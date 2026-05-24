import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Budgets',
  description: 'Set spending limits, track category budgets, and stay on top of your money.',
}
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { BudgetsClientOrchestrator } from '@/app/dashboard/budgets/client-orchestrator'
import { loadBudgetsPageData } from '@/app/dashboard/budgets/data'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, icon, color, type')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name')

 
  const pageData = await loadBudgetsPageData({
    period: 'this_month',
    scope: 'all',
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
        <DashboardSubNav />
      </div>
      <BudgetsClientOrchestrator
        initialData={pageData}
        categories={allCategories || []}
      />
    </div>
  )
}
