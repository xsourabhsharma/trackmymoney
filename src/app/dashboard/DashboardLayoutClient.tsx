'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'
import { ToastProvider } from '@/components/ui/toast-provider'
import { ChevronDown, LogOut, Menu, Settings, WalletCards, X } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { BrandLogo } from '@/components/BrandLogo'

interface Props {
  user: User
  initialTheme: 'system' | 'light' | 'dark'
  initialCurrency: 'USD' | 'INR'
  children: React.ReactNode
}

const navLinks = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'AI Auto-Parse', href: '/dashboard/auto-parse' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Subscriptions', href: '/dashboard/subscriptions' },
  { name: 'Budgets', href: '/dashboard/budgets' },
  { name: 'Goals & Debt', href: '/dashboard/goals' },
  { name: 'Reports', href: '/dashboard/reports' },
  { name: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayoutClient({ user, initialTheme, initialCurrency, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const setCurrency = useCurrencyStore((state) => state.setCurrency)
  const fetchExchangeRate = useCurrencyStore((state) => state.fetchExchangeRate)
  const { setTheme } = useTheme()
  const isInitialMount = useRef(true)
  const [navMenuOpen, setNavMenuOpen] = useState(false)

  useEffect(() => {
    setCurrency(initialCurrency)
    void fetchExchangeRate()
  }, [fetchExchangeRate, initialCurrency, setCurrency])

  useEffect(() => {
    if (isInitialMount.current && initialTheme) {
      setTheme(initialTheme === 'system' ? 'dark' : initialTheme)
      isInitialMount.current = false
    }
  }, [initialTheme, setTheme])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNavMenuOpen(false))
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavMenuOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const activeRoute = navLinks.find((link) => isLinkActive(link.href)) ?? navLinks[0]
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = (user.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="tm-console min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative">
              <button
                type="button"
                aria-expanded={navMenuOpen}
                aria-controls="dashboard-logo-menu"
                onClick={() => setNavMenuOpen((open) => !open)}
                className="group flex shrink-0 items-center gap-2 rounded-[16px] border border-transparent p-1 pr-2 text-left hover:border-[var(--border-light)] hover:bg-[var(--bg-surface)]"
              >
                <BrandLogo markClassName="h-9 w-9 rounded-xl" textClassName="hidden text-[15px] sm:inline" />
                <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${navMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {navMenuOpen ? (
                <div
                  id="dashboard-logo-menu"
                  className="absolute left-0 top-[calc(100%+0.7rem)] z-[70] w-[min(92vw,360px)] overflow-hidden rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-base)] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-light)] px-3 py-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Dashboard Sections
                    </span>
                    <button
                      type="button"
                      onClick={() => setNavMenuOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                      aria-label="Close dashboard menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <nav aria-label="Dashboard logo menu" className="grid gap-1 py-2">
                    {navLinks.map((link) => {
                      const active = isLinkActive(link.href)
                      return (
                        <Link
                          key={`${link.href}-logo-menu`}
                          href={link.href}
                          className={`rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-all ${
                            active
                              ? 'bg-[var(--accent)] text-black'
                              : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                          }`}
                        >
                          {link.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              ) : null}
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] md:flex">
              <WalletCards className="h-3.5 w-3.5 text-[var(--accent)]" />
              {activeRoute.name}
            </div>
          </div>

          <nav className="hidden min-w-0 flex-1 justify-center lg:flex" aria-label="Dashboard sections">
            <ul className="tm-scrollbar-none flex max-w-full items-center gap-2 overflow-x-auto px-4 py-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href)
                return (
                  <li key={link.href} className="shrink-0">
                    <Link
                      href={link.href}
                      className={`tm-route-chip ${active ? 'tm-route-chip-active' : 'tm-route-chip-idle'}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setNavMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] lg:hidden"
              aria-label="Open dashboard sections"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link
              href="/dashboard/settings"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] sm:flex"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 border-l border-[var(--border-light)] pl-3">
              <div className="hidden max-w-[160px] flex-col items-end md:flex">
                <span className="truncate font-mono text-[11px] font-bold text-[var(--text-main)]">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] hover:text-[var(--accent)]"
                >
                  Sign Out
                </button>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] font-mono text-sm font-bold text-[var(--text-muted)]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--accent)] md:hidden"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-base)]/90 p-2 shadow-2xl backdrop-blur-xl sm:hidden">
        <ul className="tm-scrollbar-none flex items-center gap-2 overflow-x-auto">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href)
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  className={`tm-route-chip block ${active ? 'tm-route-chip-active' : 'tm-route-chip-idle'}`}
                >
                  {link.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 pb-32 md:p-6 lg:p-10">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  )
}
