'use client'

import { BudgetOverviewMetrics, BudgetFilter, BudgetPeriod, BudgetScope } from '@/app/dashboard/budgets/data'
import { TrendingUp, TrendingDown, Wallet, Calendar, Building2, User } from 'lucide-react'

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

const SCOPES: { key: BudgetScope; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: null },
  { key: 'personal', label: 'Personal', icon: <User className="w-3 h-3" /> },
  { key: 'business', label: 'Business', icon: <Building2 className="w-3 h-3" /> },
]

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BudgetOverviewHeader({ metrics, filter, onFilterChange }: Props) {
  const { totalBudget, totalSpent, remaining } = metrics
  const pctUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const isOver = remaining < 0

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)]">
              Budget
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--text-main)] tracking-tight">
            ${fmt(totalBudget)}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">
            Total Monthly Budget
          </div>
          {/* Mini progress bar */}
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pctUsed, 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-1 tabular-nums">{Math.round(pctUsed)}% utilized</div>
        </div>

        {/* Total Spent */}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)]">
              Spent
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--text-main)] tracking-tight">
            ${fmt(totalSpent)}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">
            Total Spent
          </div>
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full" />
          <div className="text-[9px] text-[var(--text-muted)] mt-1">across all budget categories</div>
        </div>

        {/* Remaining */}
        <div className={`group relative p-6 border rounded-2xl transition-all hover:shadow-md overflow-hidden ${isOver ? 'bg-red-50/50 border-red-100' : 'bg-[var(--bg-base)] border-[var(--border-light)] hover:border-[var(--border-dark)]'}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] ${isOver ? 'bg-[var(--expense-red)]/5' : 'bg-[var(--income-green)]/5'}`} />
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOver ? 'bg-red-100' : 'bg-green-100'}`}>
              <TrendingDown className={`w-5 h-5 ${isOver ? 'text-[var(--expense-red)]' : 'text-[var(--income-green)]'}`} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${isOver ? 'bg-red-50 text-red-600 border-red-100' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)]'}`}>
              {isOver ? 'Over Budget' : 'Remaining'}
            </span>
          </div>
          <div className={`text-3xl font-bold tabular-nums tracking-tight ${isOver ? 'text-[var(--expense-red)]' : 'text-[var(--income-green)]'}`}>
            {isOver ? '-' : ''}${fmt(Math.abs(remaining))}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">
            {isOver ? 'Over Budget' : 'Remaining Balance'}
          </div>
          <div className="mt-4 h-1 bg-[var(--bg-surface)] rounded-full" />
          <div className="text-[9px] text-[var(--text-muted)] mt-1">{isOver ? '⚠️ exceeded limit' : '✓ within budget'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Period chips */}
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => onFilterChange({ ...filter, period: p.key })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
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

        {/* Scope chips */}
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {SCOPES.map(s => (
            <button
              key={s.key}
              onClick={() => onFilterChange({ ...filter, scope: s.key })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                filter.scope === s.key
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
