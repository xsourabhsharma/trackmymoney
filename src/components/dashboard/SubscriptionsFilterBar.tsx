'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Plus, Filter, Monitor } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { SubscriptionStatus } from '@/app/dashboard/subscriptions/data'
import { Button } from '@/components/ui/button'

interface SubscriptionsFilterBarProps {
  initialStatus: SubscriptionStatus | 'all'
  initialSearch: string
  onAddSubClick?: () => void
}

export function SubscriptionsFilterBar({ initialStatus, initialSearch, onAddSubClick }: SubscriptionsFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<SubscriptionStatus | 'all'>(initialStatus)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch] = useDebounce(search, 400)

  useEffect(() => {
    // Only update if changes occurred compared to current URL state
    const currentUrlStatus = searchParams.get('status') || 'all'
    const currentUrlSearch = searchParams.get('q') || ''
    
    if (status !== currentUrlStatus || debouncedSearch !== currentUrlSearch) {
      const params = new URLSearchParams()
      if (status !== 'all') params.set('status', status)
      if (debouncedSearch) params.set('q', debouncedSearch)
      
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [status, debouncedSearch, pathname, router, searchParams])

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-[var(--border-light)] mb-4 bg-transparent sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Status Filter */}
        <div className="relative">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as SubscriptionStatus | 'all')}
            className="pl-9 pr-10 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow cursor-pointer shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-[var(--text-muted)] rotate-45 pointer-events-none transform -translate-y-[8px]"></div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--text-main)]">
            <Search className="w-full h-full" />
          </div>
          <input 
            type="text" 
            placeholder="Search subscriptions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-sm font-light text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow placeholder:text-[var(--text-muted)] shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button 
          variant="outline"
          className="bg-[var(--bg-muted)] hover:bg-[var(--border-light)] text-[var(--text-main)] border border-[var(--border-light)] text-[12px] font-bold uppercase tracking-widest px-4 py-2 h-auto rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Monitor className="w-4 h-4 text-[var(--accent)]" />
          Import from Bank
        </Button>
        <Button 
          onClick={onAddSubClick}
          className="bg-[var(--text-main)] hover:bg-[var(--text-main)]/90 text-[var(--bg-base)] text-[12px] font-bold uppercase tracking-widest px-4 py-2 h-auto rounded-xl flex items-center gap-2 shadow-sm transition-all shadow-[var(--border-light)]/50 border border-transparent"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </Button>
      </div>
    </div>
  )
}
