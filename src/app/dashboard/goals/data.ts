

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
  totalSavingsGoals: number    
  totalSavingsSaved: number    
  totalDebt: number            
  totalOriginalDebt: number    
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
  originalPrincipal: number  
  currentBalance: number     
  interestRate: number       
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
  dataWarning?: string
}


interface DebtInput {
  id: string
  balance: number
  interestRate: number 
  minimumPayment: number
}

export function simulateDebtPayoff(
  debts: DebtInput[],
  extraMonthlyPayment: number,
  strategy: PayoffStrategy,
  startDate: Date = new Date()
): DebtFreeCountdown | null {
  if (debts.length === 0) return null

 
  let balances = debts.map(d => ({
    ...d,
    remaining: d.balance,
    monthlyRate: (d.interestRate / 100) / 12,
  }))

  const MAX_MONTHS = 600
  let months = 0

  while (balances.some(d => d.remaining > 0.01) && months < MAX_MONTHS) {
    months++

   
    balances = balances.map(d => ({
      ...d,
      remaining: d.remaining > 0 ? d.remaining * (1 + d.monthlyRate) : 0,
    }))

   
    const remainingExtra = extraMonthlyPayment
    balances = balances.map(d => {
      if (d.remaining <= 0) return d
      const payment = Math.min(d.minimumPayment, d.remaining)
      return { ...d, remaining: Math.max(0, d.remaining - payment) }
    })

   
    const activeDebts = balances.filter(d => d.remaining > 0)
    if (activeDebts.length > 0 && remainingExtra > 0) {
      let targetDebt: typeof balances[0]

      if (strategy === 'snowball') {
       
        targetDebt = activeDebts.reduce((a, b) => a.remaining < b.remaining ? a : b)
      } else if (strategy === 'avalanche') {
       
        targetDebt = activeDebts.reduce((a, b) => a.monthlyRate > b.monthlyRate ? a : b)
      } else {
       
        targetDebt = activeDebts[0]
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
