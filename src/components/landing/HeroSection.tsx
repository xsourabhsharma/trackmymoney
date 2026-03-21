'use client'

import React from 'react'
import Link from 'next/link'
import { motion, Variants, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Shield, Download, CreditCard } from 'lucide-react'
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

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])
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
      {/* Premium 3D Background */}
      <FinanceWorld3D />

      {/* Radial Gradients for text legibility over 3D in both modes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/90 via-[var(--bg-base)]/50 to-[var(--bg-base)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-base)_95%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full mt-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center text-center"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-[3rem] sm:text-[4rem] md:text-[5.5rem] leading-[1.05] font-black mb-6 tracking-tighter text-[var(--text-main)]"
          >
            Wealth intelligence.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--income-green)] via-[#3B82F6] to-[#8B5CF6]">
              Zero friction.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-[600px] mx-auto leading-relaxed font-medium"
          >
            Upload a receipt, forward an email, or sync your bank. Our AI extracts, categorizes, and builds your financial dashboard instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto mb-12">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden shadow-xl shadow-[var(--income-green)]/20 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2">
                Start For Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-main)] rounded-full text-sm font-black uppercase tracking-widest hover:bg-[var(--border-light)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-sm transition-all"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-8 justify-center opacity-80">
            {trustItems.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <Icon className="w-4 h-4 text-[var(--income-green)]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Floating Interface */}
        <motion.div
          initial={{ opacity: 0, y: 150 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, type: 'spring', bounce: 0.2 }}
          className="mt-20 mx-auto max-w-5xl relative cursor-crosshair perspective-[1500px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1500 }}
        >
          {/* Glowing backplate */}
          <div className="absolute -inset-10 bg-gradient-to-t from-[var(--income-green)]/30 via-[#3B82F6]/30 to-transparent blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div 
            style={{ rotateX, rotateY, z: translateZ }}
            className="relative bg-white/5 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-t-[40px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-3xl aspect-[16/9] transform-gpu flex items-center justify-center"
          >
             {/* Abstract UI Representation */}
             <div className="absolute top-0 left-0 right-0 h-14 border-b border-white/10 flex items-center px-8 gap-3 bg-white/5 dark:bg-white/5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-sm" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-sm" />
             </div>

             <div className="w-full h-full pt-14 p-10 grid grid-cols-4 gap-8 opacity-70">
                <div className="col-span-1 space-y-6">
                  <div className="h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 shadow-inner" />
                  <div className="h-48 bg-gradient-to-tr from-[var(--income-green)]/20 to-transparent rounded-3xl border border-[var(--income-green)]/30 backdrop-blur-md" />
                  <div className="h-32 bg-white/5 rounded-3xl border border-white/5" />
                </div>
                <div className="col-span-3 space-y-6">
                  <div className="h-64 bg-gradient-to-b from-white/10 to-transparent rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#3B82F6]/20 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/5" />
                    <div className="h-32 bg-white/5 rounded-3xl border border-white/5" />
                  </div>
                </div>
             </div>
             
             {/* Hover Glass Element Over UI */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-sm transition-opacity duration-500 hover:opacity-0 group">
                <div className="px-8 py-4 bg-white/10 dark:bg-black/40 border border-white/20 rounded-2xl flex items-center gap-4 backdrop-blur-xl shadow-2xl scale-110">
                   <div className="w-3 h-3 rounded-full bg-[var(--income-green)] shadow-[0_0_15px_var(--income-green)] animate-pulse" />
                   <span className="text-base font-black tracking-[0.2em] uppercase text-white drop-shadow-md">AI Sync Active</span>
                </div>
             </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
