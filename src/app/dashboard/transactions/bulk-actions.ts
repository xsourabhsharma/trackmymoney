'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface BulkTransactionInput {
  amount: number | string
  merchant?: string | null
  date: string
  type?: string | null
}

function toImportedTransaction(userId: string, tx: BulkTransactionInput) {
  const amount = typeof tx.amount === 'number' ? tx.amount : Number.parseFloat(tx.amount)
  const parsedDate = new Date(tx.date)

  if (!Number.isFinite(amount) || amount <= 0 || Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return {
    user_id: userId,
    amount,
    currency: 'USD',
    type: tx.type?.toLowerCase() === 'income' ? 'income' as const : 'expense' as const,
    merchant: tx.merchant?.trim() || 'Unknown Merchant',
    date: parsedDate.toISOString(),
    source: 'import' as const,
    is_reviewed: true,
  }
}

export async function bulkInsertTransactions(transactions: BulkTransactionInput[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const formattedTransactions = transactions
    .map((tx) => toImportedTransaction(user.id, tx))
    .filter((tx): tx is NonNullable<ReturnType<typeof toImportedTransaction>> => tx !== null)

  if (formattedTransactions.length === 0) {
    throw new Error('No valid transactions to import')
  }

  const { error } = await supabase
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
  if (ids.length === 0) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
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
