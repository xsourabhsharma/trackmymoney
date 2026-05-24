import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ConsolePanel({
  children,
  className,
  accent = false,
}: {
  children: React.ReactNode
  className?: string
  accent?: boolean
}) {
  return (
    <section className={cn(accent ? 'tm-panel-accent' : 'tm-panel-dark', className)}>
      {children}
    </section>
  )
}

export function ConsoleHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--text-main)]">
        {title}
      </h2>
      {action}
    </div>
  )
}

export function ConsoleMetric({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="tm-label mb-2">{label}</div>
      <div className="tm-value truncate text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-[var(--text-muted)]">{hint}</div> : null}
    </div>
  )
}

export function RailMeter({
  value,
  limit,
  accent = false,
}: {
  value: number
  limit: number
  accent?: boolean
}) {
  const pct = limit > 0 ? Math.min((value / limit) * 100, 100) : 0
  return (
    <div className="relative h-9 w-full">
      <div
        className={cn(
          'absolute left-0 right-0 top-4 h-px',
          accent ? 'bg-black/20' : 'bg-white/10 dark:bg-white/10'
        )}
      />
      <div className="absolute inset-x-0 top-[11px] flex justify-between">
        {Array.from({ length: 32 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-2.5 w-px',
              accent ? 'bg-black/20' : 'bg-[var(--border-dark)]'
            )}
          />
        ))}
      </div>
      <div
        className={cn(
          'absolute left-0 top-[15px] h-1',
          accent ? 'bg-black' : 'bg-[var(--accent)]'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function AmountPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-black px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)] dark:bg-black">
      {children}
    </span>
  )
}

export function ConsoleLinkButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  return (
    <a href={href} className="tm-button-secondary min-h-11">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  )
}

