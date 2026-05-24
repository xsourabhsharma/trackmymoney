import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { createAdminClient } from '@/utils/supabase/admin'
import type { FinanceToolScope } from './types'

export const DEFAULT_EXTERNAL_ACCESS_SCOPES = [
  'read:all',
  'write:transactions',
  'write:budgets',
  'write:subscriptions',
  'write:goals',
  'write:debts',
] as const satisfies FinanceToolScope[]

export function hashAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function generateAccessToken() {
  return `tmm_${randomBytes(32).toString('base64url')}`
}

export async function verifyExternalAccessToken(
  _request: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined

  const tokenHash = hashAccessToken(bearerToken)
  const supabase = createAdminClient() as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  }
  const { data, error } = await supabase
    .from('external_access_tokens')
    .select('id, user_id, scopes, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error || !data) return undefined
  if (data.revoked_at) return undefined
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return undefined

  await supabase
    .from('external_access_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return {
    token: bearerToken,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    clientId: data.id,
    extra: {
      userId: data.user_id,
    },
  }
}

export function normalizeScopes(input: unknown): FinanceToolScope[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [...DEFAULT_EXTERNAL_ACCESS_SCOPES]
  }

  return input
    .filter((scope): scope is FinanceToolScope => typeof scope === 'string')
    .filter((scope, index, scopes) => scopes.indexOf(scope) === index)
}
