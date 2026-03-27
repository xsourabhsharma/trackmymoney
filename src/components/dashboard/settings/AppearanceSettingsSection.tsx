'use client'

import { Palette } from 'lucide-react'
import { UserSettings, Theme } from '@/app/dashboard/settings/data'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function AppearanceSettingsSection({ settings, onSave }: Props) {
  const { setTheme } = useTheme()
  
  function handleThemeChange(t: Theme) {
    onSave({ theme: t })
    setTheme(t)
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--accent)]" /> Appearance
        </h3>
        <ThemeToggle />
      </div>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest block px-1">Visual Theme (Persisted)</span>
          <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] shadow-inner">
            {(['system', 'light', 'dark'] as Theme[]).map((t) => (
              <button 
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`flex-1 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all ${
                  settings.theme === t 
                    ? 'bg-[var(--bg-base)] text-[var(--text-main)] shadow-sm border border-[var(--border-light)]/50' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
