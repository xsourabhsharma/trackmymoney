'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import { signInWithOAuth, signup } from '../login/actions'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  return <SignUpContent searchParamsPromise={searchParams} />
}

function SignUpContent({ searchParamsPromise }: { searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    await signInWithOAuth(provider)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grid grid-cols-1 lg:grid-cols-2 font-sans overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 py-20 relative overflow-hidden bg-[#1C1B19]">
        {/* Ambient glow */}
        <div className="absolute top-[-40%] right-[-30%] w-[70%] h-[70%] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(45,90,61,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-30%] left-[-20%] w-[50%] h-[50%] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

        <div className="relative z-10 mb-12">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
            <Image src="/logo.svg" alt="TrackMyMoney" width={28} height={28} className="w-7 h-7 brightness-200" />
            Track<span className="text-white/50">My</span>Money
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-[2.5rem] font-bold text-white mb-4 leading-tight tracking-tight">
            Take control of your<br />
            <span className="text-[#6BCB77]">finances today</span>
          </h1>
          <p className="text-white/50 text-lg mb-10 leading-relaxed max-w-md">
            Join individuals and freelancers who understand exactly where their money goes.
          </p>

          <div className="flex flex-col gap-4 mb-12">
            {[
              { icon: '🔗', title: 'Upload & auto-parse', desc: 'Drop PDF or CSV statements. AI reads them instantly.' },
              { icon: '⚡', title: 'Smart categorization', desc: 'Transactions sorted, subscriptions detected automatically' },
              { icon: '📊', title: 'Clear insights', desc: 'Budgets, goals, and spending trends in one dashboard' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">{item.title}</div>
                  <div className="text-white/40 text-[13px] leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini dashboard preview */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex gap-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
              <span className="w-2 h-2 rounded-full bg-[#FFD93D]" />
              <span className="w-2 h-2 rounded-full bg-[#6BCB77]" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-sm tabular-nums">₹1,24,590</div>
                <div className="text-white/30 text-[11px] uppercase font-semibold tracking-wider mt-0.5">Balance</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[#6BCB77] font-bold text-sm tabular-nums">₹70,750</div>
                <div className="text-white/30 text-[11px] uppercase font-semibold tracking-wider mt-0.5">Income</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-[#FF6B6B]/80 font-bold text-sm tabular-nums">₹29,329</div>
                <div className="text-white/30 text-[11px] uppercase font-semibold tracking-wider mt-0.5">Expenses</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: '🛒', name: 'Whole Foods Market', amount: '-₹4,280', neg: true },
                { icon: '💼', name: 'Client Payment', amount: '+₹42,250', neg: false },
              ].map((tx, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-2.5 text-[11px]">
                  <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[12px]">{tx.icon}</span>
                  <span className="flex-grow text-white/70 font-medium truncate">{tx.name}</span>
                  <span className={`font-bold ${tx.neg ? 'text-[#FF6B6B]/80' : 'text-[#6BCB77]'}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-10 relative overflow-y-auto max-h-screen">
        <div className="max-w-[440px] w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--text-main)]">
              <Image src="/logo.svg" alt="TrackMyMoney" width={28} height={28} className="w-7 h-7" />
              Track<span className="text-[var(--text-muted)]">My</span>Money
            </Link>
          </div>

          <div className="mb-7">
            <h2 className="text-[1.75rem] font-bold text-[var(--text-main)] mb-2 tracking-tight">Create your account</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">Get started in under 2 minutes. No credit card needed.</p>
          </div>

          {/* Social signup first — fastest path */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="h-11 flex items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] disabled:opacity-60 text-[var(--text-main)] text-sm font-medium transition-all cursor-pointer"
            >
              {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="h-11 flex items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] hover:bg-[var(--bg-surface)] disabled:opacity-60 text-[var(--text-main)] text-sm font-medium transition-all cursor-pointer"
            >
              {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon />}
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-light)]" /></div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-base)] px-3 text-[11px] uppercase font-semibold tracking-widest text-[var(--text-muted)]">or sign up with email</span>
            </div>
          </div>

          <SignupFormInner />

          {/* Trust badges */}
          <div className="flex flex-col gap-2 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] mt-6">
            {[
              'We never sell your data',
              'Delete your account and export data anytime',
              'Bank-level encryption for your finances',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-[12px] text-[var(--text-muted)]">
                <Check className="w-3.5 h-3.5 text-[var(--income-green)] shrink-0" />
                {text}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-7">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[var(--text-main)] hover:underline underline-offset-2">Log in</Link>
          </p>

          <div className="mt-10 flex justify-between items-center text-[12px] font-semibold text-[var(--text-muted)] tracking-widest uppercase">
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            </div>
            <span className="opacity-60">© TrackMyMoney 2026</span>
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

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[var(--expense-red)]/5 text-[var(--expense-red)] border border-[var(--expense-red)]/15 rounded-xl p-3.5 text-sm font-medium flex items-start gap-2">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-[13px] font-medium text-[var(--text-main)]">Full name</label>
        <input
          id="full_name"
          name="full_name"
          placeholder="Alex Sharma"
          className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl placeholder:text-[var(--text-muted)]/40 text-[15px] text-[var(--text-main)] outline-none"
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[13px] font-medium text-[var(--text-main)]">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl placeholder:text-[var(--text-muted)]/40 text-[15px] text-[var(--text-main)] outline-none"
          required
        />
      </div>

      {/* Password + Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-[var(--text-main)]">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              className="w-full px-4 py-3 pr-11 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl placeholder:text-[var(--text-muted)]/40 text-[15px] text-[var(--text-main)] outline-none"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm_password" className="text-[13px] font-medium text-[var(--text-main)]">Confirm password</label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 pr-11 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl placeholder:text-[var(--text-muted)]/40 text-[15px] text-[var(--text-main)] outline-none"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-1.5">
        <label htmlFor="currency" className="text-[13px] font-medium text-[var(--text-main)]">Primary currency</label>
        <div className="relative group">
          <select
            id="currency"
            name="currency"
            className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl text-[15px] text-[var(--text-main)] appearance-none cursor-pointer outline-none"
            defaultValue="INR"
          >
            <option value="INR">🇮🇳 INR (₹) Indian Rupee</option>
            <option value="USD">🇺🇸 USD ($) US Dollar</option>
            <option value="EUR">🇪🇺 EUR (€) Euro</option>
            <option value="GBP">🇬🇧 GBP (£) British Pound</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L1 3h10z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Consent */}
      <div className="pt-1">
        <label className="flex items-start gap-3 text-[12px] text-[var(--text-muted)] cursor-pointer group leading-relaxed">
          <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-[var(--border-light)] text-[var(--text-main)] focus:ring-0 cursor-pointer accent-[var(--text-main)]" />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="text-[var(--text-main)] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[var(--text-main)] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">Privacy Policy</Link>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 mt-2 bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-60 rounded-full text-sm font-semibold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
      </button>
    </form>
  )
}
