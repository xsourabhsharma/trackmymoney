import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Simple security check to prevent unauthorized triggering if not using Vercel Cron natively
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString()

  // Find all active recurring transactions where next_due_date is today or in the past
  const { data: dueSubscriptions, error: fetchError } = await supabaseAdmin
    .from('recurring_transactions')
    .select('*')
    .eq('is_active', true)
    .lte('next_due_date', today)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!dueSubscriptions || dueSubscriptions.length === 0) {
    return NextResponse.json({ message: 'No subscriptions due today.' })
  }

  let processedCount = 0

  for (const sub of dueSubscriptions) {
    // 1. Insert the new transaction into the ledger
    const { error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: sub.user_id,
        amount: sub.amount,
        currency: 'USD',
        type: 'expense', // Assume expense for now, could be derived from category
        category_id: sub.category_id,
        merchant: sub.merchant,
        description: 'Auto-generated recurring subscription',
        date: sub.next_due_date,
        source: 'manual', // System generated
        is_recurring: true,
        recurring_id: sub.id,
        is_reviewed: true
      })

    if (insertError) {
      console.error(`Failed to insert transaction for sub ${sub.id}:`, insertError)
      continue
    }

    // 2. Calculate the next due date
    const nextDue = new Date(sub.next_due_date)
    if (sub.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1)
    else if (sub.frequency === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1)
    else if (sub.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7)

    // 3. Update the recurring transaction's next_due_date
    const { error: updateError } = await supabaseAdmin
      .from('recurring_transactions')
      .update({ next_due_date: nextDue.toISOString() })
      .eq('id', sub.id)

    if (updateError) {
      console.error(`Failed to update next_due_date for sub ${sub.id}:`, updateError)
    } else {
      processedCount++
    }
  }

  // NOTE: If Resend API Key is set, we would loop over unique users and send them an email
  // summary of their auto-charged subscriptions here.

  return NextResponse.json({ 
    message: `Successfully processed ${processedCount} recurring subscriptions.`,
    processedCount
  })
}
