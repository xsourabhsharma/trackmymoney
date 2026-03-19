'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { signInWithOAuth, login } from './actions'

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

export default function LoginPage() {
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    await signInWithOAuth(provider)
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    try {
      await login(formData)
    } catch {
      setError('Invalid email or password.')
      setIsPending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans">
      {/* Left Panel - Branding */}
      <div className="relative flex flex-col justify-center px-8 lg:px-12 py-12 lg:py-16 min-h-[auto] lg:min-h-screen overflow-hidden bg-gradient-to-br from-[var(--bg-surface-dark)] to-[#2a2824]">
        {/* Background Gradients */}
        <div className="absolute top-[-50%] right-[-50%] w-full h-full rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)' }}></div>

        {/* Env Label */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 px-2.5 py-1 bg-white/10 rounded-full text-[0.625rem] font-medium text-[var(--text-inverse-muted)] uppercase tracking-[0.05em]">
          Beta
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold uppercase tracking-[0.05em] text-[var(--text-inverse)] mb-8 lg:mb-12 relative z-10 w-fit">
          <div className="w-[28px] h-[28px] border-2 border-[var(--text-inverse)] rounded-md flex-shrink-0"></div>
          TrackMyMoney
        </Link>

        <div className="relative z-10 w-full max-w-[500px]">
          <h1 className="text-3xl lg:text-[2rem] font-bold text-[var(--text-inverse)] mb-6 leading-tight tracking-tight">
            Understand your money in minutes, not months
          </h1>
          
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3 text-[0.9375rem] text-[var(--text-inverse-muted)]">
              <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[0.625rem] text-[var(--text-inverse)]">✓</span>
              Track income, expenses, and subscriptions
            </div>
            <div className="flex items-center gap-3 text-[0.9375rem] text-[var(--text-inverse-muted)]">
              <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[0.625rem] text-[var(--text-inverse)]">✓</span>
              Set budgets, goals, and manage debts
            </div>
            <div className="flex items-center gap-3 text-[0.9375rem] text-[var(--text-inverse-muted)]">
              <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[0.625rem] text-[var(--text-inverse)]">✓</span>
              AI Auto-Parse for statements and receipts
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="hidden lg:block bg-[var(--bg-base)] rounded-[24px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] opacity-95 relative z-10 w-full">
            <div className="flex gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B]"></span>
              <span className="w-2 h-2 rounded-full bg-[#FFD93D]"></span>
              <span className="w-2 h-2 rounded-full bg-[#6BCB77]"></span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
                <div className="text-[0.875rem] font-semibold">$124,590</div>
                <div className="text-[0.5rem] text-[var(--text-muted)] uppercase">Balance</div>
              </div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
                <div className="text-[0.875rem] font-semibold text-[var(--income-green)]">$8,450</div>
                <div className="text-[0.5rem] text-[var(--text-muted)] uppercase">Income</div>
              </div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
                <div className="text-[0.875rem] font-semibold text-[var(--expense-red)]">$3,240</div>
                <div className="text-[0.5rem] text-[var(--text-muted)] uppercase">Expenses</div>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] rounded-lg p-2 mb-2">
              <div className="text-[0.5rem] font-semibold text-[var(--text-muted)] uppercase mb-1">Recent Transactions</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-[0.625rem] p-1 bg-[var(--bg-base)] rounded">
                  <span className="w-4 h-4 bg-[var(--bg-surface)] rounded flex items-center justify-center text-[0.5rem]">🏪</span>
                  <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">Whole Foods Market</span>
                  <span className="font-medium text-[var(--expense-red)]">-$142</span>
                </div>
                <div className="flex items-center gap-1 text-[0.625rem] p-1 bg-[var(--bg-base)] rounded">
                  <span className="w-4 h-4 bg-[var(--bg-surface)] rounded flex items-center justify-center text-[0.5rem]">💼</span>
                  <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">Acme Corp Salary</span>
                  <span className="font-medium text-[var(--income-green)]">+$4,225</span>
                </div>
                <div className="flex items-center gap-1 text-[0.625rem] p-1 bg-[var(--bg-base)] rounded">
                  <span className="w-4 h-4 bg-[var(--bg-surface)] rounded flex items-center justify-center text-[0.5rem]">☕</span>
                  <span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">Sightglass Coffee</span>
                  <span className="font-medium text-[var(--expense-red)]">-$6.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col justify-center bg-[var(--bg-base)] p-8 lg:p-12 relative h-full">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-6">
            <h2 className="text-[1.75rem] font-bold text-[var(--text-main)] mb-2 tracking-tight">Log in to TrackMyMoney</h2>
            <p className="text-[0.9375rem] text-[var(--text-muted)]">Welcome back, let&apos;s get you to your dashboard.</p>
          </div>

          <form action={handleSubmit} className="mb-6">
            {error && (
              <div className="mb-4 bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-lg p-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[0.8125rem] font-medium mb-2 text-[var(--text-main)]" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                className="w-full p-[12px_16px] border border-[var(--border-light)] rounded-lg text-[0.9375rem] bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] transition-all focus:outline-none focus:border-[var(--text-main)] focus:ring-[3px] focus:ring-[var(--text-main)]/10" 
                placeholder="Enter your email"
                required 
              />       
            </div>

            <div className="mb-4">
              <label className="block text-[0.8125rem] font-medium mb-2 text-[var(--text-main)]" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  name="password"
                  className="w-full p-[12px_16px] border border-[var(--border-light)] rounded-lg text-[0.9375rem] bg-[var(--bg-base)] text-[var(--text-main)] placeholder-[var(--text-muted)] transition-all focus:outline-none focus:border-[var(--text-main)] focus:ring-[3px] focus:ring-[var(--text-main)]/10 pr-12" 
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2 text-[0.8125rem] text-[var(--text-muted)] cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 accent-[var(--accent)]" /> 
                Remember me
              </label>
              <Link href="/forgot-password" className="text-[0.8125rem] text-[var(--text-main)] font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full inline-flex items-center justify-center p-[14px_24px] rounded-full text-[0.9375rem] font-medium transition-all bg-[var(--text-main)] text-[var(--bg-base)] hover:bg-[var(--bg-surface-dark)] disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-grow h-[1px] bg-[var(--border-light)]"></span>
            <span className="text-[0.75rem] text-[var(--text-muted)] uppercase tracking-[0.05em]">or continue with</span>
            <span className="flex-grow h-[1px] bg-[var(--border-light)]"></span>
          </div>

          <button 
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            className="w-full inline-flex items-center justify-center p-[14px_24px] rounded-full text-[0.9375rem] font-medium transition-all bg-[var(--bg-base)] border border-[var(--border-light)] text-[var(--text-main)] mb-3 hover:bg-[var(--bg-surface)] hover:border-[var(--border-dark)] disabled:opacity-70"
          >
            {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <button 
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={!!oauthLoading}
            className="w-full inline-flex items-center justify-center p-[14px_24px] rounded-full text-[0.9375rem] font-medium transition-all bg-[var(--bg-base)] border border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-dark)] disabled:opacity-70"
          >
            {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <GithubIcon />}
            Continue with GitHub
          </button>

          <p className="text-center text-[0.875rem] text-[var(--text-muted)] mt-6">
            New here? <Link href="/signup" className="text-[var(--text-main)] font-medium hover:underline">Create an account</Link>
          </p>
        </div>

        {/* Footer */}
        <div className="lg:absolute lg:bottom-6 lg:left-12 lg:right-12 mt-8 lg:mt-0 flex flex-col lg:flex-row justify-between items-center gap-2 text-[0.75rem] text-[var(--text-muted)]">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[var(--text-main)]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)]">Terms</Link>
          </div>
          <span>© TrackMyMoney, 2026</span>
        </div>
      </div>
    </div>
  )
}
