'use client'

import { useState } from 'react'
import { Database, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserSettings } from '@/app/dashboard/settings/data'
import { deleteUserAccountAction } from '@/app/dashboard/settings/actions'
import { useRouter } from 'next/navigation'
import {
  AI_LEARNING_OPT_IN_COPY,
  ARCHIVE_EXPORT_UNAVAILABLE_COPY,
  SETTINGS_PRIVACY_COPY,
} from '@/lib/settings/privacy-copy'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function DataPrivacySettingsSection({ settings, onSave }: Props) {
  const router = useRouter()
  const [isSavingAiChoice, setIsSavingAiChoice] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleTerminate() {
    if (!confirm('WARNING: This action is irreversible. Are you sure you want to delete your account?')) {
      return
    }
    const finalConfirm = prompt('Type "DELETE" to confirm account deletion:')
    if (finalConfirm !== 'DELETE') return

    setIsDeleting(true)
    try {
      await deleteUserAccountAction()
      router.push('/')
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }

  async function handleToggleAI() {
    const newValue = !settings.ai_learning_opt_in
    setIsSavingAiChoice(true)
    try {
      await onSave({ ai_learning_opt_in: newValue })
    } catch (err) {
      console.error('Failed to save AI opt-in setting:', err)
    } finally {
      setIsSavingAiChoice(false)
    }
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" /> Data & Privacy
        </h3>
      </div>
      
      <div className="space-y-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left select-none transition-colors hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleToggleAI}
          disabled={isSavingAiChoice}
          aria-pressed={settings.ai_learning_opt_in}
          data-ai-learning-opt-in={settings.ai_learning_opt_in ? 'true' : 'false'}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight">AI product learning</span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Explicit opt-in: {settings.ai_learning_opt_in ? 'On' : 'Off'}</span>
          </div>
          <span
            className={`relative h-5 w-9 rounded-full shadow-sm transition-colors duration-200 ${settings.ai_learning_opt_in ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${settings.ai_learning_opt_in ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </span>
        </button>
        <p className="px-1 text-[11px] font-medium leading-relaxed text-[var(--text-muted)]">
          {AI_LEARNING_OPT_IN_COPY}
        </p>

        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-light)]/50">
          <Button 
            disabled
            variant="outline" 
            className="w-full h-10 rounded-xl text-[12px] font-bold uppercase tracking-widest border-[var(--border-light)] hover:bg-[var(--bg-surface)] flex gap-2 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Full archive pending
          </Button>
          <p className="px-1 text-[11px] font-medium leading-relaxed text-[var(--text-muted)]">
            {ARCHIVE_EXPORT_UNAVAILABLE_COPY}
          </p>

          <Button 
            onClick={handleTerminate}
            disabled={isDeleting}
            className="w-full h-10 bg-[var(--expense-red)]/5 text-[var(--expense-red)] hover:bg-[var(--expense-red)] hover:text-white border border-[var(--expense-red)]/20 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete account'}
          </Button>
        </div>

        <p className="px-2 text-center text-[11px] font-medium leading-relaxed text-[var(--text-muted)] opacity-70">
          {SETTINGS_PRIVACY_COPY}
        </p>
      </div>
    </div>
  )
}
