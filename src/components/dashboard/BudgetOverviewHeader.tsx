'use client'

import { BudgetOverviewMetrics, BudgetFilter, BudgetPeriod } from '@/app/dashboard/budgets/data'
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  metrics: BudgetOverviewMetrics
  filter: BudgetFilter
  onFilterChange: (f: BudgetFilter) => void
}

const PERIODS: { key: BudgetPeriod; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_three_months', label: 'Last 3 Months' },
  { key: 'all', label: 'All Time' },
]



export function BudgetOverviewHeader({ metrics, filter, onFilterChange }: Props) {
  const { fmt } = useCurrency()
  const { totalBudget, totalSpent, remaining } = metrics
  const pctUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const isOver = remaining < 0

  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
        {}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden hover-lift">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/10 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-main)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)] shadow-sm">
              Budget
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--text-main)] tracking-tight">
            {fmt(totalBudget)}
          </div>
          <div className="text-[12px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-[0.15em] mt-1">
            Total Monthly Budget
          </div>
          {}
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full animate-progress-fill"
              style={{ width: `${Math.min(pctUsed, 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-medium text-[var(--text-main)] opacity-70 mt-1 tabular-nums">{Math.round(pctUsed)}% utilized</div>
        </div>

        {}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden hover-lift">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/10 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 dark:bg-orange-400/20 flex items-center justify-center border border-orange-500/10 dark:border-orange-400/20">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)]">
              Spent
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--text-main)] tracking-tight">
            {fmt(totalSpent)}
          </div>
          <div className="text-[12px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-[0.15em] mt-1">
            Total Spent
          </div>
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full" />
          <div className="text-[11px] text-[var(--text-muted)] mt-1">across all budget categories</div>
        </div>

        {}
        <div className={`group relative p-6 border rounded-2xl transition-all hover:shadow-md overflow-hidden ${isOver ? 'bg-red-50/50 border-red-100' : 'bg-[var(--bg-base)] border-[var(--border-light)] hover:border-[var(--border-dark)]'}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] ${isOver ? 'bg-[var(--expense-red)]/5' : 'bg-[var(--income-green)]/5'}`} />
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isOver ? 'bg-red-500/15 border-red-500/20' : 'bg-green-500/15 border-green-500/20'}`}>
              <TrendingDown className={`w-5 h-5 ${isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${isOver ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)]'}`}>
              {isOver ? 'Over Budget' : 'Remaining'}
            </span>
          </div>
          <div className={`text-3xl font-bold tabular-nums tracking-tight ${isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {isOver ? '-' : ''}{fmt(Math.abs(remaining))}
          </div>
          <div className="text-[12px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-[0.15em] mt-1">
            {isOver ? 'Over Budget' : 'Remaining Balance'}
          </div>
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full" />
          <div className="text-[11px] text-[var(--text-muted)] mt-1">{isOver ? '⚠️ exceeded limit' : '✓ within budget'}</div>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {}
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => onFilterChange({ ...filter, period: p.key })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                filter.period === p.key
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Calendar className="w-2.5 h-2.5" />
              {p.label}
            </button>
          ))}
        </div>


      </div>
    </div>
  )
}
