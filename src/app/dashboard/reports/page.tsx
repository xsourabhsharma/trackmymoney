import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Detailed analytics, spending trends, and financial breakdown reports.',
}
import { ReportsClientOrchestrator } from '@/app/dashboard/reports/client-orchestrator'
import { loadReportsPageData } from '@/app/dashboard/reports/data'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const pageData = await loadReportsPageData({
    period: 'this_month',
    scope: 'all',
    view: 'summary',
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardSubNav />
      <ReportsClientOrchestrator initialData={pageData} />
    </div>
  )
}
