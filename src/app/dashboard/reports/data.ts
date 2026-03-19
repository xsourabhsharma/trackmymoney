import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import {
  startOfMonth, endOfMonth, startOfYear,
  subMonths, subDays, format, eachDayOfInterval, eachMonthOfInterval,
} from 'date-fns'

// ─── Filter Types ───────────────────────────────────────────────────────────

export type ReportsPeriod = 'this_month' | 'last_month' | 'last_three_months' | 'year_to_date'
export type ReportsScope = 'all' | 'bank' | 'card'
export type ReportsView = 'summary' | 'detailed' | 'tax'

export interface ReportsFilter {
  period: ReportsPeriod
  scope: ReportsScope
  view: ReportsView
}

// ─── Output Types ───────────────────────────────────────────────────────────

export interface SummaryMetrics {
  totalBalance: number
  periodIncome: number
  periodExpenses: number
  savingsRate: number
  incomeChangeVsPrev: number    // % change vs equivalent previous period
  expenseChangeVsPrev: number
}

export interface CashFlowPoint {
  date: string        // 'YYYY-MM-DD' or 'MMM' for monthly grouping
  income: number
  expense: number
  net: number
}

export interface CategorySpendingItem {
  categoryId: string | null
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  amount: number
  transactionCount: number
  percentOfTotal: number
}

export interface MerchantSpendingItem {
  merchant: string
  transactionsCount: number
  totalAmount: number
  averageAmount: number
}

export interface PeriodComparisonMetrics {
  incomeCurrent: number
  incomePrevious: number
  incomeChangePct: number
  expensesCurrent: number
  expensesPrevious: number
  expensesChangePct: number
  netCurrent: number
  netPrevious: number
  efficiencyCurrent: number
  efficiencyPrevious: number
  netChangePct: number
}

export interface ReportsPageData {
  filter: ReportsFilter
  dateRange: { startDate: string; endDate: string }
  summary: SummaryMetrics
  cashFlowSeries: CashFlowPoint[]
  categorySpending: CategorySpendingItem[]
  topCategories: CategorySpendingItem[]
  topMerchants: MerchantSpendingItem[]
  periodComparison: PeriodComparisonMetrics
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function getDateRangeForReports(
  period: ReportsPeriod,
  now: Date = new Date()
): { startDate: string; endDate: string } {
  switch (period) {
    case 'this_month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
    case 'last_month': {
      const lm = subMonths(now, 1)
      return {
        startDate: format(startOfMonth(lm), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lm), 'yyyy-MM-dd'),
      }
    }
    case 'last_three_months': {
      // Last 3 complete calendar months
      const threeBack = subMonths(now, 3)
      return {
        startDate: format(startOfMonth(threeBack), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      }
    }
    case 'year_to_date':
      return {
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
  }
}

function getPreviousPeriodRange(
  startDate: string,
  endDate: string
): { startDate: string; endDate: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const durationMs = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - durationMs)
  return {
    startDate: format(prevStart, 'yyyy-MM-dd'),
    endDate: format(prevEnd, 'yyyy-MM-dd'),
  }
}

function changePct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

// ─── Main Loader ─────────────────────────────────────────────────────────────

export async function loadReportsPageData(filter: ReportsFilter): Promise<ReportsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const admin = createAdminClient()
  const now = new Date()
  const { startDate, endDate } = getDateRangeForReports(filter.period, now)
  const prevRange = getPreviousPeriodRange(startDate, endDate)

  // 1. Resolve account IDs by scope
  let accountIds: string[] | null = null
  if (filter.scope !== 'all') {
    const { data: accounts } = await admin
      .from('accounts')
      .select('id, type')
      .eq('user_id', user.id)

    const typeMap: Record<ReportsScope, string[]> = {
      all: [],
      bank: ['bank', 'checking', 'savings'],
      card: ['card', 'credit_card', 'credit'],
    }
    const types = typeMap[filter.scope]
    accountIds = (accounts || [])
      .filter(a => types.some(t => a.type?.toLowerCase().includes(t)))
      .map(a => a.id)

    // If no accounts match, use empty array (no results)
    if (accountIds.length === 0) accountIds = ['__none__']
  }

  // 2. Fetch transactions for current period
  let txQuery = admin
    .from('transactions')
    .select(`amount, type, date, merchant, category_id, categories ( id, name, icon, color )`)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (accountIds) txQuery = txQuery.in('account_id', accountIds)

  const { data: txRaw } = await txQuery
  const transactions = txRaw || []

  // 3. Fetch transactions for previous period
  let prevTxQuery = admin
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', prevRange.startDate)
    .lte('date', prevRange.endDate)

  if (accountIds) prevTxQuery = prevTxQuery.in('account_id', accountIds)

  const { data: prevTxRaw } = await prevTxQuery
  const prevTransactions = prevTxRaw || []

