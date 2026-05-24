'use client'

import type { TopSummaryMetrics, GoalsDebtsFilter } from '@/app/dashboard/goals/data'
import { Target, TrendingDown, Activity, Plus, Calendar } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  summary: TopSummaryMetrics
  filter: GoalsDebtsFilter
  onChangeFilter: (partial: Partial<GoalsDebtsFilter>) => void
  onAddGoal: () => void
  onAddDebt: () => void
}



export function GoalsDebtsSummaryHeader({ summary, filter, onChangeFilter, onAddGoal, onAddDebt }: Props) {
  const { fmt } = useCurrency()
  const { totalSavingsGoals, totalSavingsSaved, totalDebt, netProgressPercent } = summary
  const pct = Math.round(netProgressPercent)
  const isGood = pct >= 50

  return (
    <div className="flex flex-col gap-6">
      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
        {}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden hover-lift">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--income-green)]/5 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-[var(--income-green)]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)]">Goals</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--income-green)] tracking-tight animate-count-up">{fmt(totalSavingsGoals)}</div>
          <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">Total Savings Goals</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2 tabular-nums">
            Saved: <span className="text-[var(--income-green)] font-bold">{fmt(totalSavingsSaved)}</span>
          </div>
        </div>

        {}
        <div className="group relative p-6 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md overflow-hidden hover-lift">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[60px]" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[var(--expense-red)]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded-full border border-[var(--border-light)]">Debt</span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-[var(--expense-red)] tracking-tight animate-count-up">{fmt(totalDebt)}</div>
          <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">Total Debt</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2">Outstanding balance</div>
        </div>

        {}
        <div className={`group relative p-6 border rounded-2xl transition-all hover:shadow-md overflow-hidden ${isGood ? 'bg-[var(--bg-base)] border-[var(--border-light)]' : 'bg-orange-50/30 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20'}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] ${isGood ? 'bg-[var(--accent)]/5' : 'bg-orange-400/5 dark:bg-orange-500/10'}`} />
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isGood ? 'bg-[var(--accent)]/10' : 'bg-orange-100 dark:bg-orange-500/20'}`}>
              <Activity className={`w-5 h-5 ${isGood ? 'text-[var(--accent)]' : 'text-orange-500 dark:text-orange-400'}`} />
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${isGood ? 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)]' : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'}`}>
              Progress
            </span>
          </div>
          <div className={`text-3xl font-bold tabular-nums tracking-tight ${isGood ? 'text-[var(--accent)]' : 'text-orange-500 dark:text-orange-400'}`}>{pct}%</div>
          <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">Net Progress</div>
          <div className="mt-3 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full animate-progress-fill ${isGood ? 'bg-[var(--accent)]' : 'bg-orange-400 dark:bg-orange-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">across goals + debt payoff</div>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {}
          <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
            {(['this_year', 'all_time'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onChangeFilter({ period: p })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${filter.period === p ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                <Calendar className="w-2.5 h-2.5" />
                {p === 'this_year' ? 'This Year' : 'All Time'}
              </button>
            ))}
          </div>
          {}
          <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
            {(['all', 'savings', 'debt'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChangeFilter({ scope: s })}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${filter.scope === s ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                {s === 'all' ? 'All' : s === 'savings' ? 'Savings Only' : 'Debt Only'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddDebt}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-full text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
          >
            <Plus className="w-3 h-3" /> Add Debt
          </button>
          <button
            onClick={onAddGoal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus className="w-3 h-3" /> New Goal
          </button>
        </div>
      </div>
    </div>
  )
}
