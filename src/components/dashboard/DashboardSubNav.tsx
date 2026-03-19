'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV_ITEMS } from '@/lib/types'

export function DashboardSubNav() {
  const pathname = usePathname()

  return (
    <div className="filter-group flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-[100vw]">
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              isActive 
                ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-md' 
                : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--border-dark)]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
