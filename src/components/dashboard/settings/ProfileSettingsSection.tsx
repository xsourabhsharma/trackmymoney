'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, ChevronDown, Loader2, Check, Camera, AlertCircle, LogOut } from 'lucide-react'
import { UserSettings } from '@/app/dashboard/settings/data'
import { uploadAvatar } from '@/app/dashboard/settings/avatar-actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  settings: UserSettings
  email: string
  avatarUrl?: string | null
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function ProfileSettingsSection({ settings, email, avatarUrl, onSave }: Props) {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarPending, setAvatarPending] = useState(false)
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    full_name: settings.full_name,
    timezone: settings.timezone,
    currency: settings.currency,
  })

  async function handleSave() {
    setIsPending(true)
    try {
      await onSave(formData)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError(null)
    setAvatarPending(true)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const result = await uploadAvatar(formData)
      setLocalAvatarUrl(result.url + `?t=${Date.now()}`)
    } catch (err: any) {
      setAvatarError(err.message || 'Avatar upload failed.')
    } finally {
      setAvatarPending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const initials = email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6 h-full">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--accent)]" /> Profile
        </h3>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--border-light)] shadow-sm focus:outline-none"
          disabled={avatarPending}
        >
          {localAvatarUrl ? (
            <Image
              src={localAvatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center text-3xl font-bold text-[var(--text-muted)]">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {avatarPending
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />
            }
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <p className="text-[12px] font-medium text-[var(--text-muted)]">Click avatar to change · Max 2 MB</p>

        {avatarError && (
          <p className="text-[12px] font-bold text-[var(--expense-red)] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {avatarError}
          </p>
        )}
      </div>

      <div className="space-y-4 flex-grow">
        <div className="space-y-1.5">
          <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Full Name</Label>
          <Input
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Sourabh Sharma"
            className="bg-[var(--bg-base)] border-[var(--border-light)] text-[13px] font-medium rounded-xl h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Email Address</Label>
          <Input
            value={email}
            disabled
            className="bg-[var(--bg-surface)] border-[var(--border-light)] text-[13px] font-medium rounded-xl h-11 opacity-70"
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Currency</Label>
            <div className="relative">
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full pl-3 pr-8 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer uppercase tracking-tight"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isPending || isSuccess}
            className={`w-full h-12 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all ${
              isSuccess
                ? 'bg-[var(--income-green)] text-white hover:bg-[var(--income-green)]'
                : 'bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90'
            }`}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
              <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Saved</span>
            ) : (
              'Save Profile'
            )}
          </Button>

          <Button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            variant="outline"
            className="w-full h-12 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--expense-red)] border-[var(--expense-red)]/20 hover:bg-[var(--expense-red)]/10 mt-3"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
