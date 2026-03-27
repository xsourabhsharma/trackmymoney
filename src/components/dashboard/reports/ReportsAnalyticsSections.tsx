'use client'

import { CategorySpendingItem, MerchantSpendingItem, PeriodComparisonMetrics } from '@/app/dashboard/reports/data'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'


interface TopCatsProps {
  topCategories: CategorySpendingItem[]
  totalExpenses: number
}

export function TopCategoriesSection({ topCategories, totalExpenses }: TopCatsProps) {
  function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (topCategories.length === 0) {
    return (
      <div className="py-10 text-center flex flex-col items-center gap-3">
        <span className="text-3xl">🗂️</span>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No spending data for this period.</p>
        <p className="text-[12px] text-[var(--text-muted)]">Add transactions or expand your date range.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--border-light)]/50">
      {topCategories.map((cat, i) => (
        <div key={cat.categoryName} className="flex items-center gap-4 py-4 group hover:bg-[var(--bg-surface)] hover:px-3 -mx-0 hover:-mx-3 transition-all rounded-xl cursor-default">
          <span className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums w-4">#{i + 1}</span>
          <div className="w-9 h-9 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform shadow-sm">
            {cat.categoryIcon || '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{cat.categoryName}</span>
            <div className="h-1 bg-[var(--bg-surface)] rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[var(--expense-red)]/60 rounded-full" style={{ width: `${cat.percentOfTotal}%` }} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[12px] font-bold tabular-nums text-[var(--text-main)]">${fmt(cat.amount)}</div>
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{cat.percentOfTotal}%</div>
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
  function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-4 gap-4 p-4 bg-[var(--bg-surface)] border-b border-[var(--border-light)] font-bold text-[11px] text-[var(--text-muted)] uppercase tracking-widest">
        <span>Merchant</span>
        <span className="text-right">Transactions</span>
        <span className="text-right">Total</span>
        <span className="text-right">Avg</span>
      </div>
      <div className="flex flex-col divide-y divide-[var(--border-light)]/50 bg-[var(--bg-base)]">
        {merchants.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No merchant data for this period.</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Add transactions with merchant names to see them here.</p>
          </div>
        ) : (
          merchants.map((m, i) => (
            <div key={m.merchant} className="grid grid-cols-4 gap-4 p-4 items-center group hover:bg-[var(--bg-surface)]/70 transition-all">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{m.merchant}</span>
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">#{i + 1}</span>
              </div>
              <span className="text-[11px] font-bold tabular-nums text-[var(--text-muted)] text-right">{m.transactionsCount}×</span>
              <span className="text-[11px] font-bold tabular-nums text-[var(--expense-red)] tracking-tighter text-right">${fmt(m.totalAmount)}</span>
              <span className="text-[11px] font-bold tabular-nums text-[var(--text-muted)] tracking-tighter text-right">${fmt(m.averageAmount)}</span>
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
  label, current, previous, changePct, isExpense = false, isPercent = false
}: {
  label: string; current: number; previous: number; changePct: number; isExpense?: boolean; isPercent?: boolean
}) {
 
  const isGood = isExpense ? changePct < 0 : changePct > 0

  function fmt(n: number) {
    return isPercent
      ? `${n.toFixed(1)}%`
      : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-light)]/50 rounded-2xl flex flex-col items-center gap-3 hover:shadow-md transition-all cursor-default">
      <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
      <div className="text-xl font-bold tabular-nums text-[var(--text-main)] tracking-tighter">{fmt(current)}</div>
      {changePct !== 0 && (
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${isGood ? 'bg-green-50 text-[var(--income-green)] border-green-100' : 'bg-red-50 text-[var(--expense-red)] border-red-100'}`}>
          {changePct > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {Math.abs(changePct).toFixed(1)}%
        </div>
      )}
      <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase opacity-60 tracking-widest">
        Last: {fmt(previous)}
      </div>
    </div>
  )
}

export function PeriodComparisonSection({ comparison }: ComparisonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <ComparisonCard label="Income" current={comparison.incomeCurrent} previous={comparison.incomePrevious} changePct={comparison.incomeChangePct} />
      <ComparisonCard label="Expenses" current={comparison.expensesCurrent} previous={comparison.expensesPrevious} changePct={comparison.expensesChangePct} isExpense />
      <ComparisonCard label="Net Delta" current={comparison.netCurrent} previous={comparison.netPrevious} changePct={comparison.netChangePct} />
      <ComparisonCard label="Efficiency" current={comparison.efficiencyCurrent} previous={comparison.efficiencyPrevious} changePct={comparison.efficiencyCurrent - comparison.efficiencyPrevious} isPercent />
    </div>
  )
}
