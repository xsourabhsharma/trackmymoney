import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getDateRangeForReports } from '@/app/dashboard/reports/data'
import type { ReportsPeriod, ReportsScope } from '@/app/dashboard/reports/data'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') || 'monthly'
  const format = searchParams.get('format') || 'csv'
  const period = (searchParams.get('period') || 'this_month') as ReportsPeriod
  const scope = (searchParams.get('scope') || 'all') as ReportsScope

  const admin = createAdminClient()
  const { startDate, endDate } = getDateRangeForReports(period, new Date())

  // Fetch transactions
  const { data: txRaw } = await admin
    .from('transactions')
    .select(`date, amount, type, merchant, description, categories ( name )`)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  const transactions = txRaw || []

  // Build CSV
  let csvContent = ''
  const headers: string[] = []

  if (type === 'tax') {
    headers.push('Date', 'Type', 'Merchant', 'Description', 'Category', 'Amount')
    csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        `"${(tx.merchant || '').replace(/"/g, '""')}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${((tx.categories as any)?.name || 'Uncategorized').replace(/"/g, '""')}"`,
        Number(tx.amount || 0).toFixed(2),
      ].join(',')),
    ].join('\n')
  } else {
    // Generic summary
    headers.push('Date', 'Type', 'Merchant', 'Category', 'Amount')
    csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        `"${(tx.merchant || '').replace(/"/g, '""')}"`,
        `"${((tx.categories as any)?.name || 'Uncategorized').replace(/"/g, '""')}"`,
        Number(tx.amount || 0).toFixed(2),
      ].join(',')),
    ].join('\n')
  }

  const filename = `${type}-report-${startDate}-to-${endDate}.csv`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
