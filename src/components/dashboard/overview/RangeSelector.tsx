'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

const RANGES = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Last Month', value: 'last-month' },
  { label: '3 Months', value: '3-months' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' }
]

export function RangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get('range') || 'month'

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const activeLabel = RANGES.find(r => r.value === currentRange)?.label || 'Month'

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4 border-b-2 border-[var(--border-main)] mb-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--text-main)]">
          Overview
        </h1>
        <div className="flex items-center text-sm font-medium text-[var(--text-muted)] mt-1 tracking-wider uppercase">
          <Calendar className="w-4 h-4 mr-2 inline-block" />
          <span>Overview &bull; {activeLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((range) => {
          const isActive = currentRange === range.value
          return (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border-[2px] transition-all ${
                isActive 
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-transparent text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--bg-muted)] hover:-translate-y-0.5'
              }`}
            >
              {range.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
