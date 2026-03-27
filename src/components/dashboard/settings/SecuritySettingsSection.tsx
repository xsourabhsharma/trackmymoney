'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Loader2, Check } from 'lucide-react'
import { updateUserPasswordAction } from '@/app/dashboard/settings/actions'

export function SecuritySettingsSection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
        {}
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
      </div>
    </div>
  )
}
