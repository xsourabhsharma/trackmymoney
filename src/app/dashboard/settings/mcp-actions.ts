'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import {
  DEFAULT_EXTERNAL_ACCESS_SCOPES,
  generateAccessToken,
  hashAccessToken,
  normalizeScopes,
} from '@/lib/finance-tools/tokens'
import type { FinanceToolScope } from '@/lib/finance-tools/types'

export async function createExternalAccessTokenAction(input: {
  name?: string
  scopes?: FinanceToolScope[]
  expiresInDays?: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const token = generateAccessToken()
  const scopes = normalizeScopes(input.scopes ?? DEFAULT_EXTERNAL_ACCESS_SCOPES)
  const expiresInDays = Number.isFinite(input.expiresInDays)
    ? Math.max(1, Math.min(365, Number(input.expiresInDays)))
    : null
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { data, error } = await (supabase as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  })
    .from('external_access_tokens')
    .insert({
      user_id: user.id,
      name: input.name?.trim() || 'AI/MCP access token',
      token_hash: hashAccessToken(token),
      scopes,
      expires_at: expiresAt,
    })
    .select('id, name, scopes, expires_at, created_at')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create token: ${error?.message || 'unknown error'}`)
  }

  revalidatePath('/dashboard/settings')
  return {
    token,
    tokenSummary: data,
  }
}

export async function revokeExternalAccessTokenAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await (supabase as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from(table: string): any
  })
    .from('external_access_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Failed to revoke token: ${error.message}`)

  revalidatePath('/dashboard/settings')
  return { success: true }
}
