'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createAdminClient()
  const { error } = await admin
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting transaction:', error)
    throw new Error('Failed to delete transaction')
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/transactions', 'page')
}
