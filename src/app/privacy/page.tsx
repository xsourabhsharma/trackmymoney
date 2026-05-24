import { LegalArticleShell, type LegalArticleSection } from '@/components/public'

export const metadata = {
  title: 'Privacy Policy',
  description:
    'How TrackMyMoney collects, uses, stores, and protects information related to your account and financial data.',
}

const sections: LegalArticleSection[] = [
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
    paragraphs: ['We use information to operate, secure, maintain, and improve TrackMyMoney.'],
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
      <>
        If you have questions about this Privacy Policy or privacy-related requests, contact us at{' '}
        <a
          href="mailto:privacy@trackmymoney.app"
          className="font-medium text-[var(--public-text)] underline underline-offset-4 hover:text-[var(--public-orange)]"
        >
          privacy@trackmymoney.app
        </a>
        .
      </>,
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalArticleShell
      active="privacy"
      contactEmail="privacy@trackmymoney.app"
      description="How TrackMyMoney collects, uses, stores, and protects information related to your account and financial data."
      lastUpdated="March 27, 2026"
      sections={sections}
      title="Privacy Policy"
    />
  )
}
