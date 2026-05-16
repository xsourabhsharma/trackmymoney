import { createClient } from '@/utils/supabase/server'
import {
  GoalsDebtsFilter,
  GoalsDebtsPageData,
  SavingsGoalRow,
  DebtRow,
  GoalStatus,
  computeNetProgress,
  GoalProgressSnapshot,
  simulateDebtPayoff,
} from './data'

interface GoalRecord {
  id: string
  name: string
  icon: string | null
  color: string | null
  target_amount: string | number
  current_amount: string | number
  target_date: string | null
  priority: string | number | null
  status: GoalStatus | null
}

interface DebtRecord {
  id: string
  name: string
  total_amount: string | number
  remaining_amount: string | number
  interest_rate: string | number | null
  minimum_payment: string | number | null
}

const GOAL_TABS: readonly GoalsDebtsFilter['goalsTab'][] = ['active', 'completed', 'all']
const GOAL_SCOPES: readonly GoalsDebtsFilter['scope'][] = ['all', 'savings', 'debt']
const PAYOFF_STRATEGIES: readonly GoalsDebtsFilter['payoffStrategy'][] = ['snowball', 'avalanche', 'custom']

function normalizeGoalsDebtsFilter(filter: GoalsDebtsFilter): GoalsDebtsFilter {
  return {
    period: filter.period === 'all_time' ? 'all_time' : 'this_year',
    scope: GOAL_SCOPES.includes(filter.scope) ? filter.scope : 'all',
    payoffStrategy: PAYOFF_STRATEGIES.includes(filter.payoffStrategy) ? filter.payoffStrategy : 'avalanche',
    goalsTab: GOAL_TABS.includes(filter.goalsTab) ? filter.goalsTab : 'active',
  }
}

export async function loadGoalsDebtsPageData(filter: GoalsDebtsFilter): Promise<GoalsDebtsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const safeFilter = normalizeGoalsDebtsFilter(filter)

  const { data: goalsRaw, error: goalsErr } = await supabase
    .from('goals')
    .select('id, name, icon, color, target_amount, current_amount, target_date, priority, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (goalsErr) console.error('Goals fetch error:', goalsErr.message)

  const { data: debtsRaw, error: debtsErr } = await supabase
    .from('debts')
    .select('id, name, total_amount, remaining_amount, interest_rate, minimum_payment')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (debtsErr) console.error('Debts fetch error:', debtsErr.message)

  const savingsGoalsAll: SavingsGoalRow[] = ((goalsRaw || []) as GoalRecord[]).map((goal) => {
    const target = Number(goal.target_amount || 0)
    const current = Number(goal.current_amount || 0)
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0
    const status: GoalStatus = progress >= 100 ? 'completed' : goal.status || 'active'

    return {
      id: goal.id,
      name: goal.name,
      icon: goal.icon || null,
      color: goal.color || null,
      targetAmount: target,
      currentAmount: current,
      currency: 'USD',
      targetDate: goal.target_date || null,
      priority: Number(goal.priority || 3),
      status,
      progressPercent: Math.round(progress),
    }
  })

  const debtRows: DebtRow[] = ((debtsRaw || []) as DebtRecord[]).map((debt) => ({
    id: debt.id,
    name: debt.name,
    creditor: null,
    originalPrincipal: Number(debt.total_amount || 0),
    currentBalance: Number(debt.remaining_amount || 0),
    interestRate: Number(debt.interest_rate || 0),
    minimumPayment: Number(debt.minimum_payment || 0),
    currency: 'USD',
  }))

  let displayGoals = savingsGoalsAll
  if (safeFilter.goalsTab === 'active') displayGoals = savingsGoalsAll.filter(goal => goal.status === 'active')
  else if (safeFilter.goalsTab === 'completed') displayGoals = savingsGoalsAll.filter(goal => goal.status === 'completed')

  const activeGoals = savingsGoalsAll.filter(goal => goal.status !== 'paused')
  const totalSavingsGoals = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalSavingsSaved = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalDebt = debtRows.reduce((sum, debt) => sum + debt.currentBalance, 0)
  const totalOriginalDebt = debtRows.reduce((sum, debt) => sum + debt.originalPrincipal, 0)

  const netProgressPercent = computeNetProgress(
    totalSavingsGoals,
    totalSavingsSaved,
    totalOriginalDebt,
    totalDebt
  )

  const goalProgressSnapshot: GoalProgressSnapshot = {
    totalTarget: totalSavingsGoals,
    totalSaved: totalSavingsSaved,
    percentFunded: totalSavingsGoals > 0 ? Math.min(100, (totalSavingsSaved / totalSavingsGoals) * 100) : 0,
  }

  const debtInputs = debtRows
    .filter(debt => debt.currentBalance > 0)
    .map(debt => ({
      id: debt.id,
      balance: debt.currentBalance,
      interestRate: debt.interestRate,
      minimumPayment: Math.max(debt.minimumPayment, 10),
    }))

  const debtFreeCountdown = simulateDebtPayoff(debtInputs, 0, safeFilter.payoffStrategy)

  return {
    filter: safeFilter,
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
    aiSuggestions: [],
    dataWarning: goalsErr || debtsErr
      ? 'Some goals or debt data could not be loaded. Refresh the page or try again later.'
      : undefined,
  }
}
