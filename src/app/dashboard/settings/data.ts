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
import type { FinanceToolScope } from '@/lib/finance-tools/types'

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

export interface ExternalAccessTokenSummary {
  id: string
  name: string
  scopes: FinanceToolScope[]
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string | null
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

export async function getExternalAccessTokens(): Promise<ExternalAccessTokenSummary[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await (supabase as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  })
    .from('external_access_tokens')
    .select('id, name, scopes, last_used_at, expires_at, revoked_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('External access token load failed:', error.message)
    return []
  }

  return (data || []) as ExternalAccessTokenSummary[]
}

export async function loadSettingsPageData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, settings: DEFAULT_SETTINGS, integrations: [] as Integration[], externalAccessTokens: [] as ExternalAccessTokenSummary[] }
  }

  const [settings, integrations, externalAccessTokens] = await Promise.all([
    getUserSettings(),
    getUserIntegrations(),
    getExternalAccessTokens(),
  ])

  return {
    user,
    settings,
    integrations,
    externalAccessTokens,
  }
}
