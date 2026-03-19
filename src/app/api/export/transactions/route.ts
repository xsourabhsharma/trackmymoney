import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { unparse } from 'papaparse'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No transaction IDs provided for export.' }, { status: 400 })
    }

    // Fetch the detailed transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id, date, merchant, description, type, amount, currency, status, source,
        categories ( name )
      `)
      .in('id', ids)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error("Export fetch error:", error)
      return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 })
    }

    // Flatten data for CSV
    const exportData = (transactions || []).map((tx: any) => ({
      ID: tx.id,
      Date: new Date(tx.date).toISOString().split('T')[0],
      Merchant: tx.merchant || '',
      Description: tx.description || '',
      Category: tx.categories?.name || 'Uncategorized',
      Type: tx.type,
      Amount: tx.amount,
      Currency: tx.currency,
      Status: tx.status,
      Source: tx.source
    }))

    const csvData = unparse(exportData)

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=track_my_money_export_${new Date().getTime()}.csv`,
      },
    })
  } catch (err: any) {
    console.error("Export API Exception:", err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
