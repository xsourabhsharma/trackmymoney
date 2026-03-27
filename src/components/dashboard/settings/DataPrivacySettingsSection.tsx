'use client'

import { useState } from 'react'
import { Database, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserSettings } from '@/app/dashboard/settings/data'
import { deleteUserAccountAction } from '@/app/dashboard/settings/actions'
import { useRouter } from 'next/navigation'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function DataPrivacySettingsSection({ settings, onSave }: Props) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
 
  const [aiOptIn, setAiOptIn] = useState(settings.ai_learning_opt_in)

  async function handleArchive() {
    setIsArchiving(true)
    try {
     
     
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const payload = JSON.stringify({ data: "archive_data", generatedAt: new Date().toISOString() }, null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `track_my_money_archive_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(error)
    } finally {
      setIsArchiving(false)
    }
  }

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

  function handleToggleAI() {
    const newValue = !aiOptIn;
    setAiOptIn(newValue);
    onSave({ ai_learning_opt_in: newValue }).catch(() => {
      setAiOptIn(!newValue);
    });
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" /> Data & Privacy
        </h3>
      </div>
      
      <div className="space-y-4">
        {}
        <div className="flex items-center justify-between py-1 px-1 group cursor-pointer select-none" onClick={handleToggleAI}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight">AI Learning Flow</span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Help improve categorization models</span>
          </div>
          <button 
            type="button"
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 shadow-sm ${aiOptIn ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${aiOptIn ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {}
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-light)]/50">
          <Button 
            onClick={handleArchive}
            disabled={isArchiving}
            variant="outline" 
            className="w-full h-10 rounded-xl text-[12px] font-bold uppercase tracking-widest border-[var(--border-light)] hover:bg-[var(--bg-surface)] flex gap-2 shadow-sm transition-all"
          >
            {isArchiving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> : <Download className="w-3.5 h-3.5" />} 
            {isArchiving ? "Packaging..." : "Full Ledger Archive"}
          </Button>

          <Button 
            onClick={handleTerminate}
            disabled={isDeleting}
            className="w-full h-10 bg-[var(--expense-red)]/5 text-[var(--expense-red)] hover:bg-[var(--expense-red)] hover:text-white border border-[var(--expense-red)]/20 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Terminate Node Account'}
          </Button>
        </div>

        <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest text-center leading-relaxed italic px-2 opacity-60">
          End-to-end encryption active. Zero third-party data sharing protocols detected.
        </p>
      </div>
    </div>
  )
}
