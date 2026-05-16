import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PublicFooterLink = {
  href: string
  label: string
}

export type PublicFooterProps = {
  active?: 'privacy' | 'terms'
  className?: string
  id?: string
  legalLinks?: PublicFooterLink[]
  productLinks?: PublicFooterLink[]
}

const defaultProductLinks: PublicFooterLink[] = [
  { href: '/#features', label: 'Features' },
  { href: '/#security', label: 'Security' },
  { href: '/login', label: 'Login' },
  { href: '/signup', label: 'Sign up' },
]

const defaultLegalLinks: PublicFooterLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

export function PublicFooter({
  active,
  className,
  id,
  legalLinks = defaultLegalLinks,
  productLinks = defaultProductLinks,
}: PublicFooterProps) {
  return (
    <footer id={id} className={cn('relative z-10 border-t border-[var(--public-border)]', className)}>
      <div className="mx-auto grid max-w-[1220px] gap-10 px-5 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:py-12">
        <div>
          <Link href="/" className="group mb-5 inline-flex items-center gap-3 font-bold text-[var(--public-text)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.055]">
              <Image
                src="/real-logo.png"
                alt="TrackMyMoney"
                width={24}
                height={24}
                className="h-6 w-6 dark:invert"
              />
            </span>
            Track<span className="text-[var(--public-muted)]">My</span>Money
          </Link>
          <p className="max-w-[390px] text-sm leading-7 text-[var(--public-muted)]">
            A focused money command center for transactions, budgets, subscriptions, imports, reports, and AI-assisted review.
          </p>
          <div className="mt-6 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--public-lime)]" />
            Private personal finance workflows
          </div>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn active={active} title="Legal" links={legalLinks} />
      </div>

      <div className="mx-auto flex max-w-[1220px] flex-col gap-3 border-t border-[var(--public-border)] px-5 py-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--public-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>TrackMyMoney 2026</span>
        <span>Built for private personal finance workflows</span>
      </div>
    </footer>
  )
}

function FooterColumn({
  active,
  links,
  title,
}: {
  active?: PublicFooterProps['active']
  links: PublicFooterLink[]
  title: string
}) {
  return (
    <div>
      <h2 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-text)]">
        {title}
      </h2>
      <ul className="grid gap-3 text-sm text-[var(--public-muted)]">
        {links.map(({ href, label }) => {
          const isActive =
            (active === 'privacy' && href === '/privacy') || (active === 'terms' && href === '/terms')

          return (
            <li key={`${href}-${label}`}>
              <Link
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 hover:text-[var(--public-text)]',
                  isActive && 'font-semibold text-[var(--public-text)]'
                )}
              >
                {label}
                {!isActive && href.startsWith('/#') ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
