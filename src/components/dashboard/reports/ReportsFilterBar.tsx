'use client'

import type { ReportsFilter, ReportsPeriod, ReportsView } from '@/app/dashboard/reports/data'

interface Props {
  filter: ReportsFilter
  onChangeFilter: (partial: Partial<ReportsFilter>) => void
}

const PERIODS: { key: ReportsPeriod; label: string }[] = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_three_months', label: 'Last 3 Months' },
  { key: 'year_to_date', label: 'Year to Date' },
]

const VIEWS: { key: ReportsView; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'detailed', label: 'Detailed' },
]

export function ReportsFilterBar({ filter, onChangeFilter }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Date Spectrum</span>
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => onChangeFilter({ period: p.key })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all ${
                filter.period === p.key
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>



      {}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">View</span>
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => onChangeFilter({ view: v.key })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-tight transition-all ${
                filter.view === v.key
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