  // 4. Fetch account balances
  let balanceQuery = admin
    .from('accounts')
    .select('current_balance')
    .eq('user_id', user.id)

  if (filter.scope !== 'all' && accountIds) {
    balanceQuery = balanceQuery.in('id', accountIds)
  }
  const { data: accountsData } = await balanceQuery
  const totalBalance = (accountsData || []).reduce((s, a) => s + Number(a.current_balance || 0), 0)

  // 5. Aggregate current period
  let periodIncome = 0
  let periodExpenses = 0
  const cashFlowMap: Record<string, { income: number; expense: number }> = {}
  const categoryMap: Record<string, { amount: number; count: number; name: string; icon: string | null; color: string | null }> = {}
  const merchantMap: Record<string, { count: number; total: number }> = {}

  for (const tx of transactions) {
    const amt = Number(tx.amount || 0)
    const cat = tx.categories as unknown as { id: string; name: string; icon: string | null; color: string | null } | null
    const dayKey = tx.date?.slice(0, 7) ?? '' // group by month for multi-month, by day for single-month

    if (!cashFlowMap[dayKey]) cashFlowMap[dayKey] = { income: 0, expense: 0 }

    if (tx.type === 'income') {
      periodIncome += amt
      cashFlowMap[dayKey].income += amt
    } else if (tx.type === 'expense') {
      periodExpenses += amt
      cashFlowMap[dayKey].expense += amt

      const catKey = tx.category_id || '__none__'
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = {
          amount: 0, count: 0,
          name: cat?.name || 'Uncategorized',
          icon: cat?.icon || null,
          color: cat?.color || null,
        }
      }
      categoryMap[catKey].amount += amt
      categoryMap[catKey].count++

      const merchant = tx.merchant || 'Unknown'
      if (!merchantMap[merchant]) merchantMap[merchant] = { count: 0, total: 0 }
      merchantMap[merchant].count++
      merchantMap[merchant].total += amt
    }
  }

  // 6. Aggregate previous period
  let prevIncome = 0
  let prevExpenses = 0
  for (const tx of prevTransactions) {
    const amt = Number(tx.amount || 0)
    if (tx.type === 'income') prevIncome += amt
    else if (tx.type === 'expense') prevExpenses += amt
  }

  // 7. Build cash flow series
  const cashFlowSeries: CashFlowPoint[] = Object.entries(cashFlowMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({
      date,
      income: vals.income,
      expense: vals.expense,
      net: vals.income - vals.expense,
    }))

  // 8. Build category spending
  const totalExp = periodExpenses || 1
  const categorySpending: CategorySpendingItem[] = Object.entries(categoryMap)
    .map(([id, val]) => ({
      categoryId: id === '__none__' ? null : id,
      categoryName: val.name,
      categoryIcon: val.icon,
      categoryColor: val.color,
      amount: val.amount,
      transactionCount: val.count,
      percentOfTotal: Math.round((val.amount / totalExp) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)

  const topCategories = categorySpending.slice(0, 8)

  // 9. Build merchant data
  const topMerchants: MerchantSpendingItem[] = Object.entries(merchantMap)
    .filter(([name]) => name !== 'Unknown' && name !== '')
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([merchant, data]) => ({
      merchant,
      transactionsCount: data.count,
      totalAmount: data.total,
      averageAmount: data.total / data.count,
    }))

  // 10. Period comparison
  const netCurrent = periodIncome - periodExpenses
  const netPrevious = prevIncome - prevExpenses
  const efficiencyCurrent = periodIncome > 0 ? (netCurrent / periodIncome) * 100 : 0
  const efficiencyPrevious = prevIncome > 0 ? (netPrevious / prevIncome) * 100 : 0

  const periodComparison: PeriodComparisonMetrics = {
    incomeCurrent: periodIncome,
    incomePrevious: prevIncome,
    incomeChangePct: changePct(periodIncome, prevIncome),
    expensesCurrent: periodExpenses,
    expensesPrevious: prevExpenses,
    expensesChangePct: changePct(periodExpenses, prevExpenses),
    netCurrent,
    netPrevious,
    netChangePct: changePct(netCurrent, netPrevious),
    efficiencyCurrent,
    efficiencyPrevious,
  }

  const savingsRate = periodIncome > 0 ? Math.max(0, (netCurrent / periodIncome) * 100) : 0

  return {
    filter,
    dateRange: { startDate, endDate },
    summary: {
      totalBalance,
      periodIncome,
      periodExpenses,
      savingsRate,
      incomeChangeVsPrev: changePct(periodIncome, prevIncome),
      expenseChangeVsPrev: changePct(periodExpenses, prevExpenses),
    },
    cashFlowSeries,
    categorySpending,
    topCategories,
    topMerchants,
    periodComparison,
  }
}
