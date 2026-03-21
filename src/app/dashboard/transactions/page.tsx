import { loadTransactionsPageData, TransactionFilter, TransactionType } from './data'
import { TransactionsPeriod } from '@/lib/date-utils'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { TransactionsFilterBar } from '@/components/dashboard/TransactionsFilterBar'
import { TransactionsSummaryMetrics } from '@/components/dashboard/TransactionsSummaryMetrics'
import { SpendingByCategoryPanel } from '@/components/dashboard/SpendingByCategoryPanel'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'
import { BudgetsSnapshotPanel } from '@/components/dashboard/BudgetsSnapshotPanel'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  
  // Parse SearchParams
  const filter: TransactionFilter = {
    period: (resolvedSearchParams?.period as TransactionsPeriod) || 'this_month',
    type: (resolvedSearchParams?.type as TransactionType | 'all') || 'all',
    categoryId: (resolvedSearchParams?.cat as string) || 'all',
    accountId: (resolvedSearchParams?.account as string) || 'all',
    merchantQuery: (resolvedSearchParams?.q as string) || '',
  }
  
  const page = parseInt(resolvedSearchParams?.page as string || '1')
  const pageSize = parseInt(resolvedSearchParams?.limit as string || '25')
  const sortCol = (resolvedSearchParams?.sort as string) || 'date'
  const sortDir = (resolvedSearchParams?.dir as string) || 'desc'

  // Load Main Data
  const pageData = await loadTransactionsPageData(filter, page, pageSize, sortCol, sortDir)

  // Load Lookup Data for Selects and Modals (Categories & Accounts)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [ { data: categories }, { data: accounts } ] = await Promise.all([
    supabase.from('categories').select('id, name, color, icon, type').order('name'),
    supabase.from('accounts').select('id, name').eq('user_id', user.id).order('name')
  ])

  return (
    <div className="flex flex-col gap-6 pb-20">
      <DashboardSubNav />

      {/* Top Filter Bar */}
      <TransactionsFilterBar 
        categories={categories || []}
        accounts={accounts || []}
        currentPeriod={filter.period}
        currentType={filter.type}
        currentCategoryId={filter.categoryId || 'all'}
        currentAccountId={filter.accountId || 'all'}
        currentQuery={filter.merchantQuery || ''}
      />

      {/* Aggregate KPI Cards */}
      <TransactionsSummaryMetrics metrics={pageData.metrics} />

      {/* Main Grid: Data Table + Side Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
        
        {/* The Grid dominates the center */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col gap-6">
          <div className="pb-4 border-b border-[var(--border-light)] flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Ledger</h3>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {pageData.totalCount} matching records
            </span>
          </div>

          {/* Interactive Table Client Component */}
          <TransactionsTable 
            transactions={pageData.transactions}
            categories={categories || []}
            accounts={accounts || []}
            totalCount={pageData.totalCount}
            currentPage={pageData.page}
            pageSize={pageData.pageSize}
          />
        </div>

        {/* Side Panels */}
        <div className="flex flex-col gap-6">
          <SpendingByCategoryPanel items={pageData.spendingByCategory} />
          <BudgetsSnapshotPanel />
        </div>
      </div>
    </div>
  )
}
