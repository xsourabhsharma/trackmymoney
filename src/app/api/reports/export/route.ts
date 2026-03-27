import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { getDateRangeForReports } from '@/app/dashboard/reports/data'
import type { ReportsScope } from '@/app/dashboard/reports/data'

const reportsExportQuerySchema = z.object({
  type: z.enum(['monthly', 'tax']).default('monthly'),
  format: z.literal('csv').default('csv'),
  period: z.enum(['this_month', 'last_month', 'last_three_months', 'year_to_date']).default('this_month'),
  scope: z.enum(['all', 'bank', 'card']).default('all'),
})

type ReportTransactionRow = {
  date: string
  amount: string | number | null
  type: string | null
  merchant: string | null
  description: string | null
  categories: { name: string } | { name: string }[] | null
}

function getCategoryLabel(categories: ReportTransactionRow['categories']) {
  const category = Array.isArray(categories) ? categories[0] : categories
  return category?.name || 'Uncategorized'
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsedQuery = reportsExportQuerySchema.safeParse({
    type: req.nextUrl.searchParams.get('type') || undefined,
    format: req.nextUrl.searchParams.get('format') || undefined,
    period: req.nextUrl.searchParams.get('period') || undefined,
    scope: req.nextUrl.searchParams.get('scope') || undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Invalid export query parameters' }, { status: 400 })
  }

  const { type, period, scope } = parsedQuery.data
  const { startDate, endDate } = getDateRangeForReports(period, new Date())

  let accountIds: string[] | null = null
  if (scope !== 'all') {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, type')
      .eq('user_id', user.id)

    const allowedTypes: Record<ReportsScope, string[]> = {
      all: [],
      bank: ['bank', 'checking', 'savings'],
      card: ['card', 'credit_card', 'credit'],
    }

    accountIds = (accounts || [])
      .filter((account) => allowedTypes[scope].some((typeName) => account.type?.toLowerCase().includes(typeName)))
      .map((account) => account.id)

    if (accountIds.length === 0) {
      accountIds = ['__none__']
    }
  }

  let transactionsQuery = supabase
    .from('transactions')
    .select(`date, amount, type, merchant, description, categories ( name )`)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (accountIds) {
    transactionsQuery = transactionsQuery.in('account_id', accountIds)
  }

  const { data: txRaw } = await transactionsQuery
  const transactions = (txRaw || []) as ReportTransactionRow[]

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
        `"${getCategoryLabel(tx.categories).replace(/"/g, '""')}"`,
        Number(tx.amount || 0).toFixed(2),
      ].join(',')),
    ].join('\n')
  } else {
    headers.push('Date', 'Type', 'Merchant', 'Category', 'Amount')
    csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        `"${(tx.merchant || '').replace(/"/g, '""')}"`,
        `"${getCategoryLabel(tx.categories).replace(/"/g, '""')}"`,
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
