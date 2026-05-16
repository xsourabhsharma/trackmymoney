'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'
import { ToastProvider } from '@/components/ui/toast-provider'
import { LogOut, Settings, WalletCards } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'

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
  const { setTheme } = useTheme()
  const isInitialMount = useRef(true)

  useEffect(() => {
    setCurrency(initialCurrency)
  }, [initialCurrency, setCurrency])

  useEffect(() => {
    if (isInitialMount.current && initialTheme) {
      setTheme(initialTheme === 'system' ? 'dark' : initialTheme)
      isInitialMount.current = false
    }
  }, [initialTheme, setTheme])

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
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 text-[15px] font-bold tracking-tight text-[var(--text-main)]">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)]">
                <Image src="/real-logo.png" alt="TrackMyMoney" width={22} height={22} className="h-5 w-5 opacity-90 dark:invert" />
              </span>
              <span className="hidden sm:inline">
                Track<span className="text-[var(--text-muted)]">My</span>Money
              </span>
            </Link>

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
                  <Image src={avatarUrl} alt="Avatar" width={36} height={36} className="h-full w-full object-cover" unoptimized />
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
