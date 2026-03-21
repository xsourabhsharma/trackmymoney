'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

function getAdmin() {
  return createAdminClient()
}

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
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
  const user = await getAuthUser()
  const admin = getAdmin()

  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { error } = await admin.from('budgets').insert({
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
    throw new Error('Failed to create budget')
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function updateBudget(id: string, payload: UpdateBudgetInput): Promise<void> {
  const user = await getAuthUser()
  const admin = getAdmin()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.categoryId !== undefined) updates.category_id = payload.categoryId
  if (payload.limitAmount !== undefined) updates.limit_amount = payload.limitAmount
  if (payload.periodType !== undefined) updates.period_type = payload.periodType
  if (payload.rollover !== undefined) updates.rollover = payload.rollover

  const { error } = await admin.from('budgets').update(updates).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('updateBudget error:', error.message)
    throw new Error('Failed to update budget')
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function deleteBudget(id: string): Promise<void> {
  const user = await getAuthUser()
  const admin = getAdmin()

  const { error } = await admin.from('budgets').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('deleteBudget error:', error.message)
    throw new Error('Failed to delete budget')
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function applyBudgetSuggestion(suggestionId: string): Promise<void> {
  const user = await getAuthUser()
  const admin = getAdmin()

  try {
    // Fetch the suggestion
    const { data: suggestion, error: fetchErr } = await admin
      .from('budget_ai_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !suggestion) return // Suggestion not found — silently no-op

    // If linked to a budget, update the budget amount
    if (suggestion.budget_id && suggestion.to_amount) {
      await admin
        .from('budgets')
        .update({ limit_amount: suggestion.to_amount, updated_at: new Date().toISOString() })
        .eq('id', suggestion.budget_id)
        .eq('user_id', user.id)
    }

    // Mark suggestion as applied
    await admin
      .from('budget_ai_suggestions')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', suggestionId)
      .eq('user_id', user.id)
  } catch {
    // Table may not exist — silently no-op
  }

  revalidatePath('/dashboard/budgets', 'page')
}

export async function dismissBudgetSuggestion(suggestionId: string): Promise<void> {
  const user = await getAuthUser()
  const admin = getAdmin()

  try {
    await admin
      .from('budget_ai_suggestions')
      .update({ status: 'dismissed' })
      .eq('id', suggestionId)
      .eq('user_id', user.id)
  } catch {
    // Table may not exist — silently no-op
  }

  revalidatePath('/dashboard/budgets', 'page')
}

// Legacy compatibility wrappers for existing buttons
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
