import 'server-only'

import { createHash } from 'node:crypto'
import type { z } from 'zod'
import type { FinanceToolContext, FinanceToolResult, FinanceToolScope, JsonRecord } from './types'

const CONFIRMATION_TTL_MS = 10 * 60 * 1000

export class FinanceToolError extends Error {
  readonly code: string

  constructor(message: string, code = 'FINANCE_TOOL_ERROR') {
    super(message)
    this.name = 'FinanceToolError'
    this.code = code
  }
}

export function asDb(context: FinanceToolContext) {
  return context.supabase as unknown as {
    // Supabase's generated types do not know about additive migration tables until the generated file is refreshed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  }
}

export function parseInput<SCHEMA extends z.ZodType>(schema: SCHEMA, input: unknown): z.infer<SCHEMA> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new FinanceToolError(
      `Invalid input: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`,
      'INVALID_INPUT'
    )
  }
  return parsed.data
}

export function assertScope(context: FinanceToolContext, requiredScope: FinanceToolScope) {
  if (!context.scopes || context.scopes.length === 0) {
    return
  }

  const [action, resource] = requiredScope.split(':')
  const allowed =
    context.scopes.includes(requiredScope) ||
    context.scopes.includes(`${action}:all` as FinanceToolScope) ||
    (action === 'read' && context.scopes.includes('write:all')) ||
    (action === 'read' && context.scopes.includes(`write:${resource}` as FinanceToolScope))

  if (!allowed) {
    throw new FinanceToolError(`Missing required scope: ${requiredScope}`, 'INSUFFICIENT_SCOPE')
  }
}

export async function runReadQuery<T>(
  query: PromiseLike<{ data: T | null; error: { message: string } | null; count?: number | null }>,
  fallback: T,
  message = 'Could not load data'
) {
  const { data, error, count } = await query
  if (error) {
    throw new FinanceToolError(`${message}: ${error.message}`, 'QUERY_FAILED')
  }

  return { data: data ?? fallback, count: count ?? null }
}

export function paginatedResult<T>(
  items: T[],
  totalCount: number | null | undefined,
  limit: number,
  offset: number
) {
  const total = totalCount ?? items.length
  const nextOffset = offset + items.length
  return {
    items,
    totalCount: total,
    count: items.length,
    limit,
    offset,
    hasMore: nextOffset < total,
    nextOffset: nextOffset < total ? nextOffset : null,
  }
}

export async function assertAccountAccess(context: FinanceToolContext, accountId: string | null | undefined) {
  if (!accountId) return
  const db = asDb(context)
  const { data, error } = await db
    .from('accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', context.userId)
    .maybeSingle()

  if (error) throw new FinanceToolError(`Could not verify account: ${error.message}`, 'ACCOUNT_CHECK_FAILED')
  if (!data) throw new FinanceToolError('Selected account is not available for this user.', 'ACCOUNT_NOT_FOUND')
}

export async function assertCategoryAccess(
  context: FinanceToolContext,
  categoryId: string | null | undefined,
  type?: 'income' | 'expense' | 'transfer'
) {
  if (!categoryId) return
  const db = asDb(context)
  let query = db
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .or(`user_id.is.null,user_id.eq.${context.userId}`)

  if (type) query = query.eq('type', type)

  const { data, error } = await query.maybeSingle()
  if (error) throw new FinanceToolError(`Could not verify category: ${error.message}`, 'CATEGORY_CHECK_FAILED')
  if (!data) throw new FinanceToolError('Selected category is not available for this user.', 'CATEGORY_NOT_FOUND')
}

export function toIsoDate(value: string | null | undefined, fieldName: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new FinanceToolError(`${fieldName} must be a valid date.`, 'INVALID_DATE')
  }
  return parsed.toISOString()
}

