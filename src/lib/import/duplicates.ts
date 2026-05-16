import { z } from 'zod'

export const IMPORT_DUPLICATE_AMOUNT_TOLERANCE = 0.01
export const IMPORT_DUPLICATE_WINDOW_DAYS = 3

const existingTransactionDuplicateSchema = z.object({
  id: z.string(),
  amount: z.union([z.string(), z.number()]),
  date: z.string(),
  merchant: z.string().nullable(),
  description: z.string().nullable(),
  account_id: z.string().nullable(),
})

export type ExistingTransactionForDuplicateCheck = z.infer<typeof existingTransactionDuplicateSchema>

export type ImportDuplicateCandidate = {
  id: string
  amount: number
  date: string
  merchant: string | null
  description: string | null
  accountId: string | null
}

export function parseExistingTransactionsForDuplicateCheck(rows: unknown) {
  const parsedRows = z.array(existingTransactionDuplicateSchema).safeParse(rows)
  return parsedRows.success ? parsedRows.data : []
}

export function findDuplicateImportRowIds(
  candidates: ImportDuplicateCandidate[],
  existingTransactions: ExistingTransactionForDuplicateCheck[]
) {
  const duplicateIds = new Set<string>()

  for (const candidate of candidates) {
    const hasDuplicate = existingTransactions.some((transaction) =>
      isDuplicateCandidate(candidate, transaction)
    )

    if (hasDuplicate) {
      duplicateIds.add(candidate.id)
    }
  }

  return duplicateIds
}

function isDuplicateCandidate(
  candidate: ImportDuplicateCandidate,
  transaction: ExistingTransactionForDuplicateCheck
) {
  const transactionAmount = Number(transaction.amount)
  if (!Number.isFinite(transactionAmount)) {
    return false
  }

  const candidateDate = new Date(candidate.date)
  const transactionDate = new Date(transaction.date)
  if (!Number.isFinite(candidateDate.getTime()) || !Number.isFinite(transactionDate.getTime())) {
    return false
  }

  const amountMatches =
    Math.abs(Math.abs(transactionAmount) - Math.abs(candidate.amount)) <= IMPORT_DUPLICATE_AMOUNT_TOLERANCE

  const diffDays = Math.ceil(
    Math.abs(transactionDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const dateMatches = diffDays <= IMPORT_DUPLICATE_WINDOW_DAYS
  const accountMatches = !candidate.accountId || transaction.account_id === candidate.accountId
  const merchantMatches = namesMatch(
    candidate.merchant ?? candidate.description,
    transaction.merchant ?? transaction.description
  )

  return amountMatches && dateMatches && accountMatches && merchantMatches
}

function namesMatch(left: string | null, right: string | null) {
  const normalizedLeft = normalizeName(left)
  const normalizedRight = normalizeName(right)

  if (!normalizedLeft || !normalizedRight) {
    return true
  }

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  )
}

function normalizeName(value: string | null) {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

