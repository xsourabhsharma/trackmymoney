import { z } from 'zod'

export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const
export const TRANSACTION_STATUSES = ['cleared', 'pending'] as const

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES)
export const transactionStatusSchema = z.enum(TRANSACTION_STATUSES)
