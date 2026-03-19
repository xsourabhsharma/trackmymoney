'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

export function AdvancedFilterPanel({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    cat: searchParams.get('cat') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
  })

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.set('page', '1') // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ type: 'all', cat: '', from: '', to: '', min: '', max: '' })
    router.push(pathname)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 font-display font-black uppercase text-sm tracking-widest hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" /> Advanced Filters
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t-4 border-[#141414] grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <Label className="font-ui font-black uppercase text-[10px] tracking-widest">Entry Type</Label>
            <Select value={filters.type} onValueChange={(val) => setFilters({...filters, type: val ?? 'all'})}>
              <SelectTrigger className="border-2 border-[#141414] rounded-none font-bold">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ALL ENTRIES</SelectItem>
                <SelectItem value="income">INFLOW (+)</SelectItem>
                <SelectItem value="expense">OUTFLOW (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-ui font-black uppercase text-[10px] tracking-widest">Category Segment</Label>
            <Select value={filters.cat} onValueChange={(val) => setFilters({...filters, cat: val ?? ''})}>
              <SelectTrigger className="border-2 border-[#141414] rounded-none font-bold">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ALL CATEGORIES</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-ui font-black uppercase text-[10px] tracking-widest">Amount Range ($)</Label>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="MIN" 
                type="number" 
                value={filters.min} 
                onChange={(e) => setFilters({...filters, min: e.target.value})}
                className="border-2 border-[#141414] rounded-none font-bold"
              />
              <span className="font-black">-</span>
              <Input 
                placeholder="MAX" 
                type="number" 
                value={filters.max} 
                onChange={(e) => setFilters({...filters, max: e.target.value})}
                className="border-2 border-[#141414] rounded-none font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="font-ui font-black uppercase text-[10px] tracking-widest">Temporal Window</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[10px] uppercase opacity-50">FROM:</span>
                <Input 
                  type="date" 
                  value={filters.from} 
                  onChange={(e) => setFilters({...filters, from: e.target.value})}
                  className="border-2 border-[#141414] rounded-none font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[10px] uppercase opacity-50">TO:</span>
                <Input 
                  type="date" 
                  value={filters.to} 
                  onChange={(e) => setFilters({...filters, to: e.target.value})}
                  className="border-2 border-[#141414] rounded-none font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={applyFilters} className="flex-1 bg-[#141414] text-white border-2 border-[#141414] hover:bg-[#fe4d00] rounded-none font-black uppercase tracking-widest h-10">
              DEPLOY FILTERS
            </Button>
            <Button onClick={clearFilters} variant="outline" className="border-2 border-[#141414] rounded-none hover:bg-gray-100 h-10 px-3">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
