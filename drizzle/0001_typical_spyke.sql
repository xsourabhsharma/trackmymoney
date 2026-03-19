CREATE TABLE "ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"period" text NOT NULL,
	"insights_json" jsonb NOT NULL,
	"prompt_payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"remaining_amount" numeric(12, 2) NOT NULL,
	"interest_rate" numeric(5, 2),
	"minimum_payment" numeric(12, 2),
	"due_date" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'csv' NOT NULL,
	"file_path" text,
	"row_count" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"raw_row" jsonb,
	"parsed_date" timestamp,
	"parsed_description" text,
	"parsed_amount" numeric(12, 2),
	"parsed_currency" text DEFAULT 'USD',
	"parsed_type" text,
	"parsed_merchant" text,
	"parsed_category_id" uuid,
	"ai_confidence" numeric(3, 2),
	"ai_payload" jsonb,
	"is_duplicate_guess" boolean DEFAULT false,
	"is_selected_for_import" boolean DEFAULT true,
	"has_error" boolean DEFAULT false,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_import_job_id_import_jobs_id_fk" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_parsed_category_id_categories_id_fk" FOREIGN KEY ("parsed_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date" ON "transactions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_type_date" ON "transactions" USING btree ("user_id","type","date");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_category_date" ON "transactions" USING btree ("user_id","category_id","date");