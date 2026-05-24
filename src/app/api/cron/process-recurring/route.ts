import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { subscriptionIntervalSchema, type SubscriptionInterval } from '@/lib/contracts'
import type { Database } from '@/lib/database.types'

type DueSubscription = Pick<
  Database['public']['Tables']['subscriptions']['Row'],
  | 'id'
  | 'user_id'
  | 'merchant'
  | 'service_name'
  | 'amount'
  | 'currency'
  | 'interval'
  | 'next_charge_date'
  | 'category_id'
  | 'linked_account_id'
>

type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
type SubscriptionEventInsert = Database['public']['Tables']['subscription_events']['Insert']

function getNextChargeDate(currentDate: string, interval: SubscriptionInterval): string | null {
  const nextDate = new Date(currentDate)

  if (Number.isNaN(nextDate.getTime())) {
    return null
  }

  switch (interval) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      return nextDate.toISOString()
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      return nextDate.toISOString()
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      return nextDate.toISOString()
    case 'custom':
      return null
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Cron environment is not configured' }, { status: 500 })
  }

  const supabaseAdmin = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const nowIso = new Date().toISOString()

  const { data: dueSubscriptions, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id, merchant, service_name, amount, currency, interval, next_charge_date, category_id, linked_account_id')
    .eq('status', 'active')
    .not('next_charge_date', 'is', null)
    .lte('next_charge_date', nowIso)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const subscriptions = (dueSubscriptions ?? []) as DueSubscription[]

  if (subscriptions.length === 0) {
    return NextResponse.json({ message: 'No subscriptions due today.', processedCount: 0, skippedCount: 0 })
  }

  let processedCount = 0
  let skippedCount = 0
  let duplicateCount = 0

  for (const subscription of subscriptions) {
    const chargeDate = subscription.next_charge_date
    const parsedInterval = subscriptionIntervalSchema.safeParse(subscription.interval)

    if (!chargeDate || !parsedInterval.success) {
      skippedCount++
      continue
    }

    const nextChargeDate = getNextChargeDate(chargeDate, parsedInterval.data)

    if (!nextChargeDate) {
      skippedCount++
      console.warn(`Skipping subscription ${subscription.id}: custom intervals need an explicit scheduling rule.`)
      continue
    }

    const { data: existingTransaction, error: existingError } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('user_id', subscription.user_id)
      .eq('recurring_id', subscription.id)
      .eq('date', chargeDate)
      .maybeSingle()

    if (existingError) {
      skippedCount++
      console.error(`Failed to check existing recurring transaction for subscription ${subscription.id}:`, existingError)
      continue
    }

    let transactionId = existingTransaction?.id

    if (!transactionId) {
      const transaction: TransactionInsert = {
        user_id: subscription.user_id,
        account_id: subscription.linked_account_id,
        amount: subscription.amount,
        currency: subscription.currency,
        type: 'expense',
        category_id: subscription.category_id,
        merchant: subscription.merchant,
        description: subscription.service_name
          ? `Auto-generated recurring subscription for ${subscription.service_name}`
          : 'Auto-generated recurring subscription',
        date: chargeDate,
        source: 'manual',
        source_metadata: {
          generated_by: 'process-recurring-cron',
          subscription_id: subscription.id,
          subscription_next_charge_date: chargeDate,
        },
        is_subscription: true,
        is_recurring: true,
        recurring_id: subscription.id,
        is_reviewed: true,
      }

      const { data: insertedTransaction, error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert(transaction)
        .select('id')
        .single()

      if (insertError) {
        skippedCount++
        console.error(`Failed to insert transaction for subscription ${subscription.id}:`, insertError)
        continue
      }

      transactionId = insertedTransaction.id
    } else {
      duplicateCount++
    }

    const subscriptionUpdate: SubscriptionUpdate = {
      last_charge_date: chargeDate,
      next_charge_date: nextChargeDate,
      updated_at: nowIso,
    }

    const { data: updatedSubscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionUpdate)
      .eq('id', subscription.id)
      .eq('user_id', subscription.user_id)
      .eq('next_charge_date', chargeDate)
      .select('id')
      .maybeSingle()

    if (updateError || !updatedSubscription) {
      skippedCount++
      console.error(`Failed to advance next_charge_date for subscription ${subscription.id}:`, updateError)
      continue
    }

    const event: SubscriptionEventInsert = {
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      event_type: 'charge_detected',
      data: {
        transaction_id: transactionId,
        amount: subscription.amount,
        currency: subscription.currency,
        charged_at: chargeDate,
        next_charge_date: nextChargeDate,
      },
    }

    const { error: eventError } = await supabaseAdmin
      .from('subscription_events')
      .insert(event)

    if (eventError) {
      console.error(`Failed to record charge event for subscription ${subscription.id}:`, eventError)
    }

    processedCount++
  }

  return NextResponse.json({
    message: `Processed ${processedCount} recurring subscriptions.`,
    processedCount,
    skippedCount,
    duplicateCount,
  })
}
