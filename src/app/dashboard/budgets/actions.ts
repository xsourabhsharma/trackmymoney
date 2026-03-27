'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { user, supabase }
}

export interface CreateBudgetInput {
  categoryId: string
  limitAmount: number
  periodType: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  rollover: boolean
  currency?: string
}

export interface UpdateBudgetInput {
  categoryId?: string
  limitAmount?: number
  periodType?: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  rollover?: boolean
}

export async function createBudget(payload: CreateBudgetInput): Promise<void> {
  const { user, supabase } = await getAuthUser()

  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { error } = await supabase.from('budgets').insert({
    user_id: user.id,
    category_id: payload.categoryId,
    limit_amount: payload.limitAmount,
    period_type: payload.periodType || 'monthly',
    period_start: periodStart,
    period_end: periodEnd,
    rollover: payload.rollover || false,
    status: 'active',
    spent: 0,
  })

  if (error) {
    console.error('createBudget error:', error.message)
    throw new Error('Failed to create budget: ' + error.message)
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function updateBudget(id: string, payload: UpdateBudgetInput): Promise<void> {
  const { user, supabase } = await getAuthUser()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.categoryId !== undefined) updates.category_id = payload.categoryId
  if (payload.limitAmount !== undefined) updates.limit_amount = payload.limitAmount
  if (payload.periodType !== undefined) updates.period_type = payload.periodType
  if (payload.rollover !== undefined) updates.rollover = payload.rollover

  const { error } = await supabase.from('budgets').update(updates).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('updateBudget error:', error.message)
    throw new Error('Failed to update budget: ' + error.message)
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function deleteBudget(id: string): Promise<void> {
  const { user, supabase } = await getAuthUser()

  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('deleteBudget error:', error.message)
    throw new Error('Failed to delete budget: ' + error.message)
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function applyBudgetSuggestion(suggestionId: string): Promise<void> {
  const { user, supabase } = await getAuthUser()

  try {
   
    const { data: suggestion, error: fetchErr } = await supabase
      .from('budget_ai_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !suggestion) return

   
    if (suggestion.budget_id && suggestion.to_amount) {
      await supabase
        .from('budgets')
        .update({ limit_amount: suggestion.to_amount, updated_at: new Date().toISOString() })
        .eq('id', suggestion.budget_id)
        .eq('user_id', user.id)
    }

   
    await supabase
      .from('budget_ai_suggestions')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', suggestionId)
      .eq('user_id', user.id)
  } catch {
   
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function dismissBudgetSuggestion(suggestionId: string): Promise<void> {
  const { user, supabase } = await getAuthUser()

  try {
    await supabase
      .from('budget_ai_suggestions')
      .update({ status: 'dismissed' })
      .eq('id', suggestionId)
      .eq('user_id', user.id)
  } catch {
   
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function addBudget(formData: FormData) {
  const categoryId = formData.get('categoryId') as string
  const amount = formData.get('amount') as string
  const rollover = formData.get('rollover') === 'true'

  await createBudget({
    categoryId,
    limitAmount: parseFloat(amount),
    periodType: 'monthly',
    rollover,
  })
}

export async function editBudget(formData: FormData) {
  const id = formData.get('id') as string
  const amount = formData.get('amount') as string
  const rollover = formData.get('rollover') === 'true'

  await updateBudget(id, {
    limitAmount: parseFloat(amount),
    rollover,
  })
}
