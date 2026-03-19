'use client'

import { useState } from 'react'
import { Download, Loader2, ChevronDown } from 'lucide-react'
import { ReportsFilter } from '@/app/dashboard/reports/data'

interface Props {
  filter: ReportsFilter
}

type ExportFormat = 'csv' | 'xlsx' | 'pdf'

interface ExportCard {
  id: string
  name: string
  desc: string
  icon: string
}

const EXPORT_CARDS: ExportCard[] = [
  { id: 'monthly', name: 'Monthly Summary Report', desc: 'Income, expenses, net, and category totals for the current period.', icon: '📋' },
  { id: 'yearly', name: 'Yearly Overview Statement', desc: 'Full annual aggregation with month-over-month comparisons.', icon: '📊' },
  { id: 'tax', name: 'Tax-Ready Ledger', desc: 'Optimized transaction export for fiscal year tax prep.', icon: '🧾' },
  { id: 'category', name: 'Category Flow (Detailed)', desc: 'Granular spending breakdown by category and month.', icon: '🗂️' },
]

export function ReportsExportsSection({ filter }: Props) {
  const [formats, setFormats] = useState<Record<string, ExportFormat>>({
    monthly: 'csv', yearly: 'csv', tax: 'csv', category: 'csv',
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, boolean>>({})

  function setFormat(id: string, fmt: ExportFormat) {
    setFormats(prev => ({ ...prev, [id]: fmt }))
  }

  async function handleGenerate(card: ExportCard) {
    const fmt = formats[card.id]
    setLoading(prev => ({ ...prev, [card.id]: true }))

    try {
      const params = new URLSearchParams({
        type: card.id,
        format: fmt,
        period: filter.period,
        scope: filter.scope,
      })

      const res = await fetch(`/api/reports/export?${params.toString()}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${card.id}-report.${fmt}`
      a.click()
      URL.revokeObjectURL(url)

      setDone(prev => ({ ...prev, [card.id]: true }))
      setTimeout(() => setDone(prev => ({ ...prev, [card.id]: false })), 3000)
    } catch (err) {
      console.error('Export error:', err)
      // Show a toast or fall back to client-side CSV
      alert('Export feature coming soon! Set up /api/reports/export to enable downloads.')
    } finally {
      setLoading(prev => ({ ...prev, [card.id]: false }))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {EXPORT_CARDS.map(card => (
        <div
          key={card.id}
          className="p-5 bg-[var(--bg-surface)] border border-[var(--border-light)]/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:border-[var(--border-dark)] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-lg shadow-sm">
              {card.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{card.name}</h4>
              <p className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-wider leading-relaxed">{card.desc}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <div className="relative">
              <select
                value={formats[card.id]}
                onChange={e => setFormat(card.id, e.target.value as ExportFormat)}
                className="pl-3 pr-7 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-[10px] font-bold uppercase appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer transition-all"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
                <option value="pdf">PDF</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
            </div>
            <button
              onClick={() => handleGenerate(card)}
              disabled={loading[card.id]}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all ${
                done[card.id]
                  ? 'bg-[var(--income-green)] text-white'
                  : 'bg-[var(--text-main)] text-[var(--bg-base)] hover:scale-[1.01] active:scale-[0.99]'
              } disabled:opacity-60`}
            >
              {loading[card.id] ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {done[card.id] ? 'Done!' : 'Generate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
