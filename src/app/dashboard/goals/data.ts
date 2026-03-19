import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

// ─── Types ─────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused'
export type DebtStatus = 'active' | 'closed'
export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom'

export interface GoalsDebtsFilter {
  period: 'this_year' | 'all_time'
  scope: 'all' | 'savings' | 'debt'
  payoffStrategy: PayoffStrategy
  goalsTab: 'active' | 'completed' | 'all'
}

export interface TopSummaryMetrics {
  totalSavingsGoals: number     // sum of target_amount
  totalSavingsSaved: number     // sum of current_amount
  totalDebt: number             // sum of remaining_amount (debt_tracker)
  totalOriginalDebt: number     // sum of total_amount (debt_tracker)
  netProgressPercent: number
}

export interface SavingsGoalRow {
  id: string
  name: string
  icon: string | null
  color: string | null
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate: string | null
  priority: number
  status: GoalStatus
  progressPercent: number
}

export interface DebtRow {
  id: string
  name: string
  creditor: string | null
  originalPrincipal: number   // total_amount
  currentBalance: number      // remaining_amount
  interestRate: number        // annual %, e.g. 19.99 (not decimal)
  minimumPayment: number
  currency: string
}

export interface GoalProgressSnapshot {
  totalTarget: number
  totalSaved: number
  percentFunded: number
}

export interface DebtFreeCountdown {
  monthsToDebtFree: number
  debtFreeDate: string
  strategy: PayoffStrategy
}

export interface AiGoalDebtSuggestion {
  id: string
  goalId: string | null
  debtId: string | null
  message: string
  data: Record<string, unknown>
  status: 'pending' | 'applied' | 'dismissed'
  createdAt: string
}

export interface GoalsDebtsPageData {
  filter: GoalsDebtsFilter
  summary: TopSummaryMetrics
  savingsGoals: SavingsGoalRow[]
  debts: DebtRow[]
  goalProgressSnapshot: GoalProgressSnapshot
  debtFreeCountdown: DebtFreeCountdown | null
  aiSuggestions: AiGoalDebtSuggestion[]
}

// ─── Payoff Simulation ─────────────────────────────────────────────────────

interface DebtInput {
  id: string
  balance: number
  interestRate: number  // stored as % e.g. 19.99 → we convert /12/100
  minimumPayment: number
}

export function simulateDebtPayoff(
  debts: DebtInput[],
  extraMonthlyPayment: number,
  strategy: PayoffStrategy,
  startDate: Date = new Date()
): DebtFreeCountdown | null {
  if (debts.length === 0) return null

  // Deep copy balances
  let balances = debts.map(d => ({
    ...d,
    remaining: d.balance,
    monthlyRate: (d.interestRate / 100) / 12,
  }))

  const MAX_MONTHS = 600 // 50 years cap
  let months = 0

  while (balances.some(d => d.remaining > 0.01) && months < MAX_MONTHS) {
    months++

    // Step 1: apply monthly interest to each active debt
    balances = balances.map(d => ({
      ...d,
      remaining: d.remaining > 0 ? d.remaining * (1 + d.monthlyRate) : 0,
    }))

    // Step 2: apply minimum payments
    let remainingExtra = extraMonthlyPayment
    balances = balances.map(d => {
      if (d.remaining <= 0) return d
      const payment = Math.min(d.minimumPayment, d.remaining)
      return { ...d, remaining: Math.max(0, d.remaining - payment) }
    })

    // Step 3: apply extra payment to focus debt (based on strategy)
    const activeDebts = balances.filter(d => d.remaining > 0)
    if (activeDebts.length > 0 && remainingExtra > 0) {
      let targetDebt: typeof balances[0]

      if (strategy === 'snowball') {
        // Focus on smallest balance first
        targetDebt = activeDebts.reduce((a, b) => a.remaining < b.remaining ? a : b)
      } else {
        // Avalanche (default for 'custom' too): focus on highest rate first
        targetDebt = activeDebts.reduce((a, b) => a.monthlyRate > b.monthlyRate ? a : b)
      }

      balances = balances.map(d => {
        if (d.id !== targetDebt.id) return d
        const extra = Math.min(remainingExtra, d.remaining)
        return { ...d, remaining: Math.max(0, d.remaining - extra) }
      })
    }
  }

  if (months >= MAX_MONTHS) {
    return {
      monthsToDebtFree: MAX_MONTHS,
      debtFreeDate: 'Over 50 years',
      strategy,
    }
  }

  const debtFreeDate = new Date(startDate)
  debtFreeDate.setMonth(debtFreeDate.getMonth() + months)
  const dateStr = debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return { monthsToDebtFree: months, debtFreeDate: dateStr, strategy }
}

// ─── Net Progress ──────────────────────────────────────────────────────────

