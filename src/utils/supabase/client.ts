import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePreviewMode,
} from './env'
import { createPreviewSupabaseClient } from './preview-client'

export type AppSupabaseClient = SupabaseClient<Database>

export function createClient(): AppSupabaseClient {
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabasePublishableKey()

  if (!supabaseUrl || !supabaseKey) {
    if (isSupabasePreviewMode()) {
      return createPreviewSupabaseClient()
    }
    throw new Error('Supabase environment variables are not configured')
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  )
}
