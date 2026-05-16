import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, CalendarDays, FileText, Mail, ShieldCheck } from 'lucide-react'
import { PublicButton } from './PublicButton'
import { PublicShell } from './PublicShell'
import { LegalVaultScene } from './three/LegalVaultScene'

export type LegalArticleGroup = {
  bullets: readonly ReactNode[]
  title: ReactNode
}

export type LegalArticleSection = {
  bullets?: readonly ReactNode[]
  groups?: readonly LegalArticleGroup[]
  id: string
  note?: ReactNode
  paragraphs?: readonly ReactNode[]
  title: ReactNode
}

export type LegalArticleShellProps = {
  active: 'privacy' | 'terms'
  contactEmail?: string
  description: string
  lastUpdated: string
  sections: readonly LegalArticleSection[]
  title: string
}

export function LegalArticleShell({
  active,
  contactEmail,
  description,
  lastUpdated,
  sections,
  title,
}: LegalArticleShellProps) {
  const relatedDocument =
    active === 'privacy'
      ? { href: '/terms', label: 'Terms of Service' }
      : { href: '/privacy', label: 'Privacy Policy' }

  return (
    <PublicShell
      footerProps={{ active }}
      navProps={{
        links: [
          { href: '/#features', label: 'Features' },
          { href: '/#security', label: 'Security' },
          { href: '/#faq', label: 'FAQ' },
        ],
        secondaryCta: { href: '/', label: 'Home' },
      }}
    >
      <section className="relative mx-auto max-w-[1220px] px-5 pb-10 pt-8 sm:pt-12 lg:pb-16">
        <LegalVaultScene className="absolute right-[-6rem] top-4 z-0 hidden h-[310px] w-[500px] min-h-0 opacity-25 lg:block" />
        <div
          aria-hidden
          className="absolute right-5 top-8 hidden h-56 w-56 rounded-full border border-[var(--public-border)] bg-[radial-gradient(circle_at_35%_35%,rgba(217,255,116,0.14),transparent_28%),radial-gradient(circle_at_70%_68%,rgba(255,90,31,0.18),transparent_34%)] opacity-60 blur-[1px] lg:block"
        />

        <div className="relative z-10 mb-8">
          <PublicButton
            href="/"
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            iconPosition="left"
          >
            Back home
          </PublicButton>
        </div>

        <div className="relative z-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="max-w-[760px]">
            <p className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-orange)]">
              Legal document
            </p>
            <h1 className="text-5xl font-light leading-[0.98] tracking-normal text-[var(--public-text)] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </div>

          <aside
            aria-labelledby="legal-summary-heading"
            className="rounded-[var(--public-radius-md)] border border-[var(--public-border)] bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.055] text-[var(--public-lime)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="legal-summary-heading"
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-text)]"
                >
                  Summary
                </h2>
              </div>
            </div>

            <p className="mb-5 text-[15px] leading-7 text-[var(--public-muted)]">{description}</p>

            <dl className="grid gap-3">
              <LegalSummaryItem icon={<CalendarDays className="h-4 w-4" />} label="Last updated">
                {lastUpdated}
              </LegalSummaryItem>
              <LegalSummaryItem icon={<FileText className="h-4 w-4" />} label="Sections">
                {sections.length} sections
              </LegalSummaryItem>
              {contactEmail ? (
                <LegalSummaryItem icon={<Mail className="h-4 w-4" />} label="Contact">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="break-all text-[var(--public-text)] underline underline-offset-4 hover:text-[var(--public-orange)]"
                  >
                    {contactEmail}
                  </a>
                </LegalSummaryItem>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-20 lg:pb-28">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-28 grid gap-4">
              <nav
                aria-label="Table of contents"
                className="rounded-[var(--public-radius-md)] border border-[var(--public-border)] bg-[color-mix(in_srgb,var(--public-bg)_84%,transparent)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
              >
                <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-muted)]">
                  On this page
                </p>
                <ul className="grid max-h-[calc(100vh-13rem)] gap-1 overflow-y-auto pr-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-start gap-3 rounded-[14px] px-3 py-2 text-sm leading-snug text-[var(--public-muted)] hover:bg-white/[0.04] hover:text-[var(--public-text)]"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--public-subtle)] group-hover:bg-[var(--public-orange)]"
                        />
                        <span>{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rounded-[var(--public-radius-md)] border border-[var(--public-border)] bg-white/[0.035] p-5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--public-text)]">
                  Related
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  <Link
                    href={relatedDocument.href}
                    className="inline-flex items-center gap-2 text-[var(--public-muted)] hover:text-[var(--public-text)]"
                  >
                    {relatedDocument.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  {contactEmail ? (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center gap-2 break-all text-[var(--public-muted)] hover:text-[var(--public-text)]"
                    >
                      {contactEmail}
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          <article className="min-w-0 space-y-5">
            {sections.map((section, index) => (
              <section
                id={section.id}
                key={section.id}
                className="scroll-mt-28 rounded-[var(--public-radius-md)] border border-[var(--public-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.032))] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.22)] sm:p-7 lg:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-[52px_minmax(0,1fr)]">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--public-border)] bg-white/[0.045] font-mono text-[11px] font-bold text-[var(--public-subtle)]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="max-w-[74ch]">
                    <h2 className="mb-4 text-2xl font-semibold leading-tight tracking-normal text-[var(--public-text)] sm:text-3xl">
                      {section.title}
                    </h2>

                    {section.paragraphs?.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${section.id}-paragraph-${paragraphIndex}`}
                        className="mb-4 text-[15.5px] leading-8 text-[var(--public-muted)] sm:text-base sm:leading-8"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {section.groups ? (
                      <div className="mt-6 grid gap-6">
                        {section.groups.map((group, groupIndex) => (
                          <div
                            key={`${section.id}-group-${groupIndex}`}
                            className="border-l border-[var(--public-border-strong)] pl-4 sm:pl-5"
                          >
                            <h3 className="mb-2 text-base font-semibold leading-7 tracking-normal text-[var(--public-text)]">
                              {group.title}
                            </h3>
                            <LegalBullets bullets={group.bullets} />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets ? <LegalBullets bullets={section.bullets} /> : null}

                    {section.note ? (
                      <p className="mt-4 border-l border-[var(--public-orange)]/60 pl-4 text-[15.5px] leading-8 text-[var(--public-muted)] sm:text-base">
                        {section.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}

            <footer className="rounded-[var(--public-radius-md)] border border-[var(--public-border)] bg-white/[0.035] p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--public-text)]">
                    Legal links
                  </h2>
                  <p className="mt-2 max-w-[560px] text-sm leading-7 text-[var(--public-muted)]">
                    Review the companion document or contact TrackMyMoney from the address listed in this page.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <PublicButton href={relatedDocument.href} variant="outline" size="sm">
                    {relatedDocument.label}
                  </PublicButton>
                  {contactEmail ? (
                    <PublicButton href={`mailto:${contactEmail}`} variant="secondary" size="sm">
                      Contact
                    </PublicButton>
                  ) : null}
                </div>
              </div>
            </footer>
          </article>
        </div>
      </section>
    </PublicShell>
  )
}

function LegalSummaryItem({
  children,
  icon,
  label,
}: {
  children: ReactNode
  icon: ReactNode
  label: string
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-3 rounded-[16px] border border-[var(--public-border)] bg-black/10 p-3">
      <dt className="contents">
        <span
          aria-hidden
          className="row-span-2 flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/[0.045] text-[var(--public-lime)]"
        >
          {icon}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--public-subtle)]">
          {label}
        </span>
      </dt>
      <dd className="col-start-2 text-sm leading-6 text-[var(--public-text)]">{children}</dd>
    </div>
  )
}

function LegalBullets({ bullets }: { bullets: readonly ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[15.5px] leading-8 text-[var(--public-muted)] marker:text-[var(--public-orange)] sm:text-base">
      {bullets.map((bullet, index) => (
        <li key={index}>{bullet}</li>
      ))}
    </ul>
  )
}
