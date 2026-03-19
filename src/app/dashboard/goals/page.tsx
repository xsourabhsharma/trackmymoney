import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { GoalsDebtsClientOrchestrator } from '@/app/dashboard/goals/client-orchestrator'
import { loadGoalsDebtsPageData } from '@/app/dashboard/goals/data'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const pageData = await loadGoalsDebtsPageData({
    period: 'this_year',
    scope: 'all',
    payoffStrategy: 'avalanche',
    goalsTab: 'active',
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardSubNav />
      <GoalsDebtsClientOrchestrator initialData={pageData} />
    </div>
  )
}
