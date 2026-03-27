'use client'

import { motion, Variants } from 'framer-motion'
import { X, Check } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const painPoints = [
  'Struggling with spreadsheets that take hours to update every month',
  'Surprise charges from forgotten subscriptions draining your account',
  'No clear picture of where you stand across multiple bank accounts',
]

const outcomes = [
  'One dashboard that auto-tracks every rupee across all your accounts',
  'AI-powered subscription detection that catches what you forgot',
  'Simple, beautiful reports that show exactly where your money goes',
]

export default function ProblemOutcomeSection() {
  return (
    <section className="py-[100px] md:py-[140px] bg-[var(--bg-base)] relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.1] mb-6 text-[var(--text-main)] text-balance">
            Stop guessing where your money<br className="hidden md:block" /> went last month
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-[600px] mx-auto text-balance">
            Sound familiar? Here&apos;s how TrackMyMoney turns financial chaos into absolute clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-[1000px] mx-auto relative">
          {}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--bg-base)] rounded-full border border-[var(--border-light)] z-20 flex items-center justify-center shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]"/>
            </svg>
          </div>

          {}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-base)] rounded-[32px] border border-[var(--border-light)] p-8 md:p-10 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--expense-red)]/10 text-[var(--expense-red)] text-xs font-bold uppercase tracking-[0.15em] mb-8 border border-[var(--expense-red)]/20 shadow-inner">
              <X className="w-4 h-4" />
              Without TrackMyMoney
            </div>
            <div className="flex flex-col gap-6">
              {painPoints.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="flex items-start gap-4 opacity-80"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--expense-red)]/10 flex items-center justify-center shrink-0 border border-[var(--expense-red)]/20">
                    <X className="w-4 h-4 text-[var(--expense-red)]" />
                  </div>
                  <p className="text-[16px] text-[var(--text-muted)] leading-relaxed mt-1">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-gradient-to-br from-[#111111] to-[#050505] dark:from-[var(--bg-surface)] dark:to-[var(--bg-base)] rounded-[32px] border border-white/10 dark:border-[var(--income-green)]/30 p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-[var(--income-green)]/5"
          >
            {}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--income-green)]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--income-green)]/20 text-[var(--income-green)] text-xs font-bold uppercase tracking-[0.15em] mb-8 relative z-10 border border-[var(--income-green)]/30 shadow-inner">
              <Check className="w-4 h-4" />
              With TrackMyMoney
            </div>
            <div className="flex flex-col gap-6 relative z-10">
              {outcomes.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--income-green)]/20 flex items-center justify-center shrink-0 border border-[var(--income-green)]/30 shadow-[0_0_15px_rgba(39,201,63,0.15)]">
                    <Check className="w-4 h-4 text-[var(--income-green)]" />
                  </div>
                  <p className="text-[16px] text-white dark:text-[var(--text-main)] leading-relaxed font-medium mt-1">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
