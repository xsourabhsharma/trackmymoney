'use client'

import { motion, Variants } from 'framer-motion'
import { TrendingDown, Repeat, Target, Download } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const features = [
  {
    icon: TrendingDown,
    title: 'Stay on top of spending',
    description:
      'Real-time category breakdowns and trend charts show exactly where every rupee goes. No more end-of-month surprises.',
    iconClass: 'text-[var(--income-green)]',
    bgClass: 'bg-[var(--income-green)]/10',
    freelancer: false,
  },
  {
    icon: Repeat,
    title: 'Kill useless subscriptions',
    description:
      'AI detects recurring charges automatically. See which subscriptions are eating into your savings and cancel the ones you forgot about.',
    iconClass: 'text-[var(--expense-red)]',
    bgClass: 'bg-[var(--expense-red)]/10',
    freelancer: true,
  },
  {
    icon: Target,
    title: 'Hit your savings goals',
    description:
      'Set personalized goals and track progress visually. Get monthly projections and nudges to stay on track.',
    iconClass: 'text-[var(--warning)]',
    bgClass: 'bg-[var(--warning)]/10',
    freelancer: false,
  },
  {
    icon: Download,
    title: 'Own your data, always',
    description:
      'Export everything to CSV, Excel, or PDF anytime. Delete your account and data whenever you want. We never sell your information.',
    iconClass: 'text-[var(--text-main)]',
    bgClass: 'bg-[var(--text-main)]/10',
    freelancer: true,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[80px] md:py-[120px] bg-[var(--bg-surface)] border-y border-[var(--border-light)]/50">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[600px] mx-auto mb-12 md:mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
            Features
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
            Designed for people who<br className="hidden sm:block" /> hate spreadsheets
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Four things you actually need. No bloat, no fluff, no 200-feature dashboards you&apos;ll never use.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-5 md:gap-6 max-w-[900px] mx-auto"
        >
          {features.map(({ icon: Icon, title, description, iconClass, bgClass, freelancer }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="relative bg-[var(--bg-base)] rounded-[20px] border border-[var(--border-light)] p-6 md:p-7 hover:border-[var(--border-dark)] hover:shadow-lg transition-all duration-300 group"
            >
              {freelancer && (
                <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-light)]">
                  Freelancer-friendly
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${bgClass}`}>
                <Icon className={`w-5 h-5 ${iconClass}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 tracking-tight text-[var(--text-main)]">{title}</h3>
              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
