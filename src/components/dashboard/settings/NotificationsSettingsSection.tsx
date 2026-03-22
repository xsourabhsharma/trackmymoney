'use client'

import { Bell, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { UserSettings, IntelligenceFrequency } from '@/app/dashboard/settings/data'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function NotificationsSettingsSection({ settings, onSave }: Props) {
  const alerts = [
    { label: 'Upcoming subscription nodes', key: 'notify_upcoming_subscriptions' as const },
    { label: 'Budget overflow warnings', key: 'notify_budget_overflow' as const },
    { label: 'Goal & debt intelligence tips', key: 'notify_goal_debt_tips' as const },
    { label: 'New AI insights available', key: 'notify_new_ai_insights' as const },
  ]

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--accent)]" /> Notifications
        </h3>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] block px-1">Active Alerts</span>
          <div className="space-y-3 px-1">
            {alerts.map(n => (
              <label 
                key={n.key} 
                className="flex items-center gap-3 text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight cursor-pointer group leading-tight"
              >
                <input 
                  type="checkbox" 
                  checked={settings[n.key]} 
                  onChange={e => onSave({ [n.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-light)] text-blue-600 focus:ring-blue-600/20 cursor-pointer accent-blue-600" 
                />
                <span className="group-hover:text-[var(--accent)] transition-colors">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-4 border-t border-[var(--border-light)]/50">
          <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">
            Intelligence Frequency
          </Label>
          <div className="relative group">
            <select 
              value={settings.intelligence_frequency}
              onChange={e => onSave({ intelligence_frequency: e.target.value as IntelligenceFrequency })}
              className="w-full pl-3 pr-8 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer uppercase tracking-tight"
            >
              <option value="instant">Instant (Live Flow)</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Sector Summary</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
