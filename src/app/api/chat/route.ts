import { createGroq } from '@ai-sdk/groq'
import { streamText, tool, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { apiError, unauthorized } from '@/lib/api-errors'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages, data } = await req.json()
  const supabase = await createClient()
  
  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  // 1. Convert frontend UIMessages to standard CoreMessages manually
  // to avoid strict schema validation errors from convertToModelMessages
  const coreMessages: any[] = []
  for (const m of messages) {
    let textContent = '';
    // Strongly enforce string conversion in case useChat parses content as a part array implicitly
    if (typeof m.content === 'string') {
      textContent = m.content;
    } else if (Array.isArray(m.content)) {
      textContent = m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }

    if (!textContent && Array.isArray(m.parts)) {
      textContent = m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    }
    
    // Support both older toolInvocations and newer parts for tools
    let toolInvocations = m.toolInvocations || [];
    if (toolInvocations.length === 0 && m.parts) {
      toolInvocations = m.parts
        .filter((p: any) => p.type === 'tool-invocation')
        .map((p: any) => ({
          toolCallId: p.toolCallId,
          toolName: p.toolName,
          args: p.args,
          state: p.state || (p.result ? 'result' : 'call'),
          result: p.result
        }));
    }

    if (m.role === 'user') {
      coreMessages.push({ role: 'user', content: textContent })
    } else if (m.role === 'assistant') {
      if (toolInvocations && toolInvocations.length > 0) {
        coreMessages.push({
          role: 'assistant',
          content: textContent || ' ', // Groq rejects completely empty text even with tools
          toolCalls: toolInvocations.map((t: any) => ({
            type: 'tool-call',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            args: t.args || {}
          }))
        })
        const toolResults = toolInvocations
          .filter((t: any) => t.state === 'result')
          .map((t: any) => ({
            type: 'tool-result',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            result: t.result
          }))
        if (toolResults.length > 0) {
          coreMessages.push({ role: 'tool', content: toolResults })
        }
      } else {
        coreMessages.push({ role: 'assistant', content: textContent || ' ' }) // Ensure never empty
      }
    } else if (m.role === 'system') {
      coreMessages.push({ role: 'system', content: textContent || ' ' })
    }
  }

  // 2. Inject images if provided in the custom 'data' field
  // We do a smart two-pass: extract text with vision concurrently, then pass text to the tool model.
  if (data?.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    const lastMsg = coreMessages[coreMessages.length - 1]
    if (lastMsg && lastMsg.role === 'user') {
      try {
        const { generateText } = await import('ai');
        
        // Parse all images in parallel to save time and prevent single-turn multimodal token crashes
        const ocrResults = await Promise.all(data.imageUrls.map((url: string) => 
          generateText({
            model: groq('llama-3.2-11b-vision-preview'),
            messages: [
              { role: 'user', content: [
                { type: 'text', text: 'Please extract all available details, numbers, dates, and amounts from this document/receipt.' },
                { type: 'image', image: url.split(',')[1] }
              ]}
            ]
          }).then(res => res.text).catch((err) => {
             console.error("Sub-image parse failed:", err);
             return "[Failed to extract exact text from this specific image segment.]";
          })
        ));

        // Mutate the user's message to contain the combined OCR text instead of the images
        const originalText = typeof lastMsg.content === 'string' ? lastMsg.content : (Array.isArray(lastMsg.content) ? lastMsg.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join(' ') : '');
        lastMsg.content = `${originalText}\n\n[System: Auto-extracted text from uploaded images:]\n${ocrResults.join('\n\n---\n\n')}`;
      } catch (e) {
        console.error("Vision extract failed:", e);
      }
    }
  }

  // Switching back to llama-3.3-70b-versatile because 8b-instant outputs raw <function> tags instead of native tools!
  const model = groq('llama-3.3-70b-versatile')

  try {
    const result = streamText({
      model,
      system: `You are the Intelligence Engine for the Track My Money app. Your purpose is to be a hyper-capable, mathematically accurate, and highly reliable financial advisor and system operator.

### PERSONALITY & TONE:
- Be exceedingly professional, concise, and trustworthy—like a top-tier private wealth manager.
- Never hallucinate data. If you don't know something, state it plainly. 
- Use brief, clear formatting (bullet points, markdown tables, bold text) where it aids readability.
- Provide actionable financial insights rather than generic advice.

### TOOL EXECUTION (CRITICAL RULES):
1. **Be Proactive**: If a user uploads a receipt or explicitly states an expense/income (e.g., "I spent $5 on coffee"), ALWAYS trigger the \`addTransaction\` tool automatically. Do NOT ask for permission first if you have the amount, merchant, and context.
2. **Handle errors gracefully**: If a tool fails, inform the user exactly what is missing politely (e.g., "I couldn't save that. Could you clarify the amount?"). NEVER expose technical stack traces or JSON.
3. **Conversational safety**: If the user says "hello" or talks generally about finance, do not trigger a tool. Respond naturally.
4. **Receipts/Vision**: If the system prompt provides you with \`[System: Auto-extracted text from uploaded image:]\`, you MUST parse the merchant and amount from it, and proactively call the \`addTransaction\` tool immediately. Do not just summarize the receipt unless asked—always attempt to log it.

### ZERO-DATA STATE:
If you cannot see any income or expenses natively, advice them: "I don't have access to your historical transactions right now. You can view them in the Transactions tab. Alternatively, let's start logging new expenses manually—what did you buy today?"`,
      messages: coreMessages,
      tools: {
        addTransaction: tool({
          description: 'Add a new transaction (expense or income) dynamically. Call this for regular spending or income logs.',
          parameters: z.object({
            amount: z.number().describe('The transaction amount. Must be a positive number.'),
            merchant: z.string().default('Unknown').describe('Name of the merchant or payee.'),
            category: z.string().optional().describe('Category name (e.g. Food, Transport).'),
            type: z.enum(['income', 'expense']).default('expense').describe('Transaction type.'),
            notes: z.string().optional().describe('Optional description or notes.')
          }),
          // @ts-expect-error — AI SDK tool() overload expects undefined execute when used with streamText
          execute: async (args: { amount: number; merchant: string; category?: string; type: 'income' | 'expense'; notes?: string }) => {
            const { amount, merchant, type, notes } = args;
            const category = args.category || '';
            if (amount <= 0) return { success: false, error: 'Amount must be greater than zero.' };
            try {
              // 1. Find the default account
              const { data: accounts } = await supabase.from('accounts').select('id, balance').eq('user_id', user.id).limit(1);
              const account = accounts?.[0];
              const accountId = account?.id;

              // 2. Find matching category
              let categoryId = null;
              if (category) {
                const { data: cats } = await supabase.from('categories').select('id').or(`user_id.eq.${user.id},user_id.is.null`).ilike('name', `%${category}%`).limit(1);
                if (cats && cats.length > 0) categoryId = cats[0].id;
              }

              // 3. Insert Database Transaction (use 'manual' source — 'ai_assistant' is not in the DB enum)
              const { error } = await supabase.from('transactions').insert({
                user_id: user.id,
                account_id: accountId,
                amount,
                merchant,
                type,
                description: notes || null,
                category_id: categoryId,
                date: new Date().toISOString(),
                source: 'manual',
                source_metadata: { origin: 'ai_advisor' },
                is_reviewed: false 
              });
              if (error) throw error;

              // 4. Update the account balance
              if (account && accountId) {
                const diff = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
                await supabase.from('accounts').update({ balance: Number(account.balance) + diff }).eq('id', accountId);
              }

              return { success: true, message: `Successfully added ${type} of $${amount} at ${merchant} and updated account balance.` };
            } catch (error: any) {
              return { success: false, error: error.message };
            }
          }
        }),

        addBudget: tool({
          description: 'Create a new budget limit for a category.',
          parameters: z.object({
            limitAmount: z.number().describe('Maximum amount for the budget.'),
            categoryName: z.string().describe('Category name for the budget (e.g. Food).'),
            periodType: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly').describe('Budget period type.')
          }),
          // @ts-expect-error — AI SDK tool() overload
          execute: async (args: { limitAmount: number; categoryName: string; periodType: 'monthly' | 'quarterly' | 'yearly' }) => {
            try {
              let categoryId = null;
              const { data: cats } = await supabase.from('categories').select('id').or(`user_id.eq.${user.id},user_id.is.null`).ilike('name', `%${args.categoryName}%`).limit(1);
              if (cats && cats.length > 0) categoryId = cats[0].id;
              else return { success: false, error: 'Category not found. Ask user to specify an existing category.' };

              const { error } = await supabase.from('budgets').insert({
                user_id: user.id,
                category_id: categoryId,
                period_type: args.periodType,
                limit_amount: args.limitAmount,
                period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                status: 'active'
              });
              if (error) throw error;
              return { success: true, message: `Successfully set a ${args.periodType} budget of $${args.limitAmount} for ${args.categoryName}.` };
            } catch (e: any) { return { success: false, error: e.message }; }
          }
        }),

        addGoal: tool({
          description: 'Create a new savings goal.',
          parameters: z.object({
            name: z.string().describe('Name of the goal (e.g. New Car, Vacation).'),
            targetAmount: z.number().describe('Target amount to save.'),
            targetDate: z.string().describe('ISO String date when the goal should be met. e.g. "2026-12-31"')
          }),
          // @ts-expect-error — AI SDK tool() overload
          execute: async (args: { name: string; targetAmount: number; targetDate: string }) => {
            try {
              const { error } = await supabase.from('goals').insert({
                user_id: user.id,
                name: args.name,
                target_amount: args.targetAmount,
                current_amount: 0,
                target_date: new Date(args.targetDate || new Date().toISOString()).toISOString(),
                status: 'active'
              });
              if (error) throw error;
              return { success: true, message: `Successfully created saving goal "${args.name}" for $${args.targetAmount}.` };
            } catch (e: any) { return { success: false, error: e.message }; }
          }
        }),

        addDebt: tool({
          description: 'Add a new debt or loan.',
          parameters: z.object({
            name: z.string().describe('Name of the debt (e.g. Mortgage, Student Loan).'),
            totalAmount: z.number().describe('Total amount of the debt.'),
            interestRate: z.number().default(0).describe('Interest rate percentage. Put 0 if none.')
          }),
          // @ts-expect-error — AI SDK tool() overload
          execute: async (args: { name: string; totalAmount: number; interestRate: number }) => {
            try {
              const { error } = await supabase.from('debts').insert({
                user_id: user.id,
                name: args.name,
                total_amount: args.totalAmount,
                remaining_amount: args.totalAmount,
                interest_rate: args.interestRate
              });
              if (error) throw error;
              return { success: true, message: `Successfully added debt "${args.name}" for $${args.totalAmount}.` };
            } catch (e: any) { return { success: false, error: e.message }; }
          }
        }),

        addSubscription: tool({
          description: 'Add a new recurring subscription (e.g. Netflix, Spotify, Gym).',
          parameters: z.object({
            merchant: z.string().describe('Name of the subscription service provider.'),
            amount: z.number().describe('Cost of the subscription.'),
            interval: z.enum(['weekly', 'monthly', 'yearly']).default('monthly').describe('Billing interval.')
          }),
          // @ts-expect-error — AI SDK tool() overload
          execute: async (args: { merchant: string; amount: number; interval: 'weekly' | 'monthly' | 'yearly' }) => {
            try {
              const { error } = await supabase.from('subscriptions').insert({
                user_id: user.id,
                merchant: args.merchant,
                amount: args.amount,
                interval: args.interval,
                status: 'active'
              });
              if (error) throw error;
              return { success: true, message: `Successfully added subscription for "${args.merchant}" at $${args.amount}/${args.interval}.` };
            } catch (e: any) { return { success: false, error: e.message }; }
          }
        }),
        getSpendingSummary: tool({
           description: 'Get a summary of the user\'s total expenses and income for the current month.',
           parameters: z.object({}),
           // @ts-expect-error — AI SDK tool() overload
           execute: async () => {
              const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
              const { data } = await supabase
                .from('transactions')
                .select('amount, type')
                .eq('user_id', user.id)
                .gte('date', startOfMonth)
              
              let expense = 0
              let income = 0
              if (data) {
                 data.forEach(t => {
                   if (t.type === 'expense') expense += Number(t.amount)
                   if (t.type === 'income') income += Number(t.amount)
                 })
              }
              return { expense, income, remaining: income - expense }
           }
        })
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return apiError('AI error', { status: 500 })
  }
}