export function titleCaseMerchant(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function withoutConfirmationFields<T extends JsonRecord>(payload: T) {
  const rest = { ...payload }
  delete rest.confirm
  delete rest.confirmationId
  delete rest.responseFormat
  return rest
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`
  }

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`
}

export function hashPayload(payload: unknown) {
  return createHash('sha256').update(stableStringify(payload)).digest('hex')
}

export async function createConfirmation(
  context: FinanceToolContext,
  toolName: string,
  payload: JsonRecord,
  summary: string
): Promise<FinanceToolResult> {
  const db = asDb(context)
  const normalizedPayload = withoutConfirmationFields(payload)
  const expiresAt = new Date(Date.now() + CONFIRMATION_TTL_MS).toISOString()
  const { data, error } = await db
    .from('tool_confirmations')
    .insert({
      user_id: context.userId,
      actor: context.actor,
      tool_name: toolName,
      payload: normalizedPayload,
      payload_hash: hashPayload(normalizedPayload),
      summary,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select('id, expires_at')
    .single()

  if (error || !data) {
    throw new FinanceToolError(`Could not create confirmation: ${error?.message || 'unknown error'}`)
  }

  await auditEvent(context, toolName, 'preview', null, null, 'pending', { summary })

  return {
    ok: true,
    message: `${summary}\n\nReply with approval and this confirmation ID to execute: ${data.id}`,
    confirmationRequired: true,
    confirmationId: data.id,
    expiresAt: data.expires_at,
    data: {
      summary,
      preview: normalizedPayload,
      confirmationId: data.id,
      expiresAt: data.expires_at,
    },
  }
}

export async function requireConfirmation(
  context: FinanceToolContext,
  toolName: string,
  args: JsonRecord
) {
  const confirmationId = typeof args.confirmationId === 'string' ? args.confirmationId : ''
  if (!args.confirm || !confirmationId) {
    return null
  }

  const db = asDb(context)
  const normalizedPayload = withoutConfirmationFields(args)
  const expectedHash = hashPayload(normalizedPayload)
  const { data, error } = await db
    .from('tool_confirmations')
    .select('id, payload_hash, status, expires_at')
    .eq('id', confirmationId)
    .eq('user_id', context.userId)
    .eq('tool_name', toolName)
    .maybeSingle()

  if (error) {
    throw new FinanceToolError(`Could not verify confirmation: ${error.message}`, 'CONFIRMATION_CHECK_FAILED')
  }

  if (!data) {
    throw new FinanceToolError('Confirmation was not found for this action.', 'CONFIRMATION_NOT_FOUND')
  }

  if (data.status !== 'pending') {
    throw new FinanceToolError(`Confirmation is ${data.status}, not pending.`, 'CONFIRMATION_NOT_PENDING')
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await db.from('tool_confirmations').update({ status: 'expired' }).eq('id', data.id)
    throw new FinanceToolError('Confirmation expired. Preview the action again.', 'CONFIRMATION_EXPIRED')
  }

  if (data.payload_hash !== expectedHash) {
    throw new FinanceToolError('Confirmation payload changed. Preview the action again.', 'CONFIRMATION_MISMATCH')
  }

  await db
    .from('tool_confirmations')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', data.id)
    .eq('user_id', context.userId)

  return data.id as string
}

export async function runConfirmedMutation(
  context: FinanceToolContext,
  toolName: string,
  args: JsonRecord,
  summary: string,
  execute: () => Promise<{ resourceId?: string | null; resourceType?: string | null; data?: unknown; message: string }>
) {
  const confirmedId = await requireConfirmation(context, toolName, args)
  if (!confirmedId) {
    return createConfirmation(context, toolName, args, summary)
  }

  try {
    const result = await execute()
    await auditEvent(
      context,
      toolName,
      'execute',
      result.resourceType ?? null,
      result.resourceId ?? null,
      'success',
      { confirmationId: confirmedId }
    )
    return {
      ok: true,
      message: result.message,
      data: result.data,
    }
  } catch (error) {
    await auditEvent(context, toolName, 'execute', null, null, 'error', {
      confirmationId: confirmedId,
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

export async function auditEvent(
  context: FinanceToolContext,
  toolName: string,
  action: string,
  resourceType: string | null,
  resourceId: string | null,
  status: string,
  metadata?: unknown
) {
  try {
    await asDb(context).from('tool_audit_events').insert({
      user_id: context.userId,
      actor: context.actor,
      tool_name: toolName,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      status,
      metadata: metadata ?? null,
    })
  } catch {
    // Audit logging must not block the user action.
  }
}

export function serializeToolError(error: unknown): FinanceToolResult {
  if (error instanceof FinanceToolError) {
    return {
      ok: false,
      message: error.message,
      data: { code: error.code },
    }
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : 'Unknown finance tool error',
  }
}

export function maybeMarkdown(data: unknown, responseFormat: 'json' | 'markdown' | undefined, heading: string) {
  if (responseFormat !== 'markdown') return data

  if (!data || typeof data !== 'object') return String(data ?? '')
  const json = JSON.stringify(data, null, 2)
  return `# ${heading}\n\n\`\`\`json\n${json}\n\`\`\``
}

export async function getProfileCurrency(context: FinanceToolContext) {
  const { data } = await asDb(context)
    .from('profiles')
    .select('currency')
    .eq('id', context.userId)
    .maybeSingle()
  return typeof data?.currency === 'string' ? data.currency : 'INR'
}

export function sumAmounts(rows: Array<{ amount?: string | number | null; type?: string | null }>, type: string) {
  return rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
}
