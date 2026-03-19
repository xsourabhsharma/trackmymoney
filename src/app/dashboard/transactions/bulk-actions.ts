'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export async function bulkInsertTransactions(transactions: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Format transactions for DB insertion
  const formattedTransactions = transactions.map((tx) => ({
    user_id: user.id,
    amount: parseFloat(tx.amount),
    currency: 'USD',
    type: tx.type.toLowerCase() === 'income' ? 'income' : 'expense',
    merchant: tx.merchant || 'Unknown Merchant',
    date: new Date(tx.date).toISOString(),
    source: 'import',
    is_reviewed: true,
  }))

  const { error } = await supabaseAdmin
    .from('transactions')
    .insert(formattedTransactions)

  if (error) {
    console.error("Bulk Insert Error:", error)
    throw new Error(`Failed to import transactions: ${error.message}`)
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function bulkDeleteTransactions(ids: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('user_id', user.id)
    .in('id', ids)

  if (error) {
    console.error("Bulk Delete Error:", error)
    throw new Error(`Failed to delete transactions: ${error.message}`)
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
