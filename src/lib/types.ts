import type { Json, Tables } from './database.types'

export type Profile = Tables<'profiles'>
export type Account = Tables<'accounts'>
export type Category = Tables<'categories'>
export type Transaction = Tables<'transactions'> & {
  categories?: Pick<Category, 'id' | 'name' | 'icon' | 'color' | 'type'> | null
  accounts?: Pick<Account, 'id' | 'name' | 'type' | 'color'> | null
}
export type Budget = Tables<'budgets'> & {
  categories?: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
}
export type Goal = Tables<'goals'>
export type Debt = Tables<'debts'>
export type Subscription = Tables<'subscriptions'> & {
  categories?: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
  accounts?: Pick<Account, 'id' | 'name' | 'type' | 'color'> | null
}
export type SubscriptionEvent = Tables<'subscription_events'>
export type AiInsightTableRecord = Tables<'ai_insights'>

export type RecurringTransaction = Subscription
export type SavingsGoal = Goal
export type DebtEntry = Debt

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string | null
}

export interface NavItem {
  label: string
  href: string
  active?: boolean
}

export const DASHBOARD_NAV_ITEMS: Omit<NavItem, 'active'>[] = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'AI Auto-Parse', href: '/dashboard/auto-parse' },
  { label: 'Transactions', href: '/dashboard/transactions' },
  { label: 'Subscriptions', href: '/dashboard/subscriptions' },
  { label: 'Budgets', href: '/dashboard/budgets' },
  { label: 'Goals & Debt', href: '/dashboard/goals' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/dashboard/settings' },
]

export interface ImportJob extends Tables<'import_jobs'> {
  status:
    | 'pending'
    | 'uploading'
    | 'parsing'
    | 'ai_categorizing'
    | 'ready_for_review'
    | 'importing'
    | 'completed'
    | 'failed'
    | 'cancelled'
  source: 'csv' | 'receipt'
  row_count: number
  created_at: string
  updated_at: string
}

export interface ImportRow extends Omit<Tables<'import_rows'>, 'raw_row' | 'ai_payload' | 'parsed_amount' | 'ai_confidence'> {
  raw_row: Json | null
  parsed_amount: number | null
  parsed_type: 'income' | 'expense' | 'transfer' | null
  categories?: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
  ai_confidence: number | null
  ai_payload: Json | null
  is_duplicate_guess: boolean
  is_selected_for_import: boolean
  has_error: boolean
  created_at: string
}

export type OverviewPeriod =
  | 'this-week'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'
  | 'all-time'

export interface OverviewMetrics {
  netPosition: number
  inflow: number
  outflow: number
  savingsRate: number
  totalAccounts: number
  accountBalance: number
}

export interface OverviewAccountBalance {
  id: string
  name: string
  type: string
  balance: number
  color: string | null
}

export interface OverviewBudgetSnapshot {
  monthlySpent: number
  monthlyLimit: number
  discretionarySpent: number
  discretionaryLimit: number
}

export interface ExpenseBreakdownItem {
  categoryId: string
  categoryName: string
  icon: string
  color: string
  amount: number
  percentage: number
}

export interface CashflowPoint {
  date: string
  income: number
  expense: number
}

export interface UpcomingCharge {
  id: string
  merchant: string
  amount: number
  cadence: string
  nextChargeDate: string
  icon?: string
  color?: string
}

export interface TopSpendingItem {
  categoryName: string
  icon: string
  color: string
  amount: number
  percentage: number
}

export interface FinancialHealthDetails {
  score: number
  label: string
  savingsRateScore: number
  budgetAdherenceScore: number
  goalProgressScore: number
  debtManagementScore: number
}

export interface AiInsight {
  id: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'opportunity'
  actionHint: string
}

export interface AiInsightRecord {
  id: string
  period: string
  insights: AiInsight[]
  createdAt: string
}

export interface OverviewData {
  period: OverviewPeriod
  metrics: OverviewMetrics
  accounts: OverviewAccountBalance[]
  budgetSnapshot: OverviewBudgetSnapshot
  expenseBreakdown: ExpenseBreakdownItem[]
  cashflowSeries: CashflowPoint[]
  recentTransactions: Transaction[]
  upcomingCharges: UpcomingCharge[]
  topSpending: TopSpendingItem[]
  financialHealth: FinancialHealthDetails
  lastInsight: AiInsightRecord | null
}
