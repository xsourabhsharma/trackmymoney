'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, BarChart3, Clock3, Loader2, Plus, ReceiptText } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

import type { OverviewData, OverviewPeriod } from '@/lib/types'
import { InteractiveChartsManager } from '@/components/dashboard/InteractiveChartsManager'
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore'
import { ConsoleHeader, ConsoleMetric, ConsolePanel, RailMeter, AmountPill } from '@/components/dashboard/FinanceConsole'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { convertCurrency, formatCurrency } from '@/lib/currency'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  initialData: OverviewData
}

type OverviewTransaction = OverviewData['recentTransactions'][number]

const PERIOD_OPTIONS: { label: string; val: OverviewPeriod }[] = [
  { label: 'Week', val: 'this-week' },
  { label: 'Month', val: 'this-month' },
  { label: 'Last Mo', val: 'last-month' },
  { label: '3 Months', val: 'last-3-months' },
  { label: 'Year', val: 'this-year' },
  { label: 'All', val: 'all-time' },
]

function fullMoney(value: number, currency: 'USD' | 'INR', baseCurrency: string, usdToInrRate: number) {
  const convertedValue = convertCurrency(value, currency, baseCurrency, usdToInrRate)
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedValue)
}

function splitMoney(value: number, currency: 'USD' | 'INR', baseCurrency: string, usdToInrRate: number) {
  const full = fullMoney(value, currency, baseCurrency, usdToInrRate)
  const match = full.match(/^(.+?)(\d{2})$/)
  if (!match) return { main: full, cents: '' }
  return { main: match[1].replace(/\.$/, ''), cents: match[2] }
}

function getTransactionAmount(tx: OverviewTransaction) {
  return Number(tx.amount || 0)
}

function getTransactionMerchant(tx: OverviewTransaction) {
  return tx.merchant || tx.description || 'Transaction'
}

function getTransactionCategoryColor(tx: OverviewTransaction) {
  return tx.categories?.color || (tx.type === 'income' ? 'var(--income-green)' : 'var(--accent)')
}

