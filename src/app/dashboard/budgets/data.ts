import { createClient } from '@/utils/supabase/server'

export type BudgetPeriod = 'this_month' | 'last_month' | 'last_three_months' | 'all'
export type BudgetScope = 'all' | 'personal' | 'business'

export interface BudgetFilter {
  period: BudgetPeriod
  scope: BudgetScope
}

export function getDateRangeForBudgetPeriod(period: BudgetPeriod, now: Date = new Date()): {
  startDate: string | null
  endDate: string | null
} {
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (period) {
    case 'this_month': {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0, 23, 59, 59)
      return { startDate: start.toISOString(), endDate: end.toISOString() }
    }
    case 'last_month': {
      const start = new Date(year, month - 1, 1)
      const end = new Date(year, month, 0, 23, 59, 59)
      return { startDate: start.toISOString(), endDate: end.toISOString() }
    }
    case 'last_three_months': {
      const start = new Date(year, month - 3, 1)
      const end = new Date(year, month, 0, 23, 59, 59)
      return { startDate: start.toISOString(), endDate: end.toISOString() }
    }
    case 'all':
    default:
      return { startDate: null, endDate: null }
  }
}

export interface BudgetOverviewMetrics {
  totalBudget: number
  totalSpent: number
  remaining: number
}

export interface CategoryBudgetItem {
  budgetId: string
  categoryId: string | null
  categoryName: string
  categoryIcon: string | null
  categoryColor: string | null
  period: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentageUsed: number
  rollover: boolean
}

export interface SpendingVsBudgetPoint {
  label: string
  budgetAmount: number
  spentAmount: number
  categoryId: string | null
}

export interface BudgetAlertItem {
  type: 'over_budget' | 'near_limit' | 'unused_buffer'
  categoryName: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  amount?: number
}

export interface AiBudgetSuggestion {
  id: string
  budgetId: string | null
  message: string
  fromAmount: number | null
  toAmount: number | null
  suggestionType: string
  status: 'pending' | 'applied' | 'dismissed'
  createdAt: string
}

export interface BudgetsPageData {
  filter: BudgetFilter
  overview: BudgetOverviewMetrics
  categoryBudgets: CategoryBudgetItem[]
  spendingVsBudget: SpendingVsBudgetPoint[]
  alerts: BudgetAlertItem[]
  aiSuggestions: AiBudgetSuggestion[]
  hasNoCategories: boolean
  dataWarning?: string
}

interface BudgetCategory {
  id: string
  name: string
  icon: string | null
  color: string | null
}

interface BudgetRow {
  id: string
  period_type: string | null
  limit_amount: string | number
  rollover: boolean | null
  category_id: string | null
  categories: BudgetCategory | BudgetCategory[] | null
}

interface BudgetTransactionRow {
  amount: string | number
  category_id: string | null
}

const BUDGET_PERIODS: readonly BudgetPeriod[] = ['this_month', 'last_month', 'last_three_months', 'all']
const BUDGET_SCOPES: readonly BudgetScope[] = ['all', 'personal', 'business']

function normalizeBudgetFilter(filter: BudgetFilter): BudgetFilter {
  return {
    period: BUDGET_PERIODS.includes(filter.period) ? filter.period : 'this_month',
    scope: BUDGET_SCOPES.includes(filter.scope) ? filter.scope : 'all',
  }
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function loadBudgetsPageData(filter: BudgetFilter): Promise<BudgetsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const safeFilter = normalizeBudgetFilter(filter)
  const { startDate, endDate } = getDateRangeForBudgetPeriod(safeFilter.period)

  const { data: budgetsRaw, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      id, period_type, limit_amount, rollover,
      category_id,
      categories ( id, name, icon, color )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (budgetsError) {
    console.error('Error fetching budgets:', budgetsError.message, budgetsError.hint)
  }

  let txQuery = supabase
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  if (startDate) txQuery = txQuery.gte('date', startDate)
  if (endDate) txQuery = txQuery.lte('date', endDate)

  const { data: transactionsRaw, error: transactionsError } = await txQuery

  if (transactionsError) {
    console.error('Error fetching budget transactions:', transactionsError.message, transactionsError.hint)
  }

  const spentByCategory: Record<string, number> = {}
  for (const tx of (transactionsRaw || []) as BudgetTransactionRow[]) {
    if (tx.category_id) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Number(tx.amount || 0)
    }
  }

  const categoryBudgets: CategoryBudgetItem[] = ((budgetsRaw || []) as unknown as BudgetRow[]).map((budget) => {
    const category = unwrapJoin(budget.categories)
    const categoryId = category?.id || budget.category_id
    const budgetAmount = Number(budget.limit_amount || 0)
    const spentAmount = categoryId ? spentByCategory[categoryId] || 0 : 0
    const remainingAmount = budgetAmount - spentAmount
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

    return {
      budgetId: budget.id,
      categoryId,
      categoryName: category?.name || 'Uncategorized',
      categoryIcon: category?.icon || null,
      categoryColor: category?.color || null,
      period: budget.period_type || 'monthly',
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      rollover: budget.rollover || false,
    }
  })

  categoryBudgets.sort((a, b) => b.percentageUsed - a.percentageUsed)

  const totalBudget = categoryBudgets.reduce((sum, category) => sum + category.budgetAmount, 0)
  const totalSpent = categoryBudgets.reduce((sum, category) => sum + category.spentAmount, 0)
  const remaining = totalBudget - totalSpent
  const overview: BudgetOverviewMetrics = { totalBudget, totalSpent, remaining }

  const spendingVsBudget: SpendingVsBudgetPoint[] = categoryBudgets.map(category => ({
    label: category.categoryName,
    budgetAmount: category.budgetAmount,
    spentAmount: category.spentAmount,
    categoryId: category.categoryId,
  }))

  spendingVsBudget.unshift({
    label: 'Overall',
    budgetAmount: totalBudget,
    spentAmount: totalSpent,
    categoryId: null,
  })

  const alerts: BudgetAlertItem[] = []

  for (const category of categoryBudgets) {
    if (category.percentageUsed > 100) {
      alerts.push({
        type: 'over_budget',
        categoryName: category.categoryName,
        message: `${category.categoryName} is over budget by $${Math.abs(category.remainingAmount).toFixed(2)} (${Math.round(category.percentageUsed)}% used)`,
        severity: 'critical',
        amount: Math.abs(category.remainingAmount),
      })
    } else if (category.percentageUsed >= 80) {
      alerts.push({
        type: 'near_limit',
        categoryName: category.categoryName,
        message: `${category.categoryName} is at ${Math.round(category.percentageUsed)}% - only $${category.remainingAmount.toFixed(2)} left`,
        severity: 'warning',
        amount: category.remainingAmount,
      })
    }
  }

  if (remaining > 0 && totalBudget > 0) {
    alerts.push({
      type: 'unused_buffer',
      categoryName: 'Overall',
      message: `You have $${remaining.toFixed(2)} remaining in your overall budget this period`,
      severity: 'info',
      amount: remaining,
    })
  }

  return {
    filter: safeFilter,
    overview,
    categoryBudgets,
    spendingVsBudget,
    alerts,
    aiSuggestions: [],
    hasNoCategories: categoryBudgets.length === 0,
    dataWarning: budgetsError || transactionsError
      ? 'Some budget data could not be loaded. Refresh the page or try again later.'
      : undefined,
  }
}
