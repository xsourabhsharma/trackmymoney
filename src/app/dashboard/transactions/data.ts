import { createClient } from '@/utils/supabase/server';
import { getDateRangeForPeriod, TransactionsPeriod } from '@/lib/date-utils';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface TransactionFilter {
  period: TransactionsPeriod;
  type: TransactionType | 'all';
  categoryId?: string;
  accountId?: string;
  merchantQuery?: string;
}

export interface TransactionRow {
  id: string;
  date: string;
  merchant: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
  type: TransactionType;
  accountId: string | null;
  accountName: string | null;
  amount: number;
  currency: string;
  status: string;
}

export interface TransactionsMetrics {
  inflow: number;
  outflow: number;
  netPosition: number;
}

export interface SpendingByCategoryItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  amount: number;
}

export interface TransactionsPageData {
  filter: TransactionFilter;
  metrics: TransactionsMetrics;
  transactions: TransactionRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  spendingByCategory: SpendingByCategoryItem[];
}

export async function loadTransactionsPageData(
  filter: TransactionFilter,
  page: number = 1,
  pageSize: number = 25,
  sortCol: string = 'date',
  sortDir: string = 'desc'
): Promise<TransactionsPageData> {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    throw new Error("Unauthorized");
  }

  const { startDate, endDate } = getDateRangeForPeriod(filter.period);

  // 1. Build the base query for transactions
  let baseQuery = supabase
    .from('transactions')
    .select(`
      id, date, merchant, description, type, amount, currency, status,
      account_id,
      category_id,
      categories!transactions_category_id_fkey ( id, name, icon, color ),
      accounts ( id, name )
    `, { count: 'exact' });

  baseQuery = baseQuery.eq('user_id', user.id);

  if (startDate) baseQuery = baseQuery.gte('date', startDate);
  if (endDate) baseQuery = baseQuery.lte('date', endDate);
  
  if (filter.type !== 'all') {
    baseQuery = baseQuery.eq('type', filter.type);
  }
  
  if (filter.categoryId && filter.categoryId !== 'all') {
    baseQuery = baseQuery.eq('category_id', filter.categoryId);
  }
  
  if (filter.accountId && filter.accountId !== 'all') {
    baseQuery = baseQuery.eq('account_id', filter.accountId);
  }

  if (filter.merchantQuery) {
    baseQuery = baseQuery.or(`merchant.ilike.%${filter.merchantQuery}%,description.ilike.%${filter.merchantQuery}%`);
  }

  // Add pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 2. We also need aggregates. Since Supabase PostgREST doesn't support complex GROUP BY queries easily,
  // we will execute RPC if defined, or we can fetch the filtered dataset for the period if it's small,
  // OR we use the database to do the heavy lifting via an rpc function.
  // Assuming no custom RPC is deployed yet, we have to fetch the matching rows for aggregates.
  // To avoid pulling 50,000 rows into JS, we SHOULD use an RPC. Wait, if we pull just 'type, amount, category_id'
  // for the current filter it's usually < 1000 rows. Let's do a lightweight aggregate fetch.
  
  let aggQuery = supabase
    .from('transactions')
    .select('type, amount, category_id, categories!transactions_category_id_fkey(name, icon, color)')
    .eq('user_id', user.id);

  if (startDate) aggQuery = aggQuery.gte('date', startDate);
  if (endDate) aggQuery = aggQuery.lte('date', endDate);
  if (filter.type !== 'all') aggQuery = aggQuery.eq('type', filter.type);
  if (filter.categoryId && filter.categoryId !== 'all') aggQuery = aggQuery.eq('category_id', filter.categoryId);
  if (filter.accountId && filter.accountId !== 'all') aggQuery = aggQuery.eq('account_id', filter.accountId);
  if (filter.merchantQuery) aggQuery = aggQuery.or(`merchant.ilike.%${filter.merchantQuery}%,description.ilike.%${filter.merchantQuery}%`);

  const [
    { data: paginatedRows, count, error: rowsError },
    { data: aggregateRows, error: aggError }
  ] = await Promise.all([
    baseQuery.order(sortCol === 'amount' ? 'amount' : sortCol === 'merchant' ? 'merchant' : 'date', { ascending: sortDir === 'asc' }).range(from, to),
    aggQuery
  ]);

  if (rowsError) console.error("Transactions Fetch Error:", rowsError?.message, rowsError?.details, rowsError?.hint);
  if (aggError) console.error("Aggregates Fetch Error:", aggError?.message, aggError?.details, aggError?.hint);

  // Parse paginated results
  const transactions: TransactionRow[] = (paginatedRows || []).map((row: any) => ({
    id: row.id,
    date: row.date,
    merchant: row.merchant,
    description: row.description,
    type: row.type as TransactionType,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    categoryId: row.category_id,
    categoryName: row.categories?.name || null,
    categoryIcon: row.categories?.icon || null,
    categoryColor: row.categories?.color || null,
    accountId: row.account_id,
    accountName: row.accounts?.name || null,
  }));

  // Process Aggregates
  let inflow = 0;
  let outflow = 0;
  const categorySpendingMap = new Map<string, SpendingByCategoryItem>();

  (aggregateRows || []).forEach((row: any) => {
    const amt = Number(row.amount) || 0;
    
    if (row.type === 'income') {
      inflow += amt;
    } else if (row.type === 'expense') {
      outflow += amt;
      
      // Accumulate category spending (expenses only)
      if (row.category_id && row.categories) {
        if (!categorySpendingMap.has(row.category_id)) {
          categorySpendingMap.set(row.category_id, {
            categoryId: row.category_id,
            categoryName: row.categories.name,
            categoryIcon: row.categories.icon,
            categoryColor: row.categories.color,
            amount: 0
          });
        }
        categorySpendingMap.get(row.category_id)!.amount += amt;
      }
    }
    // transfers do not affect inflow/outflow bounds directly in this model unless explicitly requested
  });

  const spendingByCategory = Array.from(categorySpendingMap.values())
    .sort((a, b) => b.amount - a.amount); // Sort by highest spend

  return {
    filter,
    metrics: {
      inflow,
      outflow,
      netPosition: inflow - outflow
    },
    transactions,
    totalCount: count || 0,
    page,
    pageSize,
    spendingByCategory
  };
}
