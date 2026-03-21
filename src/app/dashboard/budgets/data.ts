import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// ─── Period Helpers ────────────────────────────────────────────────────────

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
      // Last 3 complete calendar months
      const start = new Date(year, month - 3, 1)
      const end = new Date(year, month, 0, 23, 59, 59)
      return { startDate: start.toISOString(), endDate: end.toISOString() }
    }
    case 'all':
    default:
      return { startDate: null, endDate: null }
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

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
}

// ─── Main Loader ───────────────────────────────────────────────────────────

export async function loadBudgetsPageData(filter: BudgetFilter): Promise<BudgetsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const admin = createAdminClient()
  const { startDate, endDate } = getDateRangeForBudgetPeriod(filter.period)

  // 1. Fetch all budgets for user (with categories joined)
  const { data: budgetsRaw, error: budgetsError } = await admin
    .from('budgets')
    .select(`
      id, period_type, period_start, period_end, limit_amount, spent, rollover,
      category_id,
      categories ( id, name, icon, color )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (budgetsError) {
    console.error('Error fetching budgets:', budgetsError.message, budgetsError.hint)
  }

  const budgets = budgetsRaw || []

  // 2. Fetch expense transactions for the period
  let txQuery = admin
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  if (startDate) txQuery = txQuery.gte('date', startDate)
  if (endDate) txQuery = txQuery.lte('date', endDate)

  const { data: transactions } = await txQuery

  // 3. Aggregate spending by category
  const spentByCategory: Record<string, number> = {}
  for (const tx of transactions || []) {
    if (tx.category_id) {
      spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Number(tx.amount || 0)
    }
  }

  // 4. Build category budget items
  const categoryBudgets: CategoryBudgetItem[] = budgets.map((b: any) => {
    const cat = b.categories as { id: string; name: string; icon: string | null; color: string | null } | null
    const catId = cat?.id || b.category_id
    const budgetAmount = Number(b.limit_amount || 0)
    const spentAmount = spentByCategory[catId] || 0
    const remainingAmount = budgetAmount - spentAmount
    const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0

    return {
      budgetId: b.id,
      categoryId: catId,
      categoryName: cat?.name || 'Uncategorized',
      categoryIcon: cat?.icon || null,
      categoryColor: cat?.color || null,
      period: b.period_type || 'monthly',
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      rollover: b.rollover || false,
    }
  })

  // Sort: over-budget first, then by percentage used desc
  categoryBudgets.sort((a, b) => b.percentageUsed - a.percentageUsed)

  // 5. Compute overall metrics
  const totalBudget = categoryBudgets.reduce((s, c) => s + c.budgetAmount, 0)
  const totalSpent = categoryBudgets.reduce((s, c) => s + c.spentAmount, 0)
  const remaining = totalBudget - totalSpent

  const overview: BudgetOverviewMetrics = { totalBudget, totalSpent, remaining }

  // 6. Build spending vs budget comparison points
  const spendingVsBudget: SpendingVsBudgetPoint[] = categoryBudgets.map(c => ({
    label: c.categoryName,
    budgetAmount: c.budgetAmount,
    spentAmount: c.spentAmount,
    categoryId: c.categoryId,
  }))

  // Add overall aggregate at the start
  spendingVsBudget.unshift({
    label: 'Overall',
    budgetAmount: totalBudget,
    spentAmount: totalSpent,
    categoryId: null,
  })

  // 7. Generate alerts
  const alerts: BudgetAlertItem[] = []

  for (const c of categoryBudgets) {
    if (c.percentageUsed > 100) {
      alerts.push({
        type: 'over_budget',
        categoryName: c.categoryName,
        message: `${c.categoryName} is over budget by $${Math.abs(c.remainingAmount).toFixed(2)} (${Math.round(c.percentageUsed)}% used)`,
        severity: 'critical',
        amount: Math.abs(c.remainingAmount),
      })
    } else if (c.percentageUsed >= 80) {
      alerts.push({
        type: 'near_limit',
        categoryName: c.categoryName,
        message: `${c.categoryName} is at ${Math.round(c.percentageUsed)}% — only $${c.remainingAmount.toFixed(2)} left`,
        severity: 'warning',
        amount: c.remainingAmount,
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

  // 8. Load AI suggestions (silently skip if table does not exist)
  let aiSuggestions: AiBudgetSuggestion[] = []
  try {
    const { data: suggestionsRaw } = await admin
      .from('budget_ai_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    aiSuggestions = (suggestionsRaw || []).map((s: any) => ({
      id: s.id,
      budgetId: s.budget_id,
      message: s.message,
      fromAmount: s.from_amount ? Number(s.from_amount) : null,
      toAmount: s.to_amount ? Number(s.to_amount) : null,
      suggestionType: s.suggestion_type || 'general',
      status: s.status,
      createdAt: s.created_at,
    }))
  } catch {
    // Table may not exist yet — silently no-op
  }

  return {
    filter,
    overview,
    categoryBudgets,
    spendingVsBudget,
    alerts,
    aiSuggestions,
    hasNoCategories: categoryBudgets.length === 0,
  }
}
