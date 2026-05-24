'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

type GoalStatus = 'active' | 'completed' | 'paused'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { user, supabase }
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} is required`)
  }
  return value.trim()
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function numberFromForm(formData: FormData, key: string, fallback?: number) {
  const value = formData.get(key)
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number.NaN
  if (Number.isFinite(parsed)) return parsed
  if (fallback !== undefined) return fallback
  throw new Error(`${key} must be a valid number`)
}

function optionalDateIso(value: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new Error('Date is invalid')
  return parsed.toISOString()
}

function goalStatusFromForm(formData: FormData): GoalStatus {
  const status = formData.get('status')
  return status === 'completed' || status === 'paused' ? status : 'active'
}

export async function addSavingsGoal(formData: FormData) {
  const { user, supabase } = await getAuthContext()

  const name = requiredString(formData, 'name')
  const targetAmount = numberFromForm(formData, 'targetAmount')
  const currentAmount = numberFromForm(formData, 'currentAmount', 0)
  const deadline = optionalString(formData, 'deadline')
  const icon = optionalString(formData, 'icon') || 'target'
  const color = optionalString(formData, 'color') || '#3B82F6'
  const priority = numberFromForm(formData, 'priority', 1)

  const { error } = await supabase.from('goals').insert({
    user_id: user.id,
    name,
    target_amount: targetAmount,
    current_amount: currentAmount,
    target_date: optionalDateIso(deadline),
    icon,
    color,
    priority,
    status: 'active',
  })

  if (error) throw new Error(`Failed to save goal: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function updateSavingsGoal(formData: FormData) {
  const { user, supabase } = await getAuthContext()

  const id = requiredString(formData, 'id')
  const name = requiredString(formData, 'name')
  const targetAmount = numberFromForm(formData, 'targetAmount')
  const currentAmount = numberFromForm(formData, 'currentAmount')
  const deadline = optionalString(formData, 'deadline')
  const status = goalStatusFromForm(formData)

  const { error } = await supabase
    .from('goals')
    .update({
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: optionalDateIso(deadline),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Failed to update goal: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function deleteSavingsGoal(id: string) {
  const { user, supabase } = await getAuthContext()

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete goal')
  revalidatePath('/dashboard/goals', 'page')
}

export async function addDebt(formData: FormData) {
  const { user, supabase } = await getAuthContext()

  const name = requiredString(formData, 'name')
  const totalAmount = numberFromForm(formData, 'totalAmount')
  const remainingAmount = numberFromForm(formData, 'remainingAmount', totalAmount)
  const interestRate = numberFromForm(formData, 'interestRate', 0)
  const minimumPayment = numberFromForm(formData, 'minimumPayment', 0)
  const dueDate = optionalString(formData, 'dueDate')

  const { error } = await supabase.from('debts').insert({
    user_id: user.id,
    name,
    total_amount: totalAmount,
    remaining_amount: remainingAmount,
    interest_rate: interestRate,
    minimum_payment: minimumPayment,
    due_date: optionalDateIso(dueDate),
  })

  if (error) throw new Error(`Failed to save debt: ${error.message}`)
  revalidatePath('/dashboard/goals', 'page')
}

export async function updateDebt(formData: FormData) {
  const { user, supabase } = await getAuthContext()

  const id = requiredString(formData, 'id')
  const name = requiredString(formData, 'name')
  const totalAmount = numberFromForm(formData, 'totalAmount')
  const remainingAmount = numberFromForm(formData, 'remainingAmount')
  const interestRate = numberFromForm(formData, 'interestRate', 0)
  const minimumPayment = numberFromForm(formData, 'minimumPayment', 0)

  const { error } = await supabase
    .from('debts')
    .update({
      name,
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
  const { user, supabase } = await getAuthContext()

  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete debt')
  revalidatePath('/dashboard/goals', 'page')
}

export async function applyGoalDebtSuggestion(suggestionId: string) {
  await getAuthContext()
  void suggestionId
  revalidatePath('/dashboard/goals', 'page')
}

export async function dismissGoalDebtSuggestion(suggestionId: string) {
  await getAuthContext()
  void suggestionId
  revalidatePath('/dashboard/goals', 'page')
}
