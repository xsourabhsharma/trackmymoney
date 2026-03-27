import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | TrackMyMoney',
  description: 'How TrackMyMoney collects, uses, stores, and protects information related to your account and financial data.',
}

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    paragraphs: [
      'This Privacy Policy explains how TrackMyMoney collects, uses, stores, and shares information when you use the website, dashboard, and related services.',
      'TrackMyMoney is designed to help you manage personal financial information such as transactions, budgets, goals, debts, subscriptions, reports, and AI-assisted imports. Because this information can be sensitive, we aim to be clear about what we collect and why.',
    ],
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    paragraphs: [
      'We collect information you provide directly, information created through your use of the service, and limited technical information needed to operate the product.',
    ],
    groups: [
      {
        title: 'Account information',
        bullets: [
          'Email address and account credentials managed through our authentication provider.',
          'Profile information such as full name, avatar, currency, locale, and preferences.',
          'Authentication-related identifiers and session information needed to keep you signed in securely.',
        ],
      },
      {
        title: 'Financial and workspace data',
        bullets: [
          'Accounts, categories, transactions, budgets, goals, debts, subscriptions, and related records you create or import.',
          'Files and content you upload, including CSV files, statements, receipts, or similar financial documents.',
          'Import-job data, parsed rows, export requests, and financial summaries generated inside the product.',
        ],
      },
      {
        title: 'AI and support data',
        bullets: [
          'Prompts, messages, and uploaded content submitted to AI-powered features such as chat, insights, categorization, OCR, and auto-parse flows.',
          'Settings related to AI behavior, such as optional product-learning preferences if you enable them.',
        ],
      },
      {
        title: 'Technical information',
        bullets: [
          'Basic request, device, browser, and log data needed for security, debugging, and service delivery.',
          'Cookies or similar session technologies needed for login, authentication continuity, and secure dashboard access.',
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Information',
    paragraphs: [
      'We use information to operate, secure, maintain, and improve TrackMyMoney.',
    ],
    bullets: [
      'Authenticate users and protect accounts.',
      'Store, organize, and display financial data inside the dashboard.',
      'Process uploads and generate imports, exports, reports, and analytics.',
      'Power AI-assisted features such as categorization, OCR, summaries, and chat-based guidance.',
      'Provide customer support, account communications, and service notices.',
      'Monitor performance, investigate abuse, and maintain product reliability and security.',
      'Comply with legal obligations and enforce our terms.',
    ],
  },
  {
    id: 'ai-processing',
    title: '4. AI Processing',
    paragraphs: [
      'Some features in TrackMyMoney rely on third-party AI providers to process prompts, uploaded files, images, and extracted financial text. This can include categorization, receipt OCR, statement parsing, summaries, and advisor-style responses.',
      'When you choose to use those features, the relevant content may be sent to an external AI provider for processing on our behalf. We use those results to return outputs inside the product.',
      'AI outputs can be incomplete or incorrect. You are responsible for reviewing important financial results before relying on them.',
      'Provider handling of submitted content is also governed by the terms and policies of the relevant provider. Unless we expressly state otherwise in a separate agreement, you should not assume that third-party providers are subject to the same retention or model-training restrictions that may apply to TrackMyMoney itself.',
    ],
  },
  {
    id: 'sharing',
    title: '5. How Information May Be Shared',
    paragraphs: [
      'We do not sell your personal or financial data for advertising. We may share information only in limited situations needed to run the service or comply with law.',
    ],
    bullets: [
      'Infrastructure and platform providers that host or support the product, such as authentication, database, storage, and deployment providers.',
      'AI providers when you use AI-powered product features.',
      'Service providers that help us secure, maintain, or operate the application.',
      'Authorities, courts, regulators, or law enforcement when required by law or when necessary to protect rights, safety, or the service.',
      'A successor entity in connection with a merger, acquisition, financing, or asset transfer.',
    ],
  },
  {
    id: 'retention',
    title: '6. Data Retention',
    paragraphs: [
      'We generally keep your account and financial data for as long as your account remains active, unless a shorter retention period is required by law or operational necessity.',
      'If you delete your account, we will remove or anonymize data associated with it within our normal deletion processes, subject to technical backups, legal obligations, fraud-prevention needs, or records we must temporarily retain for security or compliance reasons.',
    ],
  },
  {
    id: 'security',
    title: '7. Security',
    paragraphs: [
      'We use reasonable technical and organizational measures intended to protect your information, including authenticated access controls, secure transport, and user-scoped data access patterns.',
      'No method of storage, transmission, or processing is completely secure. For that reason, we cannot guarantee absolute security, uninterrupted service, or that unauthorized access will never occur.',
    ],
  },
  {
    id: 'your-rights',
    title: '8. Your Choices and Rights',
    paragraphs: [
      'Depending on your location and applicable law, you may have rights related to access, correction, export, deletion, or objection to certain processing.',
    ],
    bullets: [
      'Update profile and preference information from your account settings.',
      'Export certain data using available export tools.',
      'Request account deletion through available account-management flows.',
      'Choose whether to use AI-powered features or submit documents to them.',
    ],
    note: 'We may need to verify identity and may limit requests where permitted or required by law.',
  },
  {
    id: 'cookies',
    title: '9. Cookies and Similar Technologies',
    paragraphs: [
      'TrackMyMoney uses cookies and similar technologies that are reasonably necessary to operate the service, such as login, session continuity, and security.',
      'If we introduce non-essential analytics, advertising, or similar tracking technologies in the future, we may update this policy and any related consent experience accordingly.',
    ],
  },
  {
    id: 'children',
    title: "10. Children's Privacy",
    paragraphs: [
      'TrackMyMoney is not intended for children under 18, and we do not knowingly collect personal information from children in that age group. If you believe a child has provided information to us, contact us so we can review and address the issue.',
    ],
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date on this page. If a change is material, we may also provide additional notice inside the product, by email, or by other reasonable means.',
    ],
  },
  {
    id: 'contact',
    title: '12. Contact',
    paragraphs: [
      'If you have questions about this Privacy Policy or privacy-related requests, contact us at privacy@trackmymoney.app.',
    ],
  },
] as const

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased">
      <nav className="border-b border-[var(--border-light)] py-4">
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--text-main)]/5 border border-[var(--border-light)] overflow-hidden">
              <Image src="/real-logo.png" alt="TrackMyMoney" width={20} height={20} className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity dark:invert" />
            </div>
            Track<span className="text-[var(--text-muted)]">My</span>Money
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-20">
        <div className="mb-10">
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-[var(--text-muted)] text-sm">Last updated: March 27, 2026</p>
        </div>

        <div className="flex gap-10">
          <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">On this page</p>
            <ul className="flex flex-col gap-1.5 border-l border-[var(--border-light)] pl-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors leading-tight block py-0.5"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 space-y-8 min-w-0">
            {sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2 className="text-xl font-bold mb-3 tracking-tight">{section.title}</h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
                    {section.id === 'contact' && paragraph.includes('privacy@trackmymoney.app') ? (
                      <>
                        If you have questions about this Privacy Policy or privacy-related requests, contact us at{' '}
                        <a
                          href="mailto:privacy@trackmymoney.app"
                          className="text-[var(--text-main)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                          privacy@trackmymoney.app
                        </a>
                        .
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}

                {'groups' in section && section.groups ? (
                  <div className="space-y-5">
                    {section.groups.map((group) => (
                      <div key={group.title}>
                        <h3 className="text-base font-semibold mb-2">{group.title}</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
                          {group.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : null}

                {'bullets' in section && section.bullets ? (
                  <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}

                {'note' in section && section.note ? (
                  <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mt-3">{section.note}</p>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border-light)] py-6">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
          <span>&copy; 2026 TrackMyMoney. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="text-[var(--text-main)] font-medium">Privacy Policy</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
