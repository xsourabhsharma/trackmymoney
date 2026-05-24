'use client'

import Link from 'next/link'
import { WalletCards } from 'lucide-react'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  href?: string
  markClassName?: string
  onClick?: () => void
  showText?: boolean
  textClassName?: string
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm',
        className
      )}
    >
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,90,31,0.34),transparent_38%)]" />
      <span aria-hidden className="absolute bottom-0 h-[42%] w-full bg-[var(--accent)]" />
      <WalletCards className="relative z-10 h-[52%] w-[52%] text-[var(--text-main)]" strokeWidth={2.35} />
    </span>
  )
}

export function BrandLogo({
  className,
  href,
  markClassName,
  onClick,
  showText = true,
  textClassName,
}: BrandLogoProps) {
  const content = (
    <>
      <BrandMark className={markClassName} />
      {showText ? (
        <span className={cn('truncate text-[15px] font-bold tracking-tight text-[var(--text-main)]', textClassName)}>
          Track<span className="text-[var(--text-muted)]">My</span>Money
        </span>
      ) : null}
    </>
  )

  const classes = cn('inline-flex min-w-0 items-center gap-2.5', className)

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <span onClick={onClick} className={classes}>
      {content}
    </span>
  )
}
