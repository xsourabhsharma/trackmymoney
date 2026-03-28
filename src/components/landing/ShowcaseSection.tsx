'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Receipt, ListTree, PieChart, Repeat, Target, BarChart3, Database } from 'lucide-react'

const features = [
  {
    id: 'autoparse',
    title: 'AI Auto-Parse Receipts & CSVs',
    description: 'Stop typing manual entries. Drop a physical receipt or bank CSV, and our AI automatically extracts the merchant, amount, category, and date instantly with high precision.',
    icon: Receipt,
    img: '/images/screenshots/auto-parse-receipt.png',
  },
  {
    id: 'transactions',
    title: 'The Ultimate Smart Ledger',
    description: 'Keep every transaction neatly organized. Search, filter, and modify your data instantly using an ultra-responsive interface devoid of spreadsheet clutter.',
    icon: ListTree,
    img: '/images/screenshots/transactions.png',
  },
  {
    id: 'budgets',
    title: 'Enforce Strict Budgets',
    description: 'Set hard category limits and visually track your remaining allowances. TrackMyMoney alerts you exactly when you are getting close to your predefined monthly spend.',
    icon: PieChart,
    img: '/images/screenshots/budgets.png',
  },
  {
    id: 'subscriptions',
    title: 'Kill Useless Subscriptions',
    description: 'Never get hit with a surprise charge again. We identify recurring payments and aggregate them into a clear monitoring board so you can pause or cancel them with ease.',
    icon: Repeat,
    img: '/images/screenshots/subscriptions.png',
  },
  {
    id: 'goals',
    title: 'Save Aggressively',
    description: 'Treat your savings targets and debt liabilities like serious projects. Assign cash flows directly against debt progress and visualize your path to freedom.',
    icon: Target,
    img: '/images/screenshots/goals.png',
  },
  {
    id: 'reports',
    title: 'Deep Financial Analytics',
    description: 'Slice and dice your entire financial history. Generate beautiful, presentation-grade reports summarizing cash flow, income vs expenses, and custom categorizations.',
    icon: BarChart3,
    img: '/images/screenshots/reports.png',
  },
]

export default function ShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative bg-[#050505] dark:bg-[var(--bg-base)] border-y border-[var(--border-light)] py-20 px-6">
      
      {}
      <div className="md:hidden flex flex-col gap-16 max-w-lg mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-white dark:text-[var(--text-main)] tracking-[-0.03em] mb-4">Command your wealth.</h2>
            <p className="text-[var(--text-muted)] text-lg">A full suite of tools built directly into your workflow.</p>
        </div>
        {features.map((feature, i) => (
          <div key={feature.id} className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-[var(--income-green)]/10 rounded-2xl flex items-center justify-center border border-[var(--income-green)]/20">
               <feature.icon className="w-6 h-6 text-[var(--income-green)]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white dark:text-[var(--text-main)] mb-3">{feature.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
            </div>
            {/* Mobile Image Container - Forced Aspect Ratio */}
            <div className="relative w-full pt-[65%] rounded-2xl overflow-hidden border border-white/10 dark:border-[var(--border-light)] shadow-2xl block bg-[#111]">
              <img src={feature.img} alt={feature.title} className="absolute inset-0 w-full h-full object-cover object-top" />
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="hidden md:grid grid-cols-[45%_55%] max-w-[1400px] mx-auto relative gap-12 lg:gap-24">
        
        {}
        <div className="py-[20vh] flex flex-col gap-[30vh]">
          <div className="mb-[10vh]">
            <h2 className="text-5xl lg:text-6xl font-black text-white dark:text-[var(--text-main)] tracking-[-0.03em] mb-6 text-balance">
              The complete toolkit for your net worth.
            </h2>
            <p className="text-xl text-[var(--text-muted)] text-balance">
              TrackMyMoney orchestrates everything from raw receipts to high-level portfolio reporting without dropping a frame.
            </p>
          </div>

          {features.map((feature, i) => (
            <motion.div 
              key={feature.id}
              onViewportEnter={() => setActiveIndex(i)}
              viewport={{ amount: 0.1, margin: "-10% 0px -10% 0px", once: false }}
              className={`flex flex-col gap-6 transition-opacity duration-500 ${activeIndex === i ? 'opacity-100' : 'opacity-30'}`}
            >
              <div className="w-16 h-16 bg-[var(--income-green)]/10 rounded-2xl flex items-center justify-center border border-[var(--income-green)]/20 shadow-inner">
                 <feature.icon className="w-8 h-8 text-[var(--income-green)]" />
              </div>
              <h3 className="text-3xl font-bold text-white dark:text-[var(--text-main)]">{feature.title}</h3>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-md">{feature.description}</p>
            </motion.div>
          ))}
          {}
          <div className="h-[20vh]" />
        </div>

        {}
        <div className="relative w-full h-full">
          <div className="sticky top-[15vh] h-[70vh] w-full flex items-center justify-center pointer-events-none">
          <div 
            className="relative w-full h-[65vh] rounded-[24px] overflow-hidden border border-white/10 dark:border-[var(--border-light)] shadow-[0_30px_100px_rgba(39,201,63,0.15)] bg-[#050505] p-2 hover:shadow-[0_40px_120px_rgba(39,201,63,0.25)] transition-shadow duration-700 flex flex-col"
          >
            
            {}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111] dark:bg-[var(--bg-surface)] border-b border-white/5 dark:border-[var(--border-light)] rounded-t-[18px] shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>

            <div className="relative w-full flex-grow rounded-b-[18px] overflow-hidden bg-black">
                {features.map((feat, idx) => (
                    <img 
                      key={feat.id}
                      src={feat.img} 
                      alt={feat.title}
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[600ms] ease-in-out ${
                        activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    />
                ))}
            </div>
          </div>
        </div>
        </div>

      </div>
    </section>
  )
}
