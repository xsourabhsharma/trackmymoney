import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabasePreviewMode,
} from './env'

const PUBLIC_AUTH_PATHS = ['/login', '/signup', '/forgot-password']

function isPathOrChild(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PATHS.some((path) => isPathOrChild(pathname, path))
}

function withNoStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}

function redirectTo(request: NextRequest, pathname: string, error?: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  if (error) {
    url.searchParams.set('error', error)
  }
  return withNoStore(NextResponse.redirect(url))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  const pathname = request.nextUrl.pathname

  if (isPathOrChild(pathname, '/register')) {
    return redirectTo(request, '/signup')
  }

  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabasePublishableKey()

  if (!supabaseUrl || !supabaseKey) {
    if (isSupabasePreviewMode()) {
      return supabaseResponse
    }
    if (isPathOrChild(pathname, '/dashboard')) {
      return redirectTo(request, '/login', 'Supabase environment is not configured')
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  withNoStore(supabaseResponse)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isPathOrChild(pathname, '/dashboard')) {
    return redirectTo(request, '/login')
  }

  if (!user && isPathOrChild(pathname, '/update-password')) {
    return redirectTo(request, '/login', 'Password reset session expired. Please request a new reset link.')
  }

  if (user && isPublicAuthPath(pathname)) {
    return redirectTo(request, '/dashboard')
  }

  return supabaseResponse
}
