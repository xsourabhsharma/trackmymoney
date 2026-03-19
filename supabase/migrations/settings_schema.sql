-- 1. User Settings Table
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,

  -- Profile
  full_name text not null,
  timezone text not null default 'UTC',
  currency text not null default 'INR',

  -- Appearance
  theme text not null default 'system',          -- 'system' | 'light' | 'dark'
  density text not null default 'comfortable',   -- 'comfortable' | 'compact'
  dashboard_strategy text not null default 'standard', -- 'standard' | 'analytics' | 'minimal'
  show_ai_panels boolean not null default true,
  active_intelligence boolean not null default true,

  -- Defaults
  default_landing text not null default 'overview',      -- 'overview' | 'transactions' | 'capital_flow'
  default_date_spectrum text not null default 'this_month', -- 'this_month' | 'last_30' | 'fiscal_ytd'
  default_account_scope text not null default 'all',     -- 'all' | 'personal' | 'business'

  -- AI & Automation
  auto_categorize boolean not null default true,
  auto_detect_subscriptions boolean not null default true,
  auto_generate_monthly_report boolean not null default false,
  anomaly_sensitivity text not null default 'medium',    -- 'low' | 'medium' | 'high'

  -- Data & Privacy
  ai_learning_opt_in boolean not null default false,

  -- Notifications
  notify_upcoming_subscriptions boolean not null default true,
  notify_budget_overflow boolean not null default true,
  notify_goal_debt_tips boolean not null default true,
  notify_new_ai_insights boolean not null default true,
  intelligence_frequency text not null default 'instant', -- 'instant' | 'daily' | 'weekly'

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS for user_settings
alter table public.user_settings enable row level security;
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);

-- 2. Integrations Table
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,      -- 'bank' | 'card' | 'upi' | 'csv_import'
  provider text not null,  -- e.g. 'Plaid', 'Razorpay', 'Manual CSV'
  status text not null,    -- 'connected' | 'disconnected' | 'pending'
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS for integrations
alter table public.integrations enable row level security;
create policy "Users can view own integrations" on public.integrations for select using (auth.uid() = user_id);
create policy "Users can update own integrations" on public.integrations for update using (auth.uid() = user_id);
create policy "Users can insert own integrations" on public.integrations for insert with check (auth.uid() = user_id);
create policy "Users can delete own integrations" on public.integrations for delete using (auth.uid() = user_id);

-- 3. Initial Default Options Trigger (Optional, handled in app layer instead for simplicity)
