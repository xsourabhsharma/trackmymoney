'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updatePassword } from './actions'
import { Key, Lock, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setIsPending(true)
    setError(null)

    try {
      await updatePassword(formData)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grid grid-cols-1 lg:grid-cols-2 font-sans overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-col justify-center px-16 py-20 relative overflow-hidden bg-gradient-to-br from-[#45433A] to-[#2a2824]">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />

        <div className="relative z-10 mb-12">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold uppercase tracking-widest text-[var(--text-inverse)] hover:opacity-90 transition-opacity">
            <div className="w-7 h-7 border-2 border-[var(--text-inverse)] rounded-md flex items-center justify-center">T</div>
            TrackMyMoney
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl border border-white/5">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-[2rem] font-bold text-[var(--text-inverse)] mb-4 leading-tight">Update your credentials</h1>
          <p className="text-lg text-[var(--text-inverse-muted)] mb-8 leading-relaxed">Choose a strong, unique password to keep your financial data safe.</p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-[var(--text-inverse-muted)]">Minimum 8 characters recommended</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Update Password Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-24 py-12 relative h-full">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-1.5">New Password</h2>
            <p className="text-sm text-[var(--text-muted)]">Please enter and confirm your new password.</p>
          </div>

          {error && (
            <div className="bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-xl p-4 mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-12 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/10 transition-all rounded-xl text-[15px] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-12 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] focus:border-[var(--text-main)] focus:ring-2 focus:ring-[var(--text-main)]/10 transition-all rounded-xl text-[15px] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 inline-flex items-center justify-center bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 rounded-full text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </form>

          <div className="mt-auto pt-12 flex justify-between items-center text-[12px] font-medium text-[var(--text-muted)] tracking-wider uppercase">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            </div>
            <span>© TrackMyMoney, 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}
