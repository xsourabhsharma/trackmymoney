import {
  ArrowRight,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileSpreadsheet,
  Gauge,
  Import,
  KeyRound,
  Layers3,
  LockKeyhole,
  PieChart,
  ReceiptText,
  Repeat2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { PublicButton } from '@/components/public/PublicButton'
import { PublicPanel } from '@/components/public/PublicPanel'
import { PublicShell } from '@/components/public/PublicShell'
import { Reveal } from '@/components/public/Reveal'
import { PublicHeroScene } from '@/components/public/three/PublicHeroScene'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#preview', label: 'Preview' },
  { href: '#import', label: 'AI import' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
]

const footerProductLinks = [
  { href: '/#preview', label: 'Preview' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#import', label: 'AI import' },
  { href: '/#tracking', label: 'Budgets' },
  { href: '/login', label: 'Login' },
  { href: '/signup', label: 'Sign up' },
]

const transactions = [
  { category: 'Groceries', date: 'Today', merchant: 'Whole Foods Market', signal: 'Reviewed', value: '-$142.50' },
  { category: 'Subscriptions', date: 'Today', merchant: 'Figma', signal: 'Recurring', value: '-$15.00' },
  { category: 'Income', date: 'Yesterday', merchant: 'Stripe Payout', signal: 'Auto matched', value: '+$3,240.00' },
  { category: 'Transport', date: 'Wed', merchant: 'Uber', signal: 'Budget watch', value: '-$28.60' },
]

const previewStats = [
  { label: 'Monthly spend', value: '$3,240', trend: '65% of plan' },
  { label: 'Upcoming bills', value: '$216', trend: 'Next 7 days' },
  { label: 'Unreviewed imports', value: '12', trend: 'Ready to approve' },
]

const howItWorks = [
  {
    icon: UploadCloud,
    title: 'Connect the raw money trail',
    body: 'Add transactions manually or import receipts, CSVs, and statements when you want a faster review flow.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review before anything sticks',
    body: 'AI-assisted parsing turns files into clean rows, but you stay in control of categories, dates, and final approval.',
  },
  {
    icon: Gauge,
    title: 'Run the month with context',
    body: 'Budgets, subscriptions, reports, and insights give you a practical read on what changed and what needs attention.',
  },
]

const importRows = [
  { label: 'Bank statement PDF', status: 'Mapped', tone: 'warm' },
  { label: 'Receipt image', status: 'Needs review', tone: 'alert' },
  { label: 'CSV export', status: 'Ready', tone: 'success' },
]

const budgetRows = [
  { label: 'Groceries', spent: 620, limit: 800, status: 'On pace' },
  { label: 'Restaurants', spent: 450, limit: 500, status: 'Watch' },
  { label: 'Transport', spent: 210, limit: 350, status: 'Healthy' },
]

const subscriptionRows = [
  { cadence: 'Monthly', label: 'Design tools', next: 'May 21', price: '$15' },
  { cadence: 'Monthly', label: 'Streaming', next: 'May 24', price: '$18' },
  { cadence: 'Annual', label: 'Cloud storage', next: 'Jun 02', price: '$99' },
]

const securityItems = [
  {
    icon: KeyRound,
    title: 'Authenticated access',
    body: 'Public pages stay separate from private dashboard routes so your ledger is not casually exposed.',
  },
  {
    icon: Layers3,
    title: 'Reviewable data flows',
    body: 'Imports are staged for review before they become saved transactions in your workspace.',
  },
  {
    icon: LockKeyhole,
    title: 'Practical privacy controls',
    body: 'The product avoids public sharing mechanics and keeps personal finance workflows focused on your account.',
  },
]

const faqs = [
  {
    question: 'What does TrackMyMoney track?',
    answer:
      'Transactions, budgets, subscriptions, reports, receipts, statements, and AI-generated money insights in one personal finance workspace.',
  },
  {
    question: 'Can I import receipts or bank statements?',
    answer:
      'Yes. The import flow is designed to parse receipts, CSVs, and statements into transaction rows that you can review before saving.',
  },
  {
    question: 'Are the AI suggestions applied automatically?',
    answer:
      'No. AI can help prepare categories and summaries, but the landing page flow is built around review and confirmation before commit.',
  },
  {
    question: 'Can I start without importing files?',
    answer:
      'Yes. You can start with manual transaction tracking, then add receipt, CSV, or statement imports when they are useful.',
  },
]

export default function LandingPage() {
  return (
    <PublicShell
      footerProps={{ productLinks: footerProductLinks }}
      navProps={{
        cta: { href: '/signup', label: 'Get started' },
        links: navLinks,
        secondaryCta: { href: '/login', label: 'Log in' },
        statusLabel: 'Private finance workspace',
      }}
    >
      <section className="relative mx-auto grid min-h-[calc(100svh-9rem)] max-w-[1220px] grid-cols-1 gap-10 px-5 pb-12 pt-7 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-12 lg:pt-8">
        <Reveal className="relative z-10">
          <h1 className="max-w-[660px] text-[clamp(2.75rem,7vw,5.2rem)] font-light leading-[0.96] tracking-normal text-[var(--public-text)]">
            Your money, organized before it gets away.
          </h1>
          <p className="mt-5 max-w-[610px] text-[clamp(1rem,1.5vw,1.13rem)] leading-7 text-[var(--public-muted)] sm:leading-8">
            TrackMyMoney brings transactions, budgets, subscriptions, imports, reports, and AI insights into one calm
            personal finance workspace.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PublicButton href="/signup" showArrow size="lg">
              Start tracking
            </PublicButton>
            <PublicButton href="/login" variant="secondary" size="lg">
              Log in
            </PublicButton>
          </div>
          <div className="mt-6 grid max-w-[640px] gap-3 text-sm leading-6 text-[var(--public-muted)] sm:grid-cols-3">
            {[
              'Review imports before saving',
              'Budget and subscription alerts',
              'Private dashboard access',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--public-orange)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08} className="relative z-10 hidden lg:block">
          <HeroProductPreview />
        </Reveal>
      </section>

      <section id="preview" className="mx-auto max-w-[1220px] px-5 pb-14 pt-8 sm:pb-18 sm:pt-8">
        <SectionIntro
          eyebrow="Product preview"
          title="A single operating view for day-to-day money decisions."
          body="The homepage preview is code-native UI, not a static screenshot: clear balances, recent transactions, budget pressure, and AI context in one scannable layout."
        />
        <Reveal className="mt-10">
          <PublicPanel padding="none" className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.16fr_0.84fr]">
              <div className="border-b border-[var(--public-border)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--public-muted)]">
                      Personal ledger
                    </p>
                    <h3 className="mt-3 text-2xl font-medium text-[var(--public-text)]">May money command center</h3>
                  </div>
                  <PublicButton href="/signup" variant="outline" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                    Try it
                  </PublicButton>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-3">
                  {previewStats.map((stat) => (
                    <div key={stat.label} className="rounded-[22px] border border-[var(--public-border)] bg-white/[0.035] p-5">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--public-subtle)]">
                        {stat.label}
                      </p>
                      <p className="mt-4 font-mono text-3xl text-[var(--public-text)]">{stat.value}</p>
                      <p className="mt-2 text-xs text-[var(--public-muted)]">{stat.trend}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--public-border)]">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[var(--public-border)] bg-white/[0.035] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--public-subtle)] sm:grid-cols-[0.85fr_1fr_auto_auto]">
                    <span className="hidden sm:block">Date</span>
                    <span>Merchant</span>
                    <span>Signal</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="divide-y divide-[var(--public-border)]">
                    {transactions.map((transaction) => (
                      <div
                        key={`${transaction.date}-${transaction.merchant}`}
                        className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 text-sm sm:grid-cols-[0.85fr_1fr_auto_auto] sm:items-center"
                      >
                        <span className="hidden font-mono text-[12px] text-[var(--public-muted)] sm:block">
                          {transaction.date}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--public-text)]">{transaction.merchant}</p>
                          <p className="mt-1 text-xs text-[var(--public-muted)] sm:hidden">
                            {transaction.date} / {transaction.category}
                          </p>
                        </div>
                        <span className="hidden rounded-full border border-[var(--public-border)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--public-muted)] sm:inline-flex">
                          {transaction.signal}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-sm',
                            transaction.value.startsWith('+') ? 'text-[#d9ff74]' : 'text-[var(--public-muted)]'
                          )}
                        >
                          {transaction.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:p-7">
                <InsightCard />
                <BudgetSnapshot />
              </div>
            </div>
          </PublicPanel>
        </Reveal>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1220px] px-5 py-14 sm:py-18">
        <SectionIntro
          eyebrow="How it works"
          title="From messy money data to a month you can actually manage."
          body="TrackMyMoney is designed around a simple loop: capture the activity, review the details, then use the dashboard to make better next moves."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {howItWorks.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <FeaturePanel {...step} step={`${index + 1}`.padStart(2, '0')} />
            </Reveal>
          ))}
        </div>
      </section>

      <section id="import" className="mx-auto grid max-w-[1220px] gap-8 px-5 py-14 sm:py-18 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <Reveal>
          <SectionIntro
            align="left"
            eyebrow="AI import"
            title="Receipts and statements become reviewable transaction rows."
            body="Use AI-assisted parsing to move faster without giving up control. Imported files land as structured candidates so you can fix categories, confirm dates, and save only what looks right."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PublicButton href="/signup" showArrow>
              Import smarter
            </PublicButton>
            <PublicButton href="/login" variant="outline">
              Open dashboard
            </PublicButton>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <PublicPanel className="relative p-5 sm:p-7">
            <div aria-hidden className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[var(--public-orange)]/15 blur-3xl" />
            <div className="relative grid gap-5 lg:grid-cols-[0.85fr_1fr]">
              <div className="rounded-[24px] border border-dashed border-[var(--public-border-strong)] bg-black/20 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--public-orange)] text-black shadow-[0_18px_48px_rgba(255,90,31,0.24)]">
                  <Import className="h-7 w-7" />
                </div>
                <h3 className="mt-7 text-2xl font-medium text-[var(--public-text)]">Drop files into a controlled queue.</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
                  Receipts, statements, and CSV exports are treated as inputs for review, not invisible changes to your
                  ledger.
                </p>
                <div className="mt-7 grid gap-3">
                  {importRows.map((row) => (
                    <ImportQueueRow key={row.label} {...row} />
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--public-border)] bg-white/[0.035] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--public-muted)]">
                    Parsed result
                  </p>
                  <span className="rounded-full bg-[var(--public-orange)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                    Draft
                  </span>
                </div>
                <ParsedReceipt />
              </div>
            </div>
          </PublicPanel>
        </Reveal>
      </section>

      <section id="tracking" className="mx-auto max-w-[1220px] px-5 py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <Reveal>
            <SectionIntro
              align="left"
              eyebrow="Budgets and subscriptions"
              title="See budget pressure and recurring costs before they surprise you."
              body="TrackMyMoney keeps planned limits and repeating charges close to the transaction feed, so overspending and renewal dates are easier to catch while the month is still active."
            />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid gap-5 md:grid-cols-2">
              <PublicPanel className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <PieChart className="h-5 w-5 text-[var(--public-orange)]" />
                  <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--public-text)]">
                    Budget rails
                  </h3>
                </div>
                <div className="grid gap-5">
                  {budgetRows.map((row) => (
                    <BudgetRow key={row.label} {...row} />
                  ))}
                </div>
              </PublicPanel>

              <PublicPanel className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Repeat2 className="h-5 w-5 text-[var(--public-orange)]" />
                  <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--public-text)]">
                    Subscription watch
                  </h3>
                </div>
                <div className="grid gap-3">
                  {subscriptionRows.map((row) => (
                    <SubscriptionRow key={row.label} {...row} />
                  ))}
                </div>
              </PublicPanel>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-[1220px] px-5 py-14 sm:py-18">
        <Reveal>
          <PublicPanel className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--public-border)] bg-white/[0.055] text-[var(--public-orange)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--public-muted)]">
                Privacy and security
              </p>
              <h2 className="mt-4 max-w-[540px] text-[clamp(2.15rem,4vw,4.2rem)] font-light leading-tight text-[var(--public-text)]">
                Built for sensitive personal finance work.
              </h2>
              <p className="mt-5 max-w-[560px] text-sm leading-7 text-[var(--public-muted)]">
                No fake badges, no public leaderboards, no marketing claims pretending to be compliance. Just a focused
                private workspace with clear account boundaries and review-first data entry.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {securityItems.map((item) => (
                <SecurityItem key={item.title} {...item} />
              ))}
            </div>
          </PublicPanel>
        </Reveal>
      </section>

      <section id="faq" className="mx-auto max-w-[900px] px-5 py-14 sm:py-18">
        <SectionIntro
          eyebrow="FAQ"
          title="Straight answers before you create an account."
          body="The public homepage avoids claims the product cannot back up today, and keeps the path simple: sign up or log in."
        />
        <div className="mt-10 grid gap-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.04}>
              <details className="group rounded-[24px] border border-[var(--public-border)] bg-white/[0.045] p-5 open:bg-white/[0.065]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-[var(--public-text)]">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--public-muted)] transition-transform group-open:rotate-90 motion-reduce:transition-none" />
                </summary>
                <p className="mt-4 max-w-[760px] text-sm leading-7 text-[var(--public-muted)]">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-20 pt-10 sm:pb-24">
        <Reveal>
          <PublicPanel variant="accent" className="overflow-hidden p-7 sm:p-10">
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div aria-hidden className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-black/15 blur-3xl" />
              <div className="relative">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black/58">
                  Ready when you are
                </p>
                <h2 className="mt-4 max-w-[720px] text-[clamp(2.25rem,4.6vw,4.8rem)] font-light leading-[0.98] text-black">
                  Start with the next transaction you want to understand.
                </h2>
                <p className="mt-5 max-w-[640px] text-sm leading-7 text-black/68">
                  Build a clearer month from imports, budgets, subscriptions, reports, and AI-assisted review.
                </p>
              </div>
              <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col">
                <PublicButton href="/signup" variant="secondary" showArrow className="border-black/20 bg-black text-[var(--public-text)] hover:bg-black/90">
                  Create account
                </PublicButton>
                <PublicButton href="/login" variant="outline" className="border-black/25 text-black hover:bg-black/10">
                  Log in
                </PublicButton>
              </div>
            </div>
          </PublicPanel>
        </Reveal>
      </section>
    </PublicShell>
  )
}

