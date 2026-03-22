'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Smartphone, Monitor, Loader2, Check } from 'lucide-react'
import { updateUserPasswordAction } from '@/app/dashboard/settings/actions'

export function SecuritySettingsSection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  async function handlePasswordChange() {
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }
    setIsPending(true)
    try {
      await updateUserPasswordAction(password)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setIsChangingPassword(false)
        setPassword('')
      }, 3000)
    } catch (err) {
      console.error(err)
      alert('Failed to update password. You may need to sign in again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6 h-full">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--accent)]" /> Security
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* Change Password Block */}
        {!isChangingPassword ? (
          <div className="flex items-center justify-between py-2 group cursor-pointer hover:bg-[var(--bg-surface)] px-2 -mx-2 rounded-xl transition-all">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight">Change Password</span>
              <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Update your node access key</span>
            </div>
            <Button 
              onClick={() => setIsChangingPassword(true)}
              variant="ghost" 
              className="h-8 px-3 rounded-full text-[11px] font-bold uppercase tracking-widest border border-[var(--border-light)] hover:bg-white shadow-sm transition-all"
            >
              Update
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl flex flex-col gap-3 -mx-2">
            <span className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight">New Password</span>
            <div className="flex gap-2">
              <Input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password..."
                className="bg-[var(--bg-base)] border-[var(--border-light)] text-[13px] font-medium rounded-xl h-9"
              />
              <Button 
                onClick={handlePasswordChange}
                disabled={isPending || isSuccess}
                className={`h-9 px-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all ${
                  isSuccess ? 'bg-[var(--income-green)] text-white hover:bg-[var(--income-green)]' : 'bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90'
                }`}
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSuccess ? <Check className="w-3.5 h-3.5" /> : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-2 group cursor-pointer hover:bg-[var(--bg-surface)] px-2 -mx-2 rounded-xl transition-all border-t border-[var(--border-light)]/50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight">Two-Factor Auth</span>
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Biometric / OTP Verification</span>
          </div>
          <button 
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 shadow-sm ${twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 group cursor-pointer hover:bg-[var(--bg-surface)] px-2 -mx-2 rounded-xl transition-all border-t border-[var(--border-light)]/50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight">Login Alerts</span>
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Push notification on new connection</span>
          </div>
          <button 
            onClick={() => setLoginAlerts(!loginAlerts)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 shadow-sm ${loginAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${loginAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="pt-4 border-t border-[var(--border-light)]">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 block px-1">Recent Sessions</span>
          <div className="flex flex-col gap-2">
            {[
              { device: 'Current Session (Web)', meta: 'Active now', current: true, icon: <Monitor className="w-4 h-4" /> },
              { device: 'Mobile App Node', meta: 'Connected 2 hours ago', current: false, icon: <Smartphone className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]/50 group hover:bg-white transition-all cursor-default">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-muted)] shadow-sm">{s.icon}</div>
                <div className="flex-grow min-w-0">
                  <div className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{s.device}</div>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest truncate">{s.meta}</div>
                </div>
                {s.current && <span className="px-2 py-0.5 bg-green-50 text-[var(--income-green)] border border-green-100 rounded text-[11px] font-bold uppercase">Current</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
