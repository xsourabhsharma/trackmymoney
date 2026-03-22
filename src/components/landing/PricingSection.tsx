'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    cta: 'Get started',
    ctaHref: '/signup',
    highlight: false,
    features: [
      'Track up to 3 accounts',
      '6 months of transaction history',
      'Core dashboards & budgets',
      'AI Auto-Parse (5 uploads/mo)',
      'CSV & PDF export',
    ],
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    cta: 'Coming soon',
    ctaHref: '/signup',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited accounts',
      'Full transaction history',
      'Advanced reports & trends',
      'Unlimited AI Auto-Parse',
      'Priority email support',
      'Custom budget categories',
    ],
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-[80px] md:py-[120px] bg-[var(--bg-base)]">
      <div className="max-w-[900px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[550px] mx-auto mb-12 md:mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
            Pricing
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
            Simple pricing that grows with you
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Start free. Upgrade when you need more power. No hidden fees, ever.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`relative rounded-[24px] p-7 md:p-8 border transition-all duration-300 ${
                plan.highlight
                  ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-2xl shadow-black/10'
                  : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-light)] hover:border-[var(--border-dark)] hover:shadow-lg'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--income-green)] text-white text-[12px] font-bold uppercase tracking-widest rounded-full shadow-md">
                  {plan.badge}
                </span>
              )}

              <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className={`text-sm font-medium ${plan.highlight ? 'opacity-60' : 'text-[var(--text-muted)]'}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-3 mb-7">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-[14px]">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        plan.highlight ? 'text-[var(--income-green)]' : 'text-[var(--income-green)]'
                      }`}
                    />
                    <span className={plan.highlight ? 'opacity-90' : ''}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`group w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-[var(--bg-base)] text-[var(--text-main)] hover:opacity-90 shadow-md'
                    : 'bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 shadow-sm'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
