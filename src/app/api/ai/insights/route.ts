import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, type AppSupabaseServerClient } from '@/utils/supabase/server'
import {
  generateAiText,
  getAiTextState,
  isAiDisabledError,
  logAiServiceError,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'

const insightCategorySchema = z.object({
  categoryName: z.string().optional(),
  name: z.string().optional(),
  amount: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
})

const insightsRequestSchema = z.object({
  stats: z.object({
    period: z.string().max(100).optional(),
    inflow: z.coerce.number().optional(),
    outflow: z.coerce.number().optional(),
    netPosition: z.coerce.number().optional(),
    savingsRate: z.coerce.number().optional(),
    nodeBalance: z.coerce.number().optional(),
    metrics: z.object({
      inflow: z.coerce.number().optional(),
      outflow: z.coerce.number().optional(),
      netPosition: z.coerce.number().optional(),
      savingsRate: z.coerce.number().optional(),
      accountBalance: z.coerce.number().optional(),
      totalAccounts: z.coerce.number().optional(),
    }).partial().optional(),
    topSpending: z.array(insightCategorySchema).max(10).optional(),
    topSpendingCategories: z.array(insightCategorySchema).max(10).optional(),
    upcomingCharges: z.array(z.unknown()).max(50).optional(),
    recentTransactions: z.array(z.unknown()).max(1000).optional(),
    financialHealth: z.object({
      score: z.coerce.number().optional(),
    }).partial().optional(),
    healthSnapshot: z.object({
      overallScore: z.coerce.number().optional(),
    }).partial().optional(),
  }).passthrough(),
})

const insightRecordSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(240),
  severity: z.enum(['info', 'warning', 'opportunity']),
  actionHint: z.string().min(1).max(180),
})

const insightRecordsSchema = z.array(insightRecordSchema).min(1).max(5)

type InsightsSummary = {
  period?: string
  inflow: number
  outflow: number
  netPosition: number
  savingsRate: number
  accountBalance: number
  totalAccounts: number
  topCategories: Array<{ name: string; amount: number }>
  upcomingChargesCount: number
  healthScore: number
  transactionCount: number
}

type InsightRecord = z.infer<typeof insightRecordSchema>

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const consent = await requireAiConsent(supabase, user.id, 'insights')
  if (!consent.allowed) {
    return NextResponse.json(
      { error: consent.message, code: consent.code },
      { status: 403 }
    )
  }

  const parsedBody = insightsRequestSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Missing stats' }, { status: 400 })
  }

  const { stats } = parsedBody.data
  const summary = summarizeStats(stats)

  try {
    if (!getAiTextState().enabled) {
      const fallbackInsights = generateLocalTransactionInsights(summary)
      await storeInsights(supabase, user.id, stats.period || 'this-month', fallbackInsights, summary)
      return NextResponse.json({ insights: fallbackInsights, source: 'local' })
    }

    const prompt = `You are a transaction analyst for TrackMyMoney. Analyze these redacted transaction metrics and generate 3-5 concise, actionable insights.

Financial Summary:
- Period: ${summary.period}
- Income: ${summary.inflow.toLocaleString()}
- Expenses: ${summary.outflow.toLocaleString()}
- Net Position: ${summary.netPosition.toLocaleString()}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%
- Account Balance: ${summary.accountBalance.toLocaleString()}
- Top spending categories: ${summary.topCategories.map((category) => `${category.name}: ${category.amount}`).join(', ') || 'None'}

Rules:
- Be specific and reference only the numbers above.
- Identify transaction patterns, category concentration, income/expense changes, and data gaps.
- Each insight should have a clear action the user can take.
- Do not discuss budgets, goals, subscriptions, debt, investments, or general financial planning.
- Keep titles under 6 words in Standard Title Case.
- Keep body under 30 words in normal sentence case.
- Keep actionHint friendly, clear, and normal sentence case.

Respond with ONLY a valid JSON array of objects with these exact keys:
- id: a unique string, using "1", "2", etc.
- title: string
- body: string
- severity: "info" | "warning" | "opportunity"
- actionHint: string`

    const { text } = await generateAiText({
      prompt,
      temperature: 0.3,
      maxOutputTokens: 900,
    })

    const insights = parseInsightResponse(text)
    if (!insights) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    await storeInsights(supabase, user.id, stats.period || 'this-month', insights, summary)

    return NextResponse.json({ insights })
  } catch (error) {
    logAiServiceError('insights route failed', error)
    if (isAiDisabledError(error)) {
      const fallbackInsights = generateLocalTransactionInsights(summary)
      await storeInsights(supabase, user.id, stats.period || 'this-month', fallbackInsights, summary)
      return NextResponse.json({ insights: fallbackInsights, source: 'local' })
    }

    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

function summarizeStats(stats: z.infer<typeof insightsRequestSchema>['stats']): InsightsSummary {
  return {
    period: stats.period,
    inflow: stats.metrics?.inflow ?? stats.inflow ?? 0,
    outflow: stats.metrics?.outflow ?? stats.outflow ?? 0,
    netPosition: stats.metrics?.netPosition ?? stats.netPosition ?? 0,
    savingsRate: stats.metrics?.savingsRate ?? stats.savingsRate ?? 0,
    accountBalance: stats.metrics?.accountBalance ?? stats.nodeBalance ?? 0,
    totalAccounts: stats.metrics?.totalAccounts ?? 0,
    topCategories: (stats.topSpending || stats.topSpendingCategories || []).slice(0, 5).map((category) => ({
      name: category.categoryName || category.name || 'Unknown',
      amount: category.amount || category.total || 0,
    })),
    upcomingChargesCount: (stats.upcomingCharges || []).length,
    healthScore: stats.financialHealth?.score ?? stats.healthSnapshot?.overallScore ?? 0,
    transactionCount: (stats.recentTransactions || []).length,
  }
}

function parseInsightResponse(text: string) {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsedJson = JSON.parse(cleaned)
    const parsedInsights = insightRecordsSchema.safeParse(parsedJson)
    return parsedInsights.success ? parsedInsights.data : null
  } catch {
    return null
  }
}

