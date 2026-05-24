'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { AddTransactionButton } from '@/components/dashboard/AddTransactionButton'
import { useDebounce } from '@/hooks/use-debounce'

interface TransactionsFilterBarProps {
  categories: { id: string; name: string; type?: string; icon?: string }[];
  accounts: { id: string; name: string }[];
  currentPeriod: string;
  currentType: string;
  currentCategoryId: string;
  currentAccountId: string;
  currentQuery: string;
}

export function TransactionsFilterBar({
  categories,
  accounts,
  currentPeriod,
  currentType,
  currentCategoryId,
  currentAccountId,
  currentQuery,
}: TransactionsFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentQuery)
  const debouncedSearch = useDebounce(searchTerm, 400)

 
  const applyFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
   
    params.set('page', '1')
    router.push(`/dashboard/transactions?${params.toString()}`)
  }, [searchParams, router])

  useEffect(() => {
    if (debouncedSearch !== currentQuery) {
      applyFilter('q', debouncedSearch)
    }
  }, [debouncedSearch, currentQuery, applyFilter])

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {}
            <div className="relative shrink-0">
              <select 
                value={currentPeriod}
                onChange={(e) => applyFilter('period', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
                <option value="all_time">All Time</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {}
            <div className="relative shrink-0">
              <select 
                value={currentType}
                onChange={(e) => applyFilter('type', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

             {}
             <div className="relative shrink-0">
              <select
                value={currentCategoryId}
                onChange={(e) => applyFilter('cat', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">All Categories</option>
                {categories.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {}
            <div className="relative shrink-0">
              <select 
                value={currentAccountId}
                onChange={(e) => applyFilter('account', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest outline-none focus:border-[var(--text-main)] transition-colors cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">All Accounts</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

          </div>

          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-main)] opacity-70" />
            <input 
              type="text"
              placeholder="Search merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest outline-none focus:border-[var(--text-main)] transition-colors placeholder:text-[var(--text-main)] opacity-70 shadow-sm"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border-light)] pt-6">
          <AddTransactionButton categories={categories} accounts={accounts} buttonLabel="Add Transaction" />
        </div>
      </div>
    </div>
  )
}
