import { createClient } from '@/utils/supabase/server'
import { normalizeToMonthlyCost } from '@/lib/subscription-utils'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'
export type SubscriptionInterval = 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface SubscriptionRow {
  id: string
  merchant: string
  serviceName?: string | null
  amount: number
  currency: string
  interval: SubscriptionInterval
  status: SubscriptionStatus
  nextChargeDate: string | null
  lastChargeDate: string | null
  categoryId?: string | null
  categoryName?: string | null
  categoryIcon?: string | null
  linkedAccountId?: string | null
  linkedAccountName?: string | null
  usageScore?: number | null
  potentialSavings: boolean
}

export interface SubscriptionsFilter {
  status: SubscriptionStatus | 'all'
  searchQuery?: string
}

export interface SubscriptionsOverviewMetrics {
  totalMonthlyOutflow: number
  activeCount: number
  potentialSavingsMonthly: number
}

export interface UpcomingChargeItem {
  id: string
  merchant: string
  serviceName?: string | null
  amount: number
  currency: string
  nextChargeDate: string
  interval: string
}

export interface SubscriptionHealthMetrics {
  monthlyCostVsIncomePercent: number
  rarelyUsedCount: number
  overdueCount: number
}

export interface SubscriptionCategoryItem {
  categoryId: string | null
  categoryName: string
  amountMonthly: number
  color?: string | null
  icon?: string | null
}

export interface SubscriptionsPageData {
  filter: SubscriptionsFilter
  overview: SubscriptionsOverviewMetrics
  subscriptions: SubscriptionRow[]
  totalCount: number
  page: number
  pageSize: number
  upcomingCharges: UpcomingChargeItem[]
  health: SubscriptionHealthMetrics
  categoriesBreakdown: SubscriptionCategoryItem[]
}

export async function loadSubscriptionsPageData(
  filter: SubscriptionsFilter,
  page: number = 1,
  pageSize: number = 25
): Promise<SubscriptionsPageData> {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error("Unauthorized")

  // 1. Fetch ALL subscriptions for the user to compute exact aggregates
  // In a massive app, this would be heavily SQL-driven via RPC. We will do it in JS for exact precision given typical subscription cardinalities (< 50).
  const { data: allSubs, error: allSubsError } = await supabase
    .from('subscriptions')
    .select(`
      *,
      categories ( id, name, icon, color ),
      accounts ( id, name )
    `)
    .eq('user_id', user.id)

  if (allSubsError) console.error("Error fetching Subscriptions: ", allSubsError.message, allSubsError.details, allSubsError.hint)

  const rows = allSubs || []
  
  // -- Calculate Overview Metrics --
  let totalMonthlyOutflow = 0
  let activeCount = 0
  let potentialSavingsMonthly = 0
  
  // -- Calculate Upcoming & Health Metrics --
  const now = new Date()
  const todayStr = now.toISOString()
  const upcomingCharges: UpcomingChargeItem[] = []
  
  let rarelyUsedCount = 0
  let overdueCount = 0

  // -- Category Aggregations --
  const categoryMap = new Map<string, SubscriptionCategoryItem>()

  for (const sub of rows) {
    const amount = Number(sub.amount) || 0
    const normalizedMonthly = normalizeToMonthlyCost(amount, sub.interval)

    if (sub.status === 'active') {
      activeCount++
      totalMonthlyOutflow += normalizedMonthly

      if (sub.potential_savings || (sub.usage_score !== null && sub.usage_score < 30)) {
        potentialSavingsMonthly += normalizedMonthly
      }

      if (sub.usage_score !== null && sub.usage_score < 30) rarelyUsedCount++

      // Check upcoming and overdue
      if (sub.next_charge_date) {
        if (sub.next_charge_date < todayStr) {
          overdueCount++
        } else {
          // Push to upcoming charges. We will slice the top 5 closest later.
          upcomingCharges.push({
            id: sub.id,
            merchant: sub.merchant,
            serviceName: sub.service_name,
            amount,
            currency: sub.currency,
            nextChargeDate: sub.next_charge_date,
            interval: sub.interval
          })
        }
      }

      // Aggregate Category Cost
      const catId = sub.category_id || 'uncategorized'
      const catName = sub.categories?.name || 'Uncategorized'
      
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: sub.category_id,
          categoryName: catName,
          amountMonthly: 0,
          color: sub.categories?.color,
          icon: sub.categories?.icon
        })
      }
      categoryMap.get(catId)!.amountMonthly += normalizedMonthly
    }
  }

  // Calculate Vs Income (Fetching last 30 days of income)
  // Strict implementation calculates rolling 30 day income
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: incomeTx } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'income')
    .gte('date', thirtyDaysAgo.toISOString())

  const monthlyIncome = (incomeTx || []).reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  const monthlyCostVsIncomePercent = monthlyIncome > 0 ? (totalMonthlyOutflow / monthlyIncome) * 100 : 0

  // Final preparations for aggregates
  upcomingCharges.sort((a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime())
  const topUpcoming = upcomingCharges.slice(0, 5)

  const categoriesBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.amountMonthly - a.amountMonthly)

  // -- Pagination & Filtering logic for the Table --
  let filteredRows = [...rows]
  
  if (filter.status !== 'all') {
    filteredRows = filteredRows.filter(r => r.status === filter.status)
  }
  
  if (filter.searchQuery) {
    const q = filter.searchQuery.toLowerCase()
    filteredRows = filteredRows.filter(r => 
      r.merchant.toLowerCase().includes(q) || 
      (r.service_name && r.service_name.toLowerCase().includes(q))
    )
  }

  const totalCount = filteredRows.length
  
  // Sort alphabetically by merchant, then paginate
  filteredRows.sort((a, b) => a.merchant.localeCompare(b.merchant))
  const fromIndex = (page - 1) * pageSize
  const paginatedRows = filteredRows.slice(fromIndex, fromIndex + pageSize)

  const finalSubscriptions: SubscriptionRow[] = paginatedRows.map(r => ({
    id: r.id,
    merchant: r.merchant,
    serviceName: r.service_name,
    amount: Number(r.amount),
    currency: r.currency,
    interval: r.interval as SubscriptionInterval,
    status: r.status as SubscriptionStatus,
    nextChargeDate: r.next_charge_date,
    lastChargeDate: r.last_charge_date,
    categoryId: r.category_id,
    categoryName: r.categories?.name,
    categoryIcon: r.categories?.icon,
    linkedAccountId: r.linked_account_id,
    linkedAccountName: r.accounts?.name,
    usageScore: r.usage_score !== null ? Number(r.usage_score) : null,
    potentialSavings: r.potential_savings || false
  }))

  return {
    filter,
    overview: {
      totalMonthlyOutflow,
      activeCount,
      potentialSavingsMonthly
    },
    subscriptions: finalSubscriptions,
    totalCount,
    page,
    pageSize,
    upcomingCharges: topUpcoming,
    health: {
      monthlyCostVsIncomePercent,
      rarelyUsedCount,
      overdueCount
    },
    categoriesBreakdown
  }
}
