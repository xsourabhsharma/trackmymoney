import 'server-only'

import { tool, zodSchema, type ToolSet } from 'ai'
import type { FinanceToolContext } from './types'
import { FINANCE_TOOL_DEFINITIONS, executeFinanceTool } from './registry'

export function createTrackMyMoneyAiTools(context: FinanceToolContext): ToolSet {
  return Object.fromEntries(
    FINANCE_TOOL_DEFINITIONS.map((definition) => [
      definition.name,
      tool({
        title: definition.title,
        description: `${definition.description} ${
          definition.readOnly
            ? 'This is read-only.'
            : 'This is confirmation-gated: first call returns a preview and confirmationId; after explicit user approval, call again with confirm=true and the same confirmationId.'
        }`,
        inputSchema: zodSchema(definition.inputSchema as Parameters<typeof zodSchema>[0]),
        execute: async (input) => executeFinanceTool(definition.name, input, context),
      }),
    ])
  ) as ToolSet
}
