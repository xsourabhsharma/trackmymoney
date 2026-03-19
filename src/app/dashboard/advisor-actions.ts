'use server'

import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Client instantiated dynamically inside handlers to prevent build errors

interface TxRow {
  amount: string | number
  type: 'income' | 'expense'
  date: string
  categories: { name: string } | null
}

export async function generateFinancialInsights() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createAdminClient()
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const aiClient = new OpenAI({
    apiKey: process.env.AI_API_KEY || '',
    baseURL: process.env.AI_BASE_URL,
  })

  const { data: transactions } = await admin
    .from('transactions')
    .select('amount, type, date, categories(name)')
    .eq('user_id', user.id)
    .gte('date', sixtyDaysAgo.toISOString())
    .order('date', { ascending: false })

  if (!transactions || transactions.length === 0) {
    return 'Not enough data yet. Add a few transactions and I\'ll start spotting patterns.'
  }

  const currentMonthExp: Record<string, number> = {}
  const lastMonthExp: Record<string, number> = {}
  let currentMonthIncome = 0
  let lastMonthIncome = 0
  const now = new Date()

  for (const tx of transactions as unknown as TxRow[]) {
    const txDate = new Date(tx.date)
    const isCurrent = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    const amount = parseFloat(String(tx.amount))
    const catName = tx.categories?.name ?? 'Other'

    if (tx.type === 'expense') {
      if (isCurrent) currentMonthExp[catName] = (currentMonthExp[catName] ?? 0) + amount
      else lastMonthExp[catName] = (lastMonthExp[catName] ?? 0) + amount
    } else if (tx.type === 'income') {
      if (isCurrent) currentMonthIncome += amount
      else lastMonthIncome += amount
    }
  }

  const promptData = {
    currentMonthIncome,
    lastMonthIncome,
    currentMonthExpensesByCategory: currentMonthExp,
    lastMonthExpensesByCategory: lastMonthExp,
  }

  const systemPrompt = `You are a sharp, professional AI Financial Advisor. You receive a user's aggregated spending data.
Give exactly 3 bullet points of actionable, specific insights. Include percentage comparisons where data allows.
Format: "- insight". Plain text only. Be concise. Do not invent numbers.`

  try {
    const response = await aiClient.chat.completions.create({
      model: process.env.AI_MODEL ?? 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(promptData) },
      ],
      temperature: 0.5,
      max_tokens: 250,
    })

    return response.choices[0].message.content ?? "Couldn't generate insights at this time."
  } catch (error) {
    console.error('AI insight generation failed:', error)
    return 'AI Advisor is temporarily unavailable. Please try again shortly.'
  }
}
