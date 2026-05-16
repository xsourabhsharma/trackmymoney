'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { requestPasswordReset } from '../login/actions'
import { Mail, ArrowLeft, CheckCircle, Loader2, Shield, Lock, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [emailValue, setEmailValue] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await requestPasswordReset(formData)
    setIsPending(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6 py-12 font-sans relative overflow-hidden">
      <ThemeToggle variant="public" className="fixed right-5 top-5 z-30" />
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--income-green)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex justify-center"
        >
          <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tight text-[var(--text-main)] group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-xl group-hover:scale-105 transition-transform duration-300">
               <Image src="/real-logo.png" alt="TrackMyMoney Logo" width={32} height={32} className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity dark:invert" />
            </div>
            <span>Track<span className="text-[var(--text-muted)]">My</span>Money</span>
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {sent ? (
            
            <motion.div 
              key="success"
              initial="hidden" animate="visible" variants={fadeUp}
              className="bg-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-10 text-center shadow-xl shadow-black/5"
            >
              <div className="w-20 h-20 rounded-[24px] bg-[var(--income-green)]/10 flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-[24px] bg-[var(--income-green)]/20 animate-ping opacity-20" />
                <CheckCircle className="w-10 h-10 text-[var(--income-green)] relative z-10" />
              </div>
              <h1 className="text-3xl font-black text-[var(--text-main)] mb-4 tracking-tight">Check your inbox</h1>
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mb-8 font-medium">
                We&apos;ve sent a secure password reset link to <span className="text-[var(--text-main)] font-bold">{emailValue}</span>. 
                Please check your email to continue.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full h-[56px] bg-[var(--text-main)] text-[var(--bg-base)] rounded-2xl text-[15px] font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
                >
                  Back to Log In
                </Link>
                <button
                  onClick={() => { setSent(false); setError(null) }}
                  className="text-[14px] text-[var(--text-muted)] font-bold hover:text-[var(--text-main)] transition-colors py-2"
                >
                  Didn&apos;t get the email? Try again
                </button>
              </div>
            </motion.div>
          ) : (
            
            <motion.div 
              key="form"
              initial="hidden" animate="visible" variants={fadeUp}
              className="bg-[var(--bg-surface)] rounded-[32px] border border-[var(--border-light)] p-10 shadow-xl shadow-black/5"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[11px] font-black uppercase tracking-widest text-blue-600 mb-4">
                   <Lock className="w-3 h-3" /> Security First
                </div>
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-3 tracking-tight">Reset password</h1>
                <p className="text-[15px] text-[var(--text-muted)] leading-relaxed font-medium">
                  Enter your email and we&apos;ll send you instructions to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-2xl p-4 mb-6 text-[14px] font-bold flex items-start gap-3">
                  <Shield className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="peer w-full h-[60px] px-5 pt-5 pb-1 border border-[var(--border-light)] rounded-2xl text-[15px] bg-[var(--bg-base)] text-[var(--text-main)] transition-all focus:outline-none focus:border-[var(--text-main)] focus:ring-1 focus:ring-[var(--text-main)] hover:border-[var(--border-dark)] shadow-inner" 
                    required 
                  />
                  <label 
                    htmlFor="email"
                    className={`absolute left-5 transition-all duration-200 pointer-events-none text-[var(--text-muted)] ${
                      emailFocused || emailValue
                        ? 'text-[11px] top-2 font-bold text-[var(--text-main)] uppercase tracking-wider'
                        : 'text-[15px] top-[18px] font-medium group-hover:text-[var(--text-main)]'
                    }`}
                  >
                    Email Address
                  </label>
                  <Mail className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailFocused ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]/40'}`} />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-[60px] bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-60 rounded-2xl text-[16px] font-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
                >
                  {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Send Instructions</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Log In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-[var(--bg-surface)]/50 rounded-full border border-[var(--border-light)] backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-[var(--income-green)]" /> AI-Powered Finance
          </div>
          
          <div className="flex justify-between items-center w-full text-[11px] font-black text-[var(--text-muted)] tracking-widest uppercase opacity-60">
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            </div>
            <span>© 2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