export default function DashboardClient({ initialData }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<OverviewData>(initialData)
  const [loading, setLoading] = useState(false)
  const range = (searchParams.get('range') as OverviewPeriod) || 'this-month'
  const { currency, fmt, rateStatus, usdToInrRate } = useCurrency()
  const displayCurrency = currency === 'INR' ? 'INR' : 'USD'

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

  const { metrics, budgetSnapshot } = data
  const accountTotal = metrics.accountBalance || metrics.netPosition
  const net = splitMoney(accountTotal, displayCurrency, 'USD', usdToInrRate)
  const checking = data.accounts?.find((account) => /check|bank/i.test(account.name)) ?? data.accounts?.[0]
  const savings = data.accounts?.find((account) => /saving/i.test(account.name)) ?? data.accounts?.[1]
  const currentDate = useMemo(() => format(new Date(), 'EEEE, dd, MMM'), [])
  const monthlyLimit = budgetSnapshot.monthlyLimit
  const monthlySpent = budgetSnapshot.monthlySpent
  const discretionaryLimit = budgetSnapshot.discretionaryLimit
  const discretionarySpent = budgetSnapshot.discretionarySpent
  const remainingDays = Math.max(0, Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() - Date.now()) / 86400000))
  const hasTransactions = data.recentTransactions.length > 0 || metrics.inflow > 0 || metrics.outflow > 0

  return (
    <div className={`tm-console -mx-4 -mt-2 min-h-[calc(100dvh-7rem)] px-4 pb-8 transition-opacity duration-300 md:-mx-6 md:px-6 lg:-mx-10 lg:px-10 ${loading ? 'opacity-70' : 'opacity-100'}`}>
      {loading ? (
        <div className="fixed left-0 right-0 top-0 z-40 h-1 overflow-hidden bg-[var(--bg-surface)]">
          <div className="h-full w-1/3 animate-shimmer bg-[var(--accent)]" />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1220px] grid-cols-1 gap-6 pt-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-[14px] font-bold tracking-normal text-[var(--text-main)]">
              {currentDate}
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                {displayCurrency}
                {rateStatus === 'fallback' || rateStatus === 'error' ? ' fallback rate' : ''}
              </span>
              <Clock3 className="h-4 w-4" />
            </div>
          </div>

          <ConsolePanel className="p-7 sm:p-9">
            <div className="tm-label mb-4">Net Liquid Assets</div>
            <div className="flex items-end gap-2">
              <span className="tm-value text-[clamp(3.4rem,8vw,5.8rem)] font-light leading-none">
                {net.main}
              </span>
              {net.cents ? (
                <span className="tm-value pb-3 text-3xl font-light text-[var(--text-muted)]">
                  .{net.cents}
                </span>
              ) : null}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ConsoleMetric
                label={checking?.name || 'Checking'}
                value={checking ? fullMoney(checking.balance, displayCurrency, 'USD', usdToInrRate) : 'No account yet'}
              />
              <ConsoleMetric
                label={savings?.name || 'Savings'}
                value={savings ? fullMoney(savings.balance, displayCurrency, 'USD', usdToInrRate) : 'Add account'}
              />
            </div>
          </ConsolePanel>

          <ConsolePanel className="min-h-[440px] p-7 sm:p-8">
            <ConsoleHeader
              title="Recent Activity"
              action={
                <Link href="/dashboard/transactions" className="rounded-full border border-[var(--border-dark)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-main)] hover:border-[var(--text-main)]">
                  View All
                </Link>
              }
              className="mb-8"
            />

            {data.recentTransactions.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                <div className="tm-label">No transactions yet</div>
                <Link href="/dashboard/transactions" className="tm-button-primary">
                  Add Transaction
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-light)]">
                {data.recentTransactions.slice(0, 7).map((tx) => {
                  const amount = getTransactionAmount(tx)
                  const isIncome = tx.type === 'income'
                  return (
                    <div key={tx.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4 font-mono">
                      <span className="text-[13px] text-[var(--text-muted)]">
                        {format(new Date(tx.date), 'dd MMM')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <CategoryIcon
                            className="h-8 w-8 rounded-[10px]"
                            color={getTransactionCategoryColor(tx)}
                            icon={tx.categories?.icon}
                            name={tx.categories?.name}
                          />
                          <span className="truncate text-[14px] font-bold text-[var(--text-main)]">
                            {getTransactionMerchant(tx)}
                          </span>
                        </div>
                      </div>
                      <span className={`text-right text-[13px] tabular-nums ${isIncome ? 'text-[var(--income-green)]' : 'text-[var(--text-main)]'}`}>
                        {isIncome ? '+' : '-'}{fullMoney(amount, displayCurrency, tx.currency || 'USD', usdToInrRate)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </ConsolePanel>
        </div>

        <aside className="space-y-6">
          <ConsolePanel accent className="p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-[13px] font-bold uppercase tracking-[0.16em]">Monthly Spend</div>
              <AmountPill>{remainingDays}D REMAINING</AmountPill>
            </div>
            <div className="mt-8">
              {budgetSnapshot.hasMonthlyBudget ? (
                <RailMeter value={monthlySpent} limit={monthlyLimit} accent />
              ) : (
                <EmptyMiniState icon={<BarChart3 className="h-5 w-5" />} title="No monthly budget" body="Create a budget to compare spend against a real limit." href="/dashboard/budgets" />
              )}
            </div>
            {budgetSnapshot.hasMonthlyBudget ? (
              <div className="mt-7 flex items-center justify-between font-mono text-[12px] font-bold">
                <span>{fullMoney(monthlySpent, displayCurrency, 'USD', usdToInrRate)}</span>
                <span>{fullMoney(monthlyLimit, displayCurrency, 'USD', usdToInrRate)} Limit</span>
              </div>
            ) : null}
          </ConsolePanel>

          <ConsolePanel className="p-7">
            <div className="flex items-center justify-between gap-4">
              <ConsoleHeader title="Discretionary" />
              {budgetSnapshot.hasDiscretionaryBudget ? (
                <span className="rounded-full bg-[var(--accent)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-black">
                  {discretionaryLimit > 0 && discretionarySpent > discretionaryLimit * 0.8 ? 'At Risk' : 'On Track'}
                </span>
              ) : null}
            </div>
            <div className="mt-8">
              {budgetSnapshot.hasDiscretionaryBudget ? (
                <RailMeter value={discretionarySpent} limit={discretionaryLimit} />
              ) : (
                <EmptyMiniState icon={<ReceiptText className="h-5 w-5" />} title="No discretionary budget" body="Spending will appear after you add food, shopping, or entertainment transactions." href="/dashboard/transactions" />
              )}
            </div>
            {budgetSnapshot.hasDiscretionaryBudget ? (
              <div className="mt-7 flex items-center justify-between font-mono text-[12px] text-[var(--text-muted)]">
                <span>{fullMoney(discretionarySpent, displayCurrency, 'USD', usdToInrRate)}</span>
                <span>{fullMoney(discretionaryLimit, displayCurrency, 'USD', usdToInrRate)} Limit</span>
              </div>
            ) : null}
          </ConsolePanel>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/transactions" className="tm-button-primary justify-between">
              Add <Plus className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/auto-parse" className="tm-button-secondary justify-between">
              Import <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ConsolePanel className="p-7 xl:mt-[202px]">
            <div className="flex items-end justify-between gap-4">
              <div className="tm-value text-2xl font-bold">
                {hasTransactions ? `${metrics.savingsRate.toFixed(1)}%` : 'No data'}
              </div>
              <div className="tm-label">Savings Rate</div>
            </div>
          </ConsolePanel>
        </aside>
      </div>

      <div className="mx-auto mt-6 max-w-[1220px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="tm-label">Period</div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.val}
                onClick={() => handleRangeChange(p.val)}
                className={`tm-route-chip ${range === p.val ? 'tm-route-chip-active' : 'tm-route-chip-idle'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <InteractiveChartsManager
          donutData={data.expenseBreakdown.map((category) => ({
            name: category.categoryName,
            value: category.amount,
            icon: category.icon,
            color: category.color,
          }))}
          donutTotal={metrics.outflow}
          cashFlowData={data.cashflowSeries.map((point) => ({
            month: format(new Date(point.date), 'MMM dd'),
            income: point.income,
            expense: point.expense,
          }))}
          transactions={data.recentTransactions}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <ConsolePanel className="p-7">
            <ConsoleHeader title="Intelligence Summary" className="mb-5" />
            <p className="max-w-3xl font-mono text-[13px] leading-7 text-[var(--text-muted)]">
              {metrics.inflow === 0 && metrics.outflow === 0
                ? 'No activity recorded for this period. Add your first transaction to start generating operating signals.'
                : `You earned ${fmt(metrics.inflow)} and spent ${fmt(metrics.outflow)}. Net ${metrics.netPosition >= 0 ? 'saved' : 'deficit'} is ${formatCurrency(Math.abs(metrics.netPosition), displayCurrency, 'USD', usdToInrRate)} with ${metrics.savingsRate.toFixed(1)}% savings efficiency.`}
            </p>
            {data.lastInsight?.insights?.[0] ? (
              <div className="mt-6 border-t border-[var(--border-light)] pt-5">
                <div className="tm-label mb-2">{data.lastInsight.insights[0].title}</div>
                <p className="font-mono text-[13px] leading-7 text-[var(--text-main)]">
                  {data.lastInsight.insights[0].body}
                </p>
              </div>
            ) : null}
          </ConsolePanel>

          <div className="tm-panel-dark p-1">
            <FinancialHealthScore details={data.financialHealth} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="fixed bottom-5 right-5 z-40 rounded-full bg-[var(--bg-surface)] px-4 py-2 font-mono text-[11px] text-[var(--text-muted)]">
          <Loader2 className="mr-2 inline h-3 w-3 animate-spin" />
          Syncing
        </div>
      ) : null}
    </div>
  )
}

function EmptyMiniState({
  body,
  href,
  icon,
  title,
}: {
  body: string
  href: string
  icon: ReactNode
  title: string
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--border-light)] bg-[var(--bg-surface)] p-4 text-[var(--text-muted)]">
      <div className="mb-3 flex items-center gap-2 text-[var(--text-main)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--accent)]">
          {icon}
        </span>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">{title}</span>
      </div>
      <p className="text-sm leading-6">{body}</p>
      <Link href={href} className="mt-4 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-main)] hover:text-[var(--accent)]">
        Open section
      </Link>
    </div>
  )
}
