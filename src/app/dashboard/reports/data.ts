import { createClient } from '@/utils/supabase/server'
import {
  endOfDay,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
} from 'date-fns'

export type ReportsPeriod = 'last_7_days' | 'this_month' | 'this_year' | 'custom'
export type ReportsScope = 'all' | 'bank' | 'card'
export type ReportsView = 'summary' | 'detailed' | 'tax'

export interface ReportsFilter {
  from?: string
  period: ReportsPeriod
  scope: ReportsScope
  to?: string
  view: ReportsView
}

export interface SummaryMetrics {
  periodIncome: number
  periodExpenses: number
  savingsRate: number
  incomeChangeVsPrev: number
  expenseChangeVsPrev: number
}

export interface CashFlowPoint {
  date: string
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
  dataWarning?: string
}

interface ReportAccountRow {
  id: string
  type: string | null
}

interface ReportCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
}

interface ReportTransactionRow {
  amount: string | number
  type: 'income' | 'expense' | 'transfer'
  date: string | null
  merchant: string | null
  category_id: string | null
  categories: ReportCategory | ReportCategory[] | null
}

interface PreviousTransactionRow {
  amount: string | number
  type: 'income' | 'expense' | 'transfer'
}

const REPORT_PERIODS: readonly ReportsPeriod[] = ['last_7_days', 'this_month', 'this_year', 'custom']
const REPORT_SCOPES: readonly ReportsScope[] = ['all', 'bank', 'card']
const REPORT_VIEWS: readonly ReportsView[] = ['summary', 'detailed', 'tax']

export function normalizeReportsPeriod(value: unknown): ReportsPeriod {
  return typeof value === 'string' && REPORT_PERIODS.includes(value as ReportsPeriod)
    ? value as ReportsPeriod
    : 'this_month'
}

export function normalizeReportsScope(value: unknown): ReportsScope {
  return typeof value === 'string' && REPORT_SCOPES.includes(value as ReportsScope)
    ? value as ReportsScope
    : 'all'
}

export function normalizeReportsView(value: unknown): ReportsView {
  return typeof value === 'string' && REPORT_VIEWS.includes(value as ReportsView)
    ? value as ReportsView
    : 'summary'
}

function normalizeReportsFilter(filter: ReportsFilter): ReportsFilter {
  return {
    from: normalizeDateString(filter.from),
    period: normalizeReportsPeriod(filter.period),
    scope: normalizeReportsScope(filter.scope),
    to: normalizeDateString(filter.to),
    view: normalizeReportsView(filter.view),
  }
}

