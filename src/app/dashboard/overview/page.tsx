import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getOverviewMetrics,
  getCashFlowSeries,
  getExpenseBreakdown,
  getRecentTransactions,
  getUpcomingCharges,
  getSetupStatus,
  getAdvisorInsight
} from '@/lib/dal/overview'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns'

import { RangeSelector } from '@/components/dashboard/overview/RangeSelector'
import { KpiRow } from '@/components/dashboard/overview/KpiRow'
import { AiAdvisorCard } from '@/components/dashboard/overview/AiAdvisorCard'
import { IntelligenceHubSummary } from '@/components/dashboard/overview/IntelligenceHubSummary'
import { CashFlowChart } from '@/components/dashboard/overview/CashFlowChart'
import { ExpenseBreakdownChart } from '@/components/dashboard/overview/ExpenseBreakdownChart'
import { RecentActivityCard } from '@/components/dashboard/overview/RecentActivityCard'
import { UpcomingChargesCard } from '@/components/dashboard/overview/UpcomingChargesCard'
import Link from 'next/link'
import { Plus, Activity } from 'lucide-react'
import { db } from '@/db'
import { accounts } from '@/db/schema'
import { count, eq } from 'drizzle-orm'

function getDateRange(rangeParam: string) {
  const now = new Date()
  let from: Date
  let to: Date = now

  switch (rangeParam) {
    case 'week':
      from = startOfWeek(now, { weekStartsOn: 1 })
      break
    case 'last-month':
      from = startOfMonth(subMonths(now, 1))
      to = endOfMonth(subMonths(now, 1))
      break
    case '3-months':
      from = startOfMonth(subMonths(now, 2))
      break
    case 'year':
      from = startOfYear(now)
      break
    case 'all':
      from = subYears(now, 10) // practically all
      break
    case 'month':
    default:
      from = startOfMonth(now)
      break
  }
  return { from, to }
}

export default async function OverviewPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const range = (resolvedSearchParams?.range as string) || 'month'
  const { from, to } = getDateRange(range)

  const [
    setupStatus,
    metrics,
    cashFlow,
    breakdown,
    recentTx,
    upcomingCharges,
    advisorInsight,
    accountCountResult
  ] = await Promise.all([
    getSetupStatus(user.id),
    getOverviewMetrics(user.id, from, to),
    getCashFlowSeries(user.id, from, to),
    getExpenseBreakdown(user.id, from, to),
    getRecentTransactions(user.id, from, to, 5),
    getUpcomingCharges(user.id, 14),
    getAdvisorInsight(user.id, from, to),
    db.select({ count: count() }).from(accounts).where(eq(accounts.userId, user.id))
  ])

  const accountsCount = accountCountResult[0]?.count || 0

  return (
    <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4 border-b-2 border-[var(--border-main)] mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--text-main)]">
            Overview
          </h1>
        </div>
        <Link 
          href="/dashboard/transactions?add=true"
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-gray-800 rounded-full text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          New Transaction
        </Link>
      </div>
      
      {/* Top Section: AI Advisor + Intelligence Hub */}
      <div className="flex flex-col xl:flex-row gap-8 mb-8">
        
        {/* Left Column: AI Advisor */}
        <div className="w-full xl:w-[380px] flex-shrink-0">
          <AiAdvisorCard insight={advisorInsight} />
        </div>

        {/* Right Column: Intelligence Hub */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 bg-white rounded-[32px] border border-[var(--border-light)] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 uppercase tracking-widest">
              <Activity className="w-5 h-5 text-gray-500" strokeWidth={2.5} />
              <div>
                <h2 className="text-sm font-black text-[var(--text-main)]">Intelligence Hub</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Live - Synced with your accounts</p>
              </div>
            </div>
            
            <RangeSelector />
          </div>

          <IntelligenceHubSummary 
            totalInflow={metrics.totalInflow}
            totalOutflow={metrics.totalOutflow}
            netPosition={metrics.netPosition}
            savingsRate={metrics.savingsRate}
          />

          <KpiRow metrics={metrics} accountsCount={accountsCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CashFlowChart data={cashFlow} />
        <ExpenseBreakdownChart data={breakdown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RecentActivityCard transactions={recentTx} />
        <UpcomingChargesCard subscriptions={upcomingCharges} />
      </div>
    </div>
  )
}
