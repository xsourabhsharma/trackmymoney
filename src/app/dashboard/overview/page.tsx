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
import { GettingStartedChecklist } from '@/components/dashboard/overview/GettingStartedChecklist'
import { CashFlowChart } from '@/components/dashboard/overview/CashFlowChart'
import { ExpenseBreakdownChart } from '@/components/dashboard/overview/ExpenseBreakdownChart'
import { RecentActivityCard } from '@/components/dashboard/overview/RecentActivityCard'
import { UpcomingChargesCard } from '@/components/dashboard/overview/UpcomingChargesCard'

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
    advisorInsight
  ] = await Promise.all([
    getSetupStatus(user.id),
    getOverviewMetrics(user.id, from, to),
    getCashFlowSeries(user.id, from, to),
    getExpenseBreakdown(user.id, from, to),
    getRecentTransactions(user.id, from, to, 5),
    getUpcomingCharges(user.id, 14),
    getAdvisorInsight(user.id, from, to)
  ])

  return (
    <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <RangeSelector />
      
      <KpiRow metrics={metrics} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AiAdvisorCard insight={advisorInsight} />
        <GettingStartedChecklist status={setupStatus} />
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
