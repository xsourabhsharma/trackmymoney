import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePreviewMode,
} from './env'
import { createPreviewSupabaseClient } from './preview-client'

export type AppSupabaseServerClient = SupabaseClient<Database>

export async function createClient(): Promise<AppSupabaseServerClient> {
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabasePublishableKey()

  if (!supabaseUrl || !supabaseKey) {
    if (isSupabasePreviewMode()) {
      return createPreviewSupabaseClient()
    }
    throw new Error('Supabase environment variables are not configured')
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components can read cookies but cannot persist refreshed ones.
          }
        },
      },
    }
  )
}
