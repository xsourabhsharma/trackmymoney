'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  subscriptionIntervalSchema,
  subscriptionStatusSchema,
  type SubscriptionInterval,
  type SubscriptionStatus,
} from '@/lib/contracts'
import type { Database } from '@/lib/database.types'

type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export interface CreateSubscriptionPayload {
  merchant: string
  serviceName?: string
  amount: number
  currency?: string
  interval: SubscriptionInterval
  status: SubscriptionStatus
  nextChargeDate?: string
  lastChargeDate?: string
  categoryId?: string | null
  linkedAccountId?: string | null
  notes?: string
  potentialSavings?: boolean
}

export async function createSubscription(payload: CreateSubscriptionPayload) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Error("Unauthorized")

  const interval = subscriptionIntervalSchema.safeParse(payload.interval)
  const status = subscriptionStatusSchema.safeParse(payload.status)

  if (!interval.success) return { success: false, error: 'Invalid subscription interval' }
  if (!status.success) return { success: false, error: 'Invalid subscription status' }

  const { data: newSub, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    merchant: payload.merchant,
    service_name: payload.serviceName,
    amount: payload.amount,
    currency: payload.currency || 'USD',
    interval: interval.data,
    status: status.data,
    next_charge_date: payload.nextChargeDate,
    last_charge_date: payload.lastChargeDate,
    category_id: payload.categoryId,
    linked_account_id: payload.linkedAccountId,
    notes: payload.notes,
    potential_savings: payload.potentialSavings || false
  }).select('id').single()

  if (error) {
    console.error("Create subscription error", error)
    return { success: false, error: error.message }
  }

 
  await supabase.from('subscription_events').insert({
    subscription_id: newSub.id,
    user_id: user.id,
    event_type: 'created'
  })

  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function updateSubscription(id: string, payload: Partial<CreateSubscriptionPayload>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  if (payload.interval !== undefined && !subscriptionIntervalSchema.safeParse(payload.interval).success) {
    return { success: false, error: 'Invalid subscription interval' }
  }

  if (payload.status !== undefined && !subscriptionStatusSchema.safeParse(payload.status).success) {
    return { success: false, error: 'Invalid subscription status' }
  }

 
  const updateData: SubscriptionUpdate = { updated_at: new Date().toISOString() }
  if (payload.merchant !== undefined) updateData.merchant = payload.merchant
  if (payload.serviceName !== undefined) updateData.service_name = payload.serviceName
  if (payload.amount !== undefined) updateData.amount = payload.amount
  if (payload.currency !== undefined) updateData.currency = payload.currency
  if (payload.interval !== undefined) updateData.interval = payload.interval
  if (payload.status !== undefined) updateData.status = payload.status
  if (payload.nextChargeDate !== undefined) updateData.next_charge_date = payload.nextChargeDate
  if (payload.lastChargeDate !== undefined) updateData.last_charge_date = payload.lastChargeDate
  if (payload.categoryId !== undefined) updateData.category_id = payload.categoryId
  if (payload.linkedAccountId !== undefined) updateData.linked_account_id = payload.linkedAccountId
  if (payload.notes !== undefined) updateData.notes = payload.notes
  if (payload.potentialSavings !== undefined) updateData.potential_savings = payload.potentialSavings

  const { data: updatedSub, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error("Update subscription error", error)
    return { success: false, error: error.message }
  }

  if (!updatedSub) {
    return { success: false, error: 'Subscription not found' }
  }

  await supabase.from('subscription_events').insert({
    subscription_id: id,
    user_id: user.id,
    event_type: 'updated'
  })

  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function pauseSubscriptions(ids: string[]) {
  if (!ids || ids.length === 0) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .in('id', ids)
    .select('id')

  if (error) {
    console.error("Pause subscriptions error", error)
    return { success: false, error: error.message }
  }

 
  const updatedIds = (data || []).map(sub => sub.id)
  const events = updatedIds.map(id => ({
    subscription_id: id,
    user_id: user.id,
    event_type: 'paused' as const
  }))

  if (events.length > 0) {
    await supabase.from('subscription_events').insert(events)
  }

  revalidatePath('/dashboard/subscriptions')
  return { success: true }
}

export async function deleteSubscriptions(ids: string[]) {
    if (!ids || ids.length === 0) return { success: true };
  
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
  
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)
      .in('id', ids);
  
    if (error) {
      console.error("Delete subscriptions error", error);
      return { success: false, error: error.message };
    }
  
    revalidatePath('/dashboard/subscriptions');
    return { success: true };
}
