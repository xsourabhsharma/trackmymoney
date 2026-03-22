'use client'

import { Palette } from 'lucide-react'
import { UserSettings, Theme, Density, DashboardStrategy } from '@/app/dashboard/settings/data'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function AppearanceSettingsSection({ settings, onSave }: Props) {
  
  function handleThemeChange(t: Theme) {
    onSave({ theme: t })
    // We already have a ThemeToggle component, but to sync we can set data-theme on html if needed,
    // though the app might be relying on something else. We'll simply persist it.
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
        
        <div className="space-y-3">
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest block px-1">Interface Density</span>
          <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
            {(['comfortable', 'compact'] as Density[]).map((d) => (
              <button 
                key={d} 
                onClick={() => onSave({ density: d })}
                className={`flex-1 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all ${
                  settings.density === d 
                    ? 'bg-[var(--bg-base)] text-[var(--text-main)] shadow-sm border border-[var(--border-light)]/50' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3 pt-4 border-t border-[var(--border-light)]/50">
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest block px-1">Dashboard Strategy</span>
          <div className="flex flex-wrap gap-2">
            {(['standard', 'analytics', 'minimal'] as DashboardStrategy[]).map((s) => (
              <button 
                key={s} 
                onClick={() => onSave({ dashboard_strategy: s })}
                className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest border transition-all ${
                  settings.dashboard_strategy === s 
                    ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)]' 
                    : 'bg-white text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--border-dark)]'
                }`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]/50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight">Show AI Panels</span>
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Active intelligence monitoring</span>
          </div>
          <button 
            onClick={() => onSave({ show_ai_panels: !settings.show_ai_panels })}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 shadow-sm ${
              settings.show_ai_panels ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              settings.show_ai_panels ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>
    </div>
  )
}
