CREATE TYPE "public"."account_type" AS ENUM('bank', 'credit_card', 'cash', 'wallet', 'investment');--> statement-breakpoint
CREATE TYPE "public"."budget_period" AS ENUM('monthly', 'quarterly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."budget_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."subscription_cadence" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."transaction_source" AS ENUM('manual', 'sms', 'email', 'import');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('cleared', 'pending');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "account_type" DEFAULT 'bank' NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"last_sync_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"period_type" "budget_period" DEFAULT 'monthly' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp,
	"limit_amount" numeric(12, 2) NOT NULL,
	"spent" numeric(12, 2) DEFAULT '0',
	"status" "budget_status" DEFAULT 'active',
	"rollover" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"type" "transaction_type" NOT NULL,
	"is_default" boolean DEFAULT false,
	"parent_id" uuid,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_amount" numeric(12, 2) NOT NULL,
	"current_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"target_date" timestamp,
	"priority" numeric(2, 0) DEFAULT '1',
	"status" "goal_status" DEFAULT 'active',
	"color" text DEFAULT '#3B82F6',
	"icon" text DEFAULT '🎯',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "health_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"locale" text DEFAULT 'en-US',
	"preferences" jsonb,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"merchant" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"cadence" "subscription_cadence" DEFAULT 'monthly' NOT NULL,
	"next_charge_date" timestamp NOT NULL,
	"category_id" uuid,
	"linked_transaction_id" uuid,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"type" "transaction_type" NOT NULL,
	"category_id" uuid,
	"merchant" text,
	"description" text,
	"date" timestamp NOT NULL,
	"status" "transaction_status" DEFAULT 'cleared',
	"is_subscription" boolean DEFAULT false,
	"source" "transaction_source" DEFAULT 'manual' NOT NULL,
	"source_metadata" jsonb,
	"confidence_score" numeric(3, 2),
	"receipt_url" text,
	"is_recurring" boolean DEFAULT false,
	"recurring_id" uuid,
	"is_reviewed" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_snapshots" ADD CONSTRAINT "health_snapshots_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_linked_transaction_id_transactions_id_fk" FOREIGN KEY ("linked_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;