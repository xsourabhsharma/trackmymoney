'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

export function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('q') || ''
  const initialMin = searchParams.get('min') || ''
  const initialMax = searchParams.get('max') || ''
  
  const [searchTerm, setSearchTerm] = React.useState(initialSearch)
  const [minAmount, setMinAmount] = React.useState(initialMin)
  const [maxAmount, setMaxAmount] = React.useState(initialMax)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedMin = useDebounce(minAmount, 500)
  const debouncedMax = useDebounce(maxAmount, 500)

  React.useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (debouncedSearchTerm) current.set('q', debouncedSearchTerm)
    else current.delete('q')

    if (debouncedMin) current.set('min', debouncedMin)
    else current.delete('min')

    if (debouncedMax) current.set('max', debouncedMax)
    else current.delete('max')
    
    router.push(`?${current.toString()}`)
  }, [debouncedSearchTerm, debouncedMin, debouncedMax, router, searchParams])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search merchants or notes..."
          className="pl-9 pr-4 bg-white dark:bg-zinc-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type="number"
          placeholder="Min $"
          className="w-24 bg-white dark:bg-zinc-900"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <span className="text-gray-500">-</span>
        <Input
          type="number"
          placeholder="Max $"
          className="w-24 bg-white dark:bg-zinc-900"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />
      </div>
    </div>
  )
}
