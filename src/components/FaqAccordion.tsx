'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'Is TrackMyMoney free?',
    answer:
      'Yes! The free plan lets you track up to 3 accounts with 6 months of history, core dashboards, budgets, and 5 AI Auto-Parse uploads per month. No credit card required to start.',
  },
  {
    question: 'How do you connect to my bank?',
    answer:
      'Currently, TrackMyMoney supports manual uploads via our AI Auto-Parse feature. You can upload PDF bank statements, CSV exports, or Excel files and our AI extracts and categorizes all transactions automatically. Direct bank connections via account aggregators are coming soon.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Your data is stored in a Supabase-managed Postgres database with row-level security, meaning only you can access your own financial data. All communication is encrypted over HTTPS. We never sell, share, or use your data for advertising.',
  },
  {
    question: 'Can I use this if I\'m a freelancer?',
    answer:
      'Absolutely. TrackMyMoney is built specifically for individuals and freelancers. Track irregular income from multiple clients, detect subscription creep, and get a clear picture of your net position each month.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. You can export all your transactions, budgets, and reports to CSV, Excel, or PDF at any time from the Settings page. Your data is always yours.',
  },
  {
    question: 'Do you have a mobile app?',
    answer:
      'TrackMyMoney is a mobile-friendly progressive web app (PWA). It works beautifully on any phone or tablet browser. Just bookmark it to your home screen for an app-like experience. A native app is on the roadmap.',
  },
  {
    question: 'What file formats does Auto-Parse support?',
    answer:
      'Our AI Auto-Parse engine supports PDF bank statements, CSV exports, Excel (.xlsx) files, and even pasted raw text. It handles complex multi-column PDF layouts and automatically detects transaction patterns.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-[80px] md:py-[120px] bg-[var(--bg-surface)] border-t border-[var(--border-light)]/50">
      <div className="max-w-[800px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
            FAQ
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
            Frequently asked questions
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="flex flex-col">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="border-b border-[var(--border-light)]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center py-5 text-left bg-transparent border-none cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold text-[var(--text-main)] pr-4 group-hover:text-[var(--income-green)] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-[14px] text-[var(--text-muted)] leading-relaxed pb-5 pr-8">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}