-- ==============================================================================
-- TrackMyMoney Master SQL Setup Script
-- Run this entire script in the Supabase SQL Editor to set up your database.
-- ==============================================================================

-- 0. CLEAN RESET (WARNING: THIS DELETES EXISTING TRACKMYMONEY DATA/TABLES)
-- This ensures you don't get "Already Exists" errors if you run it multiple times.
DROP TABLE IF EXISTS "public"."import_rows" CASCADE;
DROP TABLE IF EXISTS "public"."import_jobs" CASCADE;
DROP TABLE IF EXISTS "public"."ai_insights" CASCADE;
DROP TABLE IF EXISTS "public"."debts" CASCADE;
DROP TABLE IF EXISTS "public"."chat_messages" CASCADE;
DROP TABLE IF EXISTS "public"."health_snapshots" CASCADE;
DROP TABLE IF EXISTS "public"."subscription_events" CASCADE;
DROP TABLE IF EXISTS "public"."subscriptions" CASCADE;
DROP TABLE IF EXISTS "public"."goals" CASCADE;
DROP TABLE IF EXISTS "public"."budgets" CASCADE;
DROP TABLE IF EXISTS "public"."transactions" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."accounts" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;

DROP TYPE IF EXISTS "public"."account_type" CASCADE;
DROP TYPE IF EXISTS "public"."budget_period" CASCADE;
DROP TYPE IF EXISTS "public"."budget_status" CASCADE;
DROP TYPE IF EXISTS "public"."goal_status" CASCADE;
DROP TYPE IF EXISTS "public"."subscription_interval" CASCADE;
DROP TYPE IF EXISTS "public"."subscription_status" CASCADE;
DROP TYPE IF EXISTS "public"."subscription_event_type" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_source" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_status" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_type" CASCADE;

-- 1. Create Custom ENUM Types
CREATE TYPE "public"."account_type" AS ENUM('bank', 'credit_card', 'cash', 'wallet', 'investment');
CREATE TYPE "public"."budget_period" AS ENUM('monthly', 'quarterly', 'yearly', 'custom');
CREATE TYPE "public"."budget_status" AS ENUM('active', 'inactive');
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'paused');
CREATE TYPE "public"."subscription_interval" AS ENUM('weekly', 'monthly', 'yearly', 'custom');
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled');
CREATE TYPE "public"."subscription_event_type" AS ENUM('created', 'updated', 'paused', 'resumed', 'cancelled', 'charge_detected');
CREATE TYPE "public"."transaction_source" AS ENUM('manual', 'sms', 'email', 'import');
CREATE TYPE "public"."transaction_status" AS ENUM('cleared', 'pending');
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');

-- 2. Create Tables
CREATE TABLE "public"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	"email" text NOT NULL UNIQUE,
	"full_name" text,
	"avatar_url" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"locale" text DEFAULT 'en-US',
	"preferences" jsonb,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"type" "public"."account_type" DEFAULT 'bank' NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"last_sync_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"type" "public"."transaction_type" NOT NULL,
	"is_default" boolean DEFAULT false,
	"parent_id" uuid,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"account_id" uuid REFERENCES "public"."accounts"("id"),
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"type" "public"."transaction_type" NOT NULL,
	"category_id" uuid REFERENCES "public"."categories"("id"),
	"merchant" text,
	"description" text,
	"date" timestamp NOT NULL,
	"status" "public"."transaction_status" DEFAULT 'cleared',
	"is_subscription" boolean DEFAULT false,
	"source" "public"."transaction_source" DEFAULT 'manual' NOT NULL,
	"source_metadata" jsonb,
	"confidence_score" numeric(3, 2),
	"receipt_url" text,
	"is_recurring" boolean DEFAULT false,
	"recurring_id" uuid,
	"is_reviewed" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"category_id" uuid NOT NULL REFERENCES "public"."categories"("id"),
	"period_type" "public"."budget_period" DEFAULT 'monthly' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp,
	"limit_amount" numeric(12, 2) NOT NULL,
	"spent" numeric(12, 2) DEFAULT '0',
	"status" "public"."budget_status" DEFAULT 'active',
	"rollover" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"target_amount" numeric(12, 2) NOT NULL,
	"current_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"target_date" timestamp,
	"priority" numeric(2, 0) DEFAULT '1',
	"status" "public"."goal_status" DEFAULT 'active',
	"color" text DEFAULT '#3B82F6',
	"icon" text DEFAULT '🎯',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"merchant" text NOT NULL,
	"service_name" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"interval" "public"."subscription_interval" DEFAULT 'monthly' NOT NULL,
	"status" "public"."subscription_status" DEFAULT 'active' NOT NULL,
	"next_charge_date" timestamp,
	"last_charge_date" timestamp,
	"category_id" uuid REFERENCES "public"."categories"("id"),
	"linked_account_id" uuid REFERENCES "public"."accounts"("id"),
	"usage_score" numeric(5, 2),
	"potential_savings" boolean DEFAULT false,
	"notes" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"event_type" "public"."subscription_event_type" NOT NULL,
	"event_date" timestamp DEFAULT now() NOT NULL,
	"data" jsonb
);

