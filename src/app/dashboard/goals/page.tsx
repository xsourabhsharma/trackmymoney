import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'

export const metadata: Metadata = {
  title: 'Goals & Debt',
  description: 'Track your savings goals and manage debt payoff plans.',
}
import { GoalsDebtsClientOrchestrator } from '@/app/dashboard/goals/client-orchestrator'
import { loadGoalsDebtsPageData } from '@/app/dashboard/goals/server-data'

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
      <div className="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
        <DashboardSubNav />
      </div>
      <GoalsDebtsClientOrchestrator initialData={pageData} />
    </div>
  )
}
