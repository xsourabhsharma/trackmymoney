'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { requestPasswordReset } from '../login/actions'
import { Mail, ArrowLeft, CheckCircle, Loader2, Shield } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--text-main)]">
            <Image src="/logo.svg" alt="TrackMyMoney" width={28} height={28} className="w-7 h-7" />
            Track<span className="text-[var(--text-muted)]">My</span>Money
          </Link>
        </div>

        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {sent ? (
          /* Success state */
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--income-green)]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[var(--income-green)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] mb-3 tracking-tight">Check your email</h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              We sent a password reset link to your email address. The link expires in 1 hour.
            </p>
            <p className="text-[13px] text-[var(--text-muted)]">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSent(false); setError(null) }}
                className="text-[var(--text-main)] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                try again
              </button>.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center justify-center w-full h-12 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              Return to login
            </Link>
          </div>
        ) : (
          /* Form state */
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)] p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2 tracking-tight">Reset your password</h1>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Enter the email address you signed up with and we&apos;ll send you a secure reset link.
              </p>
            </div>

            {error && (
              <div className="bg-[var(--expense-red)]/5 text-[var(--expense-red)] border border-[var(--expense-red)]/15 rounded-xl p-3.5 mb-5 text-sm font-medium flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[13px] font-medium text-[var(--text-main)]">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--bg-base)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/5 transition-all rounded-xl placeholder:text-[var(--text-muted)]/40 text-[15px] text-[var(--text-main)] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 disabled:opacity-60 rounded-full text-sm font-semibold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 text-[12px] text-[var(--text-muted)] justify-center">
              <Shield className="w-3.5 h-3.5 text-[var(--income-green)]" />
              Secure, encrypted link. Expires in 1 hour.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex justify-between items-center text-[12px] font-semibold text-[var(--text-muted)] tracking-widest uppercase">
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </div>
          <span className="opacity-60">© TrackMyMoney 2026</span>
        </div>
      </div>
    </div>
  )
}
