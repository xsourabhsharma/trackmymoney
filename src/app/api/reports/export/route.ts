import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { endOfDay, parseISO } from 'date-fns'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { createClient } from '@/utils/supabase/server'
import {
  getDateRangeForReports,
  normalizeDateString,
  type ReportsPeriod,
  type ReportsScope,
} from '@/app/dashboard/reports/data'

const reportsExportQuerySchema = z.object({
  format: z.enum(['csv', 'pdf']).default('csv'),
  from: z.string().optional(),
  period: z.enum(['last_7_days', 'this_month', 'this_year', 'custom']).default('this_month'),
  scope: z.enum(['all', 'bank', 'card']).default('all'),
  to: z.string().optional(),
  type: z.enum(['transactions', 'monthly', 'tax']).default('transactions'),
})

type ReportTransactionRow = {
  amount: string | number | null
  categories: { name: string } | { name: string }[] | null
  currency: string | null
  date: string
  description: string | null
  merchant: string | null
  type: string | null
}

function getCategoryLabel(categories: ReportTransactionRow['categories']) {
  const category = Array.isArray(categories) ? categories[0] : categories
  return category?.name || 'Uncategorized'
}

function csvCell(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function formatMoney(value: number, currency = 'USD') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    currency: currency === 'INR' ? 'INR' : 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsedQuery = reportsExportQuerySchema.safeParse({
    format: req.nextUrl.searchParams.get('format') || undefined,
    from: req.nextUrl.searchParams.get('from') || undefined,
    period: req.nextUrl.searchParams.get('period') || undefined,
    scope: req.nextUrl.searchParams.get('scope') || undefined,
    to: req.nextUrl.searchParams.get('to') || undefined,
    type: req.nextUrl.searchParams.get('type') || undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Invalid export query parameters' }, { status: 400 })
  }

  const { format, period, scope, type } = parsedQuery.data
  const from = normalizeDateString(parsedQuery.data.from)
  const to = normalizeDateString(parsedQuery.data.to)
  const { startDate, endDate } = getDateRangeForReports(period as ReportsPeriod, new Date(), { from, to })
  const transactions = await loadTransactionsForExport(supabase, user.id, scope, startDate, endDate)
  const report = buildReportSummary(transactions)
  const filenameBase = `trackmymoney-${type}-report-${startDate}-to-${endDate}`

  if (format === 'pdf') {
    const pdfBytes = buildPdfReport({
      endDate,
      generatedAt: new Date(),
      report,
      startDate,
      title: type === 'tax' ? 'TrackMyMoney Tax Transaction Report' : 'TrackMyMoney Transaction Report',
      transactions,
    })

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
        'Content-Type': 'application/pdf',
      },
      status: 200,
    })
  }

  const csvContent = buildCsvReport({
    endDate,
    generatedAt: new Date(),
    report,
    startDate,
    title: type === 'tax' ? 'TrackMyMoney Tax Transaction Report' : 'TrackMyMoney Transaction Report',
    transactions,
  })

  return new NextResponse(csvContent, {
    headers: {
      'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
    status: 200,
  })
}

async function loadTransactionsForExport(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  scope: ReportsScope,
  startDate: string,
  endDate: string
) {
  let accountIds: string[] | null = null
  if (scope !== 'all') {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, type')
      .eq('user_id', userId)

    const allowedTypes: Record<ReportsScope, string[]> = {
      all: [],
      bank: ['bank', 'checking', 'savings'],
      card: ['card', 'credit_card', 'credit'],
    }

    accountIds = (accounts || [])
      .filter((account) => allowedTypes[scope].some((typeName) => account.type?.toLowerCase().includes(typeName)))
      .map((account) => account.id)

    if (accountIds.length === 0) accountIds = ['__none__']
  }

  let transactionsQuery = supabase
    .from('transactions')
    .select('date, amount, currency, type, merchant, description, categories ( name )')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endOfDay(parseISO(endDate)).toISOString())
    .order('date', { ascending: true })

  if (accountIds) transactionsQuery = transactionsQuery.in('account_id', accountIds)

  const { data: txRaw, error } = await transactionsQuery
  if (error) throw new Error(error.message)
  return (txRaw || []) as unknown as ReportTransactionRow[]
}

function buildReportSummary(transactions: ReportTransactionRow[]) {
  let income = 0
  let expenses = 0
  const categoryTotals = new Map<string, number>()

  for (const tx of transactions) {
    const amount = Number(tx.amount || 0)
    if (tx.type === 'income') income += amount
    if (tx.type === 'expense') {
      expenses += amount
      const category = getCategoryLabel(tx.categories)
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount)
    }
  }

  return {
    categoryTotals: Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]),
    expenses,
    income,
    net: income - expenses,
    transactionCount: transactions.length,
  }
}

