'use client'

import { Suspense, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Activity, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthExperienceShell, PublicButton, PublicPanel, Reveal } from '@/components/public'
import { login, signInWithOAuth } from './actions'

function mapAuthError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  if (lower.includes('email not confirmed')) return 'Please verify your email address before logging in.'
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many login attempts. Please wait a moment and try again.'
  }
  if (lower.includes('user not found')) return 'No account found with this email. Please sign up first.'
  if (lower.includes('network')) return 'Network error. Please check your connection and try again.'
  return raw
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function LoginPageContent() {
  const searchParams = useSearchParams()
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState<string | null>(() => {
    const urlError = searchParams.get('error')
    return urlError ? mapAuthError(urlError) : null
  })
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

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
      const result = await login(formData)
      if (result?.error) {
        setError(mapAuthError(result.error))
        setIsPending(false)
      }
    } catch (caught) {
      if (caught instanceof Error && caught.message === 'NEXT_REDIRECT') throw caught
      setError('Invalid email or password. Please try again.')
      setIsPending(false)
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return
    await handleSubmit(new FormData(event.currentTarget))
  }

  return (
    <AuthExperienceShell
      description="Log in to access your AI-powered financial dashboard, upload statements, and track your net worth without noisy spreadsheets."
      eyebrow="Welcome back"
      footer={
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span>TrackMyMoney 2026</span>
          <span>All rights reserved</span>
        </div>
      }
      highlights={[
        { icon: Activity, label: 'One command center for cash flow, subscriptions, and goals' },
        { icon: Shield, label: 'Secure Supabase auth with user-scoped financial data' },
        { icon: Sparkles, label: 'AI Auto-Parse turns statements into reviewed transactions' },
      ]}
      preview={<LoginPreview />}
      title={
        <>
          Understand your money in <span className="text-[var(--public-lime)]">minutes.</span>
        </>
      }
    >
      <Reveal>
        <div className="mb-8">
          <h1 className="text-[2.35rem] font-light leading-tight tracking-normal text-[var(--public-text)]">
            Welcome back
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--public-muted)]">
            Sign in with OAuth or your email and password to continue.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <PublicPanel padding="md" variant="glass">
          <div className="mb-6 grid gap-3">
            <PublicButton
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              fullWidth
              variant="secondary"
              icon={oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              iconPosition="left"
            >
              Continue with Google
            </PublicButton>

            <PublicButton
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              fullWidth
              variant="secondary"
              icon={oauthLoading === 'github' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GithubIcon />}
              iconPosition="left"
            >
              Continue with GitHub
            </PublicButton>
          </div>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-[var(--public-border)]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--public-muted)]">
              Or email
            </span>
            <span className="h-px flex-1 bg-[var(--public-border)]" />
          </div>

          <form onSubmit={handleFormSubmit} className="grid gap-5">
            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-[14px] border border-[var(--public-orange)]/30 bg-[var(--public-orange)]/10 p-3 text-sm font-medium text-[var(--public-orange)]"
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--public-orange)]" />
                    {error}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <FloatingInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={emailValue}
              focused={emailFocused}
              error={emailError}
              autoComplete="email"
              onBlur={(value) => {
                setEmailFocused(false)
                validateEmail(value)
              }}
              onChange={(value) => {
                setEmailValue(value)
                if (emailError) setEmailError(null)
              }}
              onFocus={() => setEmailFocused(true)}
            />

            <div className="relative">
              <FloatingInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={passwordValue}
                focused={passwordFocused}
                autoComplete="current-password"
                onBlur={() => setPasswordFocused(false)}
                onChange={setPasswordValue}
                onFocus={() => setPasswordFocused(true)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[var(--public-muted)] hover:bg-white/[0.06] hover:text-[var(--public-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-orange)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="-mt-2 flex justify-end text-[13px]">
              <Link
                href="/forgot-password"
                className="font-semibold text-[var(--public-text)] underline-offset-4 hover:text-[var(--public-orange)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg)]"
              >
                Forgot password?
              </Link>
            </div>

            <PublicButton type="submit" disabled={isPending} fullWidth size="lg">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log in'}
            </PublicButton>
          </form>
        </PublicPanel>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mt-8 text-center text-[14px] text-[var(--public-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-[var(--public-text)] hover:text-[var(--public-orange)]">
            Sign up for free
          </Link>
        </p>
        <div className="mt-8 flex justify-center gap-6 text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)] lg:hidden">
          <Link href="/privacy" className="hover:text-[var(--public-text)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--public-text)]">
            Terms
          </Link>
        </div>
      </Reveal>
    </AuthExperienceShell>
  )
}

function LoginPreview() {
  return (
    <div aria-hidden="true" className="relative min-h-[230px]">
      <div className="absolute left-1 top-4 h-28 w-28 rounded-full border border-[var(--public-orange)]/20 bg-[var(--public-orange)]/10 blur-2xl" />
      <div className="absolute bottom-2 right-4 h-24 w-24 rounded-full border border-[var(--public-lime)]/20 bg-[var(--public-lime)]/10 blur-2xl" />

      <div className="relative rounded-[22px] border border-[var(--public-border)] bg-black/30 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] [transform:perspective(900px)_rotateX(5deg)_rotateY(-7deg)]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--public-lime)]" />
          </div>
          <span className="rounded-full border border-[var(--public-border)] bg-white/[0.045] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--public-muted)]">
            Live view
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[16px] border border-[var(--public-border)] bg-white/[0.045] p-4">
            <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
              Net worth
            </div>
            <div className="text-xl font-semibold tracking-normal text-[var(--public-text)]">$124,590</div>
          </div>
          <div className="relative overflow-hidden rounded-[16px] border border-[var(--public-lime)]/25 bg-[var(--public-lime)]/10 p-4">
            <TrendingUp className="absolute right-3 top-3 h-8 w-8 text-[var(--public-lime)] opacity-25" />
            <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-lime)]">
              Saved
            </div>
            <div className="text-xl font-semibold tracking-normal text-[var(--public-text)]">$4,230</div>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-[var(--public-border)] bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--public-text)]">Statement reviewed</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--public-lime)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
          <div className="space-y-2">
            <span className="block h-1.5 w-full rounded-full bg-white/10" />
            <span className="block h-1.5 w-8/12 rounded-full bg-[var(--public-orange)]/75" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FloatingInput({
  className,
  error,
  focused,
  id,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  type,
  value,
  autoComplete,
}: {
  autoComplete?: string
  className?: string
  error?: string | null
  focused: boolean
  id: string
  label: string
  name: string
  onBlur: (value: string) => void
  onChange: (value: string) => void
  onFocus: () => void
  type: string
  value: string
}) {
  const lifted = focused || value
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={(event) => onBlur(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`peer h-14 w-full rounded-[14px] border bg-white/[0.045] px-4 pb-1 pt-4 text-[15px] text-[var(--public-text)] shadow-inner transition-all placeholder:text-transparent hover:border-[var(--public-border-strong)] focus:border-[var(--public-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--public-orange)] ${
          error ? 'border-[var(--public-orange)]' : 'border-[var(--public-border)]'
        } ${className ?? ''}`}
        required
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          error ? 'text-[var(--public-orange)]' : 'text-[var(--public-muted)]'
        } ${lifted ? 'top-2 text-[11px] font-bold uppercase tracking-[0.14em]' : 'top-4 text-[15px]'}`}
      >
        {label}
      </label>
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[var(--public-orange)]">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