CREATE TABLE "public"."health_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"period_type" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"savings_rate" numeric(5, 2),
	"budget_adherence" numeric(5, 2),
	"goal_progress" numeric(5, 2),
	"debt_score" numeric(5, 2),
	"overall_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"remaining_amount" numeric(12, 2) NOT NULL,
	"interest_rate" numeric(5, 2),
	"minimum_payment" numeric(12, 2),
	"due_date" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"period" text NOT NULL,
	"insights_json" jsonb NOT NULL,
	"prompt_payload" jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public"."import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'csv' NOT NULL,
	"file_path" text,
	"row_count" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

CREATE TABLE "public"."import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_job_id" uuid NOT NULL REFERENCES "public"."import_jobs"("id") ON DELETE CASCADE,
	"user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
	"raw_row" jsonb,
	"parsed_date" timestamp,
	"parsed_description" text,
	"parsed_amount" numeric(12, 2),
	"parsed_currency" text DEFAULT 'USD',
	"parsed_type" text,
	"parsed_merchant" text,
	"parsed_category_id" uuid REFERENCES "public"."categories"("id") ON DELETE SET NULL,
	"ai_confidence" numeric(3, 2),
	"ai_payload" jsonb,
	"is_duplicate_guess" boolean DEFAULT false,
	"is_selected_for_import" boolean DEFAULT true,
	"has_error" boolean DEFAULT false,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);

-- 3. Create Indexes for Performance
CREATE INDEX "idx_transactions_user_date" ON "public"."transactions" USING btree ("user_id","date");
CREATE INDEX "idx_transactions_user_type_date" ON "public"."transactions" USING btree ("user_id","type","date");
CREATE INDEX "idx_transactions_user_category_date" ON "public"."transactions" USING btree ("user_id","category_id","date");
CREATE INDEX "idx_subscriptions_user_status" ON "public"."subscriptions" USING btree ("user_id","status");
CREATE INDEX "idx_subscriptions_user_next_charge" ON "public"."subscriptions" USING btree ("user_id","next_charge_date");
CREATE INDEX "idx_subscriptions_user_merchant" ON "public"."subscriptions" USING btree ("user_id","merchant");

-- 4. Enable Row Level Security (RLS)
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."subscription_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."health_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."debts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_insights" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."import_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."import_rows" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- First, drop existing policies if they exist (to avoid 'already exists' error on policies)
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can manage own accounts" ON "public"."accounts";
DROP POLICY IF EXISTS "Users can manage own categories" ON "public"."categories";
DROP POLICY IF EXISTS "Users can manage own transactions" ON "public"."transactions";
DROP POLICY IF EXISTS "Users can manage own budgets" ON "public"."budgets";
DROP POLICY IF EXISTS "Users can manage own goals" ON "public"."goals";
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON "public"."subscriptions";
DROP POLICY IF EXISTS "Users can manage own subscription_events" ON "public"."subscription_events";
DROP POLICY IF EXISTS "Users can manage own health_snapshots" ON "public"."health_snapshots";
DROP POLICY IF EXISTS "Users can manage own chat_messages" ON "public"."chat_messages";
DROP POLICY IF EXISTS "Users can manage own debts" ON "public"."debts";
DROP POLICY IF EXISTS "Users can manage own ai_insights" ON "public"."ai_insights";
DROP POLICY IF EXISTS "Users can manage own import_jobs" ON "public"."import_jobs";
DROP POLICY IF EXISTS "Users can manage own import_rows" ON "public"."import_rows";

CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (auth.uid() = id);

-- Base policy template applied to all user-data tables: 
-- Users can completely manage (CRUD) rows where user_id matches their auth.uid()
CREATE POLICY "Users can manage own accounts" ON "public"."accounts" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own categories" ON "public"."categories" FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own transactions" ON "public"."transactions" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own budgets" ON "public"."budgets" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON "public"."goals" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscriptions" ON "public"."subscriptions" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscription_events" ON "public"."subscription_events" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health_snapshots" ON "public"."health_snapshots" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat_messages" ON "public"."chat_messages" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own debts" ON "public"."debts" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai_insights" ON "public"."ai_insights" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own import_jobs" ON "public"."import_jobs" FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own import_rows" ON "public"."import_rows" FOR ALL USING (auth.uid() = user_id);

-- 6. Setup Auth Profile Trigger
-- Automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Done!
