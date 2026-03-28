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
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 dark:border-[var(--border-light)] shadow-2xl">
              <Image src={feature.img} alt={feature.title} fill className="object-cover object-top" />
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="hidden md:flex max-w-[1400px] mx-auto relative items-start gap-12 lg:gap-24">
        
        {}
        <div className="w-[45%] py-[20vh] flex flex-col gap-[30vh]">
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
              viewport={{ amount: 0.5, margin: "-20% 0px -20% 0px" }}
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
        <div className="w-[55%] sticky top-[15vh] h-[70vh] flex items-center justify-center perspective-[2000px]">
          <motion.div 
            initial={{ rotateY: -15, rotateX: 8, opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ rotateY: 0, rotateX: 0, opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative w-full h-[65vh] rounded-[24px] overflow-hidden border border-white/10 dark:border-[var(--border-light)] shadow-[0_30px_100px_rgba(39,201,63,0.15)] bg-[#050505] p-2 hover:shadow-[0_40px_120px_rgba(39,201,63,0.25)] transition-shadow duration-700"
          >
            
            {}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111] dark:bg-[var(--bg-surface)] border-b border-white/5 dark:border-[var(--border-light)] rounded-t-[18px]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>

            <div className="relative w-full h-[calc(100%-40px)] rounded-b-[18px] overflow-hidden bg-black">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image 
                      src={features[activeIndex].img} 
                      alt={features[activeIndex].title}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1400px) 50vw, 700px"
                      priority={activeIndex === 0}
                    />
                  </motion.div>
                </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
