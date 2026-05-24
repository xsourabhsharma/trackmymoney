'use client'

import { BarChart3 } from 'lucide-react'
import type { CashFlowPoint, PeriodComparisonMetrics } from '@/app/dashboard/reports/data'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  comparison: PeriodComparisonMetrics
  points: CashFlowPoint[]
}

export function CashFlowChartSection({ comparison, points }: Props) {
  const { fmt } = useCurrency()

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-surface)]/30 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--accent)]">
          <BarChart3 className="h-5 w-5" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No cash flow data for this period.</p>
        <p className="text-[12px] text-[var(--text-muted)]">Add transactions or expand your date range to see activity here.</p>
      </div>
    )
  }

  const maxVal = Math.max(...points.flatMap((point) => [point.income, point.expense, Math.abs(point.net)]), 1)
  const width = 300
  const height = 150
  const pad = 10

  function valueToY(value: number) {
    return height - pad - ((value / maxVal) * (height - 2 * pad))
  }

  function buildPath(accessor: (point: CashFlowPoint) => number) {
    return points.map((point, index) => {
      const x = pad + (index / Math.max(points.length - 1, 1)) * (width - 2 * pad)
      const y = valueToY(accessor(point))
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  const netCurrent = comparison.netCurrent
  const netChangePct = comparison.netChangePct
  const isImprovement = netChangePct > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-surface)]/30 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" preserveAspectRatio="xMidYMid meet">
          {[0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = height - pad - (fraction * (height - 2 * pad))
            return (
              <line
                key={fraction}
                x1={pad}
                y1={y}
                x2={width - pad}
                y2={y}
                stroke="var(--border-light)"
                strokeDasharray="4 4"
                strokeWidth="0.5"
              />
            )
          })}

          <path d={buildPath((point) => point.income)} fill="none" stroke="var(--income-green)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          <path d={buildPath((point) => point.expense)} fill="none" stroke="var(--expense-red)" strokeDasharray="6 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={buildPath((point) => Math.max(0, point.net))} fill="none" stroke="var(--accent)" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" opacity="0.7" />

          {points.map((point, index) => {
            const x = pad + (index / Math.max(points.length - 1, 1)) * (width - 2 * pad)
            return (
              <g key={`${point.date}-${index}`}>
                <circle cx={x} cy={valueToY(point.income)} fill="var(--income-green)" r="3" />
                <circle cx={x} cy={valueToY(point.expense)} fill="var(--expense-red)" r="2.5" />
              </g>
            )
          })}
        </svg>

        <div className="mt-2 flex justify-between px-4">
          {points.map((point, index) => (
            <span key={`${point.date}-${index}`} className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {point.date}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6">
        {[
          { label: 'Income', color: 'bg-[var(--income-green)]' },
          { label: 'Expense', color: 'bg-[var(--expense-red)]' },
          { label: 'Net', color: 'bg-[var(--accent)]' },
        ].map((legend) => (
          <div key={legend.label} className="flex items-center gap-1.5">
            <div className={`h-0.5 w-5 rounded-full ${legend.color}`} />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{legend.label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-surface)] p-4 text-center">
        <p className="text-[12px] font-bold uppercase leading-relaxed tracking-wide text-[var(--text-muted)]">
          In this period, your net cash flow is{' '}
          <span className={`font-black ${netCurrent >= 0 ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}`}>
            {fmt(Math.abs(netCurrent))}
          </span>
          {netChangePct !== 0 ? (
            <>
              , with{' '}
              <span className={isImprovement ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}>
                {isImprovement ? '+' : ''}{netChangePct.toFixed(1)}%
              </span>{' '}
              {isImprovement ? 'improvement' : 'change'} vs previous period
            </>
          ) : null}
          .
        </p>
      </div>
    </div>
  )
}
