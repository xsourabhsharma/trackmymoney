import { LegalArticleShell, type LegalArticleSection } from '@/components/public'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms governing access to and use of the TrackMyMoney website, dashboard, and AI-assisted finance features.',
}

const sections: LegalArticleSection[] = [
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
    paragraphs: ['You are responsible for the information and files you upload, enter, or submit through the service.'],
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
    paragraphs: ['You agree not to misuse the service.'],
    bullets: [
      "Do not attempt to access another user's data or account.",
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
      <>
        If you have questions about these Terms, contact us at{' '}
        <a
          href="mailto:support@trackmymoney.app"
          className="font-medium text-[var(--public-text)] underline underline-offset-4 hover:text-[var(--public-orange)]"
        >
          support@trackmymoney.app
        </a>
        .
      </>,
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalArticleShell
      active="terms"
      contactEmail="support@trackmymoney.app"
      description="Terms governing access to and use of the TrackMyMoney website, dashboard, uploads, exports, and AI-assisted finance features."
      lastUpdated="March 27, 2026"
      sections={sections}
      title="Terms of Service"
    />
  )
}
