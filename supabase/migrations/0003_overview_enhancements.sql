-- ==========================================
-- Overview Dashboard Enhancements
-- ==========================================
-- Adds ai_insights table, debts table (if missing), 
-- performance indexes, and RLS policies.

-- 1. AI Insights table
CREATE TABLE IF NOT EXISTS "ai_insights" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "period" text NOT NULL,
  "insights_json" jsonb NOT NULL,
  "prompt_payload" jsonb,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "ai_insights_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action
);

-- 2. Debts table (counterpart to debt_tracker if it doesn't exist)
CREATE TABLE IF NOT EXISTS "debts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "total_amount" numeric(12, 2) NOT NULL,
  "remaining_amount" numeric(12, 2) NOT NULL,
  "interest_rate" numeric(5, 2),
  "minimum_payment" numeric(12, 2),
  "due_date" timestamp,
  "updated_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "debts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action
);

-- 3. Performance indexes for dashboard queries
CREATE INDEX IF NOT EXISTS "idx_transactions_user_date_type" ON transactions (user_id, date, type);
CREATE INDEX IF NOT EXISTS "idx_transactions_user_category" ON transactions (user_id, category_id);
CREATE INDEX IF NOT EXISTS "idx_budgets_user_status" ON budgets (user_id, status);
CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_next_charge" ON subscriptions (user_id, next_charge_date);
CREATE INDEX IF NOT EXISTS "idx_goals_user_status" ON goals (user_id, status);
CREATE INDEX IF NOT EXISTS "idx_accounts_user" ON accounts (user_id);
CREATE INDEX IF NOT EXISTS "idx_ai_insights_user_created" ON ai_insights (user_id, created_at DESC);

-- 4. RLS for ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai insights" ON ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai insights" ON ai_insights FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS for debts
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debts" ON debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debts" ON debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debts" ON debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own debts" ON debts FOR DELETE USING (auth.uid() = user_id);
