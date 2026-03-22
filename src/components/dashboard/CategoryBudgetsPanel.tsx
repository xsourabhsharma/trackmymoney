'use client'

import { CategoryBudgetItem } from '@/app/dashboard/budgets/data'
import { Plus, TrendingUp } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  categoryBudgets: CategoryBudgetItem[]
  onAddBudget: () => void
  onEditBudget: (budget: CategoryBudgetItem) => void
}



function StatusBadge({ pct, isOver }: { pct: number; isOver: boolean }) {
  if (isOver) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-tight">Over Budget</span>
  if (pct >= 80) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-tight">Near Limit</span>
  if (pct >= 50) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tight">Comfortable</span>
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-tight">On Track</span>
}

export function CategoryBudgetsPanel({ categoryBudgets, onAddBudget, onEditBudget }: Props) {
  const { fmt } = useCurrency()

  if (categoryBudgets.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-5 border-2 border-dashed border-[var(--border-light)] rounded-[24px] bg-[var(--bg-surface)]/30">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-3xl shadow-sm">
          🎯
        </div>
        <div>
          <p className="text-[13px] font-bold text-[var(--text-main)] tracking-tight mb-1">
            No category budgets yet
          </p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
            Create monthly spending limits for key categories like Groceries, Dining, or Entertainment to start tracking your budget.
          </p>
        </div>
        <button
          onClick={onAddBudget}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all btn-press"
        >
          <Plus className="w-3.5 h-3.5" />
          Set Budget Limit
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {categoryBudgets.map((budget) => {
        const pct = budget.percentageUsed
        const isOver = pct > 100
        const cappedPct = Math.min(pct, 100)

        return (
          <div
            key={budget.budgetId}
            className="group p-5 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md cursor-pointer relative overflow-hidden hover-lift"
            onClick={() => onEditBudget(budget)}
          >
            {/* Subtle background fill based on usage */}
            <div
              className={`absolute inset-0 opacity-[0.02] transition-all ${isOver ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-[var(--accent)]'}`}
            />

            <div className="relative flex flex-col gap-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                    {budget.categoryIcon || '📦'}
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight block">
                      {budget.categoryName}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {budget.period} budget
                      {budget.rollover && ' · rollover'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold tabular-nums ${isOver ? 'text-[var(--expense-red)]' : pct >= 80 ? 'text-orange-500' : 'text-[var(--text-main)]'}`}>
                    {Math.round(pct)}%
                  </span>
                  <StatusBadge pct={pct} isOver={isOver} />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full animate-progress-fill ${
                    isOver ? 'bg-[var(--expense-red)]' : pct >= 80 ? 'bg-orange-400' : 'bg-[var(--accent)]'
                  }`}
                  style={{ width: `${cappedPct}%` }}
                />
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[15px] font-bold tabular-nums text-[var(--text-main)]">
                    {fmt(budget.spentAmount)}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">
                    / {fmt(budget.budgetAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                  <TrendingUp className="w-3 h-3" />
                  {fmt(Math.abs(budget.remainingAmount))} {isOver ? 'over' : 'left'}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
