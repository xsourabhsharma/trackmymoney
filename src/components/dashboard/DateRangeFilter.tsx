'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

const ranges = [
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'Last 3 Months', value: 'last-3-months' },
  { label: 'This Year', value: 'this-year' },
  { label: 'All Time', value: 'all-time' },
]

export function DateRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRange = searchParams.get('range') || 'this-month'

  const setRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', range)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
      <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200 dark:border-zinc-800">
        <Calendar className="h-3 w-3" /> Range
      </div>
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-tighter transition-all rounded-md ${
            currentRange === r.value
              ? 'bg-[#141414] text-[#dfd8cb] shadow-[2px_2px_0px_0px_rgba(254,77,0,1)]'
              : 'text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-zinc-800'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
