import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | TrackMyMoney',
  description: 'Terms governing access to and use of the TrackMyMoney website, dashboard, and AI-assisted finance features.',
}

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing or using TrackMyMoney, you agree to these Terms of Service. If you do not agree, do not use the service.',
      'These Terms apply to the public website, dashboard, APIs, uploads, exports, AI-assisted features, and any related services we make available.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility and Accounts',
    paragraphs: [
      'You must provide accurate registration information and keep your account credentials secure. You are responsible for activity that occurs under your account.',
      'You may not share access credentials in a way that compromises the security or integrity of the service.',
    ],
  },
  {
    id: 'service-description',
    title: '3. Description of the Service',
    paragraphs: [
      'TrackMyMoney is a personal finance web application that helps users organize and review financial information. Features may include transaction tracking, budgeting, goals, debt tracking, subscription monitoring, reporting, data export, and AI-assisted processing of uploaded content.',
      'We may add, remove, improve, suspend, or change features over time.',
    ],
  },
  {
    id: 'user-data',
    title: '4. Your Data and Responsibilities',
    paragraphs: [
      'You are responsible for the information and files you upload, enter, or submit through the service.',
    ],
    bullets: [
      'You must have the right to upload and process any documents, statements, receipts, images, or other content you submit.',
      'You are responsible for reviewing imported, parsed, categorized, or AI-generated outputs before relying on them.',
      'You should keep backup copies of important records you do not want to lose.',
      'You remain responsible for financial, tax, accounting, investment, and legal decisions you make using information from the product.',
    ],
  },
  {
    id: 'ai-features',
    title: '5. AI Features and No Professional Advice',
    paragraphs: [
      'TrackMyMoney may provide AI-assisted categorization, OCR, summaries, insights, and advisor-style responses. These features are offered for convenience and productivity only.',
      'AI outputs may be inaccurate, incomplete, delayed, or inappropriate for your specific circumstances.',
      'TrackMyMoney is not a bank, broker, lender, accountant, law firm, tax advisor, or registered investment adviser. Nothing in the service constitutes financial, tax, legal, or investment advice.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable Use',
    paragraphs: [
      'You agree not to misuse the service.',
    ],
    bullets: [
      'Do not attempt to access another user\'s data or account.',
      'Do not upload malicious code, harmful content, or content you do not have permission to use.',
      'Do not interfere with the service, reverse engineer it, or attempt to bypass security measures.',
      'Do not use the service for unlawful, fraudulent, deceptive, or abusive purposes.',
      'Do not overload, scrape, or automate the service in a way that harms availability or stability.',
    ],
  },
  {
    id: 'ownership',
    title: '7. Ownership and License',
    paragraphs: [
      'As between you and TrackMyMoney, you retain ownership of the content and data you submit to the service.',
      'You grant us a limited license to host, store, process, reproduce, and transmit your content only as needed to operate, secure, improve, and support the service.',
      'We retain ownership of the TrackMyMoney application, branding, design, code, documentation, and related intellectual property.',
    ],
  },
  {
    id: 'availability',
    title: '8. Availability, Changes, and Termination',
    paragraphs: [
      'We do not guarantee that the service will always be available, error-free, or uninterrupted. Maintenance, outages, provider issues, or feature changes may affect access.',
      'We may suspend or terminate access if we reasonably believe you have violated these Terms, created risk for the service or other users, or used the product unlawfully.',
      'You may stop using the service at any time. Where available, you may also export data or request account deletion through account-management features.',
    ],
  },
  {
    id: 'fees',
    title: '9. Fees and Future Paid Features',
    paragraphs: [
      'TrackMyMoney may currently offer free access to some or all features. We may introduce paid features, limits, subscriptions, or pricing in the future.',
      'If we do, we may update these Terms and provide pricing or billing details separately at the time those features are offered.',
    ],
  },
  {
    id: 'disclaimers',
    title: '10. Disclaimers',
    paragraphs: [
      'The service is provided "as is" and "as available" to the maximum extent permitted by law.',
      'We disclaim warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or availability.',
    ],
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, TrackMyMoney and its operators will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or for lost profits, revenues, data, business opportunities, or goodwill arising out of or related to your use of the service.',
      'To the maximum extent permitted by law, our total liability for claims arising out of or related to the service will be limited to the amount you paid us for the service, if any, during the 12 months before the event giving rise to the claim.',
    ],
  },
  {
    id: 'indemnity',
    title: '12. Indemnity',
    paragraphs: [
      'You agree to indemnify and hold harmless TrackMyMoney and its operators from claims, liabilities, damages, losses, and expenses arising out of your content, your misuse of the service, or your violation of these Terms.',
    ],
  },
  {
    id: 'changes',
    title: '13. Changes to These Terms',
    paragraphs: [
      'We may revise these Terms from time to time. When we do, we will update the "Last updated" date on this page. Your continued use of the service after the updated Terms become effective means you accept the revised Terms.',
    ],
  },
  {
    id: 'contact',
    title: '14. Contact',
    paragraphs: [
      'If you have questions about these Terms, contact us at support@trackmymoney.app.',
    ],
  },
] as const

export default function TermsPage() {
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
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold tracking-tight mb-3">Terms of Service</h1>
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

                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
                    {section.id === 'contact' && paragraph.includes('support@trackmymoney.app') ? (
                      <>
                        If you have questions about these Terms, contact us at{' '}
                        <a
                          href="mailto:support@trackmymoney.app"
                          className="text-[var(--text-main)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                          support@trackmymoney.app
                        </a>
                        .
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}

                {'bullets' in section && section.bullets ? (
                  <ul className="list-disc list-inside space-y-2 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
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
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span className="text-[var(--text-main)] font-medium">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
