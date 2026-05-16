'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV_ITEMS } from '@/lib/types'

export function DashboardSubNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Dashboard sections"
      className="tm-scrollbar-none flex w-full max-w-[100vw] gap-2 overflow-x-auto py-1"
    >
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`tm-route-chip ${
              isActive
                ? 'tm-route-chip-active'
                : 'tm-route-chip-idle'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
