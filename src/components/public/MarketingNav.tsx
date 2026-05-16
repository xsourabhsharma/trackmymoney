'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PublicButton } from './PublicButton'
import { ThemeToggle } from '@/components/ThemeToggle'

export type MarketingNavLink = {
  href: string
  label: string
}

type MarketingNavAction = {
  href: string
  label: string
}

export type MarketingNavProps = {
  className?: string
  cta?: MarketingNavAction
  links?: MarketingNavLink[]
  logoHref?: string
  secondaryCta?: MarketingNavAction
  showLinks?: boolean
  statusLabel?: string
  sticky?: boolean
}

const defaultLinks: MarketingNavLink[] = [
  { href: '#features', label: 'Features' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
]

export function MarketingNav({
  className,
  cta = { href: '/signup', label: 'Start' },
  links = defaultLinks,
  logoHref = '/',
  secondaryCta = { href: '/login', label: 'Log in' },
  showLinks = true,
  statusLabel = 'Private beta',
  sticky = true,
}: MarketingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => setScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const closeMenuOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false)
      }
    }

    desktopQuery.addEventListener('change', closeMenuOnDesktop)

    return () => desktopQuery.removeEventListener('change', closeMenuOnDesktop)
  }, [])

  return (
    <header
      className={cn(
        sticky ? 'sticky top-0' : 'relative',
        'z-50 border-b transition-all duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-[var(--public-border)] bg-[color-mix(in_srgb,var(--public-bg)_86%,transparent)] shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur-2xl'
          : 'border-transparent bg-transparent',
        className
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1220px] items-center justify-between gap-4 px-5">
        <Link
          href={logoHref}
          className="group relative z-[61] flex min-w-0 items-center gap-3 font-bold text-[var(--public-text)]"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.055] shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Image
              src="/real-logo.png"
              alt="TrackMyMoney"
              width={28}
              height={28}
              className="h-7 w-7 dark:invert"
              priority
            />
          </span>
          <span className="truncate text-[17px] tracking-normal">
            Track<span className="text-[var(--public-muted)]">My</span>Money
          </span>
        </Link>

        {showLinks && links.length > 0 ? (
          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--public-muted)] md:flex"
          >
            {links.map(({ href, label }) => (
              <Link key={`${href}-${label}`} href={href} className="hover:text-[var(--public-text)]">
                {label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="hidden items-center gap-2 md:flex">
          {statusLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--public-border)] bg-white/[0.04] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--public-lime)]" />
              {statusLabel}
            </span>
          ) : null}
          <ThemeToggle variant="public" />
          <PublicButton href={secondaryCta.href} variant="ghost" size="sm">
            {secondaryCta.label}
          </PublicButton>
          <PublicButton href={cta.href} size="sm" icon={<ArrowRight className="h-4 w-4" />}>
            {cta.label}
          </PublicButton>
        </div>

        <div className="relative z-[61] flex items-center gap-2 md:hidden">
          <ThemeToggle variant="public" />
          <button
            type="button"
            aria-controls="public-mobile-menu"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.055] text-[var(--public-text)]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm transition-opacity duration-200 md:hidden motion-reduce:transition-none',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
      />
      <div
        id="public-mobile-menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={cn(
          'fixed right-0 top-0 z-[60] h-dvh w-[min(84vw,340px)] border-l border-[var(--public-border)] bg-[var(--public-bg)] p-5 pt-24 shadow-2xl transition-transform duration-300 md:hidden motion-reduce:transition-none',
          mobileOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        )}
      >
        <div className="flex flex-col gap-2">
          <ThemeToggle variant="public" showLabel className="mb-3 w-full justify-center" />
          {showLinks
            ? links.map(({ href, label }) => (
                <Link
                  key={`${href}-${label}-mobile`}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-[14px] border border-transparent px-4 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--public-text)] hover:border-[var(--public-border)] hover:bg-white/[0.04]"
                >
                  {label}
                </Link>
              ))
            : null}
          <div className="mt-4 grid gap-3">
            <PublicButton href={cta.href} fullWidth showArrow onClick={() => setMobileOpen(false)}>
              {cta.label}
            </PublicButton>
            <PublicButton href={secondaryCta.href} fullWidth variant="secondary" onClick={() => setMobileOpen(false)}>
              {secondaryCta.label}
            </PublicButton>
          </div>
        </div>
      </div>
    </header>
  )
}
