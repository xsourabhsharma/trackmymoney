import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { executeFinanceTool, listFinanceToolMetadata } from '@/lib/finance-tools/registry'
import { verifyExternalAccessToken } from '@/lib/finance-tools/tokens'
import type { FinanceToolActor, FinanceToolScope } from '@/lib/finance-tools/types'

export const runtime = 'nodejs'

function bearerFromRequest(request: Request) {
  const header = request.headers.get('authorization') || ''
  const [type, token] = header.split(/\s+/)
  return type?.toLowerCase() === 'bearer' ? token : undefined
}

export async function GET() {
  return NextResponse.json({
    tools: listFinanceToolMetadata(),
    mcpEndpoint: '/api/mcp',
  })
}

export async function POST(request: Request) {
  const auth = await verifyExternalAccessToken(request, bearerFromRequest(request))
  const userId = auth?.extra?.userId
  if (typeof userId !== 'string') {
    return NextResponse.json({ ok: false, message: 'Authentication required.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body.' }, { status: 400 })
  }

  const toolName = typeof (body as { tool?: unknown }).tool === 'string'
    ? (body as { tool: string }).tool
    : ''
  if (!toolName) {
    return NextResponse.json({ ok: false, message: 'tool is required.' }, { status: 400 })
  }

  const actorHeader = request.headers.get('x-trackmymoney-actor')
  const actor: FinanceToolActor = actorHeader === 'cli' ? 'cli' : 'api'
  const result = await executeFinanceTool(toolName, (body as { args?: unknown }).args ?? {}, {
    supabase: createAdminClient(),
    userId,
    actor,
    scopes: (auth?.scopes || []) as FinanceToolScope[],
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
