import { importCommitRowSchema, type TransactionType } from '@/lib/contracts'
import type { TablesInsert } from '@/lib/database.types'

export type ValidatedImportCommitRow = {
  id: string
  amount: number
  currency: string
  type: TransactionType
  categoryId: string | null
  date: string
  merchant: string | null
  description: string | null
  usedDefaultCurrency: boolean
}

export type ImportCommitValidationIssue = {
  id: string | null
  message: string
}

export type ImportCommitValidationResult = {
  validRows: ValidatedImportCommitRow[]
  invalidRows: ImportCommitValidationIssue[]
}

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/

export function validateImportCommitRows(rows: unknown): ImportCommitValidationResult {
  if (!Array.isArray(rows)) {
    return {
      validRows: [],
      invalidRows: [{ id: null, message: 'Import rows result was not an array.' }],
    }
  }

  const validRows: ValidatedImportCommitRow[] = []
  const invalidRows: ImportCommitValidationIssue[] = []

  for (const row of rows) {
    const parsedRow = importCommitRowSchema.safeParse(row)
    if (!parsedRow.success) {
      invalidRows.push({
        id: extractRowId(row),
        message: parsedRow.error.issues.map((issue) => issue.message).join('; '),
      })
      continue
    }

    const rowIssues: string[] = []
    const amount = normalizeAmount(parsedRow.data.parsed_amount)
    const date = normalizeDate(parsedRow.data.parsed_date)
    const currency = normalizeCurrency(parsedRow.data.parsed_currency)
    const merchant = normalizeText(parsedRow.data.parsed_merchant)
    const description = normalizeText(parsedRow.data.parsed_description)

    if (amount === null) {
      rowIssues.push('Missing or invalid amount.')
    }

    if (!date) {
      rowIssues.push('Missing or invalid date.')
    }

    if (!parsedRow.data.parsed_type) {
      rowIssues.push('Missing transaction type.')
    }

    if (!currency.value) {
      rowIssues.push('Invalid currency code.')
    }

    if (!merchant && !description) {
      rowIssues.push('Missing merchant or description.')
    }

    if (rowIssues.length > 0 || amount === null || !date || !parsedRow.data.parsed_type || !currency.value) {
      invalidRows.push({
        id: parsedRow.data.id,
        message: rowIssues.join(' '),
      })
      continue
    }

    validRows.push({
      id: parsedRow.data.id,
      amount,
      currency: currency.value,
      type: parsedRow.data.parsed_type,
      categoryId: parsedRow.data.parsed_category_id,
      date,
      merchant: merchant ?? description,
      description,
      usedDefaultCurrency: currency.usedDefault,
    })
  }

  return { validRows, invalidRows }
}

export function buildImportTransactions({
  rows,
  userId,
  accountId,
  importJobId,
}: {
  rows: ValidatedImportCommitRow[]
  userId: string
  accountId: string | null
  importJobId: string
}): TablesInsert<'transactions'>[] {
  return rows.map((row) => ({
    user_id: userId,
    account_id: accountId,
    amount: row.amount,
    currency: row.currency,
    type: row.type,
    category_id: row.categoryId,
    merchant: row.merchant,
    description: row.description,
    date: row.date,
    status: 'cleared',
    source: 'import',
    is_reviewed: false,
    source_metadata: {
      import_job_id: importJobId,
      import_row_id: row.id,
      currency_defaulted: row.usedDefaultCurrency,
    },
  }))
}

export function collectIds(rows: unknown) {
  const ids = new Set<string>()

  if (!Array.isArray(rows)) {
    return ids
  }

  for (const row of rows) {
    if (typeof row !== 'object' || row === null || !('id' in row)) {
      continue
    }

    const id = (row as { id?: unknown }).id
    if (typeof id === 'string') {
      ids.add(id)
    }
  }

  return ids
}

function normalizeAmount(value: string | number | null) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  return Math.abs(amount)
}

function normalizeDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function normalizeCurrency(value: string | null) {
  if (!value) {
    return { value: 'USD', usedDefault: true }
  }

  const normalized = value.trim().toUpperCase()
  return {
    value: CURRENCY_CODE_PATTERN.test(normalized) ? normalized : null,
    usedDefault: false,
  }
}

function normalizeText(value: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function extractRowId(row: unknown) {
  if (typeof row !== 'object' || row === null || !('id' in row)) {
    return null
  }

  const id = (row as { id?: unknown }).id
  return typeof id === 'string' ? id : null
}

