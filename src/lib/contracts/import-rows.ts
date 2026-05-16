import { z } from 'zod'
import { transactionTypeSchema } from './transactions'

const decimalValueSchema = z.union([z.string(), z.number()])

export const IMPORT_COMMIT_ROW_FIELDS = [
  'id',
  'parsed_amount',
  'parsed_currency',
  'parsed_type',
  'parsed_category_id',
  'parsed_date',
  'parsed_merchant',
  'parsed_description',
] as const

export const IMPORT_COMMIT_ROW_SELECT = IMPORT_COMMIT_ROW_FIELDS.join(', ')

export const IMPORT_COMMIT_DISPLAY_NAME_FIELDS = [
  'parsed_merchant',
  'parsed_description',
] as const

export const importCommitRowSchema = z.object({
  id: z.string().uuid(),
  parsed_amount: decimalValueSchema.nullable(),
  parsed_currency: z.string().nullable(),
  parsed_type: transactionTypeSchema.nullable(),
  parsed_category_id: z.string().uuid().nullable(),
  parsed_date: z.string().nullable(),
  parsed_merchant: z.string().nullable(),
  parsed_description: z.string().nullable(),
})

export const importCommitRowsSchema = z.array(importCommitRowSchema)

export type ImportCommitRowField = (typeof IMPORT_COMMIT_ROW_FIELDS)[number]
export type ImportCommitDisplayNameField = (typeof IMPORT_COMMIT_DISPLAY_NAME_FIELDS)[number]
export type ImportCommitRow = z.infer<typeof importCommitRowSchema>

