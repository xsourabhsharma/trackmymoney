import { createClient } from '@/utils/supabase/server'

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Default Construction ───────────────────────────────────────────────────

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

// ─── Data Access ────────────────────────────────────────────────────────────

export async function getUserSettings(): Promise<UserSettings> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (data) return data as UserSettings

  // If no row exists, return the defaults
  return DEFAULT_SETTINGS
}

export async function getUserIntegrations(): Promise<Integration[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data || []) as Integration[]
}

export async function loadSettingsPageData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { user: null, settings: DEFAULT_SETTINGS, integrations: [] }
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
