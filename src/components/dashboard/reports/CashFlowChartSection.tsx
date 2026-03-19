'use client'

import { CashFlowPoint, PeriodComparisonMetrics } from '@/app/dashboard/reports/data'

interface Props {
  points: CashFlowPoint[]
  comparison: PeriodComparisonMetrics
}

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

export function CashFlowChartSection({ points, comparison }: Props) {
  if (points.length === 0) {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-3 border-2 border-dashed border-[var(--border-light)] rounded-[20px] bg-[var(--bg-surface)]/30">
        <span className="text-3xl">📈</span>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No cash flow data for this period.</p>
        <p className="text-[10px] text-[var(--text-muted)]">Add transactions or expand your date range to see activity here.</p>
      </div>
    )
  }

  // Build SVG paths from data
  const maxVal = Math.max(...points.flatMap(p => [p.income, p.expense, Math.abs(p.net)]), 1)
  const W = 300
  const H = 150
  const pad = 10

  function valueToY(val: number) {
    return H - pad - ((val / maxVal) * (H - 2 * pad))
  }

  function buildPath(accessor: (p: CashFlowPoint) => number) {
    return points.map((p, i) => {
      const x = pad + (i / Math.max(points.length - 1, 1)) * (W - 2 * pad)
      const y = valueToY(accessor(p))
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  const netCurrent = comparison.netCurrent
  const netChangePct = comparison.netChangePct
  const isImprovement = netChangePct > 0

  return (
    <div className="flex flex-col gap-4">
      {/* SVG Chart */}
      <div className="relative overflow-hidden rounded-xl bg-[var(--bg-surface)]/30 border border-[var(--border-light)]/50 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(frac => {
            const y = H - pad - (frac * (H - 2 * pad))
            return (
              <line key={frac} x1={pad} y1={y} x2={W - pad} y2={y}
                stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="4 4" />
            )
          })}

          {/* Income line */}
          <path d={buildPath(p => p.income)} fill="none" stroke="var(--income-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Expense line */}
          <path d={buildPath(p => p.expense)} fill="none" stroke="var(--expense-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />

          {/* Net line */}
          <path d={buildPath(p => Math.max(0, p.net))} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" opacity="0.7" />

          {/* Data points */}
          {points.map((p, i) => {
            const x = pad + (i / Math.max(points.length - 1, 1)) * (W - 2 * pad)
            return (
              <g key={i}>
                <circle cx={x} cy={valueToY(p.income)} r="3" fill="var(--income-green)" />
                <circle cx={x} cy={valueToY(p.expense)} r="2.5" fill="var(--expense-red)" />
              </g>
            )
          })}
        </svg>

        {/* X axis labels */}
        <div className="flex justify-between px-4 mt-2">
          {points.map((p, i) => (
            <span key={i} className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {p.date}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        {[
          { label: 'Income', color: 'bg-[var(--income-green)]', dashed: false },
          { label: 'Expense', color: 'bg-[var(--expense-red)]', dashed: true },
          { label: 'Net', color: 'bg-[var(--accent)]', dashed: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-0.5 w-5 ${l.color} ${l.dashed ? 'opacity-60' : ''} rounded-full`} />
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="bg-[var(--bg-surface)] p-4 rounded-xl text-center border border-[var(--border-light)]/50">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase leading-relaxed tracking-wide">
          In this period, your net cash flow is{' '}
          <span className={`font-black ${netCurrent >= 0 ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}`}>
            ${Math.abs(netCurrent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {netChangePct !== 0 && (
            <>, with{' '}
              <span className={isImprovement ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}>
                {isImprovement ? '+' : ''}{netChangePct.toFixed(1)}%
              </span>
              {' '}{isImprovement ? 'improvement' : 'change'} vs previous period
            </>
          )}.
        </p>
      </div>
    </div>
  )
}
