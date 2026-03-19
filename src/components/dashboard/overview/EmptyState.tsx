import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  primaryActionLabel?: string
  primaryActionHref?: string
  icon?: ReactNode
}

export function EmptyState({
  title,
  description,
  primaryActionLabel,
  primaryActionHref,
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
        {title}
      </h3>
      <p className="max-w-md text-sm text-[var(--text-muted)] mb-6">
        {description}
      </p>
      {primaryActionLabel && primaryActionHref && (
        <Link
          href={primaryActionHref}
          className="px-6 py-2.5 bg-[var(--accent-main)] text-white font-bold uppercase tracking-widest text-sm rounded-full border-2 border-transparent hover:border-[var(--text-main)] hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none"
        >
          {primaryActionLabel}
        </Link>
      )}
    </div>
  )
}
