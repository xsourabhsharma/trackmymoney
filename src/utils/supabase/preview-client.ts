import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const now = new Date()
const iso = (dayOffset: number) => {
  const date = new Date(now)
  date.setDate(now.getDate() + dayOffset)
  return date.toISOString()
}

const previewUser = {
  id: 'preview-user',
  email: 'preview@trackmymoney.local',
  user_metadata: {
    avatar_url: null,
  },
}

const categories = [
  { id: 'cat-grocery', user_id: previewUser.id, name: 'Groceries', icon: 'G', color: '#ff5a1f', type: 'expense' },
  { id: 'cat-invest', user_id: previewUser.id, name: 'Investments', icon: 'I', color: '#9ca3af', type: 'expense' },
  { id: 'cat-food', user_id: previewUser.id, name: 'Dining', icon: 'D', color: '#ff5a1f', type: 'expense' },
  { id: 'cat-bills', user_id: previewUser.id, name: 'Utilities', icon: 'U', color: '#9ca3af', type: 'expense' },
  { id: 'cat-income', user_id: previewUser.id, name: 'Income', icon: 'P', color: '#f5f5f5', type: 'income' },
]

const accounts = [
  { id: 'acct-checking', user_id: previewUser.id, name: 'Checking', type: 'bank', balance: '18400', color: '#ff5a1f' },
  { id: 'acct-savings', user_id: previewUser.id, name: 'Savings', type: 'bank', balance: '24426.43', color: '#f5f5f5' },
]

const transactions = [
  {
    id: 'tx-1',
    user_id: previewUser.id,
    account_id: 'acct-checking',
    accountName: 'Checking',
    amount: '142.50',
    currency: 'USD',
    type: 'expense',
    category_id: 'cat-grocery',
    merchant: 'Whole Foods Market',
    description: 'Weekly groceries',
    date: iso(-1),
    source: 'manual',
    status: 'cleared',
    categories: categories[0],
    accounts: accounts[0],
  },
  {
    id: 'tx-2',
    user_id: previewUser.id,
    account_id: 'acct-savings',
    accountName: 'Savings',
    amount: '500.00',
    currency: 'USD',
    type: 'expense',
    category_id: 'cat-invest',
    merchant: 'Vanguard Index Fund',
    description: 'Monthly investment transfer',
    date: iso(-2),
    source: 'manual',
    status: 'cleared',
    categories: categories[1],
    accounts: accounts[1],
  },
  {
    id: 'tx-3',
    user_id: previewUser.id,
    account_id: 'acct-checking',
    accountName: 'Checking',
    amount: '3240.00',
    currency: 'USD',
    type: 'income',
    category_id: 'cat-income',
    merchant: 'Stripe Payout',
    description: 'Client invoice payout',
    date: iso(-3),
    source: 'manual',
    status: 'cleared',
    categories: categories[4],
    accounts: accounts[0],
  },
  {
    id: 'tx-4',
    user_id: previewUser.id,
    account_id: 'acct-checking',
    accountName: 'Checking',
    amount: '34.20',
    currency: 'USD',
    type: 'expense',
    category_id: 'cat-food',
    merchant: 'Uber Eats',
    description: 'Team dinner',
    date: iso(-4),
    source: 'manual',
    status: 'cleared',
    categories: categories[2],
    accounts: accounts[0],
  },
  {
    id: 'tx-5',
    user_id: previewUser.id,
    account_id: 'acct-checking',
    accountName: 'Checking',
    amount: '15.99',
    currency: 'USD',
    type: 'expense',
    category_id: 'cat-food',
    merchant: 'Netflix Subscription',
    description: 'Streaming',
    date: iso(-4),
    source: 'manual',
    status: 'cleared',
    categories: categories[2],
    accounts: accounts[0],
  },
  {
    id: 'tx-6',
    user_id: previewUser.id,
    account_id: 'acct-checking',
    accountName: 'Checking',
    amount: '112.45',
    currency: 'USD',
    type: 'expense',
    category_id: 'cat-bills',
    merchant: 'PG&E Utility',
    description: 'Electric bill',
    date: iso(-6),
    source: 'manual',
    status: 'cleared',
    categories: categories[3],
    accounts: accounts[0],
  },
]

const budgets = [
  {
    id: 'budget-discretionary',
    user_id: previewUser.id,
    category_id: 'cat-food',
    period_type: 'monthly',
    period_start: iso(-30),
    period_end: iso(0),
    limit_amount: '1000',
    spent: '850',
    status: 'active',
    rollover: false,
    categories: categories[2],
  },
  {
    id: 'budget-monthly',
    user_id: previewUser.id,
    category_id: 'cat-grocery',
    period_type: 'monthly',
    period_start: iso(-30),
    period_end: iso(0),
    limit_amount: '5000',
    spent: '3240',
    status: 'active',
    rollover: false,
    categories: categories[0],
  },
]

