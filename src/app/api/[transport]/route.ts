import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { createAdminClient } from '@/utils/supabase/admin'
import { FINANCE_TOOL_DEFINITIONS, executeFinanceTool } from '@/lib/finance-tools/registry'
import { verifyExternalAccessToken } from '@/lib/finance-tools/tokens'
import type { FinanceToolScope } from '@/lib/finance-tools/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const handler = createMcpHandler(
  (server) => {
    for (const definition of FINANCE_TOOL_DEFINITIONS) {
      server.registerTool(
        definition.name,
        {
          title: definition.title,
          description: `${definition.description} ${
            definition.readOnly
              ? 'Read-only.'
              : 'Writes are confirmation-gated. Call once for a preview, then call again with confirm=true and confirmationId after the user approves.'
          }`,
          inputSchema: definition.inputSchema,
          annotations: {
            readOnlyHint: definition.readOnly,
            destructiveHint: definition.destructive,
            idempotentHint: definition.idempotent,
            openWorldHint: false,
          },
        },
        async (args: unknown, extra: { authInfo?: { extra?: Record<string, unknown>; scopes?: string[] } }) => {
          const userId = extra.authInfo?.extra?.userId
          if (typeof userId !== 'string') {
            return {
              isError: true,
              content: [{ type: 'text' as const, text: 'Authentication failed: user ID is missing.' }],
            }
          }

          const result = await executeFinanceTool(definition.name, args, {
            supabase: createAdminClient(),
            userId,
            actor: 'mcp',
            scopes: (extra.authInfo?.scopes || []) as FinanceToolScope[],
          })

          return {
            isError: !result.ok,
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
            structuredContent: { ...result },
          }
        }
      )
    }
  },
  {
    serverInfo: {
      name: 'trackmymoney-mcp-server',
      version: '0.1.0',
    },
    instructions:
      'Use TrackMyMoney tools to read and manage the authenticated user finance data. All create, update, and delete tools require confirmation: first call without confirm to get a preview and confirmationId, then call the same tool with confirm=true and that confirmationId only after explicit user approval.',
  },
  {
    basePath: '/api',
    disableSse: true,
    maxDuration: 60,
  }
)

const authHandler = withMcpAuth(handler, verifyExternalAccessToken, {
  required: true,
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
})

export { authHandler as GET, authHandler as POST }
