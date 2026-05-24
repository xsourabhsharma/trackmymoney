import { createClient } from '@/utils/supabase/server';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { computeInflow, computeOutflow, computeNetPosition, computeSavingsRate, computeExpenseBreakdown, computeCashflowSeries, computeTopSpending } from './overview-engine';
import { computeFinancialHealth } from './financial-health';
import type { OverviewPeriod, OverviewData, AiInsight, AiInsightRecord } from './types';
import type { SubscriptionInterval } from './contracts';

type CategoryRelation = {
  id?: string | null;
  name?: string | null;
  icon?: string | null;
  color?: string | null;
} | Array<{
  id?: string | null;
  name?: string | null;
  icon?: string | null;
  color?: string | null;
}> | null;

type TransactionOverviewRow = {
  id: string;
  amount: string | number;
  type: 'income' | 'expense' | 'transfer';
  merchant: string | null;
  description: string | null;
  date: string;
  category_id: string | null;
  categories?: {
    id?: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

type AccountBalanceRow = {
  id: string;
  name: string;
  type: string;
  balance: string | number | null;
  color: string | null;
};

type BudgetSnapshotRow = {
  limit_amount: string | number | null;
  spent: string | number | null;
  categories?: CategoryRelation;
};

type GoalSnapshotRow = {
  target_amount: string | number | null;
  current_amount: string | number | null;
};

type DebtSnapshotRow = {
  total_amount: string | number | null;
  remaining_amount: string | number | null;
};

type UpcomingSubscriptionRow = {
  id: string;
  merchant: string;
  amount: string | number;
  interval: SubscriptionInterval;
  next_charge_date: string | null;
  category_id: string | null;
  categories?: CategoryRelation;
};

type InsightRow = {
  id: string;
  period: string;
  insights_json: unknown;
  created_at: string;
};

export type DashboardRange = OverviewPeriod;
export type { OverviewData as DashboardOverview };

function getDateRange(period: OverviewPeriod): { startDate: Date; endDate: Date } {
  const now = new Date();
  switch (period) {
    case 'this-week':
      return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'this-month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case 'last-month':
      return { startDate: startOfMonth(subMonths(now, 1)), endDate: endOfMonth(subMonths(now, 1)) };
    case 'last-3-months':
      return { startDate: subMonths(now, 3), endDate: now };
    case 'this-year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };
    case 'all-time':
      return { startDate: new Date(0), endDate: now };
    default:
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
  }
}

export async function getDashboardOverview(period: OverviewPeriod): Promise<OverviewData> {
  return loadOverviewData(period);
}

export async function loadOverviewData(period: OverviewPeriod): Promise<OverviewData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const userId = user.id;
  const { startDate, endDate } = getDateRange(period);
  const fromISO = startDate.toISOString();
  const toISO = endDate.toISOString();

  const getRelation = <T>(value: T | T[] | null | undefined): T | null => {
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
  };


  const [
    txResult,
    accountsResult,
    subsResult,
    budgetsResult,
    goalsResult,
    debtsResult,
    insightResult,
  ] = await Promise.all([

    supabase
      .from('transactions')
      .select('id, amount, type, merchant, description, date, category_id, categories(id, name, icon, color)')
      .eq('user_id', userId)
      .gte('date', fromISO)
      .lte('date', toISO)
      .order('date', { ascending: false }),


    supabase
      .from('accounts')
      .select('id, name, balance, type, color')
      .eq('user_id', userId),


    supabase
      .from('subscriptions')
      .select('id, merchant, amount, interval, next_charge_date, category_id, categories(name, icon, color)')
      .eq('user_id', userId)
      .gte('next_charge_date', new Date().toISOString())
      .order('next_charge_date', { ascending: true })
      .limit(5),


    supabase
      .from('budgets')
      .select('id, limit_amount, spent, category_id, status, categories(name)')
      .eq('user_id', userId)
      .eq('status', 'active'),


    supabase
      .from('goals')
      .select('id, name, target_amount, current_amount, status')
      .eq('user_id', userId)
      .eq('status', 'active'),


    supabase
      .from('debts')
      .select('id, name, total_amount, remaining_amount')
      .eq('user_id', userId),


    supabase
      .from('ai_insights')
      .select('id, period, insights_json, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const transactions = (txResult.data || []) as TransactionOverviewRow[];
  const accounts = (accountsResult.data || []) as AccountBalanceRow[];
  const subscriptions = (subsResult.data || []) as UpcomingSubscriptionRow[];
  const budgets = (budgetsResult.data || []) as BudgetSnapshotRow[];
  const goals = (goalsResult.data || []) as GoalSnapshotRow[];
  const debts = (debtsResult.data || []) as DebtSnapshotRow[];


  const inflow = computeInflow(transactions);
  const outflow = computeOutflow(transactions);
  const netPosition = computeNetPosition(inflow, outflow);
  const savingsRate = computeSavingsRate(inflow, outflow);
  const accountBalance = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const accountBreakdown = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: Number(account.balance || 0),
    color: account.color || null,
  }));
  const expenseBreakdown = computeExpenseBreakdown(transactions, outflow);
  const cashflowSeries = computeCashflowSeries(transactions);
  const topSpending = computeTopSpending(expenseBreakdown);
  const recentTransactions = transactions.slice(0, 10);
  const monthlyLimit = budgets.reduce((sum, b) => sum + Number(b.limit_amount || 0), 0);
  const monthlySpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0) || outflow;
  const discretionaryBudget = budgets.find((b) => {
    const cat = getRelation(b.categories);
    return /dining|food|entertainment|shopping/i.test(cat?.name || '');
  });
  const discretionaryLimit = Number(discretionaryBudget?.limit_amount || 0);
  const discretionarySpent = discretionaryBudget
    ? Number(discretionaryBudget.spent || 0)
    : expenseBreakdown
        .filter((item) => /dining|food|entertainment|shopping/i.test(item.categoryName))
        .reduce((sum, item) => sum + item.amount, 0);


  const upcomingCharges = subscriptions
    .filter((s): s is UpcomingSubscriptionRow & { next_charge_date: string } => Boolean(s.next_charge_date))
    .map((s) => {
      const cat = getRelation(s.categories);
      return {
        id: s.id,
        merchant: s.merchant,
        amount: Number(s.amount),
        cadence: s.interval,
        nextChargeDate: s.next_charge_date,
        icon: cat?.icon || 'card',
        color: cat?.color || '#3B82F6',
      };
    });


  const financialHealth = computeFinancialHealth({
    savingsRate,
    budgets: budgets.map((b) => ({
      limitAmount: Number(b.limit_amount || 0),
      spent: Number(b.spent || 0),
    })),
    goals: goals.map((g) => ({
      targetAmount: Number(g.target_amount || 0),
      currentAmount: Number(g.current_amount || 0),
    })),
    debts: debts.map((d) => ({
      totalAmount: Number(d.total_amount || 0),
      remainingAmount: Number(d.remaining_amount || 0),
    })),
  });


  let lastInsight: AiInsightRecord | null = null;
  const insightRows = insightResult.data;
  if (insightRows && insightRows.length > 0) {
    const row = insightRows[0] as InsightRow;
    lastInsight = {
      id: row.id,
      period: row.period,
      insights: Array.isArray(row.insights_json) ? (row.insights_json as AiInsight[]) : [],
      createdAt: row.created_at,
    };
  }

  return {
    period,
    metrics: {
      netPosition,
      inflow,
      outflow,
      savingsRate,
      totalAccounts: accounts.length,
      accountBalance,
    },
    accounts: accountBreakdown,
    budgetSnapshot: {
      hasDiscretionaryBudget: Boolean(discretionaryBudget),
      hasMonthlyBudget: monthlyLimit > 0,
      monthlySpent,
      monthlyLimit,
      discretionarySpent,
      discretionaryLimit,
    },
    expenseBreakdown,
    cashflowSeries,
    recentTransactions: recentTransactions as unknown as OverviewData['recentTransactions'],
    upcomingCharges,
    topSpending,
    financialHealth,
    lastInsight,
  };
}
