import type { SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'
import type { Database } from '@/lib/database.types'

export type FinanceToolActor = 'widget' | 'mcp' | 'cli' | 'api'

export type FinanceToolScope =
  | 'read:all'
  | 'write:all'
  | 'read:transactions'
  | 'write:transactions'
  | 'read:budgets'
  | 'write:budgets'
  | 'read:subscriptions'
  | 'write:subscriptions'
  | 'read:goals'
  | 'write:goals'
  | 'read:debts'
  | 'write:debts'
  | 'read:settings'
  | 'write:settings'

export interface FinanceToolContext {
  supabase: SupabaseClient<Database>
  userId: string
  actor: FinanceToolActor
  scopes?: FinanceToolScope[]
}

export interface FinanceToolResult {
  ok: boolean
  message: string
  data?: unknown
  confirmationRequired?: boolean
  confirmationId?: string
  expiresAt?: string
  warnings?: string[]
}

export type FinanceToolHandler<SCHEMA extends z.ZodType> = (
  args: z.infer<SCHEMA>,
  context: FinanceToolContext
) => Promise<FinanceToolResult>

export interface FinanceToolDefinition<SCHEMA extends z.ZodType = z.ZodType> {
  name: string
  title: string
  description: string
  inputSchema: SCHEMA
  requiredScope: FinanceToolScope
  readOnly: boolean
  destructive: boolean
  idempotent: boolean
  handler: FinanceToolHandler<SCHEMA>
}

export type JsonRecord = Record<string, unknown>
