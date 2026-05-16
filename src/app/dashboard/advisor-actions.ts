'use server'

import { createClient } from '@/utils/supabase/server'
import {
  generateAiText,
  getAiDisabledClientMessage,
  getAiTextState,
  isAiDisabledError,
  logAiServiceError,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'
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

  const consent = await requireAiConsent(supabase, user.id, 'advisor')
  if (!consent.allowed) {
    return consent.message
  }

  const textState = getAiTextState()
  if (!textState.enabled) {
    return getAiDisabledClientMessage(textState)
  }

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const { data: transactions } = await supabase
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
    const response = await generateAiText({
      system: systemPrompt,
      prompt: JSON.stringify(promptData),
      temperature: 0.5,
      maxOutputTokens: 250,
    })

    return response.text || "Couldn't generate insights at this time."
  } catch (error) {
    logAiServiceError('dashboard advisor action failed', error)
    if (isAiDisabledError(error)) {
      return getAiDisabledClientMessage(error.state)
    }

    return 'AI Advisor is temporarily unavailable. Please try again shortly.'
  }
}
