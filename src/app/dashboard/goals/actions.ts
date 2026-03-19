'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// ─── Savings Goals ─────────────────────────────────────────────────────────

export async function addSavingsGoal(formData: FormData) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const name = formData.get('name') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)
  const currentAmount = parseFloat(formData.get('currentAmount') as string) || 0
  const deadline = formData.get('deadline') as string
  const icon = (formData.get('icon') as string) || '🎯'
  const color = (formData.get('color') as string) || '#3B82F6'
  const priority = parseInt(formData.get('priority') as string) || 3

  const { error } = await admin.from('savings_goals').insert({
    user_id: user.id,
    name,
    target_amount: targetAmount,
    current_amount: currentAmount,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    icon,
    color,
    priority,
    status: 'active',
  })

  if (error) throw new Error(`Failed to save goal: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function updateSavingsGoal(formData: FormData) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const targetAmount = parseFloat(formData.get('targetAmount') as string)
  const currentAmount = parseFloat(formData.get('currentAmount') as string)
  const deadline = formData.get('deadline') as string
  const status = (formData.get('status') as string) || 'active'

  const { error } = await admin
    .from('savings_goals')
    .update({
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Failed to update goal: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function deleteSavingsGoal(id: string) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const { error } = await admin
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete goal')
  revalidatePath('/dashboard/goals', 'page')
}

// ─── Debts ─────────────────────────────────────────────────────────────────

export async function addDebt(formData: FormData) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const name = formData.get('name') as string
  const creditor = (formData.get('creditor') as string) || null
  const totalAmount = parseFloat(formData.get('totalAmount') as string)
  const remainingAmount = parseFloat(formData.get('remainingAmount') as string) || totalAmount
  const interestRate = parseFloat(formData.get('interestRate') as string) || 0
  const minimumPayment = parseFloat(formData.get('minimumPayment') as string) || 0

  const { error } = await admin.from('debt_tracker').insert({
    user_id: user.id,
    name,
    creditor,
    total_amount: totalAmount,
    remaining_amount: remainingAmount,
    interest_rate: interestRate,
    minimum_payment: minimumPayment,
  })

  if (error) throw new Error(`Failed to save debt: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function updateDebt(formData: FormData) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const totalAmount = parseFloat(formData.get('totalAmount') as string)
  const remainingAmount = parseFloat(formData.get('remainingAmount') as string)
  const interestRate = parseFloat(formData.get('interestRate') as string)
  const minimumPayment = parseFloat(formData.get('minimumPayment') as string)
  const creditor = (formData.get('creditor') as string) || null

  const { error } = await admin
    .from('debt_tracker')
    .update({
      name,
      creditor,
      total_amount: totalAmount,
      remaining_amount: remainingAmount,
      interest_rate: interestRate,
      minimum_payment: minimumPayment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Failed to update debt: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function deleteDebt(id: string) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  const { error } = await admin
    .from('debt_tracker')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete debt')
  revalidatePath('/dashboard/goals', 'page')
}

// ─── AI Suggestions ────────────────────────────────────────────────────────

export async function applyGoalDebtSuggestion(suggestionId: string) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  await admin
    .from('ai_goal_debt_suggestions')
    .update({ status: 'applied', applied_at: new Date().toISOString() })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/goals', 'page')
}

export async function dismissGoalDebtSuggestion(suggestionId: string) {
  const user = await getAuthUser()
  const admin = createAdminClient()

  await admin
    .from('ai_goal_debt_suggestions')
    .update({ status: 'dismissed' })
    .eq('id', suggestionId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/goals', 'page')
}
