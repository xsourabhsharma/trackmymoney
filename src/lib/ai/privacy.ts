import 'server-only'

import type { AppSupabaseServerClient } from '@/utils/supabase/server'
import {
  aiConsentSettingsSchema,
  DEFAULT_AI_CONSENT_SETTINGS,
  partialAiConsentSettingsSchema,
  type AiConsentSettings,
} from '@/lib/contracts'

export type AiConsentFeature =
  | 'chat'
  | 'advisor'
  | 'insights'
  | 'categorization'
  | 'receipt_ocr'

export type AiConsentDecision =
  | {
      allowed: true
      settings: AiConsentSettings
    }
  | {
      allowed: false
      code: 'AI_CONSENT_REQUIRED' | 'AI_FEATURE_DISABLED'
      message: string
      settings: AiConsentSettings
    }

const FEATURE_SETTING_KEYS = {
  chat: 'active_intelligence',
  advisor: 'active_intelligence',
  insights: 'active_intelligence',
  categorization: 'auto_categorize',
  receipt_ocr: 'active_intelligence',
} as const satisfies Record<AiConsentFeature, keyof AiConsentSettings>

export async function getUserAiConsentSettings(
  supabase: AppSupabaseServerClient,
  userId: string
): Promise<AiConsentSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[AI] Failed to read AI consent settings', {
      code: error.code,
      message: error.message,
    })
  }

  return parseAiConsentSettings(data?.preferences)
}

export async function requireAiConsent(
  supabase: AppSupabaseServerClient,
  userId: string,
  feature: AiConsentFeature
): Promise<AiConsentDecision> {
  const settings = await getUserAiConsentSettings(supabase, userId)

  if (!settings.ai_learning_opt_in) {
    return {
      allowed: false,
      code: 'AI_CONSENT_REQUIRED',
      message: 'AI features are off. Enable AI learning in Settings to use this feature.',
      settings,
    }
  }

  const featureSetting = FEATURE_SETTING_KEYS[feature]
  if (!settings[featureSetting]) {
    return {
      allowed: false,
      code: 'AI_FEATURE_DISABLED',
      message: 'This AI feature is disabled in Settings.',
      settings,
    }
  }

  return { allowed: true, settings }
}

function parseAiConsentSettings(preferences: unknown): AiConsentSettings {
  const parsedPreferences = partialAiConsentSettingsSchema.safeParse(
    isRecord(preferences) ? preferences : {}
  )

  return aiConsentSettingsSchema.parse({
    ...DEFAULT_AI_CONSENT_SETTINGS,
    ...(parsedPreferences.success ? parsedPreferences.data : {}),
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
