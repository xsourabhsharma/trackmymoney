import { createClient } from '@/utils/supabase/server'
import { loadOverviewData } from '@/lib/dashboard-service'
import { getSetupStatus } from '@/lib/dal/overview'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { AddTransactionButton } from '@/components/dashboard/AddTransactionButton'
import DashboardClient from './DashboardClient'
import Link from 'next/link'
import type { OverviewPeriod } from '@/lib/types'

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const resolvedSearchParams = await searchParams
  const range = (resolvedSearchParams?.range as OverviewPeriod) || 'this-month'

  let overviewData: any = null
  try {
    overviewData = await loadOverviewData(range)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="text-4xl">⚠️</div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-[var(--text-main)]">Data Engine Failure</h1>
            <p className="text-sm text-[var(--text-muted)] max-w-[400px] text-center">We couldn't aggregate your financial data. This might be due to a missing database schema or connection issue.</p>
            <Link href="/dashboard" className="px-6 py-2 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-xs font-bold uppercase tracking-widest mt-4">Try Reloading</Link>
        </div>
    )
  }

 
  const { data: allCategories } = await supabase.from('categories').select('*')
  const { data: userAccounts } = await supabase.from('accounts').select('*')

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {}
      <div className="flex flex-wrap items-center justify-between gap-4 overflow-x-auto pb-4 border-b border-[var(--border-light)]">
        <DashboardSubNav />
        <div className="ml-auto">
          <AddTransactionButton 
            categories={allCategories || []} 
            accounts={userAccounts || []} 
            defaultType="expense" 
            buttonLabel="New Transaction" 
          />
        </div>
      </div>

      <DashboardClient initialData={overviewData} />
    </div>
  )
}
