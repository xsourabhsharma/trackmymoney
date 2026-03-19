'use client'

import { motion, Variants } from 'framer-motion'
import { Database, KeyRound, ShieldCheck, Lock } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const bullets = [
  {
    icon: Database,
    title: 'Supabase-managed Postgres',
    description: 'Your data lives in a production-grade Postgres database managed by Supabase. Not in some random spreadsheet.',
  },
  {
    icon: KeyRound,
    title: 'Secure authentication',
    description: 'Sign in with email or Google via Supabase Auth. Sessions are securely managed with industry-standard tokens.',
  },
  {
    icon: ShieldCheck,
    title: 'Row-level security',
    description: 'Postgres RLS policies ensure you only see your own data. Even if something goes wrong server-side, your data stays yours.',
  },
  {
    icon: Lock,
    title: 'Encrypted & private',
    description: 'All data in transit over HTTPS. We never sell, share, or use your financial data for advertising. Delete anytime.',
  },
]

export default function SecuritySection() {
  return (
    <section className="py-[80px] md:py-[100px] bg-[var(--bg-base)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
              Trust & Security
            </div>
            <h2 className="text-[2rem] md:text-[2.5rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
              Bank-grade security without the bank jargon
            </h2>
            <p className="text-lg text-[var(--text-muted)] leading-relaxed">
              We built TrackMyMoney on Supabase because your financial data deserves real infrastructure, not a toy database. Here&apos;s what that means for you.
            </p>
          </motion.div>

          {/* Right: bullet cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-4"
          >
            {bullets.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="bg-[var(--bg-surface)] rounded-[20px] border border-[var(--border-light)] p-5 hover:border-[var(--border-dark)] hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--income-green)]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[var(--income-green)]" />
                </div>
                <h3 className="text-[15px] font-bold mb-1.5 text-[var(--text-main)]">{title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
