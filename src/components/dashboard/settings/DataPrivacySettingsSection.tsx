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
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleArchive() {
    setIsDeleting(true) // Reusing the load state since the button has no dedicated loader
    try {
      const res = await fetch('/api/data/export')
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `track_my_money_archive_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(error)
      alert("Failed to export data")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleTerminate() {
    if (!confirm('WARNING: This action is irreversible. All your data, transactions, and account access will be permanently deleted. Are you absolutely sure?')) {
      return
    }
    const finalConfirm = prompt('Type "TERMINATE" to confirm account deletion:')
    if (finalConfirm !== 'TERMINATE') return

    setIsDeleting(true)
    try {
      await deleteUserAccountAction()
      router.push('/')
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Failed to terminate account.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--accent)]" /> Data & Privacy
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* AI Learning Flow Opt-in */}
        <div className="flex items-center justify-between py-1 px-1 group cursor-pointer" onClick={() => onSave({ ai_learning_opt_in: !settings.ai_learning_opt_in })}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight">AI Learning Flow</span>
            <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Help improve categorization models</span>
          </div>
          <button className={`w-9 h-5 rounded-full relative transition-all shadow-sm ${settings.ai_learning_opt_in ? 'bg-[var(--accent)]' : 'bg-[var(--border-light)]'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.ai_learning_opt_in ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        {/* Data Exports & Deletion */}
        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-light)]/50">
          <Button 
            onClick={handleArchive}
            variant="outline" 
            className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest border-[var(--border-light)] hover:bg-[var(--bg-surface)] flex gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Full Ledger Archive
          </Button>

          <Button 
            onClick={handleTerminate}
            disabled={isDeleting}
            className="w-full h-10 bg-[var(--expense-red)]/5 text-[var(--expense-red)] hover:bg-[var(--expense-red)] hover:text-white border border-[var(--expense-red)]/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Terminate Node Account'}
          </Button>
        </div>

        <p className="text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-widest text-center leading-relaxed italic px-2 opacity-60">
          End-to-end encryption active. Zero third-party data sharing protocols detected.
        </p>
      </div>
    </div>
  )
}
