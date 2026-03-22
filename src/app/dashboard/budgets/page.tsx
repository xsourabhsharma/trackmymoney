import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Budgets',
  description: 'Set spending limits, track category budgets, and stay on top of your money.',
}
import { createAdminClient } from '@/utils/supabase/admin'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { BudgetsClientOrchestrator } from '@/app/dashboard/budgets/client-orchestrator'
import { loadBudgetsPageData } from '@/app/dashboard/budgets/data'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()

  // Fetch categories for the form modal
  const { data: allCategories } = await admin
    .from('categories')
    .select('id, name, icon, color, type')
    .order('name')

  // Load all budgets page data
  const pageData = await loadBudgetsPageData({
    period: 'this_month',
    scope: 'all',
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardSubNav />
      <BudgetsClientOrchestrator
        initialData={pageData}
        categories={allCategories || []}
      />
    </div>
  )
}
