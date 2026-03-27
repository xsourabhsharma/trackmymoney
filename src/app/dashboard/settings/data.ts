import { createClient } from '@/utils/supabase/server'


export type Theme = 'system' | 'light' | 'dark'
export type Density = 'comfortable' | 'compact'
export type DashboardStrategy = 'standard' | 'analytics' | 'minimal'
export type Landing = 'overview' | 'transactions' | 'capital_flow'
export type DateSpectrum = 'this_month' | 'last_30' | 'fiscal_ytd'
export type AccountScope = 'all' | 'personal' | 'business'
export type AnomalySensitivity = 'low' | 'medium' | 'high'
export type IntelligenceFrequency = 'instant' | 'daily' | 'weekly'

export interface UserSettings {
  full_name: string
  timezone: string
  currency: string

  theme: Theme
  density: Density
  dashboard_strategy: DashboardStrategy
  show_ai_panels: boolean
  active_intelligence: boolean

  default_landing: Landing
  default_date_spectrum: DateSpectrum
  default_account_scope: AccountScope

  auto_categorize: boolean
  auto_detect_subscriptions: boolean
  auto_generate_monthly_report: boolean
  anomaly_sensitivity: AnomalySensitivity

  ai_learning_opt_in: boolean

  notify_upcoming_subscriptions: boolean
  notify_budget_overflow: boolean
  notify_goal_debt_tips: boolean
  notify_new_ai_insights: boolean
  intelligence_frequency: IntelligenceFrequency
}

export type IntegrationType = 'bank' | 'card' | 'upi' | 'csv_import'
export type IntegrationStatus = 'connected' | 'disconnected' | 'pending'

export interface Integration {
  id: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  metadata: Record<string, unknown>
}


export const DEFAULT_SETTINGS: UserSettings = {
  full_name: '',
  timezone: 'UTC+05:30 IST',
  currency: 'INR (₹)',
  theme: 'system',
  density: 'comfortable',
  dashboard_strategy: 'standard',
  show_ai_panels: true,
  active_intelligence: true,
  default_landing: 'overview',
  default_date_spectrum: 'this_month',
  default_account_scope: 'all',
  auto_categorize: true,
  auto_detect_subscriptions: true,
  auto_generate_monthly_report: false,
  anomaly_sensitivity: 'medium',
  ai_learning_opt_in: false,
  notify_upcoming_subscriptions: true,
  notify_budget_overflow: true,
  notify_goal_debt_tips: true,
  notify_new_ai_insights: true,
  intelligence_frequency: 'instant',
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

  if (!profile) return { ...DEFAULT_SETTINGS, full_name: user.email?.split('@')[0] || '' }

 
  const prefs = (profile.preferences as Partial<UserSettings>) || {}

  return {
    ...DEFAULT_SETTINGS,
    ...prefs,
    full_name: profile.full_name || prefs.full_name || user.email?.split('@')[0] || '',
    currency: prefs.currency || profile.currency || DEFAULT_SETTINGS.currency,
  }
}

export async function getUserIntegrations(): Promise<Integration[]> {
 
 
  return []
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

