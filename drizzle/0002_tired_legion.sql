CREATE TYPE "public"."subscription_event_type" AS ENUM('created', 'updated', 'paused', 'resumed', 'cancelled', 'charge_detected');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."subscription_cadence" RENAME TO "subscription_interval";--> statement-breakpoint
ALTER TYPE "public"."subscription_interval" ADD VALUE 'custom';--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "subscription_event_type" NOT NULL,
	"event_date" timestamp DEFAULT now() NOT NULL,
	"data" jsonb
);
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_linked_transaction_id_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "next_charge_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "service_name" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval" "subscription_interval" DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "status" "subscription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_charge_date" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "linked_account_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "usage_score" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "potential_savings" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_linked_account_id_accounts_id_fk" FOREIGN KEY ("linked_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_status" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_next_charge" ON "subscriptions" USING btree ("user_id","next_charge_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_merchant" ON "subscriptions" USING btree ("user_id","merchant");--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "cadence";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "linked_transaction_id";