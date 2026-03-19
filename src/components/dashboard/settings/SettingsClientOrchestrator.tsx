'use client'

import { useState, useTransition } from 'react'
import { UserSettings, Integration } from '@/app/dashboard/settings/data'
import { upsertUserSettingsAction } from '@/app/dashboard/settings/actions'
import { ProfileSettingsSection } from './ProfileSettingsSection'
import { SecuritySettingsSection } from './SecuritySettingsSection'
import { AppearanceSettingsSection } from './AppearanceSettingsSection'
import { DefaultsSettingsSection } from './DefaultsSettingsSection'
import { IntegrationsSettingsSection } from './IntegrationsSettingsSection'
import { AiAutomationSettingsSection } from './AiAutomationSettingsSection'
import { DataPrivacySettingsSection } from './DataPrivacySettingsSection'
import { NotificationsSettingsSection } from './NotificationsSettingsSection'

interface Props {
  initialSettings: UserSettings
  integrations: [Integration] | Integration[] // fallback for potentially missing definitions but type is properly array
  email: string
}

export function SettingsClientOrchestrator({ initialSettings, integrations, email }: Props) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()

  // Centralized save handler that optimistic-updates client then syncs to server
  async function handleSaveSetting(partial: Partial<UserSettings>) {
    // Optimistic UI update
    setSettings(prev => ({ ...prev, ...partial }))
    
    try {
      // Async server push (we don't await strictly for instant UX, but await for error handling if awaited explicitly)
      await upsertUserSettingsAction(partial)
    } catch (err) {
      console.error('Failed to save setting:', err)
      // Revert optimism if it failed
      setSettings(initialSettings) 
      throw err
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {/* ── Left Column: Profile & Security ── */}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <ProfileSettingsSection settings={settings} email={email} onSave={handleSaveSetting} />
        <SecuritySettingsSection />
      </div>

      {/* ── Middle Column: Appearance & Defaults ── */}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <AppearanceSettingsSection settings={settings} onSave={handleSaveSetting} />
        <DefaultsSettingsSection settings={settings} onSave={handleSaveSetting} />
      </div>

      {/* ── Right Column: Integrations, AI, Privacy, Notifications ── */}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <IntegrationsSettingsSection integrations={integrations as Integration[]} />
        <AiAutomationSettingsSection settings={settings} onSave={handleSaveSetting} />
        <DataPrivacySettingsSection settings={settings} onSave={handleSaveSetting} />
        <NotificationsSettingsSection settings={settings} onSave={handleSaveSetting} />
      </div>
    </div>
  )
}
