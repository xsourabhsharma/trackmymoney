import { z } from 'zod'

export const responseFormatSchema = z.enum(['markdown', 'json']).default('json')
export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer'])
export const transactionStatusSchema = z.enum(['cleared', 'pending']).default('cleared')
export const budgetPeriodSchema = z.enum(['monthly', 'quarterly', 'yearly', 'custom']).default('monthly')
export const budgetStatusSchema = z.enum(['active', 'inactive']).default('active')
export const subscriptionIntervalSchema = z.enum(['weekly', 'monthly', 'yearly', 'custom']).default('monthly')
export const subscriptionStatusSchema = z.enum(['active', 'paused', 'cancelled']).default('active')
export const goalStatusSchema = z.enum(['active', 'completed', 'paused']).default('active')

export const uuidSchema = z.string().uuid()
export const optionalUuidSchema = z.string().uuid().optional().nullable()
export const positiveAmountSchema = z.number().positive().finite()
export const currencySchema = z.string().trim().min(3).max(8).default('INR')
export const optionalDateSchema = z.string().trim().min(1).optional().nullable()

export const paginationSchema = {
  limit: z.number().int().min(1).max(100).default(25).describe('Maximum rows to return.'),
  offset: z.number().int().min(0).default(0).describe('Rows to skip for pagination.'),
}

export const confirmationSchema = {
  confirm: z.boolean().default(false).describe('Set true only after the user approves the preview.'),
  confirmationId: z.string().uuid().optional().describe('Confirmation ID returned by the preview response.'),
}

export const listAccountsInputSchema = z.object({
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const listCategoriesInputSchema = z.object({
  type: transactionTypeSchema.optional().describe('Optional category type filter.'),
  includeDefaults: z.boolean().default(true).describe('Include default system categories.'),
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const searchMerchantsInputSchema = z.object({
  query: z.string().trim().max(80).default('').describe('Optional merchant search text.'),
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const getOverviewInputSchema = z.object({
  days: z.number().int().min(7).max(365).default(90).describe('Number of recent days to summarize.'),
  responseFormat: responseFormatSchema,
})

export const listTransactionsInputSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: optionalUuidSchema,
  accountId: optionalUuidSchema,
  merchantQuery: z.string().trim().max(80).optional(),
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const getByIdInputSchema = z.object({
  id: uuidSchema,
  responseFormat: responseFormatSchema,
})

export const createTransactionInputSchema = z.object({
  amount: positiveAmountSchema,
  currency: currencySchema,
  type: transactionTypeSchema,
  categoryId: optionalUuidSchema,
  accountId: optionalUuidSchema,
  merchant: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional().nullable(),
  date: z.string().trim().min(1),
  status: transactionStatusSchema,
  ...confirmationSchema,
})

export const updateTransactionInputSchema = createTransactionInputSchema.partial().extend({
  id: uuidSchema,
  confirm: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
})

export const deleteByIdInputSchema = z.object({
  id: uuidSchema,
  ...confirmationSchema,
})

export const listBudgetsInputSchema = z.object({
  status: budgetStatusSchema.optional(),
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const createBudgetInputSchema = z.object({
  categoryId: uuidSchema,
  periodType: budgetPeriodSchema,
  limitAmount: positiveAmountSchema,
  rollover: z.boolean().default(false),
  periodStart: optionalDateSchema,
  periodEnd: optionalDateSchema,
  ...confirmationSchema,
})

export const updateBudgetInputSchema = createBudgetInputSchema.partial().extend({
  id: uuidSchema,
  confirm: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
})

export const listSubscriptionsInputSchema = z.object({
  status: subscriptionStatusSchema.optional(),
  query: z.string().trim().max(80).optional(),
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const createSubscriptionInputSchema = z.object({
  merchant: z.string().trim().min(1).max(160),
  serviceName: z.string().trim().max(160).optional().nullable(),
  amount: positiveAmountSchema,
  currency: currencySchema,
  interval: subscriptionIntervalSchema,
  status: subscriptionStatusSchema,
  nextChargeDate: optionalDateSchema,
  lastChargeDate: optionalDateSchema,
  categoryId: optionalUuidSchema,
  linkedAccountId: optionalUuidSchema,
  usageScore: z.number().min(0).max(100).optional().nullable(),
  potentialSavings: z.boolean().default(false),
  notes: z.string().trim().max(500).optional().nullable(),
  ...confirmationSchema,
})

export const updateSubscriptionInputSchema = createSubscriptionInputSchema.partial().extend({
  id: uuidSchema,
  confirm: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
})

export const listGoalsInputSchema = z.object({
  status: goalStatusSchema.optional(),
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const createGoalInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  targetAmount: positiveAmountSchema,
  currentAmount: z.number().min(0).finite().default(0),
  targetDate: optionalDateSchema,
  priority: z.number().int().min(1).max(9).default(1),
  status: goalStatusSchema,
  color: z.string().trim().max(40).default('#3B82F6'),
  icon: z.string().trim().max(40).default('target'),
  ...confirmationSchema,
})

export const updateGoalInputSchema = createGoalInputSchema.partial().extend({
  id: uuidSchema,
  confirm: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
})

export const listDebtsInputSchema = z.object({
  ...paginationSchema,
  responseFormat: responseFormatSchema,
})

export const createDebtInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  totalAmount: positiveAmountSchema,
  remainingAmount: z.number().min(0).finite().optional(),
  interestRate: z.number().min(0).max(100).default(0),
  minimumPayment: z.number().min(0).finite().default(0),
  dueDate: optionalDateSchema,
  ...confirmationSchema,
})

export const updateDebtInputSchema = createDebtInputSchema.partial().extend({
  id: uuidSchema,
  confirm: z.boolean().default(false),
  confirmationId: z.string().uuid().optional(),
})
