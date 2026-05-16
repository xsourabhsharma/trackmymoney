import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function getSafeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard'
  }

  return next
}

function getRedirectOrigin(request: Request, origin: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalhost = process.env.NODE_ENV === 'development'

  if (!isLocalhost && forwardedHost && /^[A-Za-z0-9.-]+(?::\d+)?$/.test(forwardedHost)) {
    return `https://${forwardedHost}`
  }

  return origin
}

function redirectWithNoStore(url: string) {
  const response = NextResponse.redirect(url)
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNextPath(searchParams.get('next'))
  const redirectOrigin = getRedirectOrigin(request, origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectWithNoStore(`${redirectOrigin}${next}`)
    }
  }

  return redirectWithNoStore(`${redirectOrigin}/login?error=auth_callback_failed`)
}
