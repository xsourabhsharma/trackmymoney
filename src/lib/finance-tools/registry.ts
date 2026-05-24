import 'server-only'

import {
  createBudgetInputSchema,
  createDebtInputSchema,
  createGoalInputSchema,
  createSubscriptionInputSchema,
  createTransactionInputSchema,
  deleteByIdInputSchema,
  getByIdInputSchema,
  getOverviewInputSchema,
  listAccountsInputSchema,
  listBudgetsInputSchema,
  listCategoriesInputSchema,
  listDebtsInputSchema,
  listGoalsInputSchema,
  listSubscriptionsInputSchema,
  listTransactionsInputSchema,
  searchMerchantsInputSchema,
  updateBudgetInputSchema,
  updateDebtInputSchema,
  updateGoalInputSchema,
  updateSubscriptionInputSchema,
  updateTransactionInputSchema,
} from './schemas'
import type { FinanceToolContext, FinanceToolDefinition, FinanceToolResult, JsonRecord } from './types'
import {
  asDb,
  assertAccountAccess,
  assertCategoryAccess,
  assertScope,
  getProfileCurrency,
  maybeMarkdown,
  paginatedResult,
  parseInput,
  runConfirmedMutation,
  serializeToolError,
  sumAmounts,
  titleCaseMerchant,
  toIsoDate,
} from './service'

function tool<SCHEMA extends FinanceToolDefinition['inputSchema']>(
  definition: FinanceToolDefinition<SCHEMA>
): FinanceToolDefinition<SCHEMA> {
  return definition
}

function monthBounds(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

function cleanUndefined(record: JsonRecord) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined))
}

async function listAccounts(args: typeof listAccountsInputSchema._output, context: FinanceToolContext) {
  const { data, count } = await asDb(context)
    .from('accounts')
    .select('id, name, type, balance, color, created_at', { count: 'exact' })
    .eq('user_id', context.userId)
    .order('name')
    .range(args.offset, args.offset + args.limit - 1)

  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return {
    ok: true,
    message: `Loaded ${result.count} account(s).`,
    data: maybeMarkdown(result, args.responseFormat, 'Accounts'),
  }
}

async function listCategories(args: typeof listCategoriesInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('categories')
    .select('id, name, type, icon, color, is_default, user_id', { count: 'exact' })
    .order('name')
    .range(args.offset, args.offset + args.limit - 1)

  query = args.includeDefaults
    ? query.or(`user_id.is.null,user_id.eq.${context.userId}`)
    : query.eq('user_id', context.userId)
  if (args.type) query = query.eq('type', args.type)

  const { data, count } = await query
  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return {
    ok: true,
    message: `Loaded ${result.count} categor${result.count === 1 ? 'y' : 'ies'}.`,
    data: maybeMarkdown(result, args.responseFormat, 'Categories'),
  }
}

