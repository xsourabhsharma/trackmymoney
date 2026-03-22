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
    <div className="flex flex-wrap gap-2">
      {RANGES.map((range) => {
        const isActive = currentRange === range.value
        return (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-3 py-1 text-[12px] font-bold uppercase tracking-widest rounded-full transition-all border ${
              isActive 
                ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-sm' 
                : 'bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
