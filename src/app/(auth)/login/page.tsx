'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Eye, EyeOff, Sparkles, Activity, Shield, TrendingUp, AlertCircle } from 'lucide-react'
import { signInWithOAuth, login } from './actions'
import { motion, AnimatePresence } from 'framer-motion'

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
 
  const [emailFocused, setEmailFocused] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

 
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(mapAuthError(urlError))
    }
  }, [searchParams])

  function mapAuthError(raw: string): string {
    const lower = raw.toLowerCase()
    if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) return 'Invalid email or password. Please check your credentials and try again.'
    if (lower.includes('email not confirmed')) return 'Please check your inbox and verify your email address before logging in.'
    if (lower.includes('rate limit') || lower.includes('too many requests')) return 'Too many login attempts. Please wait a moment and try again.'
    if (lower.includes('user not found')) return 'No account found with this email. Please sign up first.'
    if (lower.includes('network')) return 'Network error. Please check your connection and try again.'
    return raw
  }

  function validateEmail(email: string): boolean {
    if (!email) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError(null)
    return true
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    await signInWithOAuth(provider)
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setEmailError(null)

    const email = formData.get('email') as string
    if (!validateEmail(email)) return
    if (!formData.get('password')) {
      setError('Please enter your password.')
      return
    }

    setIsPending(true)
    try {
      await login(formData)
    } catch {
      setError('Invalid email or password. Please try again.')
      setIsPending(false)
    }
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans selection:bg-[var(--income-green)] selection:text-white">
      
      {}
      <div className="relative flex flex-col justify-between px-8 lg:px-16 py-12 lg:py-16 min-h-[auto] lg:min-h-screen overflow-hidden bg-[#0A0A0A] text-white">
        {}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--income-green)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        {}
        <div className="relative z-10 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md group-hover:scale-105 transition-transform duration-300 overflow-hidden">
               <Image src="/real-logo.png" alt="TrackMyMoney Logo" width={28} height={28} className="w-7 h-7 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-md invert" />
            </div>
            <span className="text-white drop-shadow-sm">Track<span className="text-white/50">My</span>Money</span>
          </Link>
          <div className="px-3 py-1 bg-[var(--income-green)]/10 border border-[var(--income-green)]/20 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-[var(--income-green)] backdrop-blur-md shadow-[0_0_15px_rgba(39,201,63,0.15)]">
            Beta
          </div>
        </div>

        {}
        <div className="relative z-10 w-full max-w-[500px] mt-16 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold tracking-wide text-white/80 mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" /> Welcome back
            </div>
            <h1 className="text-4xl lg:text-[3rem] font-black mb-6 leading-[1.1] tracking-[-0.03em] text-balance">
              Understand your money in minutes.
            </h1>
            <p className="text-lg text-white/60 mb-10 leading-relaxed font-medium">
              Log in to access your AI-powered financial dashboard, upload new statements, and track your net worth.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {[
              { icon: Activity, text: 'Track income, expenses, and subscriptions' },
              { icon: Shield, text: 'Bank-grade secure data storage' },
              { icon: Sparkles, text: 'AI Auto-Parse for statements and receipts' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-[15px] text-white/70 font-medium">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--income-green)] backdrop-blur-sm">
                  <item.icon className="w-4 h-4" />
                </div>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:block relative z-10 w-full max-w-[500px] bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] mt-12 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Net Worth</div>
              <div className="text-xl font-bold tracking-tight">₹1,24,590</div>
            </div>
            <div className="p-4 bg-[var(--income-green)]/10 rounded-xl border border-[var(--income-green)]/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-20"><TrendingUp className="w-8 h-8 text-[var(--income-green)]" /></div>
              <div className="text-[10px] text-[var(--income-green)] uppercase tracking-widest font-bold mb-1">Monthly Saved</div>
              <div className="text-xl font-bold tracking-tight text-white">₹42,300</div>
            </div>
          </div>
        </motion.div>

        {}
        <div className="relative z-10 hidden lg:flex items-center gap-6 text-[13px] text-white/40 font-medium">
          <span>© TrackMyMoney 2026</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>All rights reserved</span>
        </div>
      </div>

      {}
      <div className="flex flex-col justify-center bg-[var(--bg-base)] p-6 sm:p-8 lg:p-16 relative h-full">
        
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)]/50 to-transparent pointer-events-none" />

        <div className="w-full max-w-[440px] mx-auto relative z-10">
          
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4 }}
            className="mb-8 text-center lg:text-left"
          >
            <h2 className="text-[2rem] md:text-[2.25rem] font-bold text-[var(--text-main)] mb-2 tracking-[-0.02em]">Welcome back</h2>
            <p className="text-[15px] text-[var(--text-muted)]">Please enter your details to sign in.</p>
          </motion.div>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[24px] p-6 sm:p-8 shadow-sm"
          >
            {}
            <div className="flex flex-col gap-3 mb-6">
              <button 
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full inline-flex items-center justify-center p-[14px_24px] rounded-xl text-[14px] font-semibold transition-all bg-[var(--bg-base)] border border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--border-dark)] hover:shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 group"
              >
                {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <div className="group-hover:scale-110 transition-transform"><GoogleIcon /></div>}
                Continue with Google
              </button>

              <button 
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={!!oauthLoading}
                className="w-full inline-flex items-center justify-center p-[14px_24px] rounded-xl text-[14px] font-semibold transition-all bg-[var(--bg-base)] border border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--border-dark)] hover:shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 group"
              >
                {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <div className="group-hover:scale-110 transition-transform"><GithubIcon /></div>}
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <span className="flex-grow h-[1px] bg-[var(--border-light)]"></span>
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Or email</span>
              <span className="flex-grow h-[1px] bg-[var(--border-light)]"></span>
            </div>

            {}
            <form action={handleSubmit} className="flex flex-col gap-5">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-xl p-3 text-sm font-medium flex items-center gap-2 overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--expense-red)] shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {}
              <div className="relative group">
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={emailValue}
                  onChange={(e) => { setEmailValue(e.target.value); if (emailError) setEmailError(null) }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={(e) => { setEmailFocused(false); validateEmail(e.target.value) }}
                  className={`peer w-full h-[56px] px-4 pt-4 pb-1 border rounded-xl text-[15px] bg-[var(--bg-base)] text-[var(--text-main)] transition-all focus:outline-none focus:ring-1 hover:border-[var(--border-dark)] shadow-inner ${
                    emailError 
                      ? 'border-[var(--expense-red)] focus:border-[var(--expense-red)] focus:ring-[var(--expense-red)]' 
                      : 'border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-[var(--text-main)]'
                  }`} 
                  required 
                />
                <label 
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    emailError ? 'text-[var(--expense-red)]' : 'text-[var(--text-muted)]'
                  } ${
                    emailFocused || emailValue
                      ? 'text-[11px] top-2 font-medium text-[var(--text-main)]'
                      : 'text-[15px] top-4 group-hover:text-[var(--text-main)]'
                  }`}
                >
                  Email address
                </label>
                {emailError && (
                  <p className="mt-1.5 text-[12px] font-medium text-[var(--expense-red)] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailError}
                  </p>
                )}
              </div>

              {}
              <div className="relative group">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  name="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="peer w-full h-[56px] px-4 pt-4 pb-1 pr-12 border border-[var(--border-light)] rounded-xl text-[15px] bg-[var(--bg-base)] text-[var(--text-main)] transition-all focus:outline-none focus:border-[var(--text-main)] focus:ring-1 focus:ring-[var(--text-main)] hover:border-[var(--border-dark)] shadow-inner" 
                  required
                />
                <label 
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none text-[var(--text-muted)] ${
                    passwordFocused || passwordValue
                      ? 'text-[11px] top-2 font-medium text-[var(--text-main)]'
                      : 'text-[15px] top-4 group-hover:text-[var(--text-main)]'
                  }`}
                >
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-between items-center mt-1 mb-2">
                <label className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] cursor-pointer select-none font-medium hover:text-[var(--text-main)] transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border-light)] accent-[var(--text-main)]" /> 
                  Remember for 30 days
                </label>
                <Link href="/forgot-password" className="text-[13px] text-[var(--text-main)] font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full inline-flex items-center justify-center h-[56px] rounded-xl text-[15px] font-bold transition-all bg-[var(--text-main)] text-[var(--bg-base)] hover:bg-[var(--text-main)]/90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
              </button>
            </form>
          </motion.div>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center text-[14px] text-[var(--text-muted)] mt-8"
          >
            Don&apos;t have an account? <Link href="/signup" className="text-[var(--text-main)] font-bold hover:underline underline-offset-4 decoration-2 decoration-[var(--border-light)] hover:decoration-[var(--text-main)] transition-colors">Sign up for free</Link>
          </motion.p>
        </div>

        {}
        <div className="lg:hidden mt-12 flex justify-center gap-6 text-[12px] font-medium text-[var(--text-muted)]">
          <Link href="/privacy" className="hover:text-[var(--text-main)]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--text-main)]">Terms</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}
