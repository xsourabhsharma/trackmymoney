'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SubscriptionsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for immediate UI feedback before URL updates
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      createQueryString('q', query)
    }, 500)
    return () => clearTimeout(handler)
  }, [query])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }

      startTransition(() => {
        router.push(pathname + '?' + params.toString(), { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const handleReset = () => {
    setQuery('')
    setStatus('all')
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-b border-[var(--border-light)] mb-2">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-tight cursor-pointer shrink-0">
          <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--text-main)] focus:ring-0 cursor-pointer" />
          Select all
        </label>
        
        {/* Status Filter */}
        <div className="relative group shrink-0">
          <select 
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              createQueryString('status', e.target.value)
            }}
            className="pl-3 pr-8 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-[12px] font-bold uppercase tracking-tight appearance-none outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-50"
            disabled={isPending}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-main)] transition-colors" />
        </div>

        {/* Search Input */}
        <div className="relative flex-grow sm:flex-grow-0 sm:w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subscriptions..." 
            className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-[12px] font-bold uppercase tracking-tight outline-none focus:border-[var(--text-main)] transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto justify-end">
        {(query || status !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReset}
            className="h-8 rounded-full border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] text-[12px] font-bold uppercase tracking-widest transition-colors"
          >
            Reset
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 rounded-full border-[var(--border-light)] text-[var(--text-muted)] text-[12px] font-bold uppercase tracking-widest">Pause Selected</Button>
        <Button variant="outline" size="sm" className="h-8 rounded-full border-[var(--border-light)] text-[var(--text-muted)] text-[12px] font-bold uppercase tracking-widest">Export CSV</Button>
      </div>
    </div>
  )
}
