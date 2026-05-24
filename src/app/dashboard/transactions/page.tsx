import { Metadata } from 'next'
import {
  loadTransactionsPageData,
  normalizeTransactionId,
  normalizeTransactionPage,
  normalizeTransactionPageSize,
  normalizeTransactionPeriod,
  normalizeTransactionSortColumn,
  normalizeTransactionSortDirection,
  normalizeTransactionType,
  sanitizeTransactionSearchTerm,
  TransactionFilter,
} from './data'

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'View, filter, and manage all your tracked income and expenses.',
}
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { TransactionsFilterBar } from '@/components/dashboard/TransactionsFilterBar'
import { TransactionsSummaryMetrics } from '@/components/dashboard/TransactionsSummaryMetrics'
import { SpendingByCategoryPanel } from '@/components/dashboard/SpendingByCategoryPanel'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'
import { BudgetsSnapshotPanel } from '@/components/dashboard/BudgetsSnapshotPanel'

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  
  const filter: TransactionFilter = {
    period: normalizeTransactionPeriod(firstSearchParam(resolvedSearchParams?.period)),
    type: normalizeTransactionType(firstSearchParam(resolvedSearchParams?.type)),
    categoryId: normalizeTransactionId(firstSearchParam(resolvedSearchParams?.cat)),
    accountId: normalizeTransactionId(firstSearchParam(resolvedSearchParams?.account)),
    merchantQuery: sanitizeTransactionSearchTerm(firstSearchParam(resolvedSearchParams?.q)),
  }
  
  const page = normalizeTransactionPage(firstSearchParam(resolvedSearchParams?.page))
  const pageSize = normalizeTransactionPageSize(firstSearchParam(resolvedSearchParams?.limit))
  const sortCol = normalizeTransactionSortColumn(firstSearchParam(resolvedSearchParams?.sort))
  const sortDir = normalizeTransactionSortDirection(firstSearchParam(resolvedSearchParams?.dir))

 
  const pageData = await loadTransactionsPageData(filter, page, pageSize, sortCol, sortDir)

 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [ { data: categories }, { data: accounts } ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, color, icon, type')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name'),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name')
  ])
  const categoryOptions = (categories || []).map((category) => ({
    ...category,
    icon: category.icon ?? undefined,
  }))

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
        <DashboardSubNav />
      </div>

      {}
      <TransactionsFilterBar 
        categories={categoryOptions}
        accounts={accounts || []}
        currentPeriod={filter.period}
        currentType={filter.type}
        currentCategoryId={filter.categoryId || 'all'}
        currentAccountId={filter.accountId || 'all'}
        currentQuery={filter.merchantQuery || ''}
      />

      {pageData.dataWarning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {pageData.dataWarning}
        </div>
      )}

      {}
      <TransactionsSummaryMetrics metrics={pageData.metrics} />

      {}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
        
        {}
        <div className="tm-panel-dark flex flex-col gap-6 overflow-hidden p-6">
          <div className="pb-4 border-b border-[var(--border-light)] flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Ledger</h3>
            <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {pageData.totalCount} matching records
            </span>
          </div>

          {}
          <TransactionsTable 
            transactions={pageData.transactions}
            categories={categoryOptions}
            accounts={accounts || []}
            totalCount={pageData.totalCount}
            currentPage={pageData.page}
            pageSize={pageData.pageSize}
          />
        </div>

        {}
        <div className="flex flex-col gap-6">
          <SpendingByCategoryPanel items={pageData.spendingByCategory} />
          <BudgetsSnapshotPanel />
        </div>
      </div>
    </div>
  )
}
