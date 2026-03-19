import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | TrackMyMoney',
  description: 'Terms of Service for TrackMyMoney, the AI-powered personal finance tracker.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased">
      {/* Minimal nav */}
      <nav className="border-b border-[var(--border-light)] py-4">
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Image src="/logo.svg" alt="TrackMyMoney" width={24} height={24} className="w-6 h-6" />
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

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
        <div className="mb-10">
          <h1 className="text-[2rem] md:text-[2.5rem] font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-[var(--text-muted)] text-sm">Last updated: March 19, 2026</p>
        </div>

        <div className="prose-custom space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              By accessing or using TrackMyMoney (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all users, visitors, and others who access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">2. Description of Service</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              TrackMyMoney is a personal finance tracking application that allows users to upload financial statements, automatically categorize transactions using AI, track budgets, set savings goals, and view financial reports. The Service is provided as a web application accessible through modern web browsers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">3. User Accounts</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              To use most features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">4. Financial Data</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              The Service allows you to upload and process financial data including bank statements, transaction records, and related documents. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>You are solely responsible for the accuracy of the data you upload.</li>
              <li>AI-powered categorization and analysis are provided as helpful suggestions, not financial advice.</li>
              <li>TrackMyMoney is not a financial advisor, bank, or investment service.</li>
              <li>You should verify all auto-categorized data before making financial decisions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">5. Acceptable Use</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[15px] text-[var(--text-muted)] leading-relaxed pl-2">
              <li>Upload any data you do not have the right to access or process.</li>
              <li>Attempt to gain unauthorized access to other users&apos; data or accounts.</li>
              <li>Use the Service for any illegal or fraudulent purposes.</li>
              <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
              <li>Overload, disrupt, or interfere with the Service&apos;s infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">6. Free and Paid Plans</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              TrackMyMoney offers a free tier and may offer paid plans with additional features. Free tier access may be subject to usage limits. We reserve the right to modify pricing, features, or limits with reasonable notice. Paid plan subscribers will be notified of any pricing changes at least 30 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">7. Data Ownership and Export</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              You retain full ownership of all financial data you upload to the Service. You may export your data at any time in CSV, Excel, or PDF format. You may also delete your account and all associated data at any time through the Settings page. Upon account deletion, all your data is permanently removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">8. Intellectual Property</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              The Service, including its design, code, AI models, features, and documentation, is owned by TrackMyMoney and protected by intellectual property laws. Your use of the Service does not grant you any rights to our intellectual property beyond what is necessary to use the Service as intended.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">9. Limitation of Liability</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. TrackMyMoney shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to financial losses resulting from reliance on the Service&apos;s data or analysis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">10. Changes to Terms</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              We may update these Terms from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated terms. For material changes, we will notify registered users via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 tracking-tight">11. Contact</h2>
            <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:support@trackmymoney.app" className="text-[var(--text-main)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity">
                support@trackmymoney.app
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-light)] py-6">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[var(--text-muted)]">
          <span>© 2026 TrackMyMoney. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span className="text-[var(--text-main)] font-medium">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
