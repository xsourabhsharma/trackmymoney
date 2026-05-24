export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL
}

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey())
}

export function hasSupabaseAdminConfig() {
  return Boolean(
    getSupabaseUrl() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export function isSupabasePreviewMode() {
  return process.env.NODE_ENV === 'development' && !hasSupabaseConfig()
}