export function normalizeDateString(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? value : undefined
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export function getDateRangeForReports(
  period: ReportsPeriod,
  now: Date = new Date(),
  custom?: { from?: string; to?: string }
): { startDate: string; endDate: string } {
  switch (period) {
    case 'last_7_days':
      return {
        startDate: format(subDays(now, 6), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
    case 'this_month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
    case 'this_year':
      return {
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
    case 'custom': {
      const fallback = {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd'),
      }
      const from = normalizeDateString(custom?.from)
      const to = normalizeDateString(custom?.to)
      if (!from || !to) return fallback
      return from <= to ? { startDate: from, endDate: to } : { startDate: to, endDate: from }
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

export async function loadReportsPageData(filter: ReportsFilter): Promise<ReportsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const safeFilter = normalizeReportsFilter(filter)
  const now = new Date()
  const { startDate, endDate } = getDateRangeForReports(safeFilter.period, now, {
    from: safeFilter.from,
    to: safeFilter.to,
  })
  const prevRange = getPreviousPeriodRange(startDate, endDate)
  const warnings: string[] = []

  let accountIds: string[] | null = null
  if (safeFilter.scope !== 'all') {
    const { data: accountsRaw, error: accountsError } = await supabase
      .from('accounts')
      .select('id, type')
      .eq('user_id', user.id)

    if (accountsError) {
      console.error('Reports account fetch error:', accountsError.message, accountsError.hint)
      warnings.push('Account filters could not be loaded.')
      accountIds = ['__none__']
    } else {
      const typeMap: Record<ReportsScope, string[]> = {
        all: [],
        bank: ['bank', 'checking', 'savings'],
        card: ['card', 'credit_card', 'credit'],
      }
      const types = typeMap[safeFilter.scope]
      accountIds = ((accountsRaw || []) as ReportAccountRow[])
        .filter(account => types.some(type => account.type?.toLowerCase().includes(type)))
        .map(account => account.id)

      if (accountIds.length === 0) accountIds = ['__none__']
    }
  }

  let txQuery = supabase
    .from('transactions')
    .select('amount, type, date, merchant, category_id, categories ( id, name, icon, color )')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endOfDay(parseISO(endDate)).toISOString())
    .order('date', { ascending: true })

  if (accountIds) txQuery = txQuery.in('account_id', accountIds)

  const { data: txRaw, error: txError } = await txQuery
  if (txError) {
    console.error('Reports transaction fetch error:', txError.message, txError.hint)
    warnings.push('Transactions for this report could not be loaded.')
  }
  const transactions = (txRaw || []) as unknown as ReportTransactionRow[]

  let prevTxQuery = supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', prevRange.startDate)
    .lte('date', endOfDay(parseISO(prevRange.endDate)).toISOString())

  if (accountIds) prevTxQuery = prevTxQuery.in('account_id', accountIds)

  const { data: prevTxRaw, error: prevTxError } = await prevTxQuery
  if (prevTxError) {
    console.error('Reports previous transaction fetch error:', prevTxError.message, prevTxError.hint)
    warnings.push('Previous period comparison could not be loaded.')
  }
  const prevTransactions = (prevTxRaw || []) as PreviousTransactionRow[]

  let periodIncome = 0
  let periodExpenses = 0
  const cashFlowMap: Record<string, { income: number; expense: number }> = {}
  const categoryMap: Record<string, { amount: number; count: number; name: string; icon: string | null; color: string | null }> = {}
  const merchantMap: Record<string, { count: number; total: number }> = {}

  for (const tx of transactions) {
    const amount = Number(tx.amount || 0)
    const category = unwrapJoin(tx.categories)
    const dayKey = tx.date?.slice(0, 7) ?? ''

    if (!cashFlowMap[dayKey]) cashFlowMap[dayKey] = { income: 0, expense: 0 }

    if (tx.type === 'income') {
      periodIncome += amount
      cashFlowMap[dayKey].income += amount
    } else if (tx.type === 'expense') {
      periodExpenses += amount
      cashFlowMap[dayKey].expense += amount

      const categoryKey = tx.category_id || '__none__'
      if (!categoryMap[categoryKey]) {
        categoryMap[categoryKey] = {
          amount: 0,
          count: 0,
          name: category?.name || 'Uncategorized',
          icon: category?.icon || null,
          color: category?.color || null,
        }
      }
      categoryMap[categoryKey].amount += amount
      categoryMap[categoryKey].count += 1

      const merchant = tx.merchant || 'Unknown'
      if (!merchantMap[merchant]) merchantMap[merchant] = { count: 0, total: 0 }
      merchantMap[merchant].count += 1
      merchantMap[merchant].total += amount
    }
  }

  let prevIncome = 0
  let prevExpenses = 0
  for (const tx of prevTransactions) {
    const amount = Number(tx.amount || 0)
    if (tx.type === 'income') prevIncome += amount
    else if (tx.type === 'expense') prevExpenses += amount
  }

  const cashFlowSeries: CashFlowPoint[] = Object.entries(cashFlowMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => ({
      date,
      income: values.income,
      expense: values.expense,
      net: values.income - values.expense,
    }))

  const totalExpensesForShare = periodExpenses || 1
  const categorySpending: CategorySpendingItem[] = Object.entries(categoryMap)
    .map(([id, value]) => ({
      categoryId: id === '__none__' ? null : id,
      categoryName: value.name,
      categoryIcon: value.icon,
      categoryColor: value.color,
      amount: value.amount,
      transactionCount: value.count,
      percentOfTotal: Math.round((value.amount / totalExpensesForShare) * 100),
    }))
    .sort((a, b) => b.amount - a.amount)

  const topCategories = categorySpending.slice(0, 8)

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
    filter: safeFilter,
    dateRange: { startDate, endDate },
    summary: {
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
    dataWarning: warnings.length > 0
      ? `${warnings.join(' ')} Refresh the page or adjust the report filters.`
      : undefined,
  }
}
