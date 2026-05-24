import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MarketingNav, type MarketingNavProps } from './MarketingNav'
import { PublicFooter, type PublicFooterProps } from './PublicFooter'

export type PublicShellProps = {
  children: ReactNode
  className?: string
  footerProps?: PublicFooterProps
  mainClassName?: string
  navProps?: MarketingNavProps
  showFooter?: boolean
  showNav?: boolean
}

export function PublicShell({
  children,
  className,
  footerProps,
  mainClassName,
  navProps,
  showFooter = true,
  showNav = true,
}: PublicShellProps) {
  return (
    <div className={cn('tm-public-shell min-h-screen overflow-hidden text-[var(--public-text)]', className)}>
      <div aria-hidden className="tm-public-orbit tm-public-orbit-one" />
      <div aria-hidden className="tm-public-orbit tm-public-orbit-two" />
      {showNav ? <MarketingNav {...navProps} /> : null}
      <main className={cn('relative z-10', mainClassName)}>{children}</main>
      {showFooter ? <PublicFooter {...footerProps} /> : null}
    </div>
  )
}
