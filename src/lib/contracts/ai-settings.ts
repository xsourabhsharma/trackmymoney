import { z } from 'zod'

export const ANOMALY_SENSITIVITIES = ['low', 'medium', 'high'] as const
export const INTELLIGENCE_FREQUENCIES = ['instant', 'daily', 'weekly'] as const

export const anomalySensitivitySchema = z.enum(ANOMALY_SENSITIVITIES)
export const intelligenceFrequencySchema = z.enum(INTELLIGENCE_FREQUENCIES)

export const aiConsentSettingsSchema = z.object({
  show_ai_panels: z.boolean(),
  active_intelligence: z.boolean(),
  auto_categorize: z.boolean(),
  auto_detect_subscriptions: z.boolean(),
  auto_generate_monthly_report: z.boolean(),
  anomaly_sensitivity: anomalySensitivitySchema,
  ai_learning_opt_in: z.boolean(),
  notify_new_ai_insights: z.boolean(),
  intelligence_frequency: intelligenceFrequencySchema,
})

export const partialAiConsentSettingsSchema = aiConsentSettingsSchema.partial()

export type AiConsentSettings = z.infer<typeof aiConsentSettingsSchema>
export type PartialAiConsentSettings = z.infer<typeof partialAiConsentSettingsSchema>
export type AnomalySensitivity = z.infer<typeof anomalySensitivitySchema>
export type IntelligenceFrequency = z.infer<typeof intelligenceFrequencySchema>

export const AI_CONSENT_SETTING_KEYS = [
  'show_ai_panels',
  'active_intelligence',
  'auto_categorize',
  'auto_detect_subscriptions',
  'auto_generate_monthly_report',
  'anomaly_sensitivity',
  'ai_learning_opt_in',
  'notify_new_ai_insights',
  'intelligence_frequency',
] as const satisfies readonly (keyof AiConsentSettings)[]

export const DEFAULT_AI_CONSENT_SETTINGS = {
  show_ai_panels: true,
  active_intelligence: true,
  auto_categorize: true,
  auto_detect_subscriptions: true,
  auto_generate_monthly_report: false,
  anomaly_sensitivity: 'medium',
  ai_learning_opt_in: false,
  notify_new_ai_insights: true,
  intelligence_frequency: 'instant',
} as const satisfies AiConsentSettings

