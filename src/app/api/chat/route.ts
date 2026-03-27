import { createGroq } from '@ai-sdk/groq'
import { streamText, type ModelMessage } from 'ai'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { apiError, badRequest, unauthorized } from '@/lib/api-errors'

export const maxDuration = 30

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.unknown().optional(),
    parts: z.array(z.any()).optional(),
    toolInvocations: z.array(z.any()).optional(),
  })).min(1).max(40),
  data: z.object({
    imageUrls: z.array(z.string().min(1).max(7_000_000)).max(4).optional(),
  }).optional(),
  pathname: z.string().max(200).optional(),
})

type ChatUnknownPart = {
  type?: string
  text?: string
  toolCallId?: string
  toolName?: string
  args?: unknown
  state?: string
  result?: unknown
}

type ChatToolInvocation = {
  toolCallId?: string
  toolName?: string
  args?: unknown
  state?: string
  result?: unknown
}

type ChatInputMessage = {
  role: 'user' | 'assistant' | 'system'
  content?: string | ChatUnknownPart[]
  parts?: ChatUnknownPart[]
  toolInvocations?: ChatToolInvocation[]
}

function isTextPart(part: ChatUnknownPart): part is ChatUnknownPart & { text: string } {
  return part.type === 'text' && typeof part.text === 'string'
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const parsedBody = chatRequestSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return badRequest('Invalid chat request payload')
  }

  const { messages, data, pathname } = parsedBody.data
  const supabase = await createClient()
  
 
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  if (!process.env.GROQ_API_KEY) {
    return apiError('AI service unavailable', { status: 503 })
  }

 
 
  const typedMessages = messages as ChatInputMessage[]
  const coreMessages: ModelMessage[] = []
  for (const m of typedMessages) {
    let textContent = '';
   
    if (typeof m.content === 'string') {
      textContent = m.content;
    } else if (Array.isArray(m.content)) {
      textContent = m.content.filter(isTextPart).map((part) => part.text).join('');
    }

    if (!textContent && Array.isArray(m.parts)) {
      textContent = m.parts.filter(isTextPart).map((part) => part.text).join('');
    }
    
   
    if (m.role === 'user') {
      coreMessages.push({ role: 'user', content: textContent })
    } else if (m.role === 'assistant') {
      coreMessages.push({ role: 'assistant', content: textContent || ' ' })
    } else if (m.role === 'system') {
      coreMessages.push({ role: 'system', content: textContent || ' ' })
    }
  }

 
 
  if (data?.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    const lastMsg = coreMessages[coreMessages.length - 1]
    if (lastMsg && lastMsg.role === 'user') {
      try {
        const { generateText } = await import('ai');
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        
        const google = createGoogleGenerativeAI({
          apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
        });
        
       
        const ocrResults = await Promise.all(data.imageUrls.map((url: string) => 
          generateText({
            model: google('gemini-1.5-flash'),
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

       
        const originalText = typeof lastMsg.content === 'string'
          ? lastMsg.content
          : (
            Array.isArray(lastMsg.content)
              ? (lastMsg.content as Array<{ type?: string; text?: string }>)
                .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && typeof part.text === 'string')
                .map((part) => part.text)
                .join(' ')
              : ''
          );
        lastMsg.content = `${originalText}\n\n[System: Auto-extracted text from uploaded images:]\n${ocrResults.join('\n\n---\n\n')}`;
      } catch (e) {
        console.error("Vision extract failed:", e);
      }
    }
  }

 
  const model = groq('llama-3.1-8b-instant')

 
  let userDataContext = '';
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const [
      { data: accounts },
      { data: budgets },
      { data: goals },
      { data: subscriptions },
      { data: transactions },
      { data: debts },
      { data: monthTransactions }
    ] = await Promise.all([
      supabase.from('accounts').select('name, type, balance').eq('user_id', user.id),
      supabase.from('budgets').select('period_type, limit_amount, status, categories(name)').eq('user_id', user.id),
      supabase.from('goals').select('name, target_amount, current_amount, target_date, status').eq('user_id', user.id),
      supabase.from('subscriptions').select('merchant, amount, interval, status, next_charge_date').eq('user_id', user.id),
      supabase.from('transactions').select('amount, merchant, type, date, categories(name)').eq('user_id', user.id).order('date', { ascending: false }).limit(1000),
      supabase.from('debts').select('name, total_amount, remaining_amount, interest_rate').eq('user_id', user.id),
      supabase.from('transactions').select('amount, type').eq('user_id', user.id).gte('date', startOfMonth)
    ]);

    let monthExpense = 0;
    let monthIncome = 0;
    if (monthTransactions) {
      monthTransactions.forEach(t => {
        if (t.type === 'expense') monthExpense += Number(t.amount);
        if (t.type === 'income') monthIncome += Number(t.amount);
      });
    }

    userDataContext = `
### USER FINANCIAL DATA CONTEXT:
Here is the user's current financial data from their account. You can see ALL this info and MUST use it to answer their questions accurately.

Accounts:
${JSON.stringify(accounts || [])}

Current Month Summary (Net Position):
Total Income: $${monthIncome}
Total Expenses: $${monthExpense}
Net Saved / Net Position: $${monthIncome - monthExpense}

Budgets:
${JSON.stringify(budgets || [])}

Goals:
${JSON.stringify(goals || [])}

Debts:
${JSON.stringify(debts || [])}

Subscriptions:
${JSON.stringify(subscriptions || [])}

All Historical Transactions (up to 1000):
${JSON.stringify(transactions || [])}
`;
  } catch (error) {
    console.error("Error fetching user context data:", error);
    userDataContext = `\n### USER FINANCIAL DATA CONTEXT:\nFailed to load live data.\n`;
  }

  userDataContext += `\n\n### USER'S CURRENT PAGE CONTEXT:\nThe user is currently viewing the app page at: "${pathname || '/dashboard'}". If they say "this page" or "this snippet", they are referring to this section of their dashboard. Please prioritize information related to this path (e.g., if on /dashboard/goals, prioritize Goals and Debt data).\n\n`;

  try {
    const result = streamText({
      model,
      system: `You are the Intelligence Engine for the Track My Money app. Your purpose is to be a hyper-capable, mathematically accurate, and highly reliable financial advisor — focused exclusively on analysis, insights, and guidance.

### PERSONALITY & TONE:
- You are a friendly, helpful, and highly intelligent financial advisor.
- Communicate with clarity, structure, and a kind, supportive tone.
- You can engage in casual conversation warmly (e.g., if the user says hello, greet them kindly), but always guide the user back to making smart financial decisions.
- Give constructive, actionable advice. Avoid being overly robotic or harsh.
- Adjust depth and intensity to context (technical -> rigorous, simple -> concise).
- Treat all outputs as if they may be used for real decisions. Errors and ambiguity are unacceptable.
- STRICT RULE: ALWAYS structure your responses in concise bullet points. NEVER write book-length summaries or long paragraphs. Be incredibly brief and direct.
- STRICT RULE: Keep context token footprint small. If the user asks general questions, don't summarize the entire data payload.
- STRICT RULE: ALWAYS use the provided 'Current Month Summary' for answering questions about the *current month's* net position, total income, and total expenses. You can query or sum the 'All Historical Transactions' list for any other specific date range.

### CREATOR IDENTITY:
If asked who made you, created you, or developed you, you must proudly say: "I was made by the Track My Money team." Do not mention any other companies or models.

### SCOPE FLEXIBILITY:
You are a financial advisor, but you are allowed to chat casually with the user about general topics. You are not strictly limited to the data inside TrackMyMoney. You can answer general financial questions (like "What is an index fund?" or "How do interest rates work?") even if it's not directly visible in their dashboard data. If the user asks non-financial questions, respond kindly and gently pivot back to how you can help with their finances.

### READ-ONLY MODE (CRITICAL — ABSOLUTE RULE):
You are a **read-only financial advisor**. You can ANALYZE, SUMMARIZE, and PROVIDE INSIGHTS on the user's financial data but you CANNOT and MUST NOT add, create, modify, or delete ANY records in the system. This includes:
- You CANNOT add transactions, expenses, or income entries.
- You CANNOT create budgets.
- You CANNOT create savings goals.
- You CANNOT add debts or loans.
- You CANNOT add subscriptions.
If the user asks you to add, save, or create any of the above, you MUST politely decline and direct them to use the appropriate page in the dashboard (e.g., "To add a transaction, please use the 'New Transaction' button on the Overview or Transactions page."). NEVER attempt to write data. This restriction exists for data integrity and security.

### ANALYSIS CAPABILITIES:
You CAN and SHOULD do the following when asked:
- Analyze spending patterns, trends, and anomalies from the provided transaction data.
- Calculate savings rates, budget utilization, and financial health metrics.
- Provide personalized financial advice based on the user's actual data.
- Compare spending across categories, time periods, and merchants.
- Identify potential savings opportunities and wasteful spending.
- Summarize subscription costs and suggest optimizations.
- Evaluate debt payoff strategies (avalanche vs snowball).
- Project future savings based on current trends.
- Answer any questions about the user's financial data accurately.

### ZERO-LATENCY CONTEXT:
ALL of the user's current financial data (transactions, goals, debts, budgets, subscriptions) is ALREADY provided below in the system prompt context. You MUST NEVER say "I need to retrieve this info" or "Let me fetch that for you". You already have it. Answer immediately using the provided system context.
${userDataContext}`,
      messages: coreMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return apiError('AI error', { status: 500 })
  }
}