function buildCsvReport({
  endDate,
  generatedAt,
  report,
  startDate,
  title,
  transactions,
}: {
  endDate: string
  generatedAt: Date
  report: ReturnType<typeof buildReportSummary>
  startDate: string
  title: string
  transactions: ReportTransactionRow[]
}) {
  const lines = [
    [title],
    ['Generated At', generatedAt.toISOString()],
    ['Date Range', `${startDate} to ${endDate}`],
    ['Transactions', report.transactionCount],
    ['Income', report.income.toFixed(2)],
    ['Expenses', report.expenses.toFixed(2)],
    ['Net', report.net.toFixed(2)],
    [],
    ['Category Totals'],
    ['Category', 'Expense Total'],
    ...report.categoryTotals.map(([category, total]) => [category, total.toFixed(2)]),
    [],
    ['Transactions'],
    ['Date', 'Type', 'Merchant', 'Description', 'Category', 'Currency', 'Amount'],
    ...transactions.map((tx) => [
      tx.date,
      tx.type,
      tx.merchant || '',
      tx.description || '',
      getCategoryLabel(tx.categories),
      tx.currency || 'USD',
      Number(tx.amount || 0).toFixed(2),
    ]),
  ]

  return lines.map((row) => row.map(csvCell).join(',')).join('\n')
}

function buildPdfReport({
  endDate,
  generatedAt,
  report,
  startDate,
  title,
  transactions,
}: {
  endDate: string
  generatedAt: Date
  report: ReturnType<typeof buildReportSummary>
  startDate: string
  title: string
  transactions: ReportTransactionRow[]
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(17, 17, 17)
  doc.rect(0, 0, pageWidth, 92, 'F')
  doc.setTextColor(255, 250, 242)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('TrackMyMoney', 40, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.text(title, 40, 62)
  doc.setFontSize(10)
  doc.text(`${startDate} to ${endDate} | Generated ${generatedAt.toLocaleString()}`, 40, 78)

  doc.setTextColor(255, 90, 31)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(72)
  doc.text('TMM', pageWidth - 178, 68, { angle: 0 })

  const summaryY = 126
  const summaryCards = [
    ['Income', formatMoney(report.income)],
    ['Expenses', formatMoney(report.expenses)],
    ['Net', formatMoney(report.net)],
    ['Transactions', String(report.transactionCount)],
  ]

  summaryCards.forEach(([label, value], index) => {
    const x = 40 + index * 188
    doc.setDrawColor(228, 220, 208)
    doc.setFillColor(255, 250, 242)
    doc.roundedRect(x, summaryY, 168, 64, 10, 10, 'FD')
    doc.setTextColor(111, 108, 101)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(label.toUpperCase(), x + 14, summaryY + 22)
    doc.setTextColor(17, 17, 17)
    doc.setFontSize(16)
    doc.text(value, x + 14, summaryY + 46)
  })

  autoTable(doc, {
    body: transactions.map((tx) => [
      tx.date?.slice(0, 10) || '',
      tx.type || '',
      tx.merchant || '',
      getCategoryLabel(tx.categories),
      tx.currency || 'USD',
      Number(tx.amount || 0).toFixed(2),
      tx.description || '',
    ]),
    head: [['Date', 'Type', 'Merchant', 'Category', 'Currency', 'Amount', 'Description']],
    margin: { left: 40, right: 40 },
    startY: 220,
    styles: {
      cellPadding: 6,
      font: 'helvetica',
      fontSize: 8,
      overflow: 'linebreak',
      textColor: [17, 17, 17],
    },
    headStyles: {
      fillColor: [17, 17, 17],
      fontStyle: 'bold',
      textColor: [255, 250, 242],
    },
    alternateRowStyles: {
      fillColor: [250, 246, 236],
    },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 62 },
      2: { cellWidth: 132 },
      3: { cellWidth: 112 },
      4: { cellWidth: 58 },
      5: { cellWidth: 70, halign: 'right' },
      6: { cellWidth: 220 },
    },
    willDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setTextColor(220, 214, 205)
      doc.setFontSize(58)
      doc.setFont('helvetica', 'bold')
      doc.text('TrackMyMoney', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: -22,
      })
    },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setTextColor(111, 108, 101)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 70, pageHeight - 24)
    },
  })

  return Buffer.from(doc.output('arraybuffer'))
}
