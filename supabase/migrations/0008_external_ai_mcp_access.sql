-- External AI/MCP access for TrackMyMoney.
-- Adds scoped tokens, confirmation-gated write actions, and audit events.

create table if not exists public.external_access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  scopes text[] not null default '{}'::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_external_access_tokens_user
  on public.external_access_tokens (user_id);

create table if not exists public.tool_confirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor text not null,
  tool_name text not null,
  payload jsonb not null,
  payload_hash text not null,
  summary text not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tool_confirmations_status_check
    check (status in ('pending', 'confirmed', 'cancelled', 'expired'))
);

create index if not exists idx_tool_confirmations_user_status
  on public.tool_confirmations (user_id, status);

create index if not exists idx_tool_confirmations_user_tool
  on public.tool_confirmations (user_id, tool_name);

create table if not exists public.tool_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor text not null,
  tool_name text not null,
  action text not null,
  resource_type text,
  resource_id uuid,
  status text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tool_audit_events_user_created
  on public.tool_audit_events (user_id, created_at desc);

create index if not exists idx_tool_audit_events_user_tool
  on public.tool_audit_events (user_id, tool_name);

alter table public.external_access_tokens enable row level security;
alter table public.tool_confirmations enable row level security;
alter table public.tool_audit_events enable row level security;

drop policy if exists "Users can view own external access tokens" on public.external_access_tokens;
create policy "Users can view own external access tokens"
  on public.external_access_tokens for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own external access tokens" on public.external_access_tokens;
create policy "Users can insert own external access tokens"
  on public.external_access_tokens for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own external access tokens" on public.external_access_tokens;
create policy "Users can update own external access tokens"
  on public.external_access_tokens for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own external access tokens" on public.external_access_tokens;
create policy "Users can delete own external access tokens"
  on public.external_access_tokens for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own tool confirmations" on public.tool_confirmations;
create policy "Users can view own tool confirmations"
  on public.tool_confirmations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tool confirmations" on public.tool_confirmations;
create policy "Users can insert own tool confirmations"
  on public.tool_confirmations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own tool confirmations" on public.tool_confirmations;
create policy "Users can update own tool confirmations"
  on public.tool_confirmations for update
  using (auth.uid() = user_id);

drop policy if exists "Users can view own tool audit events" on public.tool_audit_events;
create policy "Users can view own tool audit events"
  on public.tool_audit_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own tool audit events" on public.tool_audit_events;
create policy "Users can insert own tool audit events"
  on public.tool_audit_events for insert
  with check (auth.uid() = user_id);
