'use client'

import type { CategorySpendingItem, MerchantSpendingItem, PeriodComparisonMetrics } from '@/app/dashboard/reports/data'
import { ArrowDownRight, ArrowUpRight, FolderOpen } from 'lucide-react'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { useCurrency } from '@/hooks/useCurrency'

interface TopCatsProps {
  topCategories: CategorySpendingItem[]
  totalExpenses: number
}

export function TopCategoriesSection({ topCategories }: TopCatsProps) {
  const { fmt } = useCurrency()

  if (topCategories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--accent)]">
          <FolderOpen className="h-5 w-5" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No spending data for this period.</p>
        <p className="text-[12px] text-[var(--text-muted)]">Add transactions or expand your date range.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--border-light)]/50">
      {topCategories.map((category, index) => (
        <div key={category.categoryName} className="flex items-center gap-4 rounded-xl py-4 transition-all hover:bg-[var(--bg-surface)] hover:px-3">
          <span className="w-4 text-[11px] font-bold tabular-nums text-[var(--text-muted)]">#{index + 1}</span>
          <CategoryIcon
            color={category.categoryColor}
            icon={category.categoryIcon}
            name={category.categoryName}
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-bold uppercase tracking-tight text-[var(--text-main)]">{category.categoryName}</span>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--bg-surface)]">
              <div className="h-full rounded-full bg-[var(--expense-red)]/70" style={{ width: `${category.percentOfTotal}%` }} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[12px] font-bold tabular-nums text-[var(--text-main)]">{fmt(category.amount)}</div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{category.percentOfTotal}%</div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface TopMerchantsProps {
  merchants: MerchantSpendingItem[]
}

export function TopMerchantsSection({ merchants }: TopMerchantsProps) {
  const { fmt } = useCurrency()

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] shadow-sm">
      <div className="grid min-w-[560px] grid-cols-4 gap-4 border-b border-[var(--border-light)] bg-[var(--bg-surface)] p-4 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        <span>Merchant</span>
        <span className="text-right">Transactions</span>
        <span className="text-right">Total</span>
        <span className="text-right">Avg</span>
      </div>
      <div className="flex min-w-[560px] flex-col divide-y divide-[var(--border-light)]/50 bg-[var(--bg-base)]">
        {merchants.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No merchant data for this period.</p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">Add transactions with merchant names to see them here.</p>
          </div>
        ) : (
          merchants.map((merchant, index) => (
            <div key={merchant.merchant} className="grid grid-cols-4 items-center gap-4 p-4 transition-all hover:bg-[var(--bg-surface)]/70">
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-[11px] font-bold uppercase tracking-tight text-[var(--text-main)]">{merchant.merchant}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60">#{index + 1}</span>
              </div>
              <span className="text-right text-[11px] font-bold tabular-nums text-[var(--text-muted)]">{merchant.transactionsCount}x</span>
              <span className="text-right text-[11px] font-bold tabular-nums tracking-tighter text-[var(--expense-red)]">{fmt(merchant.totalAmount)}</span>
              <span className="text-right text-[11px] font-bold tabular-nums tracking-tighter text-[var(--text-muted)]">{fmt(merchant.averageAmount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface ComparisonProps {
  comparison: PeriodComparisonMetrics
}

function ComparisonCard({
  changePct,
  current,
  isExpense = false,
  isPercent = false,
  label,
  previous,
}: {
  changePct: number
  current: number
  isExpense?: boolean
  isPercent?: boolean
  label: string
  previous: number
}) {
  const { fmt } = useCurrency()
  const isGood = isExpense ? changePct < 0 : changePct > 0

  function formatValue(value: number) {
    return isPercent ? `${value.toFixed(1)}%` : fmt(value)
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-surface)] p-6">
      <span className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
      <div className="text-xl font-bold tabular-nums tracking-tighter text-[var(--text-main)]">{formatValue(current)}</div>
      {changePct !== 0 ? (
        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${isGood ? 'border-green-200 bg-green-50 text-[var(--income-green)] dark:border-green-900/40 dark:bg-green-950/20' : 'border-red-200 bg-red-50 text-[var(--expense-red)] dark:border-red-900/40 dark:bg-red-950/20'}`}>
          {changePct > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(changePct).toFixed(1)}%
        </div>
      ) : null}
      <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-70">
        Last: {formatValue(previous)}
      </div>
    </div>
  )
}

export function PeriodComparisonSection({ comparison }: ComparisonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <ComparisonCard label="Income" current={comparison.incomeCurrent} previous={comparison.incomePrevious} changePct={comparison.incomeChangePct} />
      <ComparisonCard label="Expenses" current={comparison.expensesCurrent} previous={comparison.expensesPrevious} changePct={comparison.expensesChangePct} isExpense />
      <ComparisonCard label="Net Delta" current={comparison.netCurrent} previous={comparison.netPrevious} changePct={comparison.netChangePct} />
      <ComparisonCard label="Efficiency" current={comparison.efficiencyCurrent} previous={comparison.efficiencyPrevious} changePct={comparison.efficiencyCurrent - comparison.efficiencyPrevious} isPercent />
    </div>
  )
}