function HeroProductPreview() {
  return (
    <div className="relative mx-auto max-w-[680px] [perspective:1400px]">
      <PublicHeroScene className="absolute -inset-6 z-0 min-h-0 opacity-55" />
      <div aria-hidden className="absolute -inset-4 rounded-[42px] bg-[radial-gradient(circle_at_72%_18%,rgba(255,90,31,0.34),transparent_34%),radial-gradient(circle_at_16%_88%,rgba(217,255,116,0.16),transparent_30%)] blur-2xl" />
      <div className="relative z-10 rotate-0 rounded-[34px] border border-[var(--public-border-strong)] bg-[#11100d]/88 p-3 shadow-[0_34px_110px_rgba(0,0,0,0.46)] backdrop-blur-2xl sm:p-4 lg:[transform:rotateX(7deg)_rotateY(-10deg)_rotateZ(1deg)]">
        <div className="rounded-[26px] border border-[var(--public-border)] bg-[#070706] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--public-orange)] text-black">
                <WalletCards className="h-5 w-5" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--public-subtle)]">
                  May dashboard
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--public-text)]">Personal cash flow</p>
              </div>
            </div>
            <span className="hidden rounded-full border border-[var(--public-border)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--public-muted)] sm:inline-flex">
              Synced view
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[24px] border border-[var(--public-border)] bg-white/[0.045] p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--public-subtle)]">
                Available this month
              </p>
              <p className="mt-4 font-mono text-[clamp(2.4rem,8vw,4.7rem)] font-light leading-none text-[var(--public-text)]">
                $4,826
              </p>
              <div className="mt-6 h-24 rounded-[18px] border border-[var(--public-border)] bg-[linear-gradient(180deg,rgba(255,90,31,0.16),transparent)] p-3">
                <MiniChart />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[24px] bg-[var(--public-orange)] p-5 text-black">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
                    AI insight
                  </p>
                  <Bot className="h-5 w-5" />
                </div>
                <p className="mt-5 text-2xl font-medium leading-tight">Dining is pacing 18% above plan.</p>
              </div>
              <div className="rounded-[24px] border border-[var(--public-border)] bg-white/[0.045] p-5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--public-subtle)]">
                    Next renewal
                  </p>
                  <CalendarClock className="h-5 w-5 text-[var(--public-orange)]" />
                </div>
                <p className="mt-5 text-2xl font-medium text-[var(--public-text)]">$18</p>
                <p className="mt-1 text-sm text-[var(--public-muted)]">Streaming / May 24</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {['Import queue', 'Budget rails', 'Reports'].map((label, index) => (
              <div key={label} className="rounded-[18px] border border-[var(--public-border)] bg-white/[0.035] px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-subtle)]">
                  {label}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, barIndex) => (
                    <span
                      key={barIndex}
                      className={cn(
                        'h-1.5 flex-1 rounded-full',
                        barIndex <= index + 1 ? 'bg-[var(--public-orange)]' : 'bg-white/12'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionIntro({
  align = 'center',
  body,
  eyebrow,
  title,
}: {
  align?: 'center' | 'left'
  body: string
  eyebrow: string
  title: string
}) {
  return (
    <Reveal>
      <div className={cn(align === 'center' ? 'mx-auto text-center' : 'text-left', 'max-w-[760px]')}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--public-orange)]">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-[clamp(2.15rem,4.2vw,4.7rem)] font-light leading-tight text-[var(--public-text)]">
          {title}
        </h2>
        <p className={cn('mt-5 text-sm leading-7 text-[var(--public-muted)] sm:text-base sm:leading-8', align === 'center' && 'mx-auto max-w-[680px]')}>
          {body}
        </p>
      </div>
    </Reveal>
  )
}

function FeaturePanel({
  body,
  icon: Icon,
  step,
  title,
}: {
  body: string
  icon: LucideIcon
  step: string
  title: string
}) {
  return (
    <PublicPanel as="article" interactive className="h-full p-7">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[var(--public-border)] bg-white/[0.055] text-[var(--public-orange)]">
          <Icon className="h-6 w-6" />
        </div>
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--public-subtle)]">
          {step}
        </span>
      </div>
      <h3 className="text-xl font-medium leading-tight text-[var(--public-text)]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">{body}</p>
    </PublicPanel>
  )
}

function InsightCard() {
  return (
    <div className="rounded-[26px] border border-[var(--public-border)] bg-[var(--public-orange)] p-6 text-black">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black/60">AI insight</p>
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
          Review
        </span>
      </div>
      <p className="mt-7 text-2xl font-medium leading-tight">Three recurring charges increased since last month.</p>
      <p className="mt-4 text-sm leading-7 text-black/66">
        TrackMyMoney can surface changes, but you decide what to update, ignore, or investigate.
      </p>
    </div>
  )
}

function BudgetSnapshot() {
  return (
    <div className="rounded-[26px] border border-[var(--public-border)] bg-white/[0.035] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="h-5 w-5 text-[var(--public-orange)]" />
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--public-text)]">
            Month plan
          </p>
        </div>
        <span className="font-mono text-[11px] text-[var(--public-muted)]">8 days left</span>
      </div>
      <div className="space-y-4">
        <ProgressLine label="Essentials" value={68} />
        <ProgressLine label="Discretionary" value={85} alert />
        <ProgressLine label="Savings" value={42} />
      </div>
    </div>
  )
}

