'use client'

import { motion, Variants } from 'framer-motion'
import { TrendingDown, Repeat, Target, Download, LineChart, Wallet } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[80px] md:py-[120px] bg-[var(--bg-surface)] border-y border-[var(--border-light)]/50 relative overflow-hidden">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--income-green)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[600px] mx-auto mb-16"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--income-green)] font-bold mb-4">
            Powerful Analytics
          </div>
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold mb-6 leading-[1.1] tracking-[-0.03em] text-[var(--text-main)] text-balance">
            Everything you need. <br className="hidden sm:block" />
            <span className="text-[var(--text-muted)]">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-muted)] text-balance">
            A meticulously designed platform that gets out of your way and lets your data speak for itself.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto"
        >
          {}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="md:col-span-2 relative bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-8 md:p-10 hover:border-[var(--income-green)]/30 hover:shadow-2xl transition-all duration-500 overflow-hidden group min-h-[320px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--income-green)]/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[var(--income-green)]/10 border border-[var(--income-green)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <TrendingDown className="w-6 h-6 text-[var(--income-green)]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 tracking-[-0.02em] text-[var(--text-main)]">Real-time spending insights</h3>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-md">
                Category breakdowns and trend charts show exactly where every rupee goes. Say goodbye to end-of-month surprises with live sync.
              </p>
            </div>
          </motion.div>

          {}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="relative bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-8 hover:border-[var(--expense-red)]/30 hover:shadow-2xl transition-all duration-500 overflow-hidden group min-h-[320px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--expense-red)]/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[var(--expense-red)]/10 border border-[var(--expense-red)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Repeat className="w-6 h-6 text-[var(--expense-red)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-[-0.02em] text-[var(--text-main)]">Kill useless subscriptions</h3>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
                AI detects recurring charges automatically. Spot forgotten subscriptions fast.
              </p>
            </div>
          </motion.div>

          {}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="relative bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-8 hover:border-[var(--warning)]/30 hover:shadow-2xl transition-all duration-500 overflow-hidden group min-h-[320px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--warning)]/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[var(--warning)]/10 border border-[var(--warning)]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Target className="w-6 h-6 text-[var(--warning)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-[-0.02em] text-[var(--text-main)]">Hit savings goals</h3>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">
                Set personalized goals, track progress visually, and get smart nudges to stay on track.
              </p>
            </div>
          </motion.div>

          {}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="md:col-span-2 relative bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-8 md:p-10 hover:border-blue-500/30 hover:shadow-2xl transition-all duration-500 overflow-hidden group min-h-[320px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <span className="absolute top-6 right-6 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-light)] shadow-sm">
              Freelancer-friendly
            </span>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Download className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3 tracking-[-0.02em] text-[var(--text-main)]">Own your data, always</h3>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-md">
                Export everything to CSV, Excel, or PDF anytime. Delete your account and data whenever you want. We never sell your information.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
