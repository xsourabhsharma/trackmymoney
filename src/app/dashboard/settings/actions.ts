'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { UserSettings, DEFAULT_SETTINGS } from './data'
import { revalidatePath } from 'next/cache'

export async function upsertUserSettingsAction(partial: Partial<UserSettings>) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  
  if (authErr || !user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('user_settings')
      .update(partial)
      .eq('user_id', user.id)

    if (error) throw new Error(`Update failed: ${error.message}`)
  } else {
    const newRecord = {
      user_id: user.id,
      ...DEFAULT_SETTINGS,
      ...partial,
      full_name: partial.full_name || user.email?.split('@')[0] || 'Anonymous',
    }
    
    // We must pass exactly the columns that exist. 
    // Types align perfectly.
    const { error } = await supabase
      .from('user_settings')
      .insert(newRecord)

    if (error) throw new Error(`Insert failed: ${error.message}`)
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard', 'layout') // Revalidate whole dashboard since settings affect global UX
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

  // Hard delete using admin client
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  
  if (error) throw new Error(`Termination failed: ${error.message}`)
  
  // Sign out the current session
  await supabase.auth.signOut()
  return { success: true }
}
