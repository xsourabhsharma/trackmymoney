'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
  variant?: 'dashboard' | 'public'
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = 'dashboard',
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const isDark = mounted && resolvedTheme === 'dark'
  const label = mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle color mode'

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98]',
        showLabel ? 'h-11 px-4' : 'h-10 w-10',
        variant === 'public'
          ? 'border border-[var(--public-border)] bg-[var(--public-surface)] font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--public-text)] shadow-[0_10px_28px_rgba(0,0,0,0.18)] hover:border-[var(--public-border-strong)] hover:bg-[var(--public-surface-strong)] focus-visible:ring-[var(--public-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg)]'
          : 'border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-dark)] hover:text-[var(--text-main)] focus-visible:ring-[var(--accent)]',
        className
      )}
      title={label}
      aria-label={label}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </span>
      {showLabel ? <span>{mounted ? (isDark ? 'Light' : 'Dark') : 'Theme'}</span> : null}
    </button>
  )
}
