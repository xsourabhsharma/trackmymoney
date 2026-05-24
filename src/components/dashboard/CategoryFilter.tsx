'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CategoryFilterItem {
  id: string
  name: string
  icon?: string | null
}

export function CategoryFilter({ categories }: { categories: CategoryFilterItem[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('cat') || 'all'

  const handleValueChange = (value: string | null) => {
    if (!value) return
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (value === 'all') {
      current.delete('cat')
    } else {
      current.set('cat', value)
    }
    router.push(`?${current.toString()}`)
  }

  return (
    <Select value={currentCategory} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <div className="flex items-center gap-2">
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
