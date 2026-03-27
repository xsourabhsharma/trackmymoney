'use client'

import React from 'react'
import Link from 'next/link'
import { motion, Variants, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Shield, Download, CreditCard, Sparkles } from 'lucide-react'
import FinanceWorld3D from './3d/FinanceWorld3D'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const trustItems = [
  { icon: CreditCard, text: 'No credit card required' },
  { icon: Shield, text: 'Bank-grade security' },
  { icon: Download, text: '1-click data export' },
]

export default function HeroSection() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"])
  const translateZ = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 pb-20 overflow-hidden bg-[var(--bg-base)] text-[var(--text-main)] border-b border-[var(--border-light)]">
      {}
      <FinanceWorld3D />

      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/90 via-[var(--bg-base)]/50 to-[var(--bg-base)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,transparent_0%,var(--bg-base)_90%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full mt-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center text-center"
        >
          {}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
               <Sparkles className="w-4 h-4 text-[var(--income-green)]" />
               <span className="text-sm font-semibold tracking-wide">Next-gen Finance Tracking</span>
            </div>
          </motion.div>

          {}
          <motion.h1
            variants={fadeUp}
            className="text-[3.5rem] sm:text-[4.5rem] md:text-[6rem] leading-[1] font-black mb-8 tracking-[-0.04em] text-[var(--text-main)] max-w-[900px] text-balance"
          >
            Wealth intelligence.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--income-green)] via-[#3B82F6] to-[#8B5CF6] pr-2">
              Zero friction.
            </span>
          </motion.h1>

          {}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-[650px] mx-auto leading-relaxed font-medium text-balance"
          >
            Upload a receipt, forward an email, or sync your bank. Our AI extracts, categorizes, and builds your financial dashboard instantly. Stop spreadsheeting.
          </motion.p>

          {}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto mb-12">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-[0_0_40px_rgba(39,201,63,0.3)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2">
                Start For Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-6 md:gap-10 justify-center opacity-70">
            {trustItems.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <Icon className="w-4 h-4 text-[var(--income-green)]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