async function searchMerchants(args: typeof searchMerchantsInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('transactions')
    .select('merchant')
    .eq('user_id', context.userId)
    .not('merchant', 'is', null)
    .order('merchant')

  if (args.query) query = query.ilike('merchant', `%${args.query}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const merchants = Array.from(
    new Set((data || []).map((row: { merchant?: string | null }) => row.merchant?.trim()).filter(Boolean))
  )
    .sort((a, b) => String(a).localeCompare(String(b)))
    .slice(args.offset, args.offset + args.limit)

  const result = paginatedResult(merchants, data?.length ?? merchants.length, args.limit, args.offset)
  return {
    ok: true,
    message: `Loaded ${result.count} merchant suggestion(s).`,
    data: maybeMarkdown(result, args.responseFormat, 'Merchants'),
  }
}

async function getOverview(args: typeof getOverviewInputSchema._output, context: FinanceToolContext) {
  const start = new Date()
  start.setDate(start.getDate() - args.days)
  const db = asDb(context)
  const [transactions, accounts, budgets, goals, debts, subscriptions] = await Promise.all([
    db
      .from('transactions')
      .select('id, amount, type, date, merchant, category_id, categories(name)')
      .eq('user_id', context.userId)
      .gte('date', start.toISOString())
      .order('date', { ascending: false })
      .limit(500),
    db.from('accounts').select('id, name, type, balance').eq('user_id', context.userId),
    db.from('budgets').select('id, limit_amount, spent, status').eq('user_id', context.userId).eq('status', 'active'),
    db.from('goals').select('id, target_amount, current_amount, status').eq('user_id', context.userId),
    db.from('debts').select('id, total_amount, remaining_amount').eq('user_id', context.userId),
    db.from('subscriptions').select('id, amount, interval, status, next_charge_date').eq('user_id', context.userId),
  ])

  for (const result of [transactions, accounts, budgets, goals, debts, subscriptions]) {
    if (result.error) throw new Error(result.error.message)
  }

  const txRows = transactions.data || []
  const inflow = sumAmounts(txRows, 'income')
  const outflow = sumAmounts(txRows, 'expense')
  const accountBalance = (accounts.data || []).reduce((sum: number, account: { balance?: string | number }) => {
    return sum + Number(account.balance || 0)
  }, 0)

  const activeBudgetLimit = (budgets.data || []).reduce((sum: number, budget: { limit_amount?: string | number }) => {
    return sum + Number(budget.limit_amount || 0)
  }, 0)
  const activeGoalTarget = (goals.data || []).reduce((sum: number, goal: { target_amount?: string | number }) => {
    return sum + Number(goal.target_amount || 0)
  }, 0)
  const activeGoalSaved = (goals.data || []).reduce((sum: number, goal: { current_amount?: string | number }) => {
    return sum + Number(goal.current_amount || 0)
  }, 0)
  const remainingDebt = (debts.data || []).reduce((sum: number, debt: { remaining_amount?: string | number }) => {
    return sum + Number(debt.remaining_amount || 0)
  }, 0)

  const overview = {
    windowDays: args.days,
    transactionCount: txRows.length,
    inflow,
    outflow,
    netPosition: inflow - outflow,
    accountBalance,
    accountsCount: accounts.data?.length || 0,
    activeBudgetLimit,
    activeGoals: {
      targetAmount: activeGoalTarget,
      currentAmount: activeGoalSaved,
      progressPercent: activeGoalTarget > 0 ? Math.round((activeGoalSaved / activeGoalTarget) * 100) : 0,
    },
    remainingDebt,
    subscriptionsCount: subscriptions.data?.length || 0,
    recentTransactions: txRows.slice(0, 10),
  }

  return {
    ok: true,
    message: `Loaded a ${args.days}-day TrackMyMoney overview.`,
    data: maybeMarkdown(overview, args.responseFormat, 'Overview'),
  }
}

async function listTransactions(args: typeof listTransactionsInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('transactions')
    .select('id, amount, currency, type, category_id, account_id, merchant, description, date, status, source, created_at, categories(id, name, icon, color), accounts(id, name)', { count: 'exact' })
    .eq('user_id', context.userId)

  if (args.type) query = query.eq('type', args.type)
  if (args.categoryId) query = query.eq('category_id', args.categoryId)
  if (args.accountId) query = query.eq('account_id', args.accountId)
  if (args.merchantQuery) query = query.or(`merchant.ilike.*${args.merchantQuery}*,description.ilike.*${args.merchantQuery}*`)
  if (args.dateFrom) query = query.gte('date', toIsoDate(args.dateFrom, 'dateFrom'))
  if (args.dateTo) query = query.lte('date', toIsoDate(args.dateTo, 'dateTo'))

  const { data, count, error } = await query
    .order('date', { ascending: false })
    .range(args.offset, args.offset + args.limit - 1)

  if (error) throw new Error(error.message)

  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return {
    ok: true,
    message: `Loaded ${result.count} transaction(s).`,
    data: maybeMarkdown(result, args.responseFormat, 'Transactions'),
  }
}

async function getRowById(
  table: string,
  select: string,
  id: string,
  context: FinanceToolContext,
  responseFormat: 'json' | 'markdown',
  heading: string
) {
  const { data, error } = await asDb(context)
    .from(table)
    .select(select)
    .eq('id', id)
    .eq('user_id', context.userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return { ok: false, message: `${heading} not found.` }
  return { ok: true, message: `Loaded ${heading}.`, data: maybeMarkdown(data, responseFormat, heading) }
}

async function createTransaction(args: typeof createTransactionInputSchema._output, context: FinanceToolContext) {
  const currency = args.currency || await getProfileCurrency(context)
  const date = toIsoDate(args.date, 'date')
  const merchant = titleCaseMerchant(args.merchant)
  const summary = `Add ${currency} ${args.amount.toFixed(2)} ${args.type} transaction for ${merchant} on ${date?.slice(0, 10)}.`

  return runConfirmedMutation(context, 'tmm_create_transaction', args, summary, async () => {
    await assertAccountAccess(context, args.accountId)
    await assertCategoryAccess(context, args.categoryId, args.type)
    const { data, error } = await asDb(context)
      .from('transactions')
      .insert({
        user_id: context.userId,
        amount: args.amount,
        currency,
        type: args.type,
        category_id: args.categoryId || null,
        account_id: args.accountId || null,
        merchant,
        description: args.description || null,
        date,
        status: args.status || 'cleared',
        source: 'manual',
        source_metadata: { created_by: context.actor },
        is_reviewed: true,
      })
      .select('id, amount, currency, type, merchant, description, date, status')
      .single()
    if (error || !data) throw new Error(error?.message || 'Transaction insert failed')
    return { resourceType: 'transaction', resourceId: data.id, data, message: `Created transaction ${data.id}.` }
  })
}

async function updateTransaction(args: typeof updateTransactionInputSchema._output, context: FinanceToolContext) {
  const summary = `Update transaction ${args.id}.`
  return runConfirmedMutation(context, 'tmm_update_transaction', args, summary, async () => {
    await assertAccountAccess(context, args.accountId)
    await assertCategoryAccess(context, args.categoryId, args.type)
    const updatePayload = cleanUndefined({
      amount: args.amount,
      currency: args.currency,
      type: args.type,
      category_id: args.categoryId === null ? null : args.categoryId,
      account_id: args.accountId === null ? null : args.accountId,
      merchant: args.merchant ? titleCaseMerchant(args.merchant) : undefined,
      description: args.description === undefined ? undefined : args.description || null,
      date: args.date ? toIsoDate(args.date, 'date') : undefined,
      status: args.status,
      updated_at: new Date().toISOString(),
    })

    const { data, error } = await asDb(context)
      .from('transactions')
      .update(updatePayload)
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id, amount, currency, type, merchant, description, date, status')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Transaction not found')
    return { resourceType: 'transaction', resourceId: data.id, data, message: `Updated transaction ${data.id}.` }
  })
}

async function deleteRecord(table: string, toolName: string, resourceType: string, args: { id: string; confirm: boolean; confirmationId?: string }, context: FinanceToolContext) {
  return runConfirmedMutation(context, toolName, args, `Delete ${resourceType} ${args.id}.`, async () => {
    const { data, error } = await asDb(context)
      .from(table)
      .delete()
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error(`${resourceType} not found`)
    return { resourceType, resourceId: args.id, data: { id: args.id }, message: `Deleted ${resourceType} ${args.id}.` }
  })
}

async function listBudgets(args: typeof listBudgetsInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('budgets')
    .select('id, category_id, period_type, period_start, period_end, limit_amount, spent, status, rollover, categories(id, name, icon, color)', { count: 'exact' })
    .eq('user_id', context.userId)
  if (args.status) query = query.eq('status', args.status)
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(args.offset, args.offset + args.limit - 1)
  if (error) throw new Error(error.message)
  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return { ok: true, message: `Loaded ${result.count} budget(s).`, data: maybeMarkdown(result, args.responseFormat, 'Budgets') }
}

async function createBudget(args: typeof createBudgetInputSchema._output, context: FinanceToolContext) {
  const { start, end } = monthBounds()
  const periodStart = toIsoDate(args.periodStart || start, 'periodStart')
  const periodEnd = toIsoDate(args.periodEnd || end, 'periodEnd')
  return runConfirmedMutation(context, 'tmm_create_budget', args, `Create ${args.periodType} budget for ${args.limitAmount.toFixed(2)}.`, async () => {
    await assertCategoryAccess(context, args.categoryId, 'expense')
    const { data, error } = await asDb(context)
      .from('budgets')
      .insert({
        user_id: context.userId,
        category_id: args.categoryId,
        period_type: args.periodType,
        period_start: periodStart,
        period_end: periodEnd,
        limit_amount: args.limitAmount,
        spent: 0,
        status: 'active',
        rollover: args.rollover,
      })
      .select('id, category_id, period_type, limit_amount, period_start, period_end, status, rollover')
      .single()
    if (error || !data) throw new Error(error?.message || 'Budget insert failed')
    return { resourceType: 'budget', resourceId: data.id, data, message: `Created budget ${data.id}.` }
  })
}

async function updateBudget(args: typeof updateBudgetInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_update_budget', args, `Update budget ${args.id}.`, async () => {
    await assertCategoryAccess(context, args.categoryId, 'expense')
    const { data, error } = await asDb(context)
      .from('budgets')
      .update(cleanUndefined({
        category_id: args.categoryId,
        period_type: args.periodType,
        period_start: args.periodStart ? toIsoDate(args.periodStart, 'periodStart') : undefined,
        period_end: args.periodEnd === null ? null : args.periodEnd ? toIsoDate(args.periodEnd, 'periodEnd') : undefined,
        limit_amount: args.limitAmount,
        rollover: args.rollover,
        updated_at: new Date().toISOString(),
      }))
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id, category_id, period_type, limit_amount, period_start, period_end, status, rollover')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Budget not found')
    return { resourceType: 'budget', resourceId: data.id, data, message: `Updated budget ${data.id}.` }
  })
}

async function listSubscriptions(args: typeof listSubscriptionsInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('subscriptions')
    .select('id, merchant, service_name, amount, currency, interval, status, next_charge_date, last_charge_date, category_id, linked_account_id, usage_score, potential_savings, notes, categories(id, name), accounts(id, name)', { count: 'exact' })
    .eq('user_id', context.userId)
  if (args.status) query = query.eq('status', args.status)
  if (args.query) query = query.or(`merchant.ilike.*${args.query}*,service_name.ilike.*${args.query}*`)
  const { data, count, error } = await query.order('merchant').range(args.offset, args.offset + args.limit - 1)
  if (error) throw new Error(error.message)
  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return { ok: true, message: `Loaded ${result.count} subscription(s).`, data: maybeMarkdown(result, args.responseFormat, 'Subscriptions') }
}

async function createSubscription(args: typeof createSubscriptionInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_create_subscription', args, `Create ${args.interval} subscription for ${args.merchant}.`, async () => {
    await assertCategoryAccess(context, args.categoryId, 'expense')
    await assertAccountAccess(context, args.linkedAccountId)
    const { data, error } = await asDb(context)
      .from('subscriptions')
      .insert({
        user_id: context.userId,
        merchant: titleCaseMerchant(args.merchant),
        service_name: args.serviceName || null,
        amount: args.amount,
        currency: args.currency,
        interval: args.interval,
        status: args.status,
        next_charge_date: toIsoDate(args.nextChargeDate, 'nextChargeDate'),
        last_charge_date: toIsoDate(args.lastChargeDate, 'lastChargeDate'),
        category_id: args.categoryId || null,
        linked_account_id: args.linkedAccountId || null,
        usage_score: args.usageScore ?? null,
        potential_savings: args.potentialSavings,
        notes: args.notes || null,
      })
      .select('id, merchant, service_name, amount, currency, interval, status')
      .single()
    if (error || !data) throw new Error(error?.message || 'Subscription insert failed')
    await asDb(context).from('subscription_events').insert({ subscription_id: data.id, user_id: context.userId, event_type: 'created' })
    return { resourceType: 'subscription', resourceId: data.id, data, message: `Created subscription ${data.id}.` }
  })
}

async function updateSubscription(args: typeof updateSubscriptionInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_update_subscription', args, `Update subscription ${args.id}.`, async () => {
    await assertCategoryAccess(context, args.categoryId, 'expense')
    await assertAccountAccess(context, args.linkedAccountId)
    const { data, error } = await asDb(context)
      .from('subscriptions')
      .update(cleanUndefined({
        merchant: args.merchant ? titleCaseMerchant(args.merchant) : undefined,
        service_name: args.serviceName === undefined ? undefined : args.serviceName || null,
        amount: args.amount,
        currency: args.currency,
        interval: args.interval,
        status: args.status,
        next_charge_date: args.nextChargeDate === undefined ? undefined : toIsoDate(args.nextChargeDate, 'nextChargeDate'),
        last_charge_date: args.lastChargeDate === undefined ? undefined : toIsoDate(args.lastChargeDate, 'lastChargeDate'),
        category_id: args.categoryId === undefined ? undefined : args.categoryId || null,
        linked_account_id: args.linkedAccountId === undefined ? undefined : args.linkedAccountId || null,
        usage_score: args.usageScore === undefined ? undefined : args.usageScore ?? null,
        potential_savings: args.potentialSavings,
        notes: args.notes === undefined ? undefined : args.notes || null,
        updated_at: new Date().toISOString(),
      }))
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id, merchant, service_name, amount, currency, interval, status')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Subscription not found')
    await asDb(context).from('subscription_events').insert({ subscription_id: data.id, user_id: context.userId, event_type: 'updated' })
    return { resourceType: 'subscription', resourceId: data.id, data, message: `Updated subscription ${data.id}.` }
  })
}

async function listGoals(args: typeof listGoalsInputSchema._output, context: FinanceToolContext) {
  let query = asDb(context)
    .from('goals')
    .select('id, name, target_amount, current_amount, target_date, priority, status, color, icon', { count: 'exact' })
    .eq('user_id', context.userId)
  if (args.status) query = query.eq('status', args.status)
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(args.offset, args.offset + args.limit - 1)
  if (error) throw new Error(error.message)
  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return { ok: true, message: `Loaded ${result.count} goal(s).`, data: maybeMarkdown(result, args.responseFormat, 'Goals') }
}

async function createGoal(args: typeof createGoalInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_create_goal', args, `Create savings goal "${args.name}" for ${args.targetAmount.toFixed(2)}.`, async () => {
    const { data, error } = await asDb(context)
      .from('goals')
      .insert({
        user_id: context.userId,
        name: args.name,
        target_amount: args.targetAmount,
        current_amount: args.currentAmount,
        target_date: toIsoDate(args.targetDate, 'targetDate'),
        priority: args.priority,
        status: args.status,
        color: args.color,
        icon: args.icon,
      })
      .select('id, name, target_amount, current_amount, target_date, status')
      .single()
    if (error || !data) throw new Error(error?.message || 'Goal insert failed')
    return { resourceType: 'goal', resourceId: data.id, data, message: `Created goal ${data.id}.` }
  })
}

async function updateGoal(args: typeof updateGoalInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_update_goal', args, `Update savings goal ${args.id}.`, async () => {
    const { data, error } = await asDb(context)
      .from('goals')
      .update(cleanUndefined({
        name: args.name,
        target_amount: args.targetAmount,
        current_amount: args.currentAmount,
        target_date: args.targetDate === undefined ? undefined : toIsoDate(args.targetDate, 'targetDate'),
        priority: args.priority,
        status: args.status,
        color: args.color,
        icon: args.icon,
        updated_at: new Date().toISOString(),
      }))
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id, name, target_amount, current_amount, target_date, status')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Goal not found')
    return { resourceType: 'goal', resourceId: data.id, data, message: `Updated goal ${data.id}.` }
  })
}

async function listDebts(args: typeof listDebtsInputSchema._output, context: FinanceToolContext) {
  const { data, count, error } = await asDb(context)
    .from('debts')
    .select('id, name, total_amount, remaining_amount, interest_rate, minimum_payment, due_date', { count: 'exact' })
    .eq('user_id', context.userId)
    .order('created_at', { ascending: false })
    .range(args.offset, args.offset + args.limit - 1)
  if (error) throw new Error(error.message)
  const result = paginatedResult(data || [], count, args.limit, args.offset)
  return { ok: true, message: `Loaded ${result.count} debt record(s).`, data: maybeMarkdown(result, args.responseFormat, 'Debts') }
}

async function createDebt(args: typeof createDebtInputSchema._output, context: FinanceToolContext) {
  const remainingAmount = args.remainingAmount ?? args.totalAmount
  return runConfirmedMutation(context, 'tmm_create_debt', args, `Create debt "${args.name}" with remaining balance ${remainingAmount.toFixed(2)}.`, async () => {
    const { data, error } = await asDb(context)
      .from('debts')
      .insert({
        user_id: context.userId,
        name: args.name,
        total_amount: args.totalAmount,
        remaining_amount: remainingAmount,
        interest_rate: args.interestRate,
        minimum_payment: args.minimumPayment,
        due_date: toIsoDate(args.dueDate, 'dueDate'),
      })
      .select('id, name, total_amount, remaining_amount, interest_rate, minimum_payment, due_date')
      .single()
    if (error || !data) throw new Error(error?.message || 'Debt insert failed')
    return { resourceType: 'debt', resourceId: data.id, data, message: `Created debt ${data.id}.` }
  })
}

async function updateDebt(args: typeof updateDebtInputSchema._output, context: FinanceToolContext) {
  return runConfirmedMutation(context, 'tmm_update_debt', args, `Update debt ${args.id}.`, async () => {
    const { data, error } = await asDb(context)
      .from('debts')
      .update(cleanUndefined({
        name: args.name,
        total_amount: args.totalAmount,
        remaining_amount: args.remainingAmount,
        interest_rate: args.interestRate,
        minimum_payment: args.minimumPayment,
        due_date: args.dueDate === undefined ? undefined : toIsoDate(args.dueDate, 'dueDate'),
        updated_at: new Date().toISOString(),
      }))
      .eq('id', args.id)
      .eq('user_id', context.userId)
      .select('id, name, total_amount, remaining_amount, interest_rate, minimum_payment, due_date')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Debt not found')
    return { resourceType: 'debt', resourceId: data.id, data, message: `Updated debt ${data.id}.` }
  })
}

export const FINANCE_TOOL_DEFINITIONS = [
  tool({ name: 'tmm_list_accounts', title: 'List Accounts', description: 'List the user accounts available for TrackMyMoney entries.', inputSchema: listAccountsInputSchema, requiredScope: 'read:settings', readOnly: true, destructive: false, idempotent: true, handler: listAccounts }),
  tool({ name: 'tmm_list_categories', title: 'List Categories', description: 'List income, expense, and transfer categories available to the user.', inputSchema: listCategoriesInputSchema, requiredScope: 'read:settings', readOnly: true, destructive: false, idempotent: true, handler: listCategories }),
  tool({ name: 'tmm_search_merchants', title: 'Search Merchants', description: 'Search previously recorded merchants for transaction entry suggestions.', inputSchema: searchMerchantsInputSchema, requiredScope: 'read:transactions', readOnly: true, destructive: false, idempotent: true, handler: searchMerchants }),
  tool({ name: 'tmm_get_overview', title: 'Get Overview', description: 'Get a redacted financial overview for the authenticated user.', inputSchema: getOverviewInputSchema, requiredScope: 'read:all', readOnly: true, destructive: false, idempotent: true, handler: getOverview }),
  tool({ name: 'tmm_list_transactions', title: 'List Transactions', description: 'List the authenticated user transactions with filters and pagination.', inputSchema: listTransactionsInputSchema, requiredScope: 'read:transactions', readOnly: true, destructive: false, idempotent: true, handler: listTransactions }),
  tool({ name: 'tmm_get_transaction', title: 'Get Transaction', description: 'Get one transaction by ID for the authenticated user.', inputSchema: getByIdInputSchema, requiredScope: 'read:transactions', readOnly: true, destructive: false, idempotent: true, handler: (args, ctx) => getRowById('transactions', 'id, amount, currency, type, category_id, account_id, merchant, description, date, status, source, categories(id, name), accounts(id, name)', args.id, ctx, args.responseFormat, 'Transaction') }),
  tool({ name: 'tmm_create_transaction', title: 'Create Transaction', description: 'Preview or create a user transaction after confirmation. First call without confirm to get a confirmationId, then call again with confirm=true and that ID.', inputSchema: createTransactionInputSchema, requiredScope: 'write:transactions', readOnly: false, destructive: false, idempotent: false, handler: createTransaction }),
  tool({ name: 'tmm_update_transaction', title: 'Update Transaction', description: 'Preview or update a transaction after confirmation.', inputSchema: updateTransactionInputSchema, requiredScope: 'write:transactions', readOnly: false, destructive: false, idempotent: false, handler: updateTransaction }),
  tool({ name: 'tmm_delete_transaction', title: 'Delete Transaction', description: 'Preview or delete a transaction after confirmation.', inputSchema: deleteByIdInputSchema, requiredScope: 'write:transactions', readOnly: false, destructive: true, idempotent: false, handler: (args, ctx) => deleteRecord('transactions', 'tmm_delete_transaction', 'transaction', args, ctx) }),
  tool({ name: 'tmm_list_budgets', title: 'List Budgets', description: 'List budgets for the authenticated user.', inputSchema: listBudgetsInputSchema, requiredScope: 'read:budgets', readOnly: true, destructive: false, idempotent: true, handler: listBudgets }),
  tool({ name: 'tmm_get_budget', title: 'Get Budget', description: 'Get one budget by ID.', inputSchema: getByIdInputSchema, requiredScope: 'read:budgets', readOnly: true, destructive: false, idempotent: true, handler: (args, ctx) => getRowById('budgets', 'id, category_id, period_type, period_start, period_end, limit_amount, spent, status, rollover, categories(id, name)', args.id, ctx, args.responseFormat, 'Budget') }),
  tool({ name: 'tmm_create_budget', title: 'Create Budget', description: 'Preview or create a category budget after confirmation.', inputSchema: createBudgetInputSchema, requiredScope: 'write:budgets', readOnly: false, destructive: false, idempotent: false, handler: createBudget }),
  tool({ name: 'tmm_update_budget', title: 'Update Budget', description: 'Preview or update a budget after confirmation.', inputSchema: updateBudgetInputSchema, requiredScope: 'write:budgets', readOnly: false, destructive: false, idempotent: false, handler: updateBudget }),
  tool({ name: 'tmm_delete_budget', title: 'Delete Budget', description: 'Preview or delete a budget after confirmation.', inputSchema: deleteByIdInputSchema, requiredScope: 'write:budgets', readOnly: false, destructive: true, idempotent: false, handler: (args, ctx) => deleteRecord('budgets', 'tmm_delete_budget', 'budget', args, ctx) }),
  tool({ name: 'tmm_list_subscriptions', title: 'List Subscriptions', description: 'List recurring subscriptions and bills.', inputSchema: listSubscriptionsInputSchema, requiredScope: 'read:subscriptions', readOnly: true, destructive: false, idempotent: true, handler: listSubscriptions }),
  tool({ name: 'tmm_get_subscription', title: 'Get Subscription', description: 'Get one subscription by ID.', inputSchema: getByIdInputSchema, requiredScope: 'read:subscriptions', readOnly: true, destructive: false, idempotent: true, handler: (args, ctx) => getRowById('subscriptions', 'id, merchant, service_name, amount, currency, interval, status, next_charge_date, last_charge_date, category_id, linked_account_id, usage_score, potential_savings, notes', args.id, ctx, args.responseFormat, 'Subscription') }),
  tool({ name: 'tmm_create_subscription', title: 'Create Subscription', description: 'Preview or create a subscription after confirmation.', inputSchema: createSubscriptionInputSchema, requiredScope: 'write:subscriptions', readOnly: false, destructive: false, idempotent: false, handler: createSubscription }),
  tool({ name: 'tmm_update_subscription', title: 'Update Subscription', description: 'Preview or update a subscription after confirmation.', inputSchema: updateSubscriptionInputSchema, requiredScope: 'write:subscriptions', readOnly: false, destructive: false, idempotent: false, handler: updateSubscription }),
  tool({ name: 'tmm_delete_subscription', title: 'Delete Subscription', description: 'Preview or delete a subscription after confirmation.', inputSchema: deleteByIdInputSchema, requiredScope: 'write:subscriptions', readOnly: false, destructive: true, idempotent: false, handler: (args, ctx) => deleteRecord('subscriptions', 'tmm_delete_subscription', 'subscription', args, ctx) }),
  tool({ name: 'tmm_list_goals', title: 'List Goals', description: 'List savings goals.', inputSchema: listGoalsInputSchema, requiredScope: 'read:goals', readOnly: true, destructive: false, idempotent: true, handler: listGoals }),
  tool({ name: 'tmm_get_goal', title: 'Get Goal', description: 'Get one savings goal by ID.', inputSchema: getByIdInputSchema, requiredScope: 'read:goals', readOnly: true, destructive: false, idempotent: true, handler: (args, ctx) => getRowById('goals', 'id, name, target_amount, current_amount, target_date, priority, status, color, icon', args.id, ctx, args.responseFormat, 'Goal') }),
  tool({ name: 'tmm_create_goal', title: 'Create Goal', description: 'Preview or create a savings goal after confirmation.', inputSchema: createGoalInputSchema, requiredScope: 'write:goals', readOnly: false, destructive: false, idempotent: false, handler: createGoal }),
  tool({ name: 'tmm_update_goal', title: 'Update Goal', description: 'Preview or update a savings goal after confirmation.', inputSchema: updateGoalInputSchema, requiredScope: 'write:goals', readOnly: false, destructive: false, idempotent: false, handler: updateGoal }),
  tool({ name: 'tmm_delete_goal', title: 'Delete Goal', description: 'Preview or delete a savings goal after confirmation.', inputSchema: deleteByIdInputSchema, requiredScope: 'write:goals', readOnly: false, destructive: true, idempotent: false, handler: (args, ctx) => deleteRecord('goals', 'tmm_delete_goal', 'goal', args, ctx) }),
  tool({ name: 'tmm_list_debts', title: 'List Debts', description: 'List debt records.', inputSchema: listDebtsInputSchema, requiredScope: 'read:debts', readOnly: true, destructive: false, idempotent: true, handler: listDebts }),
  tool({ name: 'tmm_get_debt', title: 'Get Debt', description: 'Get one debt record by ID.', inputSchema: getByIdInputSchema, requiredScope: 'read:debts', readOnly: true, destructive: false, idempotent: true, handler: (args, ctx) => getRowById('debts', 'id, name, total_amount, remaining_amount, interest_rate, minimum_payment, due_date', args.id, ctx, args.responseFormat, 'Debt') }),
  tool({ name: 'tmm_create_debt', title: 'Create Debt', description: 'Preview or create a debt record after confirmation.', inputSchema: createDebtInputSchema, requiredScope: 'write:debts', readOnly: false, destructive: false, idempotent: false, handler: createDebt }),
  tool({ name: 'tmm_update_debt', title: 'Update Debt', description: 'Preview or update a debt record after confirmation.', inputSchema: updateDebtInputSchema, requiredScope: 'write:debts', readOnly: false, destructive: false, idempotent: false, handler: updateDebt }),
  tool({ name: 'tmm_delete_debt', title: 'Delete Debt', description: 'Preview or delete a debt record after confirmation.', inputSchema: deleteByIdInputSchema, requiredScope: 'write:debts', readOnly: false, destructive: true, idempotent: false, handler: (args, ctx) => deleteRecord('debts', 'tmm_delete_debt', 'debt', args, ctx) }),
] satisfies FinanceToolDefinition[]

const FINANCE_TOOL_MAP: Map<string, FinanceToolDefinition> = new Map(
  FINANCE_TOOL_DEFINITIONS.map((definition) => [definition.name, definition as FinanceToolDefinition])
)

export function getFinanceToolDefinition(name: string) {
  return FINANCE_TOOL_MAP.get(name)
}

export async function executeFinanceTool(
  name: string,
  input: unknown,
  context: FinanceToolContext
): Promise<FinanceToolResult> {
  const definition = getFinanceToolDefinition(name)
  if (!definition) {
    return { ok: false, message: `Unknown TrackMyMoney tool: ${name}` }
  }

  try {
    assertScope(context, definition.requiredScope)
    const args = parseInput(definition.inputSchema, input)
    return await definition.handler(args, context)
  } catch (error) {
    return serializeToolError(error)
  }
}

export function listFinanceToolMetadata() {
  return FINANCE_TOOL_DEFINITIONS.map(({ name, title, description, requiredScope, readOnly, destructive }) => ({
    name,
    title,
    description,
    requiredScope,
    readOnly,
    destructive,
  }))
}
