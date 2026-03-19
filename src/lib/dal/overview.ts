import { db } from '@/db'
import {
  transactions,
  accounts,
  categories,
  budgets,
  subscriptions,
  goals
} from '@/db/schema'
import { eq, and, gte, lte, sum, desc, sql, count } from 'drizzle-orm'
import { addDays, differenceInDays, format } from 'date-fns'

export async function getOverviewMetrics(userId: string, from: Date, to: Date) {
  // Total Inflow
  const inflowResult = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )

  // Total Outflow
  const outflowResult = await db
    .select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )

  // Total Account Balance
  const balanceResult = await db
    .select({ total: sum(accounts.balance) })
    .from(accounts)
    .where(eq(accounts.userId, userId))

  const totalInflow = Number(inflowResult[0]?.total || 0)
  const totalOutflow = Number(outflowResult[0]?.total || 0)
  const netPosition = totalInflow - totalOutflow
  const totalBalance = Number(balanceResult[0]?.total || 0)

  let savingsRate: number | null = null
  if (totalInflow > 0) {
    savingsRate = (netPosition / totalInflow) * 100
  }

  return {
    totalInflow,
    totalOutflow,
    netPosition,
    totalBalance,
    savingsRate
  }
}

export async function getCashFlowSeries(userId: string, from: Date, to: Date) {
  const daysDiff = differenceInDays(to, from)
  let dateFormat = 'YYYY-MM-DD' // daily
  if (daysDiff > 60) {
    dateFormat = 'IYYY-IW' // weekly
  }
  if (daysDiff > 180) {
    dateFormat = 'YYYY-MM' // monthly
  }

  const result = await db
    .select({
      bucket: sql<string>`TO_CHAR(${transactions.date}, ${dateFormat})`,
      type: transactions.type,
      total: sum(transactions.amount)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )
    .groupBy(sql`1, 2`)
    .orderBy(sql`1`)

  // Process result to an array of { date: string, income: number, expense: number }
  const chartMap = new Map<string, { income: number; expense: number }>()

  result.forEach((row) => {
    if (!row.bucket) return
    if (!chartMap.has(row.bucket)) {
      chartMap.set(row.bucket, { income: 0, expense: 0 })
    }
    const bucketData = chartMap.get(row.bucket)!
    if (row.type === 'income') {
      bucketData.income += Number(row.total || 0)
    } else if (row.type === 'expense') {
      bucketData.expense += Number(row.total || 0)
    }
  })

  // Format array
  const formattedData = Array.from(chartMap.entries()).map(([date, data]) => ({
    date,
    ...data
  }))

  return formattedData
}

export async function getExpenseBreakdown(userId: string, from: Date, to: Date) {
  const result = await db
    .select({
      categoryId: categories.id,
      categoryName: categories.name,
      amount: sum(transactions.amount)
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sum(transactions.amount)))

  const totalExpense = result.reduce((acc, row) => acc + Number(row.amount || 0), 0)

  return result.map((row) => ({
    categoryId: row.categoryId || 'unknown',
    categoryName: row.categoryName || 'Uncategorized',
    amount: Number(row.amount || 0),
    percentage: totalExpense > 0 ? (Number(row.amount || 0) / totalExpense) * 100 : 0
  }))
}

export async function getRecentTransactions(userId: string, from: Date, to: Date, limit = 5) {
  const result = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      merchant: transactions.merchant,
      description: transactions.description,
      date: transactions.date,
      categoryName: categories.name,
      currency: transactions.currency
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, from),
        lte(transactions.date, to)
      )
    )
    .orderBy(desc(transactions.date))
    .limit(limit)

  return result.map((r) => ({
    ...r,
    amount: Number(r.amount)
  }))
}

export async function getUpcomingCharges(userId: string, daysAhead = 14) {
  const now = new Date()
  const cutoff = addDays(now, daysAhead)

  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.nextChargeDate, now),
        lte(subscriptions.nextChargeDate, cutoff)
      )
    )
    .orderBy(subscriptions.nextChargeDate)

  return result.map(s => ({
    ...s,
    amount: Number(s.amount)
  }))
}

export async function getSetupStatus(userId: string) {
  const [accCount, txCount, budgetCount, subCount, goalCount] = await Promise.all([
    db.select({ count: count() }).from(accounts).where(eq(accounts.userId, userId)),
    db.select({ count: count() }).from(transactions).where(eq(transactions.userId, userId)),
    db.select({ count: count() }).from(budgets).where(eq(budgets.userId, userId)),
    db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select({ count: count() }).from(goals).where(eq(goals.userId, userId)),
  ])

  return {
    hasAccount: Number(accCount[0].count) > 0,
    hasTransaction: Number(txCount[0].count) > 0,
    hasBudget: Number(budgetCount[0].count) > 0,
    hasSubscription: Number(subCount[0].count) > 0,
    hasGoal: Number(goalCount[0].count) > 0,
  }
}

export type AiAdvisorState = 'no_data' | 'warning' | 'neutral' | 'opportunity'

export async function getAdvisorInsight(userId: string, from: Date, to: Date) {
  const metrics = await getOverviewMetrics(userId, from, to)
  
  if (metrics.totalInflow === 0 && metrics.totalOutflow === 0) {
    return {
      state: 'no_data' as AiAdvisorState,
      title: 'Not enough data yet',
      message: 'Add some income and expense transactions in this period to get actionable insights.',
      actions: [{ label: 'Add Transaction', href: '?add=true' }]
    }
  }

  if (metrics.totalOutflow > metrics.totalInflow * 1.05) {
    return {
      state: 'warning' as AiAdvisorState,
      title: 'Spending exceeds income',
      message: `Your expenses are ${(metrics.totalOutflow - metrics.totalInflow).toLocaleString()} higher than your income. Review your top spending categories.`,
      actions: [{ label: 'Review Categories', href: '/dashboard/reports' }]
    }
  }

  if (metrics.savingsRate !== null && metrics.savingsRate > 0 && metrics.savingsRate < 10) {
    return {
      state: 'opportunity' as AiAdvisorState,
      title: 'Savings potential',
      message: `You saved ${metrics.savingsRate.toFixed(1)}% of your income. Consider finding small expenses to cut to reach a 20% target.`,
      actions: [{ label: 'Create Budget', href: '/dashboard/budgets' }]
    }
  }

  if (metrics.savingsRate !== null && metrics.savingsRate >= 20) {
    return {
      state: 'opportunity' as AiAdvisorState,
      title: 'Excellent savings rate',
      message: `You're saving ${metrics.savingsRate.toFixed(1)}% in this period! Consider directing extra cash to your goals.`,
      actions: [{ label: 'View Goals', href: '/dashboard/goals' }]
    }
  }

  return {
    state: 'neutral' as AiAdvisorState,
    title: 'Solid cash flow',
    message: 'Your inflow and outflow are roughly balanced. Keep monitoring to stay on track.',
    actions: [{ label: 'View Transactions', href: '/dashboard/transactions' }]
  }
}
