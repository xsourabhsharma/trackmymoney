import { createClient } from '@/utils/supabase/server'
import {
  DEFAULT_SETTINGS,
  getSettingsIntegrations,
  resolveUserSettings,
  type AccountScope,
  type DashboardStrategy,
  type DateSpectrum,
  type Density,
  type Integration,
  type IntegrationStatus,
  type IntegrationType,
  type Landing,
  type Theme,
  type UserSettings,
} from '@/lib/settings'
import type { AnomalySensitivity, IntelligenceFrequency } from '@/lib/contracts/ai-settings'

export { DEFAULT_SETTINGS }
export type {
  AccountScope,
  AnomalySensitivity,
  DashboardStrategy,
  DateSpectrum,
  Density,
  Integration,
  IntegrationStatus,
  IntegrationType,
  IntelligenceFrequency,
  Landing,
  Theme,
  UserSettings,
}

export async function getUserSettings(): Promise<UserSettings> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, currency, preferences')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      ...DEFAULT_SETTINGS,
      full_name: user.email?.split('@')[0] || '',
    }
  }

  return resolveUserSettings({
    preferences: profile.preferences,
    profileFullName: profile.full_name,
    profileCurrency: profile.currency,
    fallbackName: user.email?.split('@')[0] || '',
  })
}

export async function getUserIntegrations(): Promise<Integration[]> {
  return getSettingsIntegrations()
}

export async function loadSettingsPageData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, settings: DEFAULT_SETTINGS, integrations: [] as Integration[] }
  }

  const [settings, integrations] = await Promise.all([
    getUserSettings(),
    getUserIntegrations(),
  ])

  return {
    user,
    settings,
    integrations,
  }
}
