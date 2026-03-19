'use client'

import { ReportsFilter, ReportsPeriod, ReportsScope, ReportsView } from '@/app/dashboard/reports/data'
import { Calendar, ChevronDown } from 'lucide-react'

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
  { key: 'tax', label: 'Tax' },
]

export function ReportsFilterBar({ filter, onChangeFilter }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* Date Spectrum */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Date Spectrum</span>
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => onChangeFilter({ period: p.key })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tight transition-all ${
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

      {/* Scope */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Scope</span>
        <div className="relative">
          <select
            value={filter.scope}
            onChange={e => onChangeFilter({ scope: e.target.value as ReportsScope })}
            className="pl-3 pr-8 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[10px] font-bold uppercase appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer transition-all"
          >
            <option value="all">All Accounts</option>
            <option value="bank">Bank Accounts</option>
            <option value="card">Card Accounts</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {/* View Mode */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">View</span>
        <div className="flex gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-light)] shadow-inner">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => onChangeFilter({ view: v.key })}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tight transition-all ${
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
