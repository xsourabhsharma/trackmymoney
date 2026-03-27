import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | TrackMyMoney',
  description: 'Privacy Policy for TrackMyMoney. How we handle and protect your financial data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased">
      {}
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

      {}
      <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-20">
        <div className="mb-10">
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-[var(--text-muted)] text-sm">Last updated: March 19, 2026</p>
        </div>

        <div className="flex gap-10">
          {}
          <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0">
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">On this page</p>
            <ul className="flex flex-col gap-1.5 border-l border-[var(--border-light)] pl-3">
              {[
                { id: 'introduction', label: '1. Introduction' },
                { id: 'information-we-collect', label: '2. Information We Collect' },
                { id: 'how-we-use', label: '3. How We Use Your Info' },
                { id: 'data-storage', label: '4. Data Storage & Security' },
                { id: 'ai-processing', label: '5. AI Processing' },
                { id: 'third-party', label: '6. Third-Party Services' },
                { id: 'your-rights', label: '7. Your Rights' },
                { id: 'data-retention', label: '8. Data Retention' },
                { id: 'changes', label: '9. Policy Changes' },
                { id: 'contact', label: '10. Contact Us' },
              ].map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors leading-tight block py-0.5">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

        <div className="flex-1 space-y-8 min-w-0">
          <section id="introduction">
            <h2 className="text-xl font-bold mb-3 tracking-tight">1. Introduction</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              TrackMyMoney (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal and financial information when you use our Service. We believe your financial data is deeply personal, and we treat it with the care it deserves.
            </p>
          </section>

          <section id="information-we-collect">
            <h2 className="text-xl font-bold mb-3 tracking-tight">2. Information We Collect</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              We collect the following types of information:
            </p>

            <h3 className="text-base font-semibold mb-2 mt-4">Account Information</h3>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Full name, email address, and password (hashed and salted).</li>
              <li>Preferred currency setting.</li>
              <li>OAuth provider data (Google or GitHub) if you choose social sign-in.</li>
            </ul>

            <h3 className="text-base font-semibold mb-2 mt-4">Financial Data</h3>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Bank statements, transaction records, and financial documents you upload.</li>
              <li>Transaction details extracted via our AI Auto-Parse feature.</li>
              <li>Budgets, savings goals, and subscription tracking data you create.</li>
              <li>Account names and balances you manually enter.</li>
            </ul>

            <h3 className="text-base font-semibold mb-2 mt-4">Usage Data</h3>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Browser type, device type, and operating system.</li>
              <li>Pages visited and features used within the Service.</li>
              <li>We do not use third-party analytics tracking cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">3. How We Use Your Information</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              We use your information solely to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>Process and categorize your financial data using AI.</li>
              <li>Generate dashboards, reports, and insights for your personal use.</li>
              <li>Send important service-related communications (e.g., security alerts).</li>
            </ul>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mt-3 font-medium">
              We do not sell, rent, or share your personal or financial data with third parties for marketing or advertising purposes. Ever.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">4. Data Storage and Security</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              We take the security of your data seriously:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li><strong>Database:</strong> Your data is stored in a Supabase-managed PostgreSQL database with enterprise-grade infrastructure.</li>
              <li><strong>Row-Level Security:</strong> Postgres RLS policies ensure that every database query is scoped to your user ID. You can only ever access your own data.</li>
              <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is encrypted via HTTPS/TLS.</li>
              <li><strong>Authentication:</strong> Managed by Supabase Auth with secure session handling, supporting email/password and OAuth (Google, GitHub).</li>
              <li><strong>Passwords:</strong> User passwords are hashed using bcrypt and are never stored in plain text.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">5. AI Processing</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              When you use the AI Auto-Parse feature, your uploaded documents are processed by our AI engine to extract and categorize transactions. The document content is sent to our AI provider solely for the purpose of parsing your data. We do not use your financial data to train AI models. Parsed results are stored in your account and are subject to the same security protections described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">6. Data Retention and Deletion</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              We retain your data for as long as your account is active. You have full control:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li><strong>Export:</strong> You can export all your data to CSV, Excel, or PDF at any time from Settings.</li>
              <li><strong>Delete:</strong> You can delete your account at any time. Upon deletion, all your personal data and financial records are permanently removed from our database.</li>
              <li>We do not retain backups of deleted user data beyond standard database backup cycles (up to 7 days), after which it is permanently purged.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">7. Third-Party Services</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              We use the following third-party services to operate TrackMyMoney:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li><strong>Supabase:</strong> Database hosting, authentication, and storage.</li>
              <li><strong>Vercel:</strong> Application hosting and deployment.</li>
              <li><strong>AI Provider:</strong> For document parsing and transaction categorization (data is not retained by the provider).</li>
            </ul>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mt-3">
              We do not integrate with any advertising networks, data brokers, or analytics platforms that track users across sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">8. Cookies</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              We use only essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. Your browser settings can be configured to block cookies, but this may affect your ability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">9. Your Rights</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Access all personal data we hold about you.</li>
              <li>Export your data in standard formats (CSV, Excel, PDF).</li>
              <li>Correct or update your personal information via Settings.</li>
              <li>Delete your account and all associated data at any time.</li>
              <li>Withdraw consent for data processing by deleting your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">10. Children&apos;s Privacy</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              The Service is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">11. Changes to This Policy</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be reflected by the &quot;Last updated&quot; date at the top of this page. For material changes, we will notify registered users via email. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">12. Contact Us</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              If you have questions or concerns about this Privacy Policy or your data, contact us at{' '}
              <a href="mailto:privacy@trackmymoney.app" className="text-[var(--text-main)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity">
                privacy@trackmymoney.app
              </a>.
            </p>
          </section>
        </div>
        </div>
      </main>

      {}
      <footer className="border-t border-[var(--border-light)] py-6">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
          <span>© 2026 TrackMyMoney. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="text-[var(--text-main)] font-medium">Privacy Policy</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
