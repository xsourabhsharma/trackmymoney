import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { 
  GoalsDebtsFilter, 
  GoalsDebtsPageData, 
  SavingsGoalRow, 
  DebtRow, 
  GoalStatus, 
  computeNetProgress, 
  GoalProgressSnapshot, 
  simulateDebtPayoff,
  AiGoalDebtSuggestion
} from './data'

export async function loadGoalsDebtsPageData(filter: GoalsDebtsFilter): Promise<GoalsDebtsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error('Unauthorized')

  const admin = createAdminClient()

 
  const { data: goalsRaw, error: goalsErr } = await admin
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (goalsErr) console.error('Goals fetch error:', goalsErr.message)

 
  const { data: debtsRaw, error: debtsErr } = await admin
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (debtsErr) console.error('Debts fetch error:', debtsErr.message)

  const allGoals = goalsRaw || []
  const allDebts = debtsRaw || []

 
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

 
  let displayGoals = savingsGoalsAll
  if (filter.goalsTab === 'active') displayGoals = savingsGoalsAll.filter(g => g.status === 'active')
  else if (filter.goalsTab === 'completed') displayGoals = savingsGoalsAll.filter(g => g.status === 'completed')

 
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

 
  const goalProgressSnapshot: GoalProgressSnapshot = {
    totalTarget: totalSavingsGoals,
    totalSaved: totalSavingsSaved,
    percentFunded: totalSavingsGoals > 0 ? Math.min(100, (totalSavingsSaved / totalSavingsGoals) * 100) : 0,
  }

 
  const debtInputs = debtRows
    .filter(d => d.currentBalance > 0)
    .map(d => ({
      id: d.id,
      balance: d.currentBalance,
      interestRate: d.interestRate,
      minimumPayment: Math.max(d.minimumPayment, 10),
    }))

  const debtFreeCountdown = simulateDebtPayoff(debtInputs, 0, filter.payoffStrategy)

 
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
