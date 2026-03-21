'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveReceiptTransaction(data: {
  merchant: string
  amount: number
  date: string
  category_name: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // 0. Fix missing profile issue (Foreign Key Constraint)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    // Attempt to insert the missing profile record
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || 'unknown@example.com',
      full_name: user.user_metadata?.full_name || 'User',
      avatar_url: user.user_metadata?.avatar_url || '',
      currency: 'USD'
    })
  }

  // 1. Resolve category ID
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', data.category_name)
    .single()

  // 2. Insert transaction
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: data.amount.toString(),
      merchant: data.merchant,
      date: data.date,
      type: 'expense',
      category_id: category?.id || null,
      source: 'import',
    })

  if (error) {
    console.error('Save Receipt Error:', error)
    throw new Error(`Failed to save transaction: ${error.message}`)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/transactions')
  
  return { success: true }
}
