import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Gather User's Financial Data for the last 60 days to compare
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, type, date, categories(name)')
      .eq('user_id', user.id)
      .gte('date', sixtyDaysAgo.toISOString())
      .order('date', { ascending: false })

    if (!transactions || transactions.length === 0) {
      // Return a mock stream for empty state
      const customOpenAI = createOpenAI({
        apiKey: process.env.AI_API_KEY,
        baseURL: process.env.AI_BASE_URL,
      })
      const result = await streamText({
        model: customOpenAI(process.env.AI_MODEL || 'glm-4-flash'),
        system: "You are a friendly AI Financial Advisor.",
        prompt: "The user has no financial data yet. Give them a friendly 2 sentence welcome message encouraging them to add their first transaction.",
      })
      return result.toTextStreamResponse()
    }

    // Prepare the data payload for the AI
    const currentMonthExp: Record<string, number> = {}
    const lastMonthExp: Record<string, number> = {}
    let currentMonthIncome = 0
    let lastMonthIncome = 0
    const now = new Date()
    
    transactions.forEach((tx: any) => {
      const txDate = new Date(tx.date)
      const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      const amount = parseFloat(tx.amount)
      const catName = (tx.categories as any)?.name || 'Other'

      if (tx.type === 'expense') {
        if (isCurrentMonth) {
          currentMonthExp[catName] = (currentMonthExp[catName] || 0) + amount
        } else {
          lastMonthExp[catName] = (lastMonthExp[catName] || 0) + amount
        }
      } else if (tx.type === 'income') {
        if (isCurrentMonth) {
          currentMonthIncome += amount
        } else {
          lastMonthIncome += amount
        }
      }
    })

    const promptData = {
      currentMonthIncome,
      lastMonthIncome,
      currentMonthExpensesByCategory: currentMonthExp,
      lastMonthExpensesByCategory: lastMonthExp,
    }

    const systemPrompt = `You are a highly intelligent, empathetic, and professional AI Financial Advisor. 
I am going to provide you with my aggregated spending and income data for the current month vs the previous month.

Your task is to analyze this data and provide exactly 3 actionable, specific financial insights.
Format your response as exactly 3 bullet points using a standard hyphen "- " followed by the insight. 
Crucially, you MUST include comparative spending insights if the data exists, explicitly stating percentages. For example: "- You spent 40% more on food this month."
Keep it concise, encouraging, and directly related to the data provided. Use plain text (no markdown formatting other than bullet points).
Do not hallucinate numbers that are not in the data.`

    const customOpenAI = createOpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL,
    })

    const result = await streamText({
      model: customOpenAI(process.env.AI_MODEL || 'glm-4-flash'),
      system: systemPrompt,
      prompt: JSON.stringify(promptData, null, 2),
      temperature: 0.5,
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error("Failed to generate AI insights:", error)
    return new Response("Could not generate insights.", { status: 500 })
  }
}
