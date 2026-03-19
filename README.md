# TrackMyMoney

Personal finance tracker built with Next.js and Supabase. Track income, expenses, subscriptions, budgets, and savings goals in one place. Upload bank statements and let AI categorize everything automatically.

## Features

- **Dashboard** — Live overview of balances, income, expenses, and spending trends
- **Transactions** — Add, edit, search, filter, and bulk-manage transactions
- **AI Auto-Parse** — Upload PDF/CSV/Excel bank statements; AI extracts and categorizes transactions
- **Budgets** — Set category-level monthly budgets with visual progress tracking
- **Savings Goals** — Track progress toward financial targets with projections
- **Subscriptions** — Detect recurring charges, track upcoming payments, spot subscription creep
- **Reports** — Monthly and category breakdowns with exportable charts
- **Receipt Scanner** — OCR-based receipt scanning to auto-create transactions
- **Dark Mode** — Full dark/light theme support across every page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + Row Level Security) |
| Auth | Supabase Auth (Email, Google OAuth, GitHub OAuth) |
| ORM | Drizzle ORM |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Google OAuth credentials (optional, for social login)

### Setup

```bash
git clone https://github.com/xsourabhsharma/trackmymoney.git
cd trackmymoney
npm install
```

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string
```

Push the database schema:

```bash
npx drizzle-kit push
```

Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup, Forgot/Update Password
│   ├── api/             # API routes (advisor, export, cron, merchants)
│   ├── dashboard/       # Main app (overview, transactions, budgets, goals, etc.)
│   ├── privacy/         # Privacy Policy
│   └── terms/           # Terms of Service
├── components/
│   ├── dashboard/       # Dashboard UI components (50+ components)
│   ├── landing/         # Landing page sections
│   └── ui/              # Shadcn UI primitives
├── db/                  # Drizzle schema
├── lib/                 # Business logic, types, utilities
└── utils/               # Supabase client helpers
```

## Security

- All data protected by Supabase Row Level Security (RLS)
- Service role key used server-side only via centralized `createAdminClient()`
- Security headers: X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- Environment variables excluded from version control via `.gitignore`