function ImportQueueRow({ label, status, tone }: { label: string; status: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[var(--public-border)] bg-white/[0.035] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--public-orange)]" />
        <span className="truncate text-sm text-[var(--public-text)]">{label}</span>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]',
          tone === 'success' && 'bg-[#d9ff74] text-black',
          tone === 'alert' && 'bg-[var(--public-orange)] text-black',
          tone === 'warm' && 'bg-white/[0.09] text-[var(--public-muted)]'
        )}
      >
        {status}
      </span>
    </div>
  )
}

function ParsedReceipt() {
  const fields = [
    ['Merchant', 'Arc Cafe'],
    ['Date', 'May 14'],
    ['Category', 'Restaurants'],
    ['Amount', '$42.18'],
  ]

  return (
    <div className="grid gap-3">
      {fields.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[0.8fr_1fr] gap-3 rounded-[16px] border border-[var(--public-border)] bg-black/18 px-4 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-subtle)]">
            {label}
          </span>
          <span className="text-sm font-medium text-[var(--public-text)]">{value}</span>
        </div>
      ))}
      <div className="mt-2 rounded-[18px] border border-[var(--public-border)] bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
          <ReceiptText className="h-4 w-4 text-[var(--public-orange)]" />
          Review note
        </div>
        <p className="text-sm leading-6 text-[var(--public-muted)]">
          Confirm split tax and tip before saving this restaurant transaction.
        </p>
      </div>
    </div>
  )
}

