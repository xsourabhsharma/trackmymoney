import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { unparse } from 'papaparse'
import { z } from 'zod'

const exportTransactionsRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
})

type ExportTransactionRow = {
  id: string
  date: string
  merchant: string | null
  description: string | null
  type: string
  amount: string | number
  currency: string
  status: string | null
  source: string | null
  categories: { name: string } | { name: string }[] | null
}

function getCategoryName(categories: ExportTransactionRow['categories']) {
  const category = Array.isArray(categories) ? categories[0] : categories
  return category?.name || 'Uncategorized'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsedBody = exportTransactionsRequestSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'No transaction IDs provided for export.' }, { status: 400 })
    }

    const { ids } = parsedBody.data

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

    const exportData = ((transactions || []) as ExportTransactionRow[]).map((tx) => ({
      ID: tx.id,
      Date: new Date(tx.date).toISOString().split('T')[0],
      Merchant: tx.merchant || '',
      Description: tx.description || '',
      Category: getCategoryName(tx.categories),
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
  } catch (err) {
    console.error("Export API Exception:", err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
