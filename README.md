<div align="center">
  <h1>💸 Track My Money</h1>
  <p><strong>A Next-Generation Personal Finance Dashboard Built with Next.js & AI</strong></p>

  <p>
    <a href="https://trackmymoney.app" target="_blank">View Live Demo</a> · 
    <a href="https://github.com/xsourabhsharma/trackmymoney/issues">Report Bug</a> · 
    <a href="https://github.com/xsourabhsharma/trackmymoney/issues">Request Feature</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/AI-Groq%20%7C%20OpenAI-blue?style=for-the-badge" alt="AI Powered" />
  </p>
</div>

---

## 🚀 About the Project

**Track My Money** is a comprehensive, AI-powered personal finance tracker designed to give you total control over your financial health. Built natively on **Next.js App Router** with **React Server Components**, it offers a lightning-fast, zero-friction experience for managing your wealth.

Instead of manual data entry, **Track My Money leverages AI** to read your bank statements, scan receipts, and intelligently categorize your transactions autonomously.

### ✨ Core Features

*   **📊 Intelligence Hub** — Real-time overview of cash flow, spending vs. income, and financial health scores.
*   **🤖 AI Auto-Parse** — Upload bank statements (PDF/CSV) or scan receipts. AI automatically extracts data, merchants, and categorizes them.
*   **💼 Budgets & Goals** — Setup dynamic category budgets and visual savings goals.
*   **🔁 Subscription Tracker** — Never pay for an unused service again. Auto-detect recurring charges and catch 'subscription creep'.
*   **🌙 Beautiful UI** — Responsive dark/light modes powered by Tailwind CSS and Shadcn UI.
*   **🔒 Secure by Default** — Enterprise-grade authentication and Row-Level Security (RLS) via Supabase.

---

## 🛠️ Tech Stack

This project was built using modern web standards for maximum scalability and developer experience:

*   **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4, Framer Motion
*   **Backend**: Next.js Server Actions, Supabase (PostgreSQL), Drizzle ORM
*   **Intelligence**: Groq AI Toolkit, OpenAI integrations, Multimodal Receipt Vision
*   **Authentication**: Supabase Auth (OAuth + Email)
*   **Deployment**: Optimised for Vercel edge delivery

---

## ⚙️ Local Development

To run this project locally, you will need Node.js 18+ and a [Supabase](https://supabase.com) account.

### 1. Clone the repository
```bash
git clone https://github.com/xsourabhsharma/trackmymoney.git
cd trackmymoney
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_drizzle_url
```

### 3. Push database schema
```bash
npx drizzle-kit push
```

### 4. Start the development server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to start tracking your money!

---

## 🛡️ Security & Privacy
Your financial data is completely protected. We employ **Supabase Row Level Security (RLS)** ensuring every query is executed strictly within your authenticated context. Secrets are securely managed via Vercel and excluded from the public repository.

<div align="center">
  <sub>Built with ❤️ by Sourabh Sharma.</sub>
</div>
