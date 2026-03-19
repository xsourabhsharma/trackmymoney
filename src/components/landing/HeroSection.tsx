'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Shield, Download, CreditCard } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const trustItems = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Shield, text: 'Secure Supabase-backed storage' },
  { icon: Download, text: 'Export your data anytime' },
]

// Static illustrative data for the dashboard preview
const mockTransactions = [
  { emoji: '🛒', name: 'Whole Foods Market', amount: '-$142.80', color: 'var(--expense-red)' },
  { emoji: '💼', name: 'Acme Corp Salary', amount: '+$4,225.00', color: 'var(--income-green)' },
  { emoji: '🎬', name: 'Netflix Subscription', amount: '-$15.99', color: 'var(--expense-red)' },
  { emoji: '💳', name: 'Freelance Payment', amount: '+$1,800.00', color: 'var(--income-green)' },
]

const mockBudgets = [
  { name: 'Groceries', pct: 65, color: 'var(--income-green)' },
  { name: 'Dining Out', pct: 88, color: 'var(--warning)' },
  { name: 'Transport', pct: 42, color: 'var(--income-green)' },
]

export default function HeroSection() {
  return (
    <section className="pt-[140px] pb-[80px] md:pt-[160px] md:pb-[100px] bg-gradient-to-b from-[var(--bg-surface)] via-[var(--bg-surface)]/60 to-[var(--bg-base)] relative overflow-hidden">
      {/* Ambient radial glow */}
      <div
        className="absolute top-[-30%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(45,90,61,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(69,67,58,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center lg:text-left"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-full text-xs font-semibold mb-5 shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-[var(--income-green)] rounded-full animate-pulse" />
            AI-Powered Finance Tracker
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] leading-[1.08] font-bold mb-5 tracking-tight text-[var(--text-main)]"
          >
            See exactly where your money goes.{' '}
            <span className="relative inline-block text-[var(--income-green)]">
              Cut wasteful spending
              <span className="absolute bottom-0 left-0 w-full h-[6px] bg-[var(--income-green)]/15 rounded-full" />
            </span>{' '}
            in 7 days
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-[var(--text-muted)] mb-7 max-w-[520px] mx-auto lg:mx-0 leading-relaxed"
          >
            For individuals and freelancers who want one place to unify accounts, track expenses, catch hidden subscriptions, and hit savings goals.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-base font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/8"
            >
              Get started free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 text-[var(--text-muted)] hover:text-[var(--text-main)] text-base font-medium transition-colors"
            >
              Watch live demo ↓
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start">
            {trustItems.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <Icon className="w-3.5 h-3.5" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: dashboard preview card */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, type: 'spring', bounce: 0.3 }}
          className="relative mt-4 lg:mt-0"
        >
          {/* Glowing shadow behind card */}
          <div className="absolute inset-4 bg-gradient-to-br from-[var(--income-green)]/5 to-[var(--expense-red)]/5 blur-3xl rounded-3xl -z-10" />

          <div className="bg-[var(--bg-base)] rounded-[20px] shadow-[0_32px_64px_rgba(0,0,0,0.08),_0_16px_32px_rgba(0,0,0,0.04)] border border-[var(--border-light)] overflow-hidden">
            {/* Window chrome */}
            <div className="px-4 py-3 border-b border-[var(--border-light)] flex items-center gap-2">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF6B6B]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#FFD93D]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#6BCB77]" />
              <span className="ml-3 text-[10px] text-[var(--text-muted)] font-medium tracking-wide">TrackMyMoney · Dashboard</span>
            </div>

            <div className="p-4 md:p-5">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total Balance', value: '$24,580', color: 'var(--text-main)' },
                  { label: 'Income', value: '$8,450', color: 'var(--income-green)' },
                  { label: 'Expenses', value: '$3,240', color: 'var(--expense-red)' },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="p-3 bg-[var(--bg-surface)] rounded-2xl text-center border border-[var(--border-light)]/50"
                  >
                    <div className="text-lg md:text-xl font-bold mb-0.5" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div className="bg-[var(--bg-surface)] rounded-2xl p-3 mb-3 border border-[var(--border-light)]/50">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Recent Transactions
                </div>
                <div className="flex flex-col gap-1.5">
                  {mockTransactions.map((tx) => (
                    <div
                      key={tx.name}
                      className="flex items-center gap-2 text-xs p-2 bg-[var(--bg-base)] rounded-xl"
                    >
                      <span className="w-6 h-6 bg-[var(--bg-surface)] rounded-lg flex items-center justify-center text-[10px]">
                        {tx.emoji}
                      </span>
                      <span className="flex-grow font-medium truncate">{tx.name}</span>
                      <span className="font-semibold shrink-0" style={{ color: tx.color }}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budgets */}
              <div className="bg-[var(--bg-surface)] rounded-2xl p-3 border border-[var(--border-light)]/50">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Budget Progress
                </div>
                <div className="flex flex-col gap-2">
                  {mockBudgets.map((b) => (
                    <div key={b.name} className="flex items-center gap-3 text-xs">
                      <span className="w-16 font-medium truncate">{b.name}</span>
                      <div className="flex-grow h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                        />
                      </div>
                      <span className="font-semibold w-8 text-right">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute -bottom-3 -left-3 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl px-4 py-2.5 shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-[var(--income-green)] rounded-full animate-pulse" />
            Savings rate: 70%
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
