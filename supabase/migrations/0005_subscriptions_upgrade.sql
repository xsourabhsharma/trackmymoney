-- Apply the Drizzle generated DDL changes
CREATE TYPE "public"."subscription_event_type" AS ENUM('created', 'updated', 'paused', 'resumed', 'cancelled', 'charge_detected');
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled');
ALTER TYPE "public"."subscription_cadence" RENAME TO "subscription_interval";
ALTER TYPE "public"."subscription_interval" ADD VALUE 'custom';

CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "subscription_event_type" NOT NULL,
	"event_date" timestamp DEFAULT now() NOT NULL,
	"data" jsonb
);

ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_linked_transaction_id_transactions_id_fk";

ALTER TABLE "subscriptions" ALTER COLUMN "next_charge_date" DROP NOT NULL;
ALTER TABLE "subscriptions" ADD COLUMN "service_name" text;
ALTER TABLE "subscriptions" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;
ALTER TABLE "subscriptions" ADD COLUMN "interval" "subscription_interval" DEFAULT 'monthly' NOT NULL;
ALTER TABLE "subscriptions" ADD COLUMN "status" "subscription_status" DEFAULT 'active' NOT NULL;
ALTER TABLE "subscriptions" ADD COLUMN "last_charge_date" timestamp;
ALTER TABLE "subscriptions" ADD COLUMN "linked_account_id" uuid;
ALTER TABLE "subscriptions" ADD COLUMN "usage_score" numeric(5, 2);
ALTER TABLE "subscriptions" ADD COLUMN "potential_savings" boolean DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN "notes" text;

ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_linked_account_id_accounts_id_fk" FOREIGN KEY ("linked_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "idx_subscriptions_user_status" ON "subscriptions" USING btree ("user_id","status");
CREATE INDEX "idx_subscriptions_user_next_charge" ON "subscriptions" USING btree ("user_id","next_charge_date");
CREATE INDEX "idx_subscriptions_user_merchant" ON "subscriptions" USING btree ("user_id","merchant");

ALTER TABLE "subscriptions" DROP COLUMN "cadence";
ALTER TABLE "subscriptions" DROP COLUMN "linked_transaction_id";

-- RLS Policies
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_events" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view their own subscriptions" ON "public"."subscriptions" FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own subscriptions" ON "public"."subscriptions" FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own subscriptions" ON "public"."subscriptions" FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own subscriptions" ON "public"."subscriptions" FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Policies for events
DO $$ BEGIN
    CREATE POLICY "Users can view their own subscription events" ON "public"."subscription_events" FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own subscription events" ON "public"."subscription_events" FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own subscription events" ON "public"."subscription_events" FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete their own subscription events" ON "public"."subscription_events" FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
