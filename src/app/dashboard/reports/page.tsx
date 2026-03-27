import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Detailed analytics, spending trends, and financial breakdown reports.',
}
import { ReportsClientOrchestrator } from '@/app/dashboard/reports/client-orchestrator'
import { loadReportsPageData } from '@/app/dashboard/reports/data'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const resolvedSearchParams = await searchParams
  const period = (resolvedSearchParams?.period as any) || 'this_month'
  const scope = (resolvedSearchParams?.scope as any) || 'all'
  const view = (resolvedSearchParams?.view as any) || 'summary'

  const pageData = await loadReportsPageData({
    period,
    scope,
    view,
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardSubNav />
      <ReportsClientOrchestrator initialData={pageData} />
    </div>
  )
}
