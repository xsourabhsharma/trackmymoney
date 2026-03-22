'use client'

import { motion, Variants } from 'framer-motion'
import { Upload, Sparkles, BarChart3 } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Connect & Import',
    description:
      'Upload your bank statements (PDF, CSV, or Excel) and our AI reads them instantly. Your data is stored securely in Supabase Postgres, encrypted and protected.',
    iconClass: 'text-[var(--income-green)]',
    bgClass: 'bg-[var(--income-green)]/10',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Auto-categorize & Clean',
    description:
      'AI and smart rules categorize every transaction, detect hidden subscriptions, and flag anomalies. You stay in control and can adjust any category before saving.',
    iconClass: 'text-[var(--warning)]',
    bgClass: 'bg-[var(--warning)]/10',
    highlight: true,
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'See Clear Insights',
    description:
      'Live dashboards show your spending trends, budget health, and savings rate at a glance. No more guesswork, just clean, actionable data.',
    iconClass: 'text-[var(--text-main)]',
    bgClass: 'bg-[var(--text-main)]/10',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-[80px] md:py-[120px] bg-[var(--bg-surface)] border-y border-[var(--border-light)]/50">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[600px] mx-auto mb-12 md:mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
            How It Works
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
            Three steps to financial clarity
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Get started in minutes. No bank login required. Upload a statement and let AI do the rest.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 max-w-sm md:max-w-none mx-auto"
        >
          {steps.map(({ step, icon: Icon, title, description, iconClass, bgClass, highlight }) => (
            <motion.div
              key={step}
              variants={fadeUp}
              className={`relative p-7 md:p-8 bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] hover:border-[var(--border-dark)] hover:shadow-xl transition-all duration-300 group ${
                highlight ? 'ring-1 ring-[var(--border-dark)]' : ''
              }`}
            >
              {highlight && (
                <div className="absolute top-4 right-4 text-[var(--warning)] motion-safe:animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${bgClass}`}>
                <Icon className={`w-6 h-6 ${iconClass}`} />
              </div>
              <div className={`text-[12px] font-bold tracking-widest uppercase mb-3 inline-block px-2.5 py-1 rounded-full ${bgClass} ${iconClass}`}>
                Step {step}
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--text-main)]">{title}</h3>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Security note */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center text-[13px] text-[var(--text-muted)] mt-8 max-w-[500px] mx-auto"
        >
          Your data is protected by Supabase row-level security. Only you can access your financial information. Always.
        </motion.p>
      </div>
    </section>
  )
}
