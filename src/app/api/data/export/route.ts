import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const [
      profileResult,
      txResult,
      subResult,
      budgetsResult,
      goalsResult,
      debtsResult
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, currency, locale, preferences, created_at, updated_at')
        .eq('id', user.id)
        .single(),
      supabase.from('transactions').select('*').eq('user_id', user.id),
      supabase.from('subscriptions').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('debts').select('*').eq('user_id', user.id),
    ])

    const exportData = {
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        profile: profileResult.data || null
      },
      data: {
        transactions: txResult.data || [],
        subscriptions: subResult.data || [],
        budgets: budgetsResult.data || [],
        goals: goalsResult.data || [],
        debts: debtsResult.data || []
      }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="track_my_money_archive_${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Export failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
