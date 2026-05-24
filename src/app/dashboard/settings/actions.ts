'use server'

import { createClient } from '@/utils/supabase/server'
import type { UserSettings } from './data'
import {
  mergeSettingsPreferences,
  normalizeCurrencyCode,
  sanitizeUserSettingsPatch,
} from '@/lib/settings'
import { revalidatePath } from 'next/cache'

export async function upsertUserSettingsAction(partial: Partial<UserSettings>) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  
  if (authErr || !user) throw new Error('Unauthorized')

  const cleanPartial = sanitizeUserSettingsPatch(partial)
  if (Object.keys(cleanPartial).length === 0) {
    return { success: true }
  }

 
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', user.id)
    .single()

  const mergedPrefs = mergeSettingsPreferences(profile?.preferences, cleanPartial)

 
  const updatePayload: Record<string, unknown> = {
    preferences: mergedPrefs,
    updated_at: new Date().toISOString(),
  }

 
  if (cleanPartial.full_name !== undefined) {
    updatePayload.full_name = cleanPartial.full_name
  }

 
  if (cleanPartial.currency !== undefined) {
    updatePayload.currency = normalizeCurrencyCode(cleanPartial.currency)
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) throw new Error(`Settings update failed: ${error.message}`)

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateUserPasswordAction(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteUserAccountAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  throw new Error('Account deletion is not implemented yet. Contact support to request deletion.')
}
