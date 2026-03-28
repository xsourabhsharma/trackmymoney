'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity, Calendar, PieChart as PieChartIcon, TrendingUp, ArrowUpRight, ArrowDownRight, Percent, Plus } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

import type { OverviewPeriod, OverviewData } from '@/lib/types'
import { InteractiveChartsManager } from '@/components/dashboard/InteractiveChartsManager'
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore'
import { AIAdvisorCard } from '@/components/dashboard/advisor/AIAdvisorCard'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { formatCurrency } from '@/lib/currency'

function useAnimatedValue(target: number, duration = 800): number {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)
  useEffect(() => {
    const start = prevTarget.current
    prevTarget.current = target
    const startTime = performance.now()
    let raf: number
    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(start + (target - start) * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

interface Props {
  initialData: OverviewData
}

const PERIOD_OPTIONS: { label: string; val: OverviewPeriod }[] = [
  { label: 'Week', val: 'this-week' },
  { label: 'Month', val: 'this-month' },
  { label: 'Last Mo', val: 'last-month' },
  { label: '3 Months', val: 'last-3-months' },
  { label: 'Year', val: 'this-year' },
  { label: 'All', val: 'all-time' },
]

function getPeriodLabel(period: OverviewPeriod): string {
  const option = PERIOD_OPTIONS.find(p => p.val === period)
  return option?.label || 'This Month'
}


export default function DashboardClient({ initialData }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<OverviewData>(initialData)
  const [loading, setLoading] = useState(false)
  const range = (searchParams.get('range') as OverviewPeriod) || 'this-month'
  const { currency, toggleCurrency } = useCurrencyStore()

  const safeFormatCurrency = (val: number) => formatCurrency(val, currency, 'USD')

  const fetchData = useCallback(async (newRange: OverviewPeriod) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/overview?range=${newRange}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (range !== data.period) {
      fetchData(range)
    }
  }, [range, data.period, fetchData])

  const handleRangeChange = (newRange: OverviewPeriod) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', newRange)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const { metrics } = data

  return (
    <div className={`flex flex-col gap-8 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

      {}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-[var(--bg-surface)] overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-shimmer" />
        </div>
      )}
      
      {}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.2fr] gap-x-6 gap-y-8 items-start">
        {}
        <div className="xl:row-span-2 xl:sticky xl:top-6 relative z-10 w-full mb-4 xl:mb-0">
           <AIAdvisorCard stats={data} lastInsight={data.lastInsight} />
        </div>

        {}
        <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-4 sm:p-6 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-main)] flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4" /> Intelligence Hub
              </h3>
              <span className="text-[12px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mt-1">
                Live · Synced with your accounts
              </span>
            </div>
            
            <div className="flex w-full sm:w-auto overflow-hidden">
              <div className="flex overflow-x-auto hide-scrollbar sm:flex-wrap items-center gap-1.5 w-full pb-2 md:pb-0">
                {PERIOD_OPTIONS.map((p) => (
                  <button 
                    key={p.val} 
                    onClick={() => handleRangeChange(p.val)}
                    className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                      range === p.val 
                        ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-sm' 
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--border-dark)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 mb-6 border border-[var(--border-light)]/50">
            <p className="text-[11px] font-bold leading-relaxed text-[var(--text-main)] uppercase tracking-wide">
              {metrics.inflow === 0 && metrics.outflow === 0 ? (
                <>No activity recorded for this period. Add your first transaction to see insights here.</>
              ) : (
                <>
                  {getPeriodLabel(data.period)} Summary: You earned {safeFormatCurrency(metrics.inflow)} and spent {safeFormatCurrency(metrics.outflow)}.
                  {' '}Net {metrics.netPosition >= 0 ? 'saved' : 'deficit'}: {safeFormatCurrency(Math.abs(metrics.netPosition))} ({metrics.savingsRate.toFixed(1)}% efficiency).
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <MetricCard 
              label="Net Position" 
              value={safeFormatCurrency(metrics.netPosition)} 
              hint="Net this period"
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              color={metrics.netPosition >= 0 ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}
            />
            <MetricCard 
              label="Inflow" 
              value={safeFormatCurrency(metrics.inflow)} 
              hint="Total income"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              color="text-[var(--income-green)]"
            />
            <MetricCard 
              label="Outflow" 
              value={safeFormatCurrency(metrics.outflow)} 
              hint="Total expenses"
              icon={<ArrowDownRight className="w-3.5 h-3.5" />}
              color="text-[var(--expense-red)]"
            />
            <MetricCard 
              label="Savings Rate" 
              value={`${metrics.savingsRate.toFixed(1)}%`} 
              hint="Efficiency"
              icon={<Percent className="w-3.5 h-3.5" />}
              color={metrics.savingsRate >= 20 ? 'text-[var(--income-green)]' : metrics.savingsRate > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}
            />
          </div>
        </div>

        {}
        <div className="w-full">
          <InteractiveChartsManager 
            donutData={data.expenseBreakdown.map(c => ({
                name: c.categoryName,
                value: c.amount,
                icon: c.icon,
                color: c.color
            }))}
            donutTotal={metrics.outflow}
            cashFlowData={data.cashflowSeries.map(f => ({
                month: format(new Date(f.date), 'MMM dd'),
                income: f.income,
                expense: f.expense
            }))}
            transactions={data.recentTransactions}
          />
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {}
        <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm flex flex-col min-h-[450px]">
          <div className="pb-4 border-b border-[var(--border-light)] mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--income-green)]" /> Recent Activity
            </h2>
            <Link href="/dashboard/transactions" className="text-[12px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors uppercase tracking-widest border border-[var(--border-light)] px-3 py-1 rounded-full">View All</Link>
          </div>
          
          <div className="flex flex-col divide-y divide-[var(--border-light)]">
            {data.recentTransactions.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center text-2xl shadow-sm">📝</div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)] mb-1">No transactions yet</p>
                  <p className="text-[12px] text-[var(--text-muted)] max-w-[280px]">Add your first transaction to start tracking your finances and see insights here.</p>
                </div>
                <Link href="/dashboard/transactions" className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
                  <Plus className="w-3.5 h-3.5" /> Add Transaction
                </Link>
              </div>
            ) : (
              data.recentTransactions.map((tx: any) => (
                <div className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-3 sm:gap-4 py-4 transition-all hover:bg-[var(--bg-surface)] sm:hover:px-4 -mx-0 sm:hover:-mx-4 rounded-xl" key={tx.id}>
                  <div className="w-10 h-10 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                    {tx.categories?.icon || '💸'}
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="text-[13px] font-bold truncate text-[var(--text-main)] uppercase tracking-tight">{tx.merchant || tx.description || 'Transaction'}</span>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">{tx.categories?.name || 'Uncategorized'}</span>
                  </div>
                  <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-tighter text-right hidden sm:block">
                    {format(new Date(tx.date), 'MMM dd, yyyy')}
                  </div>
                  <div className={`text-[13px] font-bold tabular-nums text-right min-w-[70px] sm:min-w-[90px] ${tx.type === 'income' ? 'text-[var(--income-green)]' : 'text-[var(--text-main)]'}`}>
                    {tx.type === 'income' ? '+ ' : '- '}{safeFormatCurrency(Number(tx.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {}
        <div className="flex flex-col gap-6">
          {}
          <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Upcoming Charges
            </h2>
            {data.upcomingCharges.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center text-xl shadow-sm">🔔</div>
                <div>
                  <p className="text-[12px] font-bold text-[var(--text-main)] mb-0.5">No upcoming charges</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Add subscriptions to track recurring payments</p>
                </div>
                <Link href="/dashboard/subscriptions" className="inline-flex items-center gap-1 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)] hover:border-[var(--border-dark)] transition-all">
                  <Plus className="w-3 h-3" /> Add Subscription
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.upcomingCharges.map((sub) => (
                    <div key={sub.id} className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-light)]/50 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{sub.icon || '💳'}</span>
                      <div className="flex-grow">
                        <div className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tight">{sub.merchant}</div>
                        <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                          {format(new Date(sub.nextChargeDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[var(--text-main)] tabular-nums">{safeFormatCurrency(Number(sub.amount))}</div>
                      </div>
                    </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/subscriptions" className="block text-center mt-4 text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">Manage Subscriptions</Link>
          </div>

          {}
          <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5" /> Top Spending
            </h2>
            {data.topSpending.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center text-xl shadow-sm">📊</div>
                <div>
                  <p className="text-[12px] font-bold text-[var(--text-main)] mb-0.5">No spending data yet</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Start adding expenses to see your top categories</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.topSpending.map((item) => (
                  <div key={item.categoryName} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-[11px] font-bold uppercase tracking-tight text-[var(--text-main)]">{item.categoryName}</span>
                      </div>
                      <span className="text-[11px] font-bold tabular-nums text-[var(--text-main)]">{safeFormatCurrency(Number(item.amount))}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <FinancialHealthScore
            details={data.financialHealth}
          />
        </div>
      </div>
    </div>
  )
}


function MetricCard({ label, value, hint, icon, color }: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-default">
      <div className="text-[11px] font-bold text-[var(--text-main)] opacity-70 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center border border-current opacity-90 group-hover:scale-110 transition-all ${color || 'text-[var(--text-main)]'}`}>{icon}</span>
        {label}
      </div>
      <div className={`text-lg font-bold tabular-nums mb-1 tracking-tighter transition-colors ${color || 'text-[var(--text-main)]'}`}>{value}</div>
      <div className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tighter opacity-50 truncate">{hint}</div>
    </div>
  )
}
