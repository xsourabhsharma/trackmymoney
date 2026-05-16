import { createClient } from '@/utils/supabase/server'
import { apiError, unauthorized } from '@/lib/api-errors'
import {
  getAiDisabledClientMessage,
  getAiTextState,
  isAiDisabledError,
  logAiServiceError,
  streamAiText,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'

type AdvisorTransaction = {
  amount: string
  type: 'income' | 'expense' | 'transfer'
  date: string
  categories: { name: string } | { name: string }[] | null
}

function getCategoryName(categories: AdvisorTransaction['categories']) {
  const category = Array.isArray(categories) ? categories[0] : categories
  return category?.name || 'Other'
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const consent = await requireAiConsent(supabase, user.id, 'advisor')
    if (!consent.allowed) {
      return apiError(consent.message, { status: 403, code: consent.code })
    }

    const textState = getAiTextState()
    if (!textState.enabled) {
      return apiError(getAiDisabledClientMessage(textState), {
        status: 503,
        code: 'AI_PROVIDER_DISABLED',
      })
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
      const result = streamAiText({
        system: 'You are a friendly AI financial advisor.',
        prompt: 'The user has no financial data yet. Give them a friendly 2 sentence welcome message encouraging them to add their first transaction.',
      })
      return result.toTextStreamResponse()
    }

    const currentMonthExp: Record<string, number> = {}
    const lastMonthExp: Record<string, number> = {}
    let currentMonthIncome = 0
    let lastMonthIncome = 0
    const now = new Date()

    ;(transactions as AdvisorTransaction[]).forEach((tx) => {
      const txDate = new Date(tx.date)
      const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      const amount = Number(tx.amount)
      const safeAmount = Number.isFinite(amount) ? amount : 0
      const catName = getCategoryName(tx.categories)

      if (tx.type === 'expense') {
        if (isCurrentMonth) {
          currentMonthExp[catName] = (currentMonthExp[catName] || 0) + safeAmount
        } else {
          lastMonthExp[catName] = (lastMonthExp[catName] || 0) + safeAmount
        }
      } else if (tx.type === 'income') {
        if (isCurrentMonth) {
          currentMonthIncome += safeAmount
        } else {
          lastMonthIncome += safeAmount
        }
      }
    })

    const promptData = {
      currentMonthIncome,
      lastMonthIncome,
      currentMonthExpensesByCategory: currentMonthExp,
      lastMonthExpensesByCategory: lastMonthExp,
    }

    const systemPrompt = `You are a professional AI financial advisor.
Analyze the provided aggregated spending and income data for the current month vs the previous month.
Provide exactly 3 actionable, specific financial insights.
Format the response as exactly 3 plain-text bullets using "- ".
Include comparative spending insights with percentages when the data supports them.
Do not hallucinate numbers that are not in the data.`

    const result = streamAiText({
      system: systemPrompt,
      prompt: JSON.stringify(promptData),
      temperature: 0.5,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    logAiServiceError('advisor route failed', error)
    if (isAiDisabledError(error)) {
      return apiError(getAiDisabledClientMessage(error.state), {
        status: 503,
        code: 'AI_PROVIDER_DISABLED',
      })
    }

    return apiError('Could not generate insights.', { status: 500 })
  }
}
