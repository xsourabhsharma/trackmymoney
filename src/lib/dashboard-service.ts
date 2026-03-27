import { createClient } from '@/utils/supabase/server';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format } from 'date-fns';
import { computeInflow, computeOutflow, computeNetPosition, computeSavingsRate, computeExpenseBreakdown, computeCashflowSeries, computeTopSpending } from './overview-engine';
import { computeFinancialHealth } from './financial-health';
import type { OverviewPeriod, OverviewData, AiInsightRecord } from './types';

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
      .select('id, name, balance, type')
      .eq('user_id', userId),

   
    supabase
      .from('subscriptions')
      .select('id, merchant, amount, cadence, next_charge_date, category_id, categories(name, icon, color)')
      .eq('user_id', userId)
      .gte('next_charge_date', new Date().toISOString())
      .order('next_charge_date', { ascending: true })
      .limit(5),

   
    supabase
      .from('budgets')
      .select('id, limit_amount, spent, category_id, status')
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
      .eq('user_id', userId)
      .then(res => {
        if (res.error) {
         
          return supabase
            .from('debt_tracker')
            .select('id, name, total_amount, remaining_amount')
            .eq('user_id', userId);
        }
        return res;
      }),

   
    supabase
      .from('ai_insights')
      .select('id, period, insights_json, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const transactions = txResult.data || [];
  const accounts = accountsResult.data || [];
  const subscriptions = subsResult.data || [];
  const budgets = budgetsResult.data || [];
  const goals = goalsResult.data || [];
  const debts = debtsResult.data || [];

 
  const inflow = computeInflow(transactions as any);
  const outflow = computeOutflow(transactions as any);
  const netPosition = computeNetPosition(inflow, outflow);
  const savingsRate = computeSavingsRate(inflow, outflow);
  const accountBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const expenseBreakdown = computeExpenseBreakdown(transactions as any, outflow);
  const cashflowSeries = computeCashflowSeries(transactions as any);
  const topSpending = computeTopSpending(expenseBreakdown);
  const recentTransactions = transactions.slice(0, 10);

 
  const upcomingCharges = subscriptions.map((s: any) => {
    const cat = Array.isArray(s.categories) ? s.categories[0] : s.categories;
    return {
      id: s.id,
      merchant: s.merchant,
      amount: Number(s.amount),
      cadence: s.cadence,
      nextChargeDate: s.next_charge_date,
      icon: cat?.icon || '💳',
      color: cat?.color || '#3B82F6',
    };
  });

 
  const financialHealth = computeFinancialHealth({
    savingsRate,
    budgets: budgets.map((b: any) => ({
      limitAmount: Number(b.limit_amount || 0),
      spent: Number(b.spent || 0),
    })),
    goals: goals.map((g: any) => ({
      targetAmount: Number(g.target_amount || 0),
      currentAmount: Number(g.current_amount || 0),
    })),
    debts: debts.map((d: any) => ({
      totalAmount: Number(d.total_amount || 0),
      remainingAmount: Number(d.remaining_amount || 0),
    })),
  });

 
  let lastInsight: AiInsightRecord | null = null;
  const insightRows = insightResult.data;
  if (insightRows && insightRows.length > 0) {
    const row = insightRows[0] as any;
    lastInsight = {
      id: row.id,
      period: row.period,
      insights: (row.insights_json as any[]) || [],
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
    expenseBreakdown,
    cashflowSeries,
    recentTransactions: recentTransactions as any,
    upcomingCharges,
    topSpending,
    financialHealth,
    lastInsight,
  };
}
