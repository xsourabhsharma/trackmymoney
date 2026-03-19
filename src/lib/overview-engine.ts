// ─── Overview Metrics Engine ───
// Pure computation functions — no DB calls, no side effects.
// All amounts are expected as numbers (already parsed from decimal strings).

import { format, parseISO } from 'date-fns';
import type { ExpenseBreakdownItem, CashflowPoint, TopSpendingItem } from './types';

interface TransactionRow {
  id: string;
  amount: string | number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  category_id?: string | null;
  categories?: { id?: string; name: string; icon?: string | null; color?: string | null } | null;
}

/** Sum of all income transactions */
export function computeInflow(transactions: TransactionRow[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/** Sum of all expense transactions */
export function computeOutflow(transactions: TransactionRow[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/** Inflow minus Outflow for the period */
export function computeNetPosition(inflow: number, outflow: number): number {
  return inflow - outflow;
}

/** Savings efficiency = (Inflow - Outflow) / Inflow * 100 */
export function computeSavingsRate(inflow: number, outflow: number): number {
  if (inflow <= 0) return 0;
  return ((inflow - outflow) / inflow) * 100;
}

/** Group expenses by category with percentages */
export function computeExpenseBreakdown(transactions: TransactionRow[], outflowTotal: number): ExpenseBreakdownItem[] {
  const map: Record<string, { amount: number; name: string; icon: string; color: string }> = {};

  transactions
    .filter(t => t.type === 'expense' && t.category_id)
    .forEach(t => {
      const catId = t.category_id!;
      if (!map[catId]) {
        const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories;
        map[catId] = {
          amount: 0,
          name: cat?.name || 'Uncategorized',
          icon: cat?.icon || '📦',
          color: cat?.color || '#3B82F6',
        };
      }
      map[catId].amount += Number(t.amount);
    });

  return Object.entries(map)
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      icon: data.icon,
      color: data.color,
      amount: data.amount,
      percentage: outflowTotal > 0 ? (data.amount / outflowTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Build daily cashflow timeseries for charts */
export function computeCashflowSeries(transactions: TransactionRow[]): CashflowPoint[] {
  const flowMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    try {
      const dateStr = typeof t.date === 'string' ? t.date : new Date(t.date).toISOString();
      const dateKey = format(parseISO(dateStr), 'yyyy-MM-dd');
      if (!flowMap[dateKey]) flowMap[dateKey] = { income: 0, expense: 0 };
      if (t.type === 'income') flowMap[dateKey].income += Number(t.amount);
      if (t.type === 'expense') flowMap[dateKey].expense += Number(t.amount);
    } catch {
      // skip malformed dates
    }
  });

  return Object.entries(flowMap)
    .map(([date, data]) => ({ date, income: data.income, expense: data.expense }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Top N spending categories with percentage share */
export function computeTopSpending(breakdown: ExpenseBreakdownItem[], limit = 5): TopSpendingItem[] {
  return breakdown.slice(0, limit).map(item => ({
    categoryName: item.categoryName,
    icon: item.icon,
    color: item.color,
    amount: item.amount,
    percentage: item.percentage,
  }));
}
