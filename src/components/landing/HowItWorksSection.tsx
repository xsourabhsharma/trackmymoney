'use client'

import { motion, Variants } from 'framer-motion'
import { Upload, Sparkles, BarChart3, ArrowRight } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Connect & Import',
    description:
      'Upload your bank statements (PDF, CSV, Excel) and our AI reads them instantly. Stored securely, encrypted, and protected.',
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Auto-categorize & Clean',
    description:
      'AI and smart rules categorize every transaction, detect hidden subscriptions, and flag anomalies. You stay in full control.',
    iconClass: 'text-[var(--warning)]',
    bgClass: 'bg-[var(--warning)]/10',
    borderClass: 'border-[var(--warning)]/20',
    highlight: true,
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'See Clear Insights',
    description:
      'Live dashboards show your spending trends, budget health, and savings rate. No more guesswork, just actionable data.',
    iconClass: 'text-[var(--income-green)]',
    bgClass: 'bg-[var(--income-green)]/10',
    borderClass: 'border-[var(--income-green)]/20',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-[100px] md:py-[140px] bg-[var(--bg-base)] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[600px] mx-auto mb-16 md:mb-24"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--income-green)] font-bold mb-4">
            How It Works
          </div>
          <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold mb-6 leading-[1.1] tracking-[-0.03em] text-[var(--text-main)] text-balance">
            Three steps to financial clarity
          </h2>
          <p className="text-lg md:text-xl text-[var(--text-muted)] text-balance">
            Get started in minutes. No bank login required. Upload a statement and let AI do the heavy lifting.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {}
          <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border-dark)] to-transparent opacity-50 z-0" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10"
          >
            {steps.map(({ step, icon: Icon, title, description, iconClass, bgClass, borderClass, highlight }, index) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="relative group flex flex-col items-center text-center"
              >
                {}
                <div className="text-[120px] font-black leading-none absolute -top-16 left-1/2 -translate-x-1/2 text-[var(--text-main)] opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500">
                  {step}
                </div>

                <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-xl border bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] group-hover:-translate-y-2 transition-transform duration-500 shadow-xl ${borderClass}`}>
                  <div className="absolute inset-0 bg-white/5 rounded-3xl" />
                  {highlight && (
                    <div className="absolute -inset-1 bg-[var(--warning)]/20 rounded-[28px] blur-md motion-safe:animate-pulse" />
                  )}
                  <Icon className={`w-8 h-8 relative z-10 ${iconClass}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-4 tracking-[-0.02em] text-[var(--text-main)]">{title}</h3>
                <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-[280px]">
                  {description}
                </p>

                {}
                {index < steps.length - 1 && (
                  <div className="md:hidden mt-8 text-[var(--border-dark)]">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20 md:mt-32 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] text-[13px] text-[var(--text-muted)] font-medium">
             <div className="w-2 h-2 rounded-full bg-[var(--income-green)] shadow-[0_0_8px_var(--income-green)] animate-pulse" />
             Your data is protected by Supabase row-level security. Only you can access it.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
