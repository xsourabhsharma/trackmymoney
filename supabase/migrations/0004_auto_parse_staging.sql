-- ==========================================
-- AI Auto-Parse Staging Tables
-- ==========================================

-- 1. Create Import Jobs Table
CREATE TABLE IF NOT EXISTS "import_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "source" text NOT NULL DEFAULT 'csv',
  "file_path" text,
  "row_count" integer DEFAULT 0,
  "error_message" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "completed_at" timestamptz,
  CONSTRAINT "import_jobs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action
);

-- 2. Create Import Rows Table (Staging)
CREATE TABLE IF NOT EXISTS "import_rows" (
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
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "import_rows_import_job_id_import_jobs_id_fk" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "import_rows_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "import_rows_parsed_category_id_categories_id_fk" FOREIGN KEY ("parsed_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS "idx_import_jobs_user" ON import_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS "idx_import_rows_job" ON import_rows (import_job_id);
CREATE INDEX IF NOT EXISTS "idx_import_rows_status" ON import_rows (import_job_id, is_selected_for_import, has_error);
CREATE INDEX IF NOT EXISTS "idx_import_rows_duplicate" ON import_rows (import_job_id, is_duplicate_guess);

-- 4. RLS Policies for import_jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control own import jobs" ON import_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. RLS Policies for import_rows
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users control own import rows" ON import_rows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
