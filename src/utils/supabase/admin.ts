import 'next/headers'

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { getSupabaseUrl, isSupabasePreviewMode } from './env'
import { createPreviewSupabaseClient } from './preview-client'

export type AppSupabaseAdminClient = SupabaseClient<Database>

function assertServerRuntime() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase admin client cannot be created in the browser')
  }
}

export function createAdminClient(): AppSupabaseAdminClient {
  assertServerRuntime()

  const supabaseUrl = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    if (isSupabasePreviewMode()) {
      return createPreviewSupabaseClient()
    }
    throw new Error('Supabase admin environment variables are not configured')
  }

  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  )
}
