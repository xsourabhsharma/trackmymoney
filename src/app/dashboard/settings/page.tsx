import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile, preferences, formats, and API keys.',
}
import { loadSettingsPageData } from '@/app/dashboard/settings/data'
import { SettingsClientOrchestrator } from '@/components/dashboard/settings/SettingsClientOrchestrator'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { settings, integrations } = await loadSettingsPageData()

  return (
    <div className="flex flex-col gap-8">
      {}
      <DashboardSubNav />

      {}
      <SettingsClientOrchestrator 
        initialSettings={settings} 
        integrations={integrations} 
        email={user.email!} 
      />
    </div>
  )
}
