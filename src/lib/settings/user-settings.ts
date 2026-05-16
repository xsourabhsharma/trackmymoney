import { z } from 'zod'
import {
  aiConsentSettingsSchema,
  DEFAULT_AI_CONSENT_SETTINGS,
} from '@/lib/contracts/ai-settings'

export const THEMES = ['system', 'light', 'dark'] as const
export const DENSITIES = ['comfortable', 'compact'] as const
export const DASHBOARD_STRATEGIES = ['standard', 'analytics', 'minimal'] as const
export const LANDING_PAGES = ['overview', 'transactions', 'capital_flow'] as const
export const DATE_SPECTRUMS = ['this_month', 'last_30', 'fiscal_ytd'] as const
export const ACCOUNT_SCOPES = ['all', 'personal', 'business'] as const
export const CURRENCIES = ['INR', 'USD'] as const

export const DEFAULT_CURRENCY = 'INR'
export const DEFAULT_TIMEZONE = 'UTC+05:30 IST'

export const themeSchema = z.enum(THEMES)
export const densitySchema = z.enum(DENSITIES)
export const dashboardStrategySchema = z.enum(DASHBOARD_STRATEGIES)
export const landingSchema = z.enum(LANDING_PAGES)
export const dateSpectrumSchema = z.enum(DATE_SPECTRUMS)
export const accountScopeSchema = z.enum(ACCOUNT_SCOPES)
export const currencySchema = z.enum(CURRENCIES)

export const userSettingsSchema = aiConsentSettingsSchema.extend({
  full_name: z.string().trim().max(160),
  timezone: z.string().trim().min(1).max(80),
  currency: currencySchema,

  theme: themeSchema,
  density: densitySchema,
  dashboard_strategy: dashboardStrategySchema,

  default_landing: landingSchema,
  default_date_spectrum: dateSpectrumSchema,
  default_account_scope: accountScopeSchema,

  notify_upcoming_subscriptions: z.boolean(),
  notify_budget_overflow: z.boolean(),
  notify_goal_debt_tips: z.boolean(),
})

export const partialUserSettingsSchema = userSettingsSchema.partial()

export type UserSettings = z.infer<typeof userSettingsSchema>
export type PartialUserSettings = z.infer<typeof partialUserSettingsSchema>
export type Theme = z.infer<typeof themeSchema>
export type Density = z.infer<typeof densitySchema>
export type DashboardStrategy = z.infer<typeof dashboardStrategySchema>
export type Landing = z.infer<typeof landingSchema>
export type DateSpectrum = z.infer<typeof dateSpectrumSchema>
export type AccountScope = z.infer<typeof accountScopeSchema>
export type CurrencyCode = z.infer<typeof currencySchema>

export const DEFAULT_SETTINGS = {
  full_name: '',
  timezone: DEFAULT_TIMEZONE,
  currency: DEFAULT_CURRENCY,
  theme: 'system',
  density: 'comfortable',
  dashboard_strategy: 'standard',
  show_ai_panels: DEFAULT_AI_CONSENT_SETTINGS.show_ai_panels,
  active_intelligence: DEFAULT_AI_CONSENT_SETTINGS.active_intelligence,
  default_landing: 'overview',
  default_date_spectrum: 'this_month',
  default_account_scope: 'all',
  auto_categorize: DEFAULT_AI_CONSENT_SETTINGS.auto_categorize,
  auto_detect_subscriptions: DEFAULT_AI_CONSENT_SETTINGS.auto_detect_subscriptions,
  auto_generate_monthly_report: DEFAULT_AI_CONSENT_SETTINGS.auto_generate_monthly_report,
  anomaly_sensitivity: DEFAULT_AI_CONSENT_SETTINGS.anomaly_sensitivity,
  ai_learning_opt_in: DEFAULT_AI_CONSENT_SETTINGS.ai_learning_opt_in,
  notify_upcoming_subscriptions: true,
  notify_budget_overflow: true,
  notify_goal_debt_tips: true,
  notify_new_ai_insights: DEFAULT_AI_CONSENT_SETTINGS.notify_new_ai_insights,
  intelligence_frequency: DEFAULT_AI_CONSENT_SETTINGS.intelligence_frequency,
} as const satisfies UserSettings

export function normalizeCurrencyCode(value: unknown): CurrencyCode {
  if (typeof value !== 'string') return DEFAULT_CURRENCY

  const normalized = value.trim().toUpperCase()
  if (normalized.startsWith('USD') || normalized.includes('$')) return 'USD'
  if (normalized.startsWith('INR') || normalized.includes('RS')) return 'INR'

  return DEFAULT_CURRENCY
}

export function resolveUserSettings({
  preferences,
  profileFullName,
  profileCurrency,
  fallbackName,
}: {
  preferences: unknown
  profileFullName?: string | null
  profileCurrency?: string | null
  fallbackName?: string
}): UserSettings {
  const rawPreferences = isRecord(preferences) ? { ...preferences } : {}
  if ('currency' in rawPreferences) {
    rawPreferences.currency = normalizeCurrencyCode(rawPreferences.currency)
  }

  const parsedPreferences = partialUserSettingsSchema.safeParse(rawPreferences)
  const safePreferences = parsedPreferences.success ? parsedPreferences.data : {}
  const fullName =
    firstNonEmptyString(profileFullName, safePreferences.full_name, fallbackName) ??
    DEFAULT_SETTINGS.full_name

  return userSettingsSchema.parse({
    ...DEFAULT_SETTINGS,
    ...safePreferences,
    full_name: fullName,
    currency: normalizeCurrencyCode(
      safePreferences.currency ?? profileCurrency ?? DEFAULT_SETTINGS.currency
    ),
  })
}

export function sanitizeUserSettingsPatch(input: unknown): PartialUserSettings {
  if (!isRecord(input)) return {}

  const normalizedInput = { ...input }
  if ('currency' in normalizedInput) {
    normalizedInput.currency = normalizeCurrencyCode(normalizedInput.currency)
  }

  const parsed = partialUserSettingsSchema.safeParse(normalizedInput)
  if (!parsed.success) {
    throw new Error('Invalid settings payload.')
  }

  return removeUndefinedValues(parsed.data)
}

export function mergeSettingsPreferences(
  existingPreferences: unknown,
  patch: PartialUserSettings
): Record<string, unknown> {
  const existing = isRecord(existingPreferences) ? existingPreferences : {}
  return {
    ...existing,
    ...patch,
  }
}

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function removeUndefinedValues<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as Partial<T>
}
