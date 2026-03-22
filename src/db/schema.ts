import { pgTable, text, timestamp, uuid, decimal, boolean, jsonb, pgEnum, integer, index } from "drizzle-orm/pg-core";

export const transactionSourceEnum = pgEnum("transaction_source", ["manual", "sms", "email", "import"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense", "transfer"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["cleared", "pending"]);
export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "quarterly", "yearly", "custom"]);
export const accountTypeEnum = pgEnum("account_type", ["bank", "credit_card", "cash", "wallet", "investment"]);
export const subscriptionIntervalEnum = pgEnum("subscription_interval", ["weekly", "monthly", "yearly", "custom"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "paused", "cancelled"]);
export const subscriptionEventTypeEnum = pgEnum("subscription_event_type", ["created", "updated", "paused", "resumed", "cancelled", "charge_detected"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "paused"]);
export const budgetStatusEnum = pgEnum("budget_status", ["active", "inactive"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Matches auth.users id
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  currency: text("currency").default("USD").notNull(),
  locale: text("locale").default("en-US"),
  preferences: jsonb("preferences"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull().default("bank"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  color: text("color").default("#3B82F6"),
  lastSyncAt: timestamp("last_sync_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  type: transactionTypeEnum("type").notNull(),
  isDefault: boolean("is_default").default(false),
  parentId: uuid("parent_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  merchant: text("merchant"),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: transactionStatusEnum("status").default("cleared"),
  isSubscription: boolean("is_subscription").default(false),
  source: transactionSourceEnum("source").default("manual").notNull(),
  sourceMetadata: jsonb("source_metadata"),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  receiptUrl: text("receipt_url"),
  isRecurring: boolean("is_recurring").default(false),
  recurringId: uuid("recurring_id"),
  isReviewed: boolean("is_reviewed").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userDateIdx: index("idx_transactions_user_date").on(t.userId, t.date),
  userTypeDateIdx: index("idx_transactions_user_type_date").on(t.userId, t.type, t.date),
  userCategoryDateIdx: index("idx_transactions_user_category_date").on(t.userId, t.categoryId, t.date),
}));

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  periodType: budgetPeriodEnum("period_type").default("monthly").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end"),
  limitAmount: decimal("limit_amount", { precision: 12, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0"),
  status: budgetStatusEnum("status").default("active"),
  rollover: boolean("rollover").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("idx_budgets_user").on(t.userId),
}));

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  targetDate: timestamp("target_date"),
  priority: decimal("priority", { precision: 2, scale: 0 }).default("1"),
  status: goalStatusEnum("status").default("active"),
  color: text("color").default("#3B82F6"),
  icon: text("icon").default("🎯"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userStatusIdx: index("idx_goals_user_status").on(t.userId, t.status),
}));

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  merchant: text("merchant").notNull(),
  serviceName: text("service_name"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  interval: subscriptionIntervalEnum("interval").default("monthly").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  nextChargeDate: timestamp("next_charge_date"),
  lastChargeDate: timestamp("last_charge_date"),
  categoryId: uuid("category_id").references(() => categories.id),
  linkedAccountId: uuid("linked_account_id").references(() => accounts.id),
  usageScore: decimal("usage_score", { precision: 5, scale: 2 }), // 0-100
  potentialSavings: boolean("potential_savings").default(false),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userStatusIdx: index("idx_subscriptions_user_status").on(t.userId, t.status),
  userNextChargeIdx: index("idx_subscriptions_user_next_charge").on(t.userId, t.nextChargeDate),
  userMerchantIdx: index("idx_subscriptions_user_merchant").on(t.userId, t.merchant),
}));

export const subscriptionEvents = pgTable("subscription_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  eventType: subscriptionEventTypeEnum("event_type").notNull(),
  eventDate: timestamp("event_date").defaultNow().notNull(),
  data: jsonb("data"),
});

export const healthSnapshots = pgTable("health_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  periodType: text("period_type").notNull(), // 'week', 'month', 'year'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  savingsRate: decimal("savings_rate", { precision: 5, scale: 2 }), // Percentage
  budgetAdherence: decimal("budget_adherence", { precision: 5, scale: 2 }), // Percentage
  goalProgress: decimal("goal_progress", { precision: 5, scale: 2 }), // Percentage
  debtScore: decimal("debt_score", { precision: 5, scale: 2 }), // 0-100
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("idx_chat_messages_user_created").on(t.userId, t.createdAt),
}));

export const debts = pgTable("debts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  minimumPayment: decimal("minimum_payment", { precision: 12, scale: 2 }),
  dueDate: timestamp("due_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("idx_debts_user").on(t.userId),
}));

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  period: text("period").notNull(),
  insightsJson: jsonb("insights_json").notNull(),
  promptPayload: jsonb("prompt_payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const importJobs = pgTable("import_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("pending").notNull(), // pending, uploading, parsing, ai_categorizing, ready_for_review, importing, completed, failed, cancelled
  source: text("source").default("csv").notNull(),     // csv, receipt
  filePath: text("file_path"),                         // Supabase Storage key
  rowCount: integer("row_count").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const importRows = pgTable("import_rows", {
  id: uuid("id").defaultRandom().primaryKey(),
  importJobId: uuid("import_job_id").references(() => importJobs.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(), // Denormalized for easier RLS
  rawRow: jsonb("raw_row"),                          // Original CSV row data
  parsedDate: timestamp("parsed_date"),
  parsedDescription: text("parsed_description"),
  parsedAmount: decimal("parsed_amount", { precision: 12, scale: 2 }),
  parsedCurrency: text("parsed_currency").default("USD"),
  parsedType: text("parsed_type"),                       // income, expense
  parsedMerchant: text("parsed_merchant"),
  parsedCategoryId: uuid("parsed_category_id").references(() => categories.id, { onDelete: "set null" }),
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  aiPayload: jsonb("ai_payload"),                       // Raw LLM reasoning/output
  isDuplicateGuess: boolean("is_duplicate_guess").default(false),
  isSelectedForImport: boolean("is_selected_for_import").default(true),
  hasError: boolean("has_error").default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ────────────────────────────────────────────────
// Performance Indexes
// ────────────────────────────────────────────────
// Indexes are declared directly inside the table definitions above.
