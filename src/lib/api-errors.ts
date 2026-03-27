
import { NextResponse } from 'next/server'

interface ApiErrorOptions {
  status?: number
  code?: string
}

export function apiError(message: string, opts: ApiErrorOptions = {}) {
  const { status = 500, code } = opts
  return NextResponse.json(
    {
      error: message,
      ...(code ? { code } : {}),
    },
    { status }
  )
}

export function unauthorized(message = 'Authentication required') {
  return apiError(message, { status: 401, code: 'UNAUTHORIZED' })
}

export function badRequest(message: string) {
  return apiError(message, { status: 400, code: 'BAD_REQUEST' })
}

export function notFound(message = 'Resource not found') {
  return apiError(message, { status: 404, code: 'NOT_FOUND' })
}

export function rateLimited(message = 'Too many requests. Please try again later.') {
  return apiError(message, { status: 429, code: 'RATE_LIMITED' })
}
