import { createClient } from '@/utils/supabase/server';
import { getDateRangeForPeriod, TransactionsPeriod } from '@/lib/date-utils';

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSortColumn = 'date' | 'merchant' | 'amount';
export type TransactionSortDirection = 'asc' | 'desc';

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
  category_id?: string | null;
  categories?: JoinedCategory | null;
  type: TransactionType;
  accountId: string | null;
  accountName: string | null;
  account_id?: string | null;
  accounts?: JoinedAccount | null;
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
  dataWarning?: string;
}

interface JoinedCategory {
  id?: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface JoinedAccount {
  id: string;
  name: string;
}

interface TransactionSelectRow {
  id: string;
  date: string;
  merchant: string | null;
  description: string | null;
  type: TransactionType;
  amount: string | number;
  currency: string | null;
  status: string | null;
  category_id: string | null;
  account_id: string | null;
  categories: JoinedCategory | JoinedCategory[] | null;
  accounts: JoinedAccount | JoinedAccount[] | null;
}

interface TransactionAggregateRow {
  type: TransactionType;
  amount: string | number;
  category_id: string | null;
  categories: Omit<JoinedCategory, 'id'> | Array<Omit<JoinedCategory, 'id'>> | null;
}

const TRANSACTION_PERIODS: readonly TransactionsPeriod[] = [
  'this_month',
  'last_month',
  'last_3_months',
  'this_year',
  'all_time',
];

const TRANSACTION_TYPES: ReadonlyArray<TransactionType | 'all'> = [
  'all',
  'income',
  'expense',
  'transfer',
];

const TRANSACTION_SORT_COLUMNS: readonly TransactionSortColumn[] = ['date', 'merchant', 'amount'];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_SEARCH_LENGTH = 80;

export function normalizeTransactionPeriod(value: unknown): TransactionsPeriod {
  return typeof value === 'string' && TRANSACTION_PERIODS.includes(value as TransactionsPeriod)
    ? value as TransactionsPeriod
    : 'this_month';
}

export function normalizeTransactionType(value: unknown): TransactionType | 'all' {
  return typeof value === 'string' && TRANSACTION_TYPES.includes(value as TransactionType | 'all')
    ? value as TransactionType | 'all'
    : 'all';
}

export function normalizeTransactionId(value: unknown): string {
  if (typeof value !== 'string' || value === 'all' || value.trim() === '') return 'all';
  return UUID_PATTERN.test(value) ? value : 'all';
}

export function sanitizeTransactionSearchTerm(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s@&.'+#:/-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

export function normalizeTransactionPage(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? Math.max(1, Math.trunc(parsed)) : 1;
}

export function normalizeTransactionPageSize(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return 25;
  return Math.min(100, Math.max(1, Math.trunc(parsed)));
}

export function normalizeTransactionSortColumn(value: unknown): TransactionSortColumn {
  return typeof value === 'string' && TRANSACTION_SORT_COLUMNS.includes(value as TransactionSortColumn)
    ? value as TransactionSortColumn
    : 'date';
}

export function normalizeTransactionSortDirection(value: unknown): TransactionSortDirection {
  return value === 'asc' ? 'asc' : 'desc';
}

function normalizeTransactionFilter(filter: TransactionFilter): TransactionFilter {
  return {
    period: normalizeTransactionPeriod(filter.period),
    type: normalizeTransactionType(filter.type),
    categoryId: normalizeTransactionId(filter.categoryId),
    accountId: normalizeTransactionId(filter.accountId),
    merchantQuery: sanitizeTransactionSearchTerm(filter.merchantQuery),
  };
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function merchantSearchFilter(searchTerm: string) {
  return `merchant.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*`;
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

  const safeFilter = normalizeTransactionFilter(filter);
  const safePage = normalizeTransactionPage(page);
  const safePageSize = normalizeTransactionPageSize(pageSize);
  const safeSortCol = normalizeTransactionSortColumn(sortCol);
  const safeSortDir = normalizeTransactionSortDirection(sortDir);
  const { startDate, endDate } = getDateRangeForPeriod(safeFilter.period);

  let baseQuery = supabase
    .from('transactions')
    .select(`
      id, date, merchant, description, type, amount, currency, status,
      account_id,
      category_id,
      categories ( id, name, icon, color ),
      accounts ( id, name )
    `, { count: 'exact' })
    .eq('user_id', user.id);

  if (startDate) baseQuery = baseQuery.gte('date', startDate);
  if (endDate) baseQuery = baseQuery.lte('date', endDate);
  if (safeFilter.type !== 'all') baseQuery = baseQuery.eq('type', safeFilter.type);
  if (safeFilter.categoryId && safeFilter.categoryId !== 'all') {
    baseQuery = baseQuery.eq('category_id', safeFilter.categoryId);
  }
  if (safeFilter.accountId && safeFilter.accountId !== 'all') {
    baseQuery = baseQuery.eq('account_id', safeFilter.accountId);
  }
  if (safeFilter.merchantQuery) {
    baseQuery = baseQuery.or(merchantSearchFilter(safeFilter.merchantQuery));
  }

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let aggQuery = supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name, icon, color)')
    .eq('user_id', user.id);

  if (startDate) aggQuery = aggQuery.gte('date', startDate);
  if (endDate) aggQuery = aggQuery.lte('date', endDate);
  if (safeFilter.type !== 'all') aggQuery = aggQuery.eq('type', safeFilter.type);
  if (safeFilter.categoryId && safeFilter.categoryId !== 'all') {
    aggQuery = aggQuery.eq('category_id', safeFilter.categoryId);
  }
  if (safeFilter.accountId && safeFilter.accountId !== 'all') {
    aggQuery = aggQuery.eq('account_id', safeFilter.accountId);
  }
  if (safeFilter.merchantQuery) {
    aggQuery = aggQuery.or(merchantSearchFilter(safeFilter.merchantQuery));
  }

  const [
    { data: paginatedRows, count, error: rowsError },
    { data: aggregateRows, error: aggError }
  ] = await Promise.all([
    baseQuery
      .order(safeSortCol, { ascending: safeSortDir === 'asc' })
      .range(from, to),
    aggQuery
  ]);

  if (rowsError) {
    console.error("Transactions Fetch Error:", rowsError.message, rowsError.details, rowsError.hint);
  }
  if (aggError) {
    console.error("Aggregates Fetch Error:", aggError.message, aggError.details, aggError.hint);
  }

  const transactions: TransactionRow[] = ((paginatedRows || []) as unknown as TransactionSelectRow[]).map((row) => {
    const category = unwrapJoin(row.categories);
    const account = unwrapJoin(row.accounts);

    return {
      id: row.id,
      date: row.date,
      merchant: row.merchant || 'Unknown Merchant',
      description: row.description,
      type: row.type,
      amount: Number(row.amount),
      currency: row.currency || 'USD',
      status: row.status || 'cleared',
      categoryId: row.category_id,
      categoryName: category?.name || null,
      categoryIcon: category?.icon || null,
      categoryColor: category?.color || null,
      category_id: row.category_id,
      categories: category,
      accountId: row.account_id,
      accountName: account?.name || null,
      account_id: row.account_id,
      accounts: account,
    };
  });

  let inflow = 0;
  let outflow = 0;
  const categorySpendingMap = new Map<string, SpendingByCategoryItem>();

  ((aggregateRows || []) as unknown as TransactionAggregateRow[]).forEach((row) => {
    const amt = Number(row.amount) || 0;
    const category = unwrapJoin(row.categories);

    if (row.type === 'income') {
      inflow += amt;
    } else if (row.type === 'expense') {
      outflow += amt;

      if (row.category_id && category) {
        if (!categorySpendingMap.has(row.category_id)) {
          categorySpendingMap.set(row.category_id, {
            categoryId: row.category_id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            amount: 0
          });
        }
        categorySpendingMap.get(row.category_id)!.amount += amt;
      }
    }
  });

  const spendingByCategory = Array.from(categorySpendingMap.values())
    .sort((a, b) => b.amount - a.amount);

  return {
    filter: safeFilter,
    metrics: {
      inflow,
      outflow,
      netPosition: inflow - outflow
    },
    transactions,
    totalCount: rowsError ? 0 : count || 0,
    page: safePage,
    pageSize: safePageSize,
    spendingByCategory,
    dataWarning: rowsError || aggError
      ? 'Some transaction data could not be loaded. Refresh the page or adjust the filters.'
      : undefined
  };
}
