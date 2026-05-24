'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import type { ReportsFilter } from '@/app/dashboard/reports/data'

interface Props {
  filter: ReportsFilter
}

type ExportFormat = 'csv' | 'pdf'

export function ReportsExportsSection({ filter }: Props) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        format,
        period: filter.period,
        scope: filter.scope,
        type: filter.view === 'tax' ? 'tax' : 'transactions',
      })
      if (filter.from) params.set('from', filter.from)
      if (filter.to) params.set('to', filter.to)

      const response = await fetch(`/api/reports/export?${params.toString()}`)
      if (!response.ok) throw new Error('Report export failed.')

      const blob = await response.blob()
      const fallbackName = `trackmymoney-report.${format}`
      const disposition = response.headers.get('Content-Disposition') || ''
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || fallbackName
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)

      setDone(true)
      setTimeout(() => setDone(false), 3000)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Report export failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex items-start gap-4 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--accent)]">
          {format === 'pdf' ? <FileText className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-main)]">
            Transaction Report
          </h4>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Export the selected report range with real transaction rows, category totals, income, expenses, and net cash flow.
          </p>
          {error ? <p className="mt-3 text-sm font-semibold text-[var(--expense-red)]">{error}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
        <div className="relative">
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            className="h-11 w-full appearance-none rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] pl-4 pr-10 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-main)] outline-none focus:border-[var(--border-dark)] sm:w-32"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[12px] font-bold uppercase tracking-[0.16em] transition-all ${
            done
              ? 'bg-[var(--income-green)] text-black'
              : 'bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90'
          } disabled:opacity-60`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          {done ? 'Downloaded' : 'Download'}
        </button>
      </div>
    </div>
  )
}
