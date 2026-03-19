'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
}

interface TransactionsFilterProps {
  categories: Category[]
}

export function TransactionsFilter({ categories }: TransactionsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for immediate UI feedback before URL updates
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [dateRange, setDateRange] = useState(searchParams.get('range') || 'this-month')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [categoryId, setCategoryId] = useState(searchParams.get('cat') || 'all')

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
      
      // Reset page when filters change
      if (name !== 'page') {
        params.delete('page')
      }

      startTransition(() => {
        router.push(pathname + '?' + params.toString(), { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  const handleReset = () => {
    setQuery('')
    setDateRange('this-month')
    setType('all')
    setCategoryId('all')
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-default">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-main)] flex items-center gap-2">
        Transactions Filter 
        {isPending && <span className="w-2 h-2 rounded-full bg-[var(--text-main)] animate-pulse" />}
      </h2>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date:</span>
          <div className="relative group">
            <select 
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                createQueryString('range', e.target.value)
              }}
              className="pl-3 pr-8 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-[11px] font-bold uppercase tracking-tight appearance-none outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-50"
              disabled={isPending}
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="this-year">This Year</option>
              <option value="all-time">All Time</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-main)] transition-colors" />
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Type:</span>
          <div className="relative group">
            <select 
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                createQueryString('type', e.target.value)
              }}
              className="pl-3 pr-8 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-[11px] font-bold uppercase tracking-tight appearance-none outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-50"
              disabled={isPending}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-main)] transition-colors" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Category:</span>
          <div className="relative group">
            <select 
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                createQueryString('cat', e.target.value)
              }}
              className="pl-3 pr-8 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-[11px] font-bold uppercase tracking-tight appearance-none outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer max-w-[150px] truncate disabled:opacity-50"
              disabled={isPending}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--text-main)] transition-colors" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search merchant..." 
            className="pl-9 pr-4 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-[11px] font-bold uppercase tracking-tight outline-none focus:border-[var(--text-main)] transition-colors w-[200px]"
          />
        </div>

        {/* Reset */}
        <div className="flex gap-2">
          {(query || dateRange !== 'this-month' || type !== 'all' || categoryId !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
