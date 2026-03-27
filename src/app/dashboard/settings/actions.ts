'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { UserSettings, DEFAULT_SETTINGS } from './data'
import { revalidatePath } from 'next/cache'

export async function upsertUserSettingsAction(partial: Partial<UserSettings>) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  
  if (authErr || !user) throw new Error('Unauthorized')

 
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferences, full_name')
    .eq('id', user.id)
    .single()

  const existingPrefs = (profile?.preferences as Record<string, unknown>) || {}

 
  const mergedPrefs = { ...existingPrefs, ...partial }

 
  const updatePayload: Record<string, unknown> = {
    preferences: mergedPrefs,
    updated_at: new Date().toISOString(),
  }

 
  if (partial.full_name !== undefined) {
    updatePayload.full_name = partial.full_name
  }

 
  if (partial.currency !== undefined) {
   
    const rawCurrency = partial.currency.split(' ')[0] || partial.currency
    updatePayload.currency = rawCurrency
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

 
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  
  if (error) throw new Error(`Termination failed: ${error.message}`)
  
 
  await supabase.auth.signOut()
  return { success: true }
}
