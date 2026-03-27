import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('merchant')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const merchants = Array.from(
    new Set(
      (data || [])
        .map((transaction) => transaction.merchant?.trim())
        .filter((merchant): merchant is string => Boolean(merchant))
    )
  ).sort((left, right) => left.localeCompare(right))

  return NextResponse.json({ merchants })
}
