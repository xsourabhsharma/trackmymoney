'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ToastProvider } from '@/components/ui/toast-provider'
import { Menu, X, Bell, LogOut } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'

interface Props {
  user: User
  initialTheme: 'system' | 'light' | 'dark'
  initialCurrency: 'USD' | 'INR'
  children: React.ReactNode
}

export default function DashboardLayoutClient({ user, initialTheme, initialCurrency, children }: Props) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const setCurrency = useCurrencyStore((state) => state.setCurrency)

  // Hydrate currency store on mount
  useEffect(() => {
    setCurrency(initialCurrency)
  }, [initialCurrency, setCurrency])

  // Apply the saved theme from DB on mount
  useEffect(() => {
    const root = document.documentElement
    if (initialTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (initialTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }, [initialTheme])

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }


  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = (user.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="app-container min-h-screen bg-[var(--bg-base)]">
      <header className="sticky top-0 z-50 bg-[var(--bg-base)] border-b border-[var(--border-light)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">

          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold uppercase tracking-wider text-[var(--text-main)]">
            <Image src="/logo.svg" alt="TrackMyMoney" width={24} height={24} className="w-6 h-6" />
            TrackMyMoney
          </Link>

          <nav className="hidden lg:block ml-4">
            <ul className="flex items-center gap-6">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                      pathname === link.href || isLinkActive(link.href) ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-light)]">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-bold text-[var(--text-main)] truncate max-w-[150px]">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--expense-red)] transition-colors underline underline-offset-2"
              >
                Sign Out
              </button>
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center overflow-hidden font-bold text-sm text-[var(--text-muted)]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Ultra-Premium Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 bg-[var(--bg-base)]/80 backdrop-blur-3xl border border-[var(--border-light)] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-2">
        <ul className="flex items-center overflow-x-auto hide-scrollbar gap-2 snap-x snap-mandatory">
          {navLinks.map(link => {
            const active = pathname === link.href || isLinkActive(link.href)
            return (
              <li key={link.href} className="flex-shrink-0 snap-start">
                <Link
                  href={link.href}
                  className={`flex flex-col items-center justify-center px-5 py-3 rounded-2xl transition-all active:scale-95 ${
                    active 
                      ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-md' 
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {link.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <main className="max-w-[1440px] mx-auto w-full p-4 pb-32 md:p-6 lg:p-10 flex flex-col gap-6 md:gap-8">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
    </div>
  )
}
