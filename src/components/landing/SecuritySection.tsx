'use client'

import { motion, Variants } from 'framer-motion'
import { Database, KeyRound, ShieldCheck, Lock } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
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
    <section className="py-[100px] md:py-[140px] bg-[var(--bg-surface)] border-y border-[var(--border-light)]/50 relative overflow-hidden">
      {}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--income-green)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
          {}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--income-green)]/10 border border-[var(--income-green)]/20 text-[11px] font-black uppercase tracking-widest text-[var(--income-green)] mb-8">
              <ShieldCheck className="w-3.5 h-3.5" /> Trust & Security
            </div>
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold mb-6 leading-[1.1] tracking-[-0.03em] text-[var(--text-main)] text-balance">
              Bank-grade security without the bank jargon.
            </h2>
            <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
              We built TrackMyMoney on Supabase because your financial data deserves real infrastructure, not a toy database. Here&apos;s exactly how we protect you.
            </p>
          </motion.div>

          {}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid sm:grid-cols-2 gap-6 relative"
          >
            {bullets.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] rounded-[24px] border border-[var(--border-light)] p-8 hover:border-[var(--income-green)]/30 hover:shadow-xl hover:shadow-[var(--income-green)]/5 transition-all duration-500 group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--income-green)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="w-12 h-12 rounded-2xl bg-[var(--income-green)]/10 border border-[var(--income-green)]/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-6 h-6 text-[var(--income-green)]" />
                </div>
                <h3 className="text-[17px] font-bold mb-3 tracking-[-0.01em] text-[var(--text-main)]">{title}</h3>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed flex-1">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
