'use client'

import React from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function HeroImage() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <div className="relative w-full max-w-[1100px] mx-auto mt-12 md:mt-20 z-20 px-4 sm:px-6 block">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[80%] h-[50%] bg-[var(--income-green)]/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
      
      <div style={{ perspective: '2000px' }} className="w-full relative">
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY }}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-[24px] border border-[var(--border-light)] shadow-2xl overflow-hidden bg-[var(--bg-surface)] backdrop-blur-xl group hover:shadow-[0_40px_80px_rgba(39,201,63,0.15)] transition-shadow duration-700 p-2"
        >
            {}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-base)] border-b border-[var(--border-light)] rounded-t-[18px]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <div className="ml-4 flex items-center gap-2 bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-light)] text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase shadow-inner">
                <Sparkles className="w-3 h-3 text-[var(--income-green)]" />
                TrackMyMoney Dashboard
            </div>
            </div>
            
            {}
            <div className="relative w-full aspect-[16/9] rounded-b-[18px] overflow-hidden bg-[#0A0A0A] border-t border-[var(--border-dark)]/50">
                <Image 
                    src="/images/screenshots/dashboard.png"
                    alt="TrackMyMoney Dashboard"
                    fill
                    sizes="(max-width: 1200px) 100vw, 1100px"
                    priority
                    className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-500 will-change-transform"
                />
            </div>
        </motion.div>
      </div>
    </div>
  )
}
