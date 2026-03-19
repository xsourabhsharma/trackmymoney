import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const admin = createAdminClient()

    // Fetch all user data in parallel
    const [
      txResult,
      subResult,
      budgetsResult,
      goalsResult,
      debtsResult,
      settingsResult
    ] = await Promise.all([
      admin.from('transactions').select('*').eq('user_id', user.id),
      admin.from('subscriptions').select('*').eq('user_id', user.id),
      admin.from('budgets').select('*').eq('user_id', user.id),
      admin.from('savings_goals').select('*').eq('user_id', user.id),
      admin.from('debts').select('*').eq('user_id', user.id),
      admin.from('user_settings').select('*').eq('user_id', user.id).single()
    ])

    const exportData = {
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        settings: settingsResult.data || {}
      },
      data: {
        transactions: txResult.data || [],
        subscriptions: subResult.data || [],
        budgets: budgetsResult.data || [],
        savings_goals: goalsResult.data || [],
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
