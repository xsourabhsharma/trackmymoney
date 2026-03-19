'use client'

import { SpendingVsBudgetPoint } from '@/app/dashboard/budgets/data'

interface Props {
  points: SpendingVsBudgetPoint[]
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

export function SpendingVsBudgetPanel({ points }: Props) {
  // Exclude "Overall" from per-category chart rows, handle separately
  const overallPoint = points.find(p => p.label === 'Overall')
  const categoryPoints = points.filter(p => p.label !== 'Overall').slice(0, 8)
  const maxVal = Math.max(...points.map(p => Math.max(p.budgetAmount, p.spentAmount)), 1)

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Bar */}
      {overallPoint && (
        <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Overall</span>
            <span className="text-[11px] font-bold tabular-nums text-[var(--text-main)]">
              {fmt(overallPoint.spentAmount)} / {fmt(overallPoint.budgetAmount)}
            </span>
          </div>
          <div className="relative h-7 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg overflow-hidden shadow-inner">
            {/* Budget limit indicator */}
            {overallPoint.budgetAmount > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[var(--accent)] z-10"
                style={{ left: `100%` }}
                title="Budget limit"
              />
            )}
            {/* Spent bar */}
            <div
              className={`h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2 text-[9px] font-bold text-white ${
                overallPoint.spentAmount > overallPoint.budgetAmount ? 'bg-[var(--expense-red)]' : 'bg-[var(--income-green)]'
              }`}
              style={{
                width: overallPoint.budgetAmount > 0
                  ? `${Math.min((overallPoint.spentAmount / overallPoint.budgetAmount) * 100, 100)}%`
                  : '0%',
              }}
            >
              {overallPoint.spentAmount > 100 && fmt(overallPoint.spentAmount)}
            </div>
          </div>
        </div>
      )}

      {/* Per-category bars */}
      {categoryPoints.length > 0 && (
        <div className="flex flex-col gap-3">
          {categoryPoints.map((point) => {
            const spentPct = maxVal > 0 ? (point.spentAmount / maxVal) * 100 : 0
            const budgetPct = maxVal > 0 ? (point.budgetAmount / maxVal) * 100 : 0
            const isOver = point.spentAmount > point.budgetAmount

            return (
              <div key={point.label} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase min-w-[80px] truncate">{point.label}</span>
                <div className="flex-1 flex flex-col gap-1">
                  {/* Budget bar */}
                  <div className="h-2.5 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)]/40 rounded-lg transition-all duration-500"
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  {/* Actual spent bar */}
                  <div className="h-2.5 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-700 ${isOver ? 'bg-[var(--expense-red)]' : 'bg-[var(--income-green)]'}`}
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="text-[10px] font-bold tabular-nums text-[var(--text-main)]">{fmt(point.spentAmount)}</div>
                  <div className="text-[9px] font-bold tabular-nums text-[var(--text-muted)]">/ {fmt(point.budgetAmount)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {categoryPoints.length === 0 && !overallPoint && (
        <div className="py-8 text-center text-[11px] text-[var(--text-muted)]">
          No spending data for this period.
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 justify-end">
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 rounded-sm bg-[var(--accent)]/40" />
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 rounded-sm bg-[var(--income-green)]" />
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Actual</span>
        </div>
      </div>
    </div>
  )
}
