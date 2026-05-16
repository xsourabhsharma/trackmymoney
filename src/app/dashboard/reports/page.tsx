import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Detailed analytics, spending trends, and financial breakdown reports.',
}
import { ReportsClientOrchestrator } from '@/app/dashboard/reports/client-orchestrator'
import {
  loadReportsPageData,
  normalizeReportsPeriod,
  normalizeReportsScope,
  normalizeReportsView,
} from '@/app/dashboard/reports/data'

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const resolvedSearchParams = await searchParams
  const period = normalizeReportsPeriod(firstSearchParam(resolvedSearchParams?.period))
  const scope = normalizeReportsScope(firstSearchParam(resolvedSearchParams?.scope))
  const view = normalizeReportsView(firstSearchParam(resolvedSearchParams?.view))

  const pageData = await loadReportsPageData({
    period,
    scope,
    view,
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
        <DashboardSubNav />
      </div>
      <ReportsClientOrchestrator initialData={pageData} />
    </div>
  )
}
