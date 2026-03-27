'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Eye, EyeOff, Shield, Sparkles, Zap, Lock, ArrowRight, Activity, ChevronDown, Check } from 'lucide-react'
import { signInWithOAuth, signup } from '../login/actions'
import { motion, AnimatePresence } from 'framer-motion'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default function SignUpPage() {
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    await signInWithOAuth(provider)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex font-sans overflow-hidden">
      
      {}
      <div className="hidden lg:flex w-[55%] flex-col justify-between px-16 py-12 relative overflow-hidden bg-[#050505] text-white">
        
        {}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(39,201,63,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        
        {}
        <div className="relative z-20 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-all duration-500 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <Image src="/real-logo.png" alt="TrackMyMoney Logo" width={32} height={32} className="w-8 h-8 drop-shadow-lg invert" />
            </div>
            <span className="text-white drop-shadow-sm font-black">Track<span className="text-white/40 font-medium">My</span>Money</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-[var(--income-green)] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Systems Operational</span>
          </div>
        </div>

        {}
        <div className="relative z-20 w-full max-w-2xl mx-auto my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <h1 className="text-[4rem] font-black text-white leading-[1] tracking-[-0.03em] mb-6">
              Financial clarity,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--income-green)] to-emerald-400">automated.</span>
            </h1>
            <p className="text-xl text-white/50 leading-relaxed font-medium max-w-lg">
              The premium command center for your wealth. Connect accounts, drop receipts, and let AI handle the categorization.
            </p>
          </motion.div>

          {}
          <div className="grid grid-cols-12 gap-5">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               whileHover={{ y: -4, scale: 1.01 }}
               className="col-span-12 md:col-span-8 p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-[28px] backdrop-blur-xl relative overflow-hidden group cursor-default shadow-2xl"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--income-green)]/0 via-[var(--income-green)]/10 to-[var(--income-green)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <div className="w-12 h-12 rounded-2xl bg-[var(--income-green)]/20 flex items-center justify-center text-[var(--income-green)] mb-5 border border-[var(--income-green)]/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Parsing</h3>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  Drop any bank statement or receipt. Our engine extracts merchants, amounts, and auto-categorizes instantly.
                </p>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               whileHover={{ y: -4, scale: 1.01 }}
               className="col-span-12 md:col-span-4 p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[28px] backdrop-blur-xl group cursor-default shadow-2xl flex flex-col justify-between relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-24 h-24 text-blue-400" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5 relative z-10 border border-blue-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">Real-time</h3>
                  <p className="text-white/50 text-[15px] leading-relaxed">Live updates on net worth.</p>
                </div>
             </motion.div>
          </div>
        </div>

        {}
        <div className="relative z-20 flex items-center justify-between w-full border-t border-white/10 pt-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-white/70 shadow-lg relative z-10 hover:z-20 hover:scale-110 transition-transform cursor-pointer">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-[14px] text-white/50 font-medium">Join the community today</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-[12px] font-bold tracking-widest uppercase">
            <Lock className="w-3 h-3" /> Bank-grade encryption
          </div>
        </div>
      </div>

      {}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 relative overflow-y-auto bg-[var(--bg-base)] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] z-10">
        
        {}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--bg-surface-dark)]/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[440px] w-full mx-auto relative z-10">
          
          {}
          <div className="lg:hidden mb-12">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight text-[var(--text-main)]">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-light)] shadow-sm">
                <Image src="/real-logo.png" alt="TrackMyMoney" width={28} height={28} className="w-7 h-7 dark:invert" />
              </div>
              Track<span className="text-[var(--text-muted)] font-medium">My</span>Money
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-[2.25rem] font-black text-[var(--text-main)] mb-3 tracking-tight">Create account</h2>
            <p className="text-[16px] text-[var(--text-muted)] font-medium leading-relaxed">
              Start your journey to financial clarity. No credit card required.
            </p>
          </motion.div>

          {}
          <div className="flex flex-col gap-3.5 mb-8">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full h-[56px] flex items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-dark)] hover:shadow-sm disabled:opacity-60 text-[var(--text-main)] text-[15px] font-bold transition-all active:scale-[0.98] group"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="group-hover:scale-110 transition-transform"><GoogleIcon /></div>}
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="w-full h-[56px] flex items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-dark)] hover:shadow-sm disabled:opacity-60 text-[var(--text-main)] text-[15px] font-bold transition-all active:scale-[0.98] group"
            >
              {oauthLoading === 'github' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="group-hover:scale-110 transition-transform"><GithubIcon /></div>}
              Continue with GitHub
            </button>
          </div>

          {}
          <div className="flex items-center gap-4 my-8">
            <span className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-[var(--border-dark)] to-transparent opacity-50"></span>
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">or sign up with email</span>
            <span className="flex-grow h-[1px] bg-gradient-to-r from-[var(--border-dark)] to-transparent opacity-50"></span>
          </div>

          <SignupFormInner />

          <p className="text-center text-[15px] text-[var(--text-muted)] mt-10 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[var(--text-main)] hover:underline underline-offset-4 decoration-2 decoration-[var(--border-light)] hover:decoration-[var(--text-main)] transition-colors">Log in here</Link>
          </p>

          <div className="mt-12 flex items-center justify-center gap-8 text-[12px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-[var(--border-dark)]" />
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignupFormInner() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

 
  const [nameValue, setNameValue] = useState('')
  const [nameFocused, setNameFocused] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')
  const [confirmFocused, setConfirmFocused] = useState(false)

 
  const [strength, setStrength] = useState(0)
  useEffect(() => {
    let s = 0
    if (passwordValue.length >= 8) s += 25
    if (/[A-Z]/.test(passwordValue)) s += 25
    if (/[0-9]/.test(passwordValue)) s += 25
    if (/[^A-Za-z0-9]/.test(passwordValue)) s += 25
    setStrength(s)
  }, [passwordValue])

  async function handleSubmit(formData: FormData) {
    const pwd = formData.get('password') as string
    const cpwd = formData.get('confirm_password') as string

    if (pwd.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (pwd !== cpwd) {
      setError('Passwords do not match.')
      return
    }

    setIsPending(true)
    setError(null)
    try {
      await signup(formData)
    } catch {
      setError('Signup failed. The email might already be in use.')
      setIsPending(false)
    }
  }

  const inputClasses = "peer w-full h-[60px] px-5 pt-5 pb-1 border border-[var(--border-light)] rounded-2xl text-[15px] font-medium bg-[var(--bg-surface)] text-[var(--text-main)] transition-all focus:outline-none focus:border-[var(--text-main)] focus:ring-1 focus:ring-[var(--text-main)] hover:border-[var(--border-dark)] shadow-sm"
  const labelClasses = (focused: boolean, value: string) => `absolute left-5 transition-all duration-200 pointer-events-none text-[var(--text-muted)] ${
    focused || value
      ? 'text-[11px] top-2.5 font-bold text-[var(--text-main)] uppercase tracking-wider'
      : 'text-[15px] top-[18px] font-medium group-hover:text-[var(--text-main)]'
  }`

  return (
    <form action={handleSubmit} className="space-y-5">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-2xl p-4 text-[14px] font-bold flex items-start gap-3 overflow-hidden shadow-sm"
          >
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="relative group">
        <input 
          id="full_name" 
          name="full_name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          className={inputClasses}
          required 
        />
        <label htmlFor="full_name" className={labelClasses(nameFocused, nameValue)}>
          Full Name
        </label>
      </div>

      {}
      <div className="relative group">
        <input 
          type="email"
          id="email" 
          name="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          className={inputClasses}
          required 
        />
        <label htmlFor="email" className={labelClasses(emailFocused, emailValue)}>
          Email Address
        </label>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="relative group">
          <input 
            type={showPassword ? 'text' : 'password'}
            id="password" 
            name="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className={`${inputClasses} pr-12`}
            required
            minLength={8}
          />
          <label htmlFor="password" className={labelClasses(passwordFocused, passwordValue)}>
            Password
          </label>
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none p-2 rounded-full hover:bg-[var(--bg-base)]"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative group">
          <input 
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirm_password" 
            name="confirm_password"
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            className={`${inputClasses} pr-12`}
            required
            minLength={8}
          />
          <label htmlFor="confirm_password" className={labelClasses(confirmFocused, confirmValue)}>
            Confirm
          </label>
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none p-2 rounded-full hover:bg-[var(--bg-base)]"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {}
      <AnimatePresence>
        {passwordValue.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden px-1"
          >
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-1">
              <span className="text-[var(--text-muted)]">Security Level</span>
              <span className={strength <= 25 ? 'text-[var(--expense-red)]' : strength <= 50 ? 'text-amber-500' : strength <= 75 ? 'text-blue-500' : 'text-[var(--income-green)]'}>
                {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Very Strong'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-full overflow-hidden flex shadow-inner">
              <div className={`h-full transition-all duration-500 rounded-full ${strength <= 25 ? 'bg-[var(--expense-red)] shadow-[0_0_10px_var(--expense-red)]' : strength <= 50 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : strength <= 75 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-[var(--income-green)] shadow-[0_0_10px_var(--income-green)]'}`} style={{ width: `${strength}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="relative group">
        <select
          id="currency"
          name="currency"
          className={`${inputClasses} appearance-none cursor-pointer`}
          defaultValue="INR"
        >
          <option value="USD">🇺🇸 USD ($) US Dollar</option>
          <option value="INR">🇮🇳 INR (₹) Indian Rupee</option>
        </select>
        <label 
          htmlFor="currency"
          className="absolute left-5 text-[11px] top-2.5 font-bold text-[var(--text-main)] uppercase tracking-wider pointer-events-none"
        >
          Primary Currency
        </label>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {}
      <div className="pt-3">
        <label className="flex items-start gap-3.5 text-[14px] text-[var(--text-muted)] cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input type="checkbox" required className="peer appearance-none w-5 h-5 rounded-md border-2 border-[var(--border-light)] checked:bg-[var(--text-main)] checked:border-[var(--text-main)] transition-all cursor-pointer focus:ring-2 focus:ring-[var(--text-main)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]" />
            <Check className="absolute w-3.5 h-3.5 text-[var(--bg-base)] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
          </div>
          <span className="leading-relaxed font-medium">
            I agree to TrackMyMoney's{' '}
            <Link href="/terms" className="text-[var(--text-main)] font-bold hover:underline underline-offset-4 decoration-2 decoration-[var(--border-light)] hover:decoration-[var(--text-main)] transition-all">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[var(--text-main)] font-bold hover:underline underline-offset-4 decoration-2 decoration-[var(--border-light)] hover:decoration-[var(--text-main)] transition-all">Privacy Policy</Link>.
          </span>
        </label>
      </div>

      {}
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-[60px] mt-6 bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-60 rounded-2xl text-[16px] font-black transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer overflow-hidden group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        {isPending ? (
          <Loader2 className="w-6 h-6 animate-spin relative z-10" />
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            Create Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </button>
    </form>
  )
}
