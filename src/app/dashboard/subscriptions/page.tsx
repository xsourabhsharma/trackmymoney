import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { loadSubscriptionsPageData, type SubscriptionsFilter, type SubscriptionStatus } from './data'
import { SubscriptionsOverview } from '@/components/dashboard/SubscriptionsOverview'
import { SubscriptionHealthPanel } from '@/components/dashboard/SubscriptionHealthPanel'
import { UpcomingChargesPanel } from '@/components/dashboard/UpcomingChargesPanel'
import { SubscriptionCategoriesPanel } from '@/components/dashboard/SubscriptionCategoriesPanel'
import { SubscriptionsClientOrchestrator } from './client-orchestrator'

export default async function SubscriptionsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    redirect('/login')
  }

  // Parse URL Search Params into Filter object
  const filter: SubscriptionsFilter = {
    status: (searchParams.status as SubscriptionStatus) || 'all',
    searchQuery: searchParams.q || ''
  }

  const page = Number(searchParams.page) || 1
  const pageSize = 20

  // Server-side Aggregation fetch
  const pageData = await loadSubscriptionsPageData(filter, page, pageSize)

  // Fetch naked categories mapping for the Form Modal
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  return (
    <div className="w-full h-full flex flex-col pt-8 lg:pt-0 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-light tracking-tight text-[var(--text-main)]">Subscriptions</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">Auto-renewals, health metrics, and savings targets.</p>
      </div>

      <SubscriptionsOverview metrics={pageData.overview} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Feed & Table (Takes up ~8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SubscriptionsClientOrchestrator 
            subscriptions={pageData.subscriptions}
            totalCount={pageData.totalCount}
            page={pageData.page}
            pageSize={pageData.pageSize}
            filter={pageData.filter}
            categories={categories || []}
          />
        </div>

        {/* Right Column: Analytics & Upcomings (Takes up ~4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="h-[350px]">
             <UpcomingChargesPanel charges={pageData.upcomingCharges} />
           </div>
           
           <div className="h-[280px]">
             <SubscriptionHealthPanel health={pageData.health} />
           </div>
           
           <div className="flex-1 min-h-[300px]">
             <SubscriptionCategoriesPanel categories={pageData.categoriesBreakdown} />
           </div>
        </div>

      </div>
    </div>
  )
}
