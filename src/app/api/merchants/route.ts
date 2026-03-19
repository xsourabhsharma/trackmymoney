import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('merchant')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Extract unique merchant names
  const merchants = Array.from(new Set(data.map(t => t.merchant))).sort()

  return NextResponse.json({ merchants })
}
