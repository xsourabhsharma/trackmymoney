'use client'

import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function FinalCTA() {
  return (
    <section className="py-[80px] md:py-[120px] bg-[#1C1B19] text-white relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-[700px] mx-auto px-6 text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-bold mb-5 tracking-tight leading-[1.1] font-sans">
            Ready to finally understand your money?
          </h2>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-[500px] mx-auto leading-relaxed">
            Join individuals and freelancers who stopped guessing and started tracking. Takes under 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white text-[#1C1B19] rounded-full text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Get started free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
          >
            Log in to existing account
          </Link>

          <p className="mt-8 text-[13px] text-white/40 font-medium">
            No credit card required · Secure data encryption · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}
