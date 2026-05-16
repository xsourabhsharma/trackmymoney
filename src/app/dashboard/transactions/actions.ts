'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CreateTransactionPayload {
  amount: number;
  currency?: string;
  type: 'income' | 'expense' | 'transfer';
  category_id?: string | null;
  account_id: string;
  merchant?: string;
  description?: string;
  date: string;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) throw new Error("Unauthorized");

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    ...payload,
    source: 'manual',
    status: 'cleared',
  });

  if (error) {
    console.error("Created transaction error", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/transactions');
  return { success: true };
}

export async function updateTransaction(id: string, payload: Partial<CreateTransactionPayload>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('transactions')
    .update({ 
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error("Update transaction error", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/transactions');
  return { success: true };
}

export async function deleteTransactions(ids: string[]) {
  if (!ids || ids.length === 0) return { success: true };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', user.id)
    .in('id', ids);

  if (error) {
    console.error("Delete transactions error", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/transactions');
  return { success: true };
}
