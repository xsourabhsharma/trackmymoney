'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PublicPanel } from './PublicPanel'
import { Reveal } from './Reveal'
import { AuthTrustScene } from './three/AuthTrustScene'

export type AuthExperienceHighlight = {
  icon: LucideIcon
  label: string
}

export type AuthExperienceShellProps = {
  asideClassName?: string
  children: ReactNode
  className?: string
  description: string
  eyebrow?: string
  footer?: ReactNode
  formClassName?: string
  highlights?: AuthExperienceHighlight[]
  logoHref?: string
  preview?: ReactNode
  statusLabel?: string
  title: ReactNode
}

export function AuthExperienceShell({
  asideClassName,
  children,
  className,
  description,
  eyebrow,
  footer,
  formClassName,
  highlights = [],
  logoHref = '/',
  preview,
  statusLabel = 'Bank-grade controls',
  title,
}: AuthExperienceShellProps) {
  return (
    <div className={cn('tm-public-shell grid min-h-screen overflow-hidden text-[var(--public-text)] lg:grid-cols-[1.04fr_0.86fr]', className)}>
      <aside
        className={cn(
          'relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-[var(--public-border)] px-10 py-10 lg:flex xl:px-16',
          asideClassName
        )}
      >
        <div aria-hidden className="tm-public-texture absolute inset-0 opacity-80" />
        <AuthTrustScene className="absolute bottom-24 right-[-5.5rem] z-0 h-[330px] w-[460px] min-h-0 opacity-55" />
        <div aria-hidden className="absolute right-12 top-28 h-20 w-20 rounded-full border border-[var(--public-orange)]/25 bg-[var(--public-orange)]/10 blur-[1px]" />
        <div aria-hidden className="absolute bottom-28 left-16 h-12 w-12 rounded-full border border-[var(--public-lime)]/30 bg-[var(--public-lime)]/10" />
        <div aria-hidden className="absolute bottom-44 right-28 h-7 w-16 rotate-[-10deg] rounded-[10px] border border-white/10 bg-white/[0.045]" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link href={logoHref} className="group flex items-center gap-3 font-bold">
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--public-border)] bg-white/[0.055] shadow-[0_12px_32px_rgba(0,0,0,0.24)] transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <Image src="/real-logo.png" alt="TrackMyMoney" width={30} height={30} className="h-7 w-7 dark:invert" priority />
            </span>
            <span className="text-xl">
              Track<span className="text-[var(--public-muted)]">My</span>Money
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="public" />
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--public-border)] bg-white/[0.045] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--public-lime)]" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-[620px] py-12">
          <Reveal>
            {eyebrow ? (
              <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-orange)]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="max-w-[640px] text-[clamp(3.6rem,6.2vw,6.4rem)] font-light leading-[0.92] tracking-normal text-[var(--public-text)]">
              {title}
            </h1>
            <p className="mt-7 max-w-[520px] text-base leading-8 text-[var(--public-muted)]">{description}</p>
          </Reveal>

          {highlights.length > 0 ? (
            <Reveal delay={0.08} className="mt-10 grid gap-4">
              {highlights.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-4 text-sm font-medium text-[var(--public-muted)]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--public-border)] bg-white/[0.045] text-[var(--public-lime)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </Reveal>
          ) : null}

          {preview ? (
            <Reveal delay={0.16} className="mt-12 max-w-[520px]">
              <PublicPanel variant="glass" padding="md">
                {preview}
              </PublicPanel>
            </Reveal>
          ) : null}
        </div>

        {footer ? (
          <div className="relative z-10 border-t border-[var(--public-border)] pt-6 text-sm text-[var(--public-muted)]">
            {footer}
          </div>
        ) : null}
      </aside>

      <section className={cn('relative flex min-h-screen flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-20', formClassName)}>
        <div aria-hidden className="tm-public-texture absolute inset-0 opacity-45" />
        <div className="relative z-10 mb-10 flex items-center justify-between gap-4 lg:hidden">
          <Link href={logoHref} className="inline-flex items-center gap-3 font-bold text-[var(--public-text)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.055]">
              <Image src="/real-logo.png" alt="TrackMyMoney" width={28} height={28} className="h-7 w-7 dark:invert" priority />
            </span>
            Track<span className="text-[var(--public-muted)]">My</span>Money
          </Link>
          <ThemeToggle variant="public" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[470px]">{children}</div>
      </section>
    </div>
  )
}
