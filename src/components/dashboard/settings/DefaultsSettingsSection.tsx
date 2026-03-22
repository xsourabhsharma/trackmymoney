'use client'

import { LayoutDashboard, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { UserSettings, Landing, DateSpectrum, AccountScope } from '@/app/dashboard/settings/data'

interface Props {
  settings: UserSettings
  onSave: (partial: Partial<UserSettings>) => Promise<void>
}

export function DefaultsSettingsSection({ settings, onSave }: Props) {
  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-[var(--accent)]" /> Defaults
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1.5 px-1">
          <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Default Landing Hub</Label>
          <div className="relative group">
            <select 
              value={settings.default_landing}
              onChange={e => onSave({ default_landing: e.target.value as Landing })}
              className="w-full pl-3 pr-8 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer uppercase tracking-tight"
            >
              <option value="overview">Overview</option>
              <option value="transactions">Transactions</option>
              <option value="capital_flow">Capital Flow</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-1.5 px-1">
          <Label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Default Date Spectrum</Label>
          <div className="relative group">
            <select 
              value={settings.default_date_spectrum}
              onChange={e => onSave({ default_date_spectrum: e.target.value as DateSpectrum })}
              className="w-full pl-3 pr-8 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl text-[11px] font-bold appearance-none outline-none focus:border-[var(--border-dark)] cursor-pointer uppercase tracking-tight"
            >
              <option value="this_month">This Month (Current)</option>
              <option value="last_30">Last 30 Cycles</option>
              <option value="fiscal_ytd">Fiscal Year to Date</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
        

      </div>
    </div>
  )
}
