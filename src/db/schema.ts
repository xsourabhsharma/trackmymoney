import { pgTable, text, timestamp, uuid, decimal, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const transactionSourceEnum = pgEnum("transaction_source", ["manual", "sms", "email", "import"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "quarterly", "yearly"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Matches auth.users id
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  currency: text("currency").default("USD").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }), // Null for system defaults
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  type: transactionTypeEnum("type").notNull(),
  isDefault: boolean("is_default").default(false),
  parentCategoryId: uuid("parent_category_id"), // For subcategories
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  merchant: text("merchant"),
  description: text("description"),
  date: timestamp("date").notNull(),
  source: transactionSourceEnum("source").default("manual").notNull(),
  sourceMetadata: jsonb("source_metadata"), // { smsId, emailId, parserId }
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  receiptUrl: text("receipt_url"),
  isRecurring: boolean("is_recurring").default(false),
  recurringId: uuid("recurring_id"),
  isReviewed: boolean("is_reviewed").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  period: budgetPeriodEnum("period").default("monthly").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rollover: boolean("rollover").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recurringTransactions = pgTable("recurring_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  merchant: text("merchant"),
  description: text("description"),
  frequency: text("frequency").notNull(), // "daily", "weekly", "monthly", "yearly"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextDueDate: timestamp("next_due_date"),
  autoCreate: boolean("auto_create").default(true),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});
