'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthExperienceShell, PublicButton, PublicPanel, Reveal } from '@/components/public'
import { signInWithOAuth, signup } from '../login/actions'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
    <AuthExperienceShell
      description="The premium command center for your money. Add transactions, review receipts, set budgets, and let AI handle the tedious categorization."
      eyebrow="Start free"
      footer={
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            Private by design
          </span>
          <span>No credit card</span>
        </div>
      }
      highlights={[
        { icon: Sparkles, label: 'Parse receipts and statements without manual spreadsheet cleanup' },
        { icon: Activity, label: 'Track budgets, subscriptions, goals, and net worth in one place' },
        { icon: Lock, label: 'Private, account-scoped workspace for financial records' },
      ]}
      preview={<SignupPreview />}
      statusLabel="Systems operational"
      title={
        <>
          Financial clarity, <span className="text-[var(--public-lime)]">automated.</span>
        </>
      }
    >
      <Reveal>
        <div className="mb-8">
          <h1 className="text-[2.35rem] font-light leading-tight tracking-normal text-[var(--public-text)]">
            Create account
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--public-muted)]">
            Use OAuth for speed or create a secure email account. No credit card required.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <PublicPanel padding="md" variant="glass">
          <div className="mb-7 grid gap-3">
            <PublicButton
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              fullWidth
              variant="secondary"
              icon={oauthLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
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
              icon={oauthLoading === 'github' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GithubIcon />}
              iconPosition="left"
            >
              Continue with GitHub
            </PublicButton>
          </div>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-[var(--public-border)]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--public-muted)]">
              Or sign up with email
            </span>
            <span className="h-px flex-1 bg-[var(--public-border)]" />
          </div>

          <SignupFormInner />
        </PublicPanel>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mt-8 text-center text-[15px] text-[var(--public-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[var(--public-text)] hover:text-[var(--public-orange)]">
            Log in here
          </Link>
        </p>
        <div className="mt-8 flex items-center justify-center gap-7 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
          <Link href="/privacy" className="hover:text-[var(--public-text)]">
            Privacy
          </Link>
          <span className="h-1 w-1 rounded-full bg-[var(--public-border-strong)]" />
          <Link href="/terms" className="hover:text-[var(--public-text)]">
            Terms
          </Link>
        </div>
      </Reveal>
    </AuthExperienceShell>
  )
}

