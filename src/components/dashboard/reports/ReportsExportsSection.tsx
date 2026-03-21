'use client'

import { useState } from 'react'
import { Download, Loader2, ChevronDown } from 'lucide-react'
import { ReportsFilter } from '@/app/dashboard/reports/data'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'

interface Props {
  filter: ReportsFilter
}

type ExportFormat = 'csv' | 'pdf'

interface ExportCard {
  id: string
  name: string
  desc: string
  icon: string
}

const EXPORT_CARDS: ExportCard[] = [
  { id: 'monthly', name: 'Monthly Summary Report', desc: 'Income, expenses, net, and category totals for the current period.', icon: '📋' },
  { id: 'tax', name: 'Tax-Ready Ledger', desc: 'Optimized transaction export for fiscal year tax prep.', icon: '🧾' },
]

export function ReportsExportsSection({ filter }: Props) {
  const [formats, setFormats] = useState<Record<string, ExportFormat>>({
    monthly: 'csv', tax: 'csv'
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
      // Fetch raw CSV data from the backend
      const res = await fetch(`/api/reports/export?type=${card.id}&format=csv&period=${filter.period}&scope=${filter.scope}`)
      if (!res.ok) throw new Error('Failed to fetch report data')
      const csvText = await res.text()

      const now = new Date()
      const filenameBase = `${card.id}-report-${now.toISOString().split('T')[0]}`

      if (fmt === 'csv') {
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filenameBase}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (fmt === 'pdf') {
        const parsed = Papa.parse(csvText, { skipEmptyLines: true })
        const data = parsed.data as string[][]
        
        if (data.length < 2) {
          alert('Not enough data to generate PDF.')
          return
        }

        const doc = new jsPDF()
        const headers = data[0]
        const body = data.slice(1)

        doc.setFontSize(18)
        doc.text(card.name, 14, 22)
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(`Generated on ${now.toLocaleDateString()}`, 14, 30)

        // @ts-ignore - jspdf-autotable plugin adds autoTable to jsPDF instance
        doc.autoTable({
          startY: 36,
          head: [headers],
          body: body,
          theme: 'striped',
          headStyles: { fillColor: [28, 27, 25] },
          styles: { fontSize: 9, cellPadding: 4 },
        })

        doc.save(`${filenameBase}.pdf`)
      }

      setDone(prev => ({ ...prev, [card.id]: true }))
      setTimeout(() => setDone(prev => ({ ...prev, [card.id]: false })), 3000)
    } catch (err) {
      console.error('Export error:', err)
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