export function computeNetProgress(
  totalSavingsGoals: number,
  totalSavingsSaved: number,
  totalOriginalDebt: number,
  totalRemainingDebt: number
): number {
  const debtRepaid = Math.max(0, totalOriginalDebt - totalRemainingDebt)
  const totalTargets = totalOriginalDebt + totalSavingsGoals
  if (totalTargets <= 0) return 0
  return Math.min(100, ((debtRepaid + totalSavingsSaved) / totalTargets) * 100)
}

// ─── Main Loader ───────────────────────────────────────────────────────────

export async function loadGoalsDebtsPageData(filter: GoalsDebtsFilter): Promise<GoalsDebtsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const admin = createAdminClient()

  // 1. Fetch savings goals  (existing table: goals)
  const { data: goalsRaw, error: goalsErr } = await admin
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (goalsErr) console.error('Goals fetch error:', goalsErr.message)

  // 2. Fetch debts  (existing table: debts)
  const { data: debtsRaw, error: debtsErr } = await admin
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (debtsErr) console.error('Debts fetch error:', debtsErr.message)

  const allGoals = goalsRaw || []
  const allDebts = debtsRaw || []

  // 3. Build typed rows
  const savingsGoalsAll: SavingsGoalRow[] = allGoals.map((g: any) => {
    const target = Number(g.target_amount || 0)
    const current = Number(g.current_amount || 0)
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0
    const status: GoalStatus = progress >= 100 ? 'completed' : (g.status || 'active')

    return {
      id: g.id,
      name: g.name,
      icon: g.icon || null,
      color: g.color || null,
      targetAmount: target,
      currentAmount: current,
      currency: g.currency || 'USD',
      targetDate: g.deadline || g.target_date || null,
      priority: g.priority || 3,
      status,
      progressPercent: Math.round(progress),
    }
  })

  const debtRows: DebtRow[] = allDebts.map((d: any) => ({
    id: d.id,
    name: d.name,
    creditor: d.creditor || d.category || null,
    originalPrincipal: Number(d.total_amount || d.original_principal || 0),
    currentBalance: Number(d.remaining_amount || d.current_balance || 0),
    interestRate: Number(d.interest_rate || 0),
    minimumPayment: Number(d.minimum_payment || 0),
    currency: d.currency || 'USD',
  }))

  // 4. Apply scope/tab filters for display
  let displayGoals = savingsGoalsAll
  if (filter.goalsTab === 'active') displayGoals = savingsGoalsAll.filter(g => g.status === 'active')
  else if (filter.goalsTab === 'completed') displayGoals = savingsGoalsAll.filter(g => g.status === 'completed')

  // 5. Compute summary metrics (always use ALL, not filtered view)
  const activeGoals = savingsGoalsAll.filter(g => g.status !== 'paused')
  const totalSavingsGoals = activeGoals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSavingsSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0)
  const totalDebt = debtRows.reduce((s, d) => s + d.currentBalance, 0)
  const totalOriginalDebt = debtRows.reduce((s, d) => s + d.originalPrincipal, 0)

  const netProgressPercent = computeNetProgress(
    totalSavingsGoals,
    totalSavingsSaved,
    totalOriginalDebt,
    totalDebt
  )

  // 6. Goal progress snapshot
  const goalProgressSnapshot: GoalProgressSnapshot = {
    totalTarget: totalSavingsGoals,
    totalSaved: totalSavingsSaved,
    percentFunded: totalSavingsGoals > 0 ? Math.min(100, (totalSavingsSaved / totalSavingsGoals) * 100) : 0,
  }

  // 7. Debt-free countdown simulation
  const debtInputs: DebtInput[] = debtRows
    .filter(d => d.currentBalance > 0)
    .map(d => ({
      id: d.id,
      balance: d.currentBalance,
      interestRate: d.interestRate,
      minimumPayment: Math.max(d.minimumPayment, 10), // sanity minimum
    }))

  const debtFreeCountdown = simulateDebtPayoff(debtInputs, 0, filter.payoffStrategy)

  // 8. Load AI suggestions (uses ai_goal_debt_suggestions if exists, silently skip if not)
  let aiSuggestions: AiGoalDebtSuggestion[] = []
  try {
    const { data: suggestionsRaw } = await admin
      .from('ai_goal_debt_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    aiSuggestions = (suggestionsRaw || []).map((s: any) => ({
      id: s.id,
      goalId: s.goal_id || null,
      debtId: s.debt_id || null,
      message: s.message,
      data: s.data || {},
      status: s.status,
      createdAt: s.created_at,
    }))
  } catch {
    // Table may not exist yet — silently no-op
  }

  return {
    filter,
    summary: {
      totalSavingsGoals,
      totalSavingsSaved,
      totalDebt,
      totalOriginalDebt,
      netProgressPercent,
    },
    savingsGoals: displayGoals,
    debts: debtRows,
    goalProgressSnapshot,
    debtFreeCountdown,
    aiSuggestions,
  }
}
