// ─── TypeScript Interfaces derived from Drizzle Schema ───

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  updated_at: string | null
  created_at: string | null
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'bank' | 'credit_card' | 'cash' | 'wallet'
  balance: string
  color: string | null
  updated_at: string | null
  created_at: string | null
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string | null
  color: string | null
  type: 'income' | 'expense'
  is_default: boolean | null
  parent_category_id: string | null
  updated_at: string | null
  created_at: string | null
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  amount: string
  currency: string
  type: 'income' | 'expense'
  category_id: string | null
  merchant: string | null
  description: string | null
  date: string
  source: 'manual' | 'sms' | 'email' | 'import'
  source_metadata: Record<string, unknown> | null
  confidence_score: string | null
  receipt_url: string | null
  is_recurring: boolean | null
  recurring_id: string | null
  is_reviewed: boolean | null
  updated_at: string | null
  created_at: string | null
  // Joined fields
  categories?: Category | null
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: string
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string | null
  rollover: boolean | null
  updated_at: string | null
  created_at: string | null
  // Joined fields
  categories?: Category | null
}

export interface RecurringTransaction {
  id: string
  user_id: string
  amount: string
  category_id: string | null
  merchant: string | null
  description: string | null
  frequency: string
  start_date: string
  end_date: string | null
  next_due_date: string | null
  auto_create: boolean | null
  is_active: boolean | null
  updated_at: string | null
  created_at: string | null
  // Joined fields
  categories?: Category | null
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: string
  current_amount: string
  deadline: string | null
  color: string | null
  icon: string | null
  updated_at: string | null
  created_at: string | null
}

export interface DebtEntry {
  id: string
  user_id: string
  name: string
  total_amount: string
  remaining_amount: string
  interest_rate: string | null
  minimum_payment: string | null
  updated_at: string | null
  created_at: string | null
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string | null
}

// ─── Utility types ───

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

// ─── AI Auto-Parse Types ───

export interface ImportJob {
  id: string;
  user_id: string;
  status: 'pending' | 'uploading' | 'parsing' | 'ai_categorizing' | 'ready_for_review' | 'importing' | 'completed' | 'failed' | 'cancelled';
  source: 'csv' | 'receipt';
  file_path: string | null;
  row_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ImportRow {
  id: string;
  import_job_id: string;
  user_id: string;
  raw_row: any | null;
  parsed_date: string | null;
  parsed_description: string | null;
  parsed_amount: number | null;
  parsed_currency: string;
  parsed_type: 'income' | 'expense' | null;
  parsed_merchant: string | null;
  parsed_category_id: string | null;
  categories?: { id: string; name: string; icon: string | null; color: string | null } | null; // Joined relation
  ai_confidence: number | null;
  ai_payload: any | null;
  is_duplicate_guess: boolean;
  is_selected_for_import: boolean;
  has_error: boolean;
  error_message: string | null;
  created_at: string;
}

// ─── Overview Dashboard Types ───

export type OverviewPeriod = 'this-week' | 'this-month' | 'last-month' | 'last-3-months' | 'this-year' | 'all-time';

export interface OverviewMetrics {
  netPosition: number;
  inflow: number;
  outflow: number;
  savingsRate: number;
  totalAccounts: number;
  accountBalance: number;
}

export interface ExpenseBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface CashflowPoint {
  date: string;
  income: number;
  expense: number;
}

export interface UpcomingCharge {
  id: string;
  merchant: string;
  amount: number;
  cadence: string;
  nextChargeDate: string;
  icon?: string;
  color?: string;
}

export interface TopSpendingItem {
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface FinancialHealthDetails {
  score: number;
  label: string;
  savingsRateScore: number;
  budgetAdherenceScore: number;
  goalProgressScore: number;
  debtManagementScore: number;
}

export interface AiInsight {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'opportunity';
  actionHint: string;
}

export interface AiInsightRecord {
  id: string;
  period: string;
  insights: AiInsight[];
  createdAt: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: string;
  remaining_amount: string;
  interest_rate: string | null;
  minimum_payment: string | null;
  due_date: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface OverviewData {
  period: OverviewPeriod;
  metrics: OverviewMetrics;
  expenseBreakdown: ExpenseBreakdownItem[];
  cashflowSeries: CashflowPoint[];
  recentTransactions: Transaction[];
  upcomingCharges: UpcomingCharge[];
  topSpending: TopSpendingItem[];
  financialHealth: FinancialHealthDetails;
  lastInsight: AiInsightRecord | null;
}