const subscriptions = [
  {
    id: 'sub-1',
    user_id: previewUser.id,
    merchant: 'Netflix',
    amount: '15.99',
    currency: 'USD',
    interval: 'monthly',
    next_charge_date: iso(8),
    service_name: 'Streaming',
    usage_score: 64,
    potential_savings: false,
    last_charge_date: iso(-22),
    linked_account_id: 'acct-checking',
    status: 'active',
    category_id: 'cat-food',
    categories: categories[2],
  },
  {
    id: 'sub-2',
    user_id: previewUser.id,
    merchant: 'Figma',
    amount: '12.00',
    currency: 'USD',
    interval: 'monthly',
    next_charge_date: iso(13),
    service_name: 'Design',
    usage_score: 24,
    potential_savings: true,
    last_charge_date: iso(-17),
    linked_account_id: 'acct-checking',
    status: 'active',
    category_id: 'cat-bills',
    categories: categories[3],
  },
]

const goals = [
  {
    id: 'goal-1',
    user_id: previewUser.id,
    name: 'Emergency Fund',
    target_amount: '25000',
    current_amount: '18400',
    status: 'active',
    color: '#ff5a1f',
    icon: 'E',
  },
]

const debts = [
  {
    id: 'debt-1',
    user_id: previewUser.id,
    name: 'Credit Card',
    total_amount: '6400',
    remaining_amount: '3200',
    interest_rate: '18.5',
    minimum_payment: '180',
  },
]

const profiles = [
  {
    id: previewUser.id,
    email: previewUser.email,
    full_name: 'Preview User',
    currency: 'USD',
    preferences: {
      theme: 'dark',
      currency: 'USD',
      density: 'comfortable',
      dashboard_strategy: 'standard',
    },
  },
]

const aiInsights = [
  {
    id: 'insight-1',
    user_id: previewUser.id,
    period: 'this-month',
    insights_json: [
      {
        id: 'i-1',
        title: 'Discretionary spend is near limit',
        body: 'Dining and subscriptions are trending close to your monthly guardrail.',
        severity: 'warning',
        actionHint: 'Review recent food and entertainment activity.',
      },
    ],
    created_at: iso(0),
  },
]

const importJobs = [
  {
    id: 'job-1',
    user_id: previewUser.id,
    file_path: 'demo-statement.csv',
    row_count: 24,
    status: 'completed',
    created_at: iso(-2),
    completed_at: iso(-2),
  },
]

const importRows: unknown[] = []

const dataByTable: Record<string, unknown[]> = {
  accounts,
  ai_insights: aiInsights,
  budgets,
  categories,
  debts,
  goals,
  import_jobs: importJobs,
  import_rows: importRows,
  profiles,
  subscription_events: [],
  subscriptions,
  transactions,
}

class PreviewQuery {
  private rows: unknown[]
  private singleMode = false
  private exactCount = false

  constructor(table: string) {
    this.rows = dataByTable[table] ?? []
  }

  select(_columns?: string, options?: { count?: string }) {
    this.exactCount = options?.count === 'exact'
    return this
  }

  eq() {
    return this
  }

  gte() {
    return this
  }

  lte() {
    return this
  }

  in() {
    return this
  }

  or() {
    return this
  }

  order() {
    return this
  }

  limit(count: number) {
    this.rows = this.rows.slice(0, count)
    return this
  }

  range(from: number, to: number) {
    this.rows = this.rows.slice(from, to + 1)
    return this
  }

  single() {
    this.singleMode = true
    return this
  }

  update() {
    return this
  }

  insert() {
    return this
  }

  upsert() {
    return this
  }

  delete() {
    return this
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const value = {
      data: this.singleMode ? this.rows[0] ?? null : this.rows,
      error: null,
      count: this.exactCount ? this.rows.length : null,
    }
    return Promise.resolve(value).then(onfulfilled, onrejected)
  }
}

export function createPreviewSupabaseClient(): SupabaseClient<Database> {
  const client = {
    auth: {
      getUser: async () => ({ data: { user: previewUser }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: previewUser }, error: null }),
      admin: {
        deleteUser: async () => ({ data: null, error: null }),
      },
    },
    from: (table: string) => new PreviewQuery(table),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '/real-logo.png' } }),
      }),
    },
  }
  return client as unknown as SupabaseClient<Database>
}