async function storeInsights(
  supabase: AppSupabaseServerClient,
  userId: string,
  period: string,
  insights: InsightRecord[],
  promptPayload: InsightsSummary
) {
  try {
    await supabase.from('ai_insights').insert({
      user_id: userId,
      period,
      insights_json: insights,
      prompt_payload: promptPayload,
    })
  } catch (error) {
    logAiServiceError('store AI insights failed', error)
  }
}

function generateLocalTransactionInsights(summary: InsightsSummary): InsightRecord[] {
  const insights: InsightRecord[] = []

  if (summary.savingsRate > 20) {
    insights.push({
      id: '1',
      title: 'Strong Savings Rate',
      body: `Recorded income is higher than expenses by ${summary.savingsRate.toFixed(1)}% this period.`,
      severity: 'info',
      actionHint: 'Review recent income and expense transactions to confirm the pattern.',
    })
  } else if (summary.savingsRate > 0) {
    insights.push({
      id: '1',
      title: 'Narrow Transaction Margin',
      body: `Recorded income is only ${summary.savingsRate.toFixed(1)}% above expenses this period.`,
      severity: 'warning',
      actionHint: 'Review your largest recorded expense categories for this period.',
    })
  } else {
    insights.push({
      id: '1',
      title: 'Spending Exceeds Income',
      body: `You're spending more than you earn this period. Net position is -${Math.abs(summary.netPosition).toLocaleString()}.`,
      severity: 'warning',
      actionHint: 'Identify and reduce non-essential expenses immediately.',
    })
  }

  if (summary.topCategories.length > 0) {
    const topCategory = summary.topCategories[0]
    insights.push({
      id: '2',
      title: `Top: ${topCategory.name}`,
      body: `${topCategory.name} is your biggest expense at ${Number(topCategory.amount).toLocaleString()}. Check if there are ways to optimize.`,
      severity: 'opportunity',
      actionHint: `Review your ${topCategory.name} transactions for savings.`,
    })
  }

  if (summary.upcomingChargesCount > 0) {
    insights.push({
      id: '3',
      title: 'Recent Transaction Volume',
      body: `This insight used ${summary.transactionCount} recent transaction${summary.transactionCount === 1 ? '' : 's'} in the selected period.`,
      severity: 'info',
      actionHint: 'Add missing transactions so reports and advisor answers stay accurate.',
    })
  }

  if (insights.length < 3) {
    insights.push({
      id: String(insights.length + 1),
      title: 'Add More Transactions',
      body: 'More recorded transactions will make category and merchant insights more useful.',
      severity: 'info',
      actionHint: 'Use Transactions or AI Auto-Parse to record activity.',
    })
  }

  return insights
}
