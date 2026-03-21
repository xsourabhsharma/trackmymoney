'use client'

import { Zap } from 'lucide-react'
import { UserSettings, AnomalySensitivity } from '@/app/dashboard/settings/data'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function AiAutomationSettingsSection({ settings, onSave }: Props) {
  const toggles = [
    { label: 'Auto-categorize transactions', key: 'auto_categorize' as const },
    { label: 'Auto-detect subscriptions', key: 'auto_detect_subscriptions' as const },
    { label: 'Generate monthly report', key: 'auto_generate_monthly_report' as const },
  ]

  const sensitivityIndex = {
    'low': 0,
    'medium': 1,
    'high': 2
  }[settings.anomaly_sensitivity] || 1

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--accent)]" /> AI & Automation
        </h3>
      </div>
      
      <div className="space-y-4">
        {toggles.map(t => (
          <div key={t.key} className="flex items-center justify-between py-1 px-1">
            <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight leading-tight pr-4">
              {t.label}
            </span>
            <button 
              onClick={() => onSave({ [t.key]: !settings[t.key] })}
              className={`w-9 h-5 rounded-full relative transition-colors duration-200 shadow-sm ${
                settings[t.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                settings[t.key] ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}

        <div className="pt-4 border-t border-[var(--border-light)]/50 px-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Anomaly Detection Sensitivity
            </span>
            <span className="text-[9px] font-bold bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-light)] capitalize">
              {settings.anomaly_sensitivity}
            </span>
          </div>
          
          <div className="flex gap-1 h-3 rounded-full overflow-hidden border border-[var(--border-light)]/30">
            {(['low', 'medium', 'high'] as AnomalySensitivity[]).map((level, i) => (
              <button
                key={level}
                onClick={() => onSave({ anomaly_sensitivity: level })}
                className={`flex-1 transition-all ${
                  sensitivityIndex >= i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