function BudgetRow({ label, limit, spent, status }: { label: string; limit: number; spent: number; status: string }) {
  const value = Math.min((spent / limit) * 100, 100)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--public-text)]">{label}</span>
        <span className="font-mono text-[11px] text-[var(--public-muted)]">{status}</span>
      </div>
      <ProgressBar value={value} />
      <div className="mt-2 flex justify-between font-mono text-[11px] text-[var(--public-muted)]">
        <span>${spent}</span>
        <span>${limit}</span>
      </div>
    </div>
  )
}

function SubscriptionRow({
  cadence,
  label,
  next,
  price,
}: {
  cadence: string
  label: string
  next: string
  price: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 rounded-[18px] border border-[var(--public-border)] bg-white/[0.035] p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--public-text)]">{label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--public-muted)]">
          <BellRing className="h-3.5 w-3.5 text-[var(--public-orange)]" />
          <span>{cadence}</span>
          <span>/</span>
          <span>{next}</span>
        </div>
      </div>
      <span className="font-mono text-sm text-[var(--public-text)]">{price}</span>
    </div>
  )
}

function SecurityItem({ body, icon: Icon, title }: { body: string; icon: LucideIcon; title: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--public-border)] bg-white/[0.035] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-[var(--public-orange)]" />
        <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--public-text)]">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-7 text-[var(--public-muted)]">{body}</p>
    </div>
  )
}

function ProgressLine({ alert = false, label, value }: { alert?: boolean; label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm text-[var(--public-text)]">{label}</span>
        <span className={cn('font-mono text-[11px]', alert ? 'text-[var(--public-orange)]' : 'text-[var(--public-muted)]')}>
          {value}%
        </span>
      </div>
      <ProgressBar alert={alert} value={value} />
    </div>
  )
}

function ProgressBar({ alert = false, value }: { alert?: boolean; value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={cn('h-full rounded-full', alert ? 'bg-[var(--public-orange)]' : 'bg-[#d9ff74]')}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

function MiniChart() {
  const bars = [32, 46, 38, 72, 58, 84, 68]

  return (
    <div className="flex h-full items-end gap-2">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn('flex-1 rounded-t-full', index === bars.length - 2 ? 'bg-[var(--public-orange)]' : 'bg-white/22')}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
