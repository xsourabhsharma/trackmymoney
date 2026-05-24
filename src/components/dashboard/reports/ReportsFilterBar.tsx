'use client'

import type { ReportsFilter, ReportsPeriod, ReportsView } from '@/app/dashboard/reports/data'

interface Props {
  filter: ReportsFilter
  onChangeFilter: (partial: Partial<ReportsFilter>) => void
}

const PERIODS: { key: ReportsPeriod; label: string }[] = [
  { key: 'last_7_days', label: '7 Days' },
  { key: 'this_month', label: 'Month' },
  { key: 'this_year', label: 'Year' },
  { key: 'custom', label: 'Custom' },
]

const VIEWS: { key: ReportsView; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'detailed', label: 'Detailed' },
]

export function ReportsFilterBar({ filter, onChangeFilter }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Date Range</span>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] p-1 shadow-inner">
            {PERIODS.map((period) => (
              <button
                key={period.key}
                type="button"
                onClick={() => onChangeFilter({ period: period.key })}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${
                  filter.period === period.key
                    ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">View</span>
          <div className="flex gap-1 rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] p-1 shadow-inner">
            {VIEWS.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => onChangeFilter({ view: view.key })}
                className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all ${
                  filter.view === view.key
                    ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter.period === 'custom' ? (
        <div className="grid gap-3 rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <DateField
            label="From"
            value={filter.from ?? ''}
            onChange={(from) => onChangeFilter({ from, period: 'custom' })}
          />
          <DateField
            label="To"
            value={filter.to ?? ''}
            onChange={(to) => onChangeFilter({ to, period: 'custom' })}
          />
          <button
            type="button"
            onClick={() => onChangeFilter({ from: '', period: 'this_month', to: '' })}
            className="h-11 rounded-xl border border-[var(--border-light)] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] hover:border-[var(--border-dark)] hover:text-[var(--text-main)]"
          >
            Reset
          </button>
        </div>
      ) : null}
    </div>
  )
}

function DateField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-3 text-sm font-medium text-[var(--text-main)] outline-none focus:border-[var(--border-dark)]"
      />
    </label>
  )
}