function SignupFormInner() {
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmValue, setConfirmValue] = useState('')
  const [confirmFocused, setConfirmFocused] = useState(false)
  const strength = getPasswordStrength(passwordValue)
  const requirements = getPasswordRequirements(passwordValue)

  function validateEmail(email: string): boolean {
    if (!email) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError(null)
    return true
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setEmailError(null)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    const acceptedTerms = formData.get('terms_consent') === 'accepted'

    if (!validateEmail(email)) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!acceptedTerms) {
      setError('Please agree to the Terms and Privacy Policy to create an account.')
      return
    }

    setIsPending(true)
    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } catch (caught) {
      if (caught instanceof Error && caught.message === 'NEXT_REDIRECT') throw caught
      setError('Signup failed. The email might already be in use.')
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-5">
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-[16px] border border-[var(--public-orange)]/30 bg-[var(--public-orange)]/10 p-4 text-[14px] font-semibold text-[var(--public-orange)]"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="leading-6">{error}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SignupFloatingInput
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="relative">
          <SignupFloatingInput
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={passwordValue}
            focused={passwordFocused}
            minLength={8}
            autoComplete="new-password"
            ariaDescribedBy={passwordValue.length > 0 ? 'signup-password-strength' : 'signup-password-help'}
            className="pr-12"
            onBlur={() => setPasswordFocused(false)}
            onChange={setPasswordValue}
            onFocus={() => setPasswordFocused(true)}
          />
          <PasswordToggle
            visible={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            label={showPassword ? 'Hide password' : 'Show password'}
          />
        </div>

        <div className="relative">
          <SignupFloatingInput
            id="confirm_password"
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm"
            value={confirmValue}
            focused={confirmFocused}
            minLength={8}
            autoComplete="new-password"
            className="pr-12"
            onBlur={() => setConfirmFocused(false)}
            onChange={setConfirmValue}
            onFocus={() => setConfirmFocused(true)}
          />
          <PasswordToggle
            visible={showConfirmPassword}
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          />
        </div>
      </div>

      <AnimatePresence>
        {passwordValue.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-1"
            id="signup-password-strength"
            aria-live="polite"
          >
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
              <span className="text-[var(--public-muted)]">Password strength</span>
              <span className={strengthClass(strength)}>{strengthLabel(strength)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full border border-[var(--public-border)] bg-white/[0.045]">
              <div className={`h-full rounded-full transition-all duration-500 ${strengthBarClass(strength)}`} style={{ width: `${strength}%` }} />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-medium text-[var(--public-muted)]">
              {requirements.map(({ label, met }) => (
                <li key={label} className={met ? 'flex items-center gap-1.5 text-[var(--public-lime)]' : 'flex items-center gap-1.5'}>
                  {met ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-[var(--public-border-strong)]" aria-hidden="true" />
                  )}
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p id="signup-password-help" className="-mt-2 px-1 text-[12px] leading-5 text-[var(--public-muted)]">
        Use 8+ characters with an uppercase letter, a number, and a symbol for a stronger password.
      </p>

      <label htmlFor="terms_consent" className="flex cursor-pointer items-start gap-3.5 pt-1 text-[14px] leading-6 text-[var(--public-muted)]">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            id="terms_consent"
            name="terms_consent"
            type="checkbox"
            value="accepted"
            required
            className="peer h-5 w-5 appearance-none rounded-md border-2 border-[var(--public-border)] transition-all checked:border-[var(--public-orange)] checked:bg-[var(--public-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-orange)]"
          />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
        </span>
        <span>
          I agree to TrackMyMoney&apos;s{' '}
          <Link href="/terms" className="font-bold text-[var(--public-text)] hover:text-[var(--public-orange)]">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-bold text-[var(--public-text)] hover:text-[var(--public-orange)]">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <PublicButton type="submit" disabled={isPending} fullWidth size="lg" showArrow={!isPending}>
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
      </PublicButton>
    </form>
  )
}

function SignupPreview() {
  return (
    <div aria-hidden="true" className="relative min-h-[250px]">
      <div className="absolute right-8 top-0 h-24 w-24 rounded-full border border-[var(--public-orange)]/20 bg-[var(--public-orange)]/10 blur-2xl" />
      <div className="absolute bottom-0 left-4 h-28 w-28 rounded-full border border-[var(--public-lime)]/20 bg-[var(--public-lime)]/10 blur-2xl" />

      <div className="relative rounded-[24px] border border-[var(--public-border)] bg-black/25 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] [transform:perspective(900px)_rotateX(6deg)_rotateY(7deg)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--public-muted)]">
            New workspace
          </span>
          <span className="rounded-full border border-[var(--public-lime)]/25 bg-[var(--public-lime)]/10 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--public-lime)]">
            Protected
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 rounded-[18px] border border-[var(--public-border)] bg-white/[0.045] p-4">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--public-lime)]/25 bg-[var(--public-lime)]/10 text-[var(--public-lime)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--public-text)]">AI parsing</h3>
            <p className="mt-2 text-[12px] leading-5 text-[var(--public-muted)]">
              Receipts and statements become categorized transactions.
            </p>
          </div>
          <div className="col-span-5 rounded-[18px] border border-[var(--public-orange)]/25 bg-[var(--public-orange)]/10 p-4">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--public-orange)]/25 bg-[var(--public-orange)]/10 text-[var(--public-orange)]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--public-text)]">Realtime</h3>
            <p className="mt-2 text-[12px] leading-5 text-[var(--public-muted)]">Budgets and goals stay current.</p>
          </div>
          <div className="col-span-12 rounded-[18px] border border-[var(--public-border)] bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--public-text)]">Setup checklist</span>
              <span className="text-[var(--public-orange)]">3 min</span>
            </div>
            <div className="grid gap-2">
              {['Connect account', 'Import statement', 'Review insights'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[12px] text-[var(--public-muted)]">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--public-lime)] text-black">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignupFloatingInput({
  className,
  focused,
  id,
  label,
  minLength,
  name,
  onBlur,
  onChange,
  onFocus,
  type = 'text',
  value,
  ariaDescribedBy,
  autoComplete,
  error,
}: {
  ariaDescribedBy?: string
  autoComplete?: string
  className?: string
  error?: string | null
  focused: boolean
  id: string
  label: string
  minLength?: number
  name: string
  onBlur: (value: string) => void
  onChange: (value: string) => void
  onFocus: () => void
  type?: string
  value: string
}) {
  const lifted = focused || value
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={(event) => onBlur(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`h-[60px] w-full rounded-[16px] border bg-white/[0.045] px-5 pb-1 pt-5 text-[15px] font-medium text-[var(--public-text)] shadow-inner transition-all hover:border-[var(--public-border-strong)] focus:border-[var(--public-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--public-orange)] ${
          error ? 'border-[var(--public-orange)]' : 'border-[var(--public-border)]'
        } ${className ?? ''}`}
        required
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-5 transition-all duration-200 ${
          lifted
            ? 'top-2.5 text-[11px] font-bold uppercase tracking-[0.14em]'
            : 'top-[18px] text-[15px]'
        } ${error ? 'text-[var(--public-orange)]' : 'text-[var(--public-muted)]'}`}
      >
        {label}
      </label>
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[var(--public-orange)]">
          <Shield className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

function PasswordToggle({
  label,
  onClick,
  visible,
}: {
  label: string
  onClick: () => void
  visible: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[var(--public-muted)] hover:bg-white/[0.06] hover:text-[var(--public-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-orange)]"
    >
      {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  )
}

function strengthLabel(strength: number) {
  if (strength <= 25) return 'Weak'
  if (strength <= 50) return 'Fair'
  if (strength <= 75) return 'Good'
  return 'Very Strong'
}

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score += 25
  if (/[A-Z]/.test(password)) score += 25
  if (/[0-9]/.test(password)) score += 25
  if (/[^A-Za-z0-9]/.test(password)) score += 25
  return score
}

function getPasswordRequirements(password: string) {
  return [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) },
  ]
}

function strengthClass(strength: number) {
  if (strength <= 25) return 'text-[var(--public-orange)]'
  if (strength <= 50) return 'text-amber-400'
  if (strength <= 75) return 'text-sky-300'
  return 'text-[var(--public-lime)]'
}

function strengthBarClass(strength: number) {
  if (strength <= 25) return 'bg-[var(--public-orange)]'
  if (strength <= 50) return 'bg-amber-400'
  if (strength <= 75) return 'bg-sky-300'
  return 'bg-[var(--public-lime)]'
}
