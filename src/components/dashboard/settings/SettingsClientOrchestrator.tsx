'use client'

import { useState } from 'react'
import { UserSettings, Integration } from '@/app/dashboard/settings/data'
import { upsertUserSettingsAction } from '@/app/dashboard/settings/actions'
import { ProfileSettingsSection } from './ProfileSettingsSection'
import { SecuritySettingsSection } from './SecuritySettingsSection'
import { AppearanceSettingsSection } from './AppearanceSettingsSection'
import { IntegrationsSettingsSection } from './IntegrationsSettingsSection'
import { DataPrivacySettingsSection } from './DataPrivacySettingsSection'

interface Props {
  initialSettings: UserSettings
  integrations: Integration[]
  email: string
}

export function SettingsClientOrchestrator({ initialSettings, integrations, email }: Props) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)

 
  async function handleSaveSetting(partial: Partial<UserSettings>) {
    const previousSettings = { ...settings }
   
    setSettings(prev => ({ ...prev, ...partial }))
    
    try {
      await upsertUserSettingsAction(partial)
    } catch (err) {
      console.error('Failed to save setting:', err)
     
      setSettings(previousSettings)
      throw err
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <ProfileSettingsSection settings={settings} email={email} onSave={handleSaveSetting} />
        <SecuritySettingsSection />
      </div>

      {}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <AppearanceSettingsSection settings={settings} onSave={handleSaveSetting} />
      </div>

      {}
      <div className="flex flex-col gap-8 flex-1 min-w-0">
        <IntegrationsSettingsSection integrations={integrations} />
        <DataPrivacySettingsSection settings={settings} onSave={handleSaveSetting} />
      </div>
    </div>
  )
}
