'use client'

import { motion, Variants } from 'framer-motion'
import { X, Check } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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
    <section className="py-[80px] md:py-[100px] bg-[var(--bg-base)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold tracking-tight leading-tight mb-4 text-[var(--text-main)]">
            Stop guessing where your money<br className="hidden md:block" /> went last month
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-[550px] mx-auto">
            Sound familiar? Here&apos;s how TrackMyMoney turns financial chaos into clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-[900px] mx-auto">
          {/* Pain column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-[var(--bg-surface)] rounded-[24px] border border-[var(--border-light)] p-6 md:p-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--expense-red)]/8 text-[var(--expense-red)] text-xs font-bold uppercase tracking-wider mb-5">
              <X className="w-3.5 h-3.5" />
              Without TrackMyMoney
            </div>
            <div className="flex flex-col gap-4">
              {painPoints.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--expense-red)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-[var(--expense-red)]" />
                  </div>
                  <p className="text-[15px] text-[var(--text-muted)] leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Outcome column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="bg-[var(--bg-surface)] rounded-[24px] border border-[var(--border-light)] p-6 md:p-8 relative overflow-hidden"
          >
            {/* Subtle green glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--income-green)]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--income-green)]/8 text-[var(--income-green)] text-xs font-bold uppercase tracking-wider mb-5 relative z-10">
              <Check className="w-3.5 h-3.5" />
              With TrackMyMoney
            </div>
            <div className="flex flex-col gap-4 relative z-10">
              {outcomes.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--income-green)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[var(--income-green)]" />
                  </div>
                  <p className="text-[15px] text-[var(--text-main)] leading-relaxed font-medium">{point}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
