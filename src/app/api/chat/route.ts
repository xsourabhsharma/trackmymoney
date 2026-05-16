import { z } from 'zod'
import type { ModelMessage } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { apiError, badRequest, unauthorized } from '@/lib/api-errors'
import {
  generateAiVisionText,
  getAiDisabledClientMessage,
  getAiTextState,
  isAiDisabledError,
  logAiServiceError,
  streamAiText,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'

export const maxDuration = 30

const MAX_CHAT_MESSAGE_CHARS = 4_000
const MAX_EXTRACTED_IMAGE_TEXT_CHARS = 1_500
const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_CHAT_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|webp);base64,/i

const chatPartSchema = z.object({
  type: z.string().optional(),
  text: z.string().optional(),
  toolCallId: z.string().optional(),
  toolName: z.string().optional(),
  args: z.unknown().optional(),
  state: z.string().optional(),
  result: z.unknown().optional(),
}).passthrough()

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.union([z.string(), z.array(chatPartSchema)]).optional(),
    parts: z.array(chatPartSchema).optional(),
    toolInvocations: z.array(chatPartSchema).optional(),
  })).min(1).max(40),
  data: z.object({
    imageUrls: z.array(z.string().min(1).max(7_000_000)).max(4).optional(),
  }).optional(),
  pathname: z.string().max(200).optional(),
})

type ChatInputMessage = z.infer<typeof chatRequestSchema>['messages'][number]
type ChatPart = z.infer<typeof chatPartSchema>

export async function POST(req: Request) {
  const parsedBody = chatRequestSchema.safeParse(await req.json())
  if (!parsedBody.success) {
    return badRequest('Invalid chat request payload')
  }

  const { messages, data, pathname } = parsedBody.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return unauthorized()
  }

  const consent = await requireAiConsent(supabase, user.id, 'chat')
  if (!consent.allowed) {
    return apiError(consent.message, { status: 403, code: consent.code })
  }

  const textState = getAiTextState()
  if (!textState.enabled) {
    return apiError(getAiDisabledClientMessage(textState), {
      status: 503,
      code: 'AI_PROVIDER_DISABLED',
    })
  }

  const coreMessages = toModelMessages(messages)
  if (coreMessages.length === 0) {
    return badRequest('Chat request must include at least one text message')
  }

  await appendImageExtraction(coreMessages, data?.imageUrls)

  const userDataContext = await buildRedactedFinancialContext(supabase, user.id, pathname)

  try {
    const result = streamAiText({
      system: `You are the Intelligence Engine for the Track My Money app. Your purpose is to be a reliable financial advisor focused on analysis, insights, and guidance.

PERSONALITY AND TONE:
- Be friendly, concise, and practical.
- Use short bullets by default.
- Do not produce long summaries unless the user explicitly asks.
- Do not hallucinate records or exact merchants. The financial context is intentionally aggregated and redacted.

CREATOR IDENTITY:
If asked who made you, created you, or developed you, say: "I was made by the Track My Money team."

READ-ONLY MODE:
You can analyze, summarize, and provide insights, but you cannot add, create, modify, or delete records. If asked to write data, direct the user to the relevant dashboard page.

FINANCIAL CONTEXT PRIVACY:
The app only provides redacted aggregates and small derived summaries. It does not provide account names, merchant names, raw transaction history, or secret values.

${userDataContext}`,
      messages: coreMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    logAiServiceError('chat route failed', error)
    if (isAiDisabledError(error)) {
      return apiError(getAiDisabledClientMessage(error.state), {
        status: 503,
        code: 'AI_PROVIDER_DISABLED',
      })
    }

    return apiError('AI error', { status: 500 })
  }
}

function toModelMessages(messages: ChatInputMessage[]): ModelMessage[] {
  return messages.flatMap((message) => {
    if (message.role === 'system') {
      return []
    }

    const textContent = clampText(getMessageText(message), MAX_CHAT_MESSAGE_CHARS)
    if (!textContent) {
      return []
    }

    return [{
      role: message.role,
      content: textContent,
    }]
  })
}

function getMessageText(message: ChatInputMessage) {
  if (typeof message.content === 'string') {
    return message.content
  }

  if (Array.isArray(message.content)) {
    return message.content.filter(isTextPart).map((part) => part.text).join('')
  }

  if (Array.isArray(message.parts)) {
    return message.parts.filter(isTextPart).map((part) => part.text).join('')
  }

  return ''
}

function isTextPart(part: ChatPart): part is ChatPart & { text: string } {
  return part.type === 'text' && typeof part.text === 'string'
}

async function appendImageExtraction(
  messages: ModelMessage[],
  imageUrls: string[] | undefined
) {
  if (!imageUrls?.length) {
    return
  }

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage || lastMessage.role !== 'user') {
    return
  }

  const validImages = imageUrls.map(normalizeImageDataUrl).filter(isString)
  if (validImages.length === 0) {
    lastMessage.content = `${getTextContent(lastMessage.content)}\n\n[System: Uploaded images were rejected because their format or size is unsupported.]`
    return
  }

  const extractedText = await Promise.all(
    validImages.map(async (image) => {
      try {
        const result = await generateAiVisionText({
          images: [image],
          prompt: 'Extract visible text, dates, amounts, and totals from this uploaded financial image. Return only concise extracted text.',
          maxOutputTokens: 700,
        })
        return clampText(result.text, MAX_EXTRACTED_IMAGE_TEXT_CHARS)
      } catch (error) {
        logAiServiceError('chat image extraction failed', error)
        return '[Image text extraction unavailable.]'
      }
    })
  )

  lastMessage.content = `${getTextContent(lastMessage.content)}\n\n[System: Concise extracted text from uploaded images:]\n${extractedText.join('\n\n---\n\n')}`
}

async function buildRedactedFinancialContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  pathname: string | undefined
) {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const startOfWindow = new Date(now)
  startOfWindow.setDate(startOfWindow.getDate() - 90)

  try {
    const [
      accountsResult,
      budgetsResult,
      goalsResult,
      subscriptionsResult,
      debtsResult,
      transactionsResult,
    ] = await Promise.all([
      supabase.from('accounts').select('type, balance').eq('user_id', userId),
      supabase.from('budgets').select('period_type, limit_amount, status').eq('user_id', userId),
      supabase.from('goals').select('target_amount, current_amount, target_date, status').eq('user_id', userId),
      supabase.from('subscriptions').select('amount, interval, status, next_charge_date').eq('user_id', userId),
      supabase.from('debts').select('total_amount, remaining_amount, interest_rate').eq('user_id', userId),
      supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', userId)
        .gte('date', startOfWindow.toISOString())
        .order('date', { ascending: false })
        .limit(300),
    ])

    const accountRows = asRecords(accountsResult.data)
    const budgetRows = asRecords(budgetsResult.data)
    const goalRows = asRecords(goalsResult.data)
    const subscriptionRows = asRecords(subscriptionsResult.data)
    const debtRows = asRecords(debtsResult.data)
    const transactionRows = asRecords(transactionsResult.data)
    const monthlyTransactionSummary = summarizeTransactionsByMonth(transactionRows)
    const currentMonthSummary = monthlyTransactionSummary[currentMonth] ?? {
      income: 0,
      expenses: 0,
      transfers: 0,
      count: 0,
    }

    return `### REDACTED USER FINANCIAL CONTEXT
Only aggregated, derived data is included.
${JSON.stringify({
  currentPage: pathname || '/dashboard',
  currentMonth: currentMonthSummary,
  last90DaysByMonth: monthlyTransactionSummary,
  accounts: summarizeAmountByField(accountRows, 'type', 'balance'),
  budgets: {
    count: budgetRows.length,
    activeCount: countByValue(budgetRows, 'status', 'active'),
    totalLimit: roundCurrency(sumField(budgetRows, 'limit_amount')),
  },
  goals: {
    count: goalRows.length,
    activeCount: countByValue(goalRows, 'status', 'active'),
    totalTarget: roundCurrency(sumField(goalRows, 'target_amount')),
    totalCurrent: roundCurrency(sumField(goalRows, 'current_amount')),
  },
  subscriptions: {
    count: subscriptionRows.length,
    activeCount: countByValue(subscriptionRows, 'status', 'active'),
    monthlyEstimate: roundCurrency(sumSubscriptionMonthlyEstimate(subscriptionRows)),
  },
  debts: {
    count: debtRows.length,
    totalOriginal: roundCurrency(sumField(debtRows, 'total_amount')),
    totalRemaining: roundCurrency(sumField(debtRows, 'remaining_amount')),
  },
})}`
  } catch (error) {
    logAiServiceError('chat financial context load failed', error)
    return `### REDACTED USER FINANCIAL CONTEXT
Live financial context could not be loaded. Do not claim access to current account data.`
  }
}

function normalizeImageDataUrl(value: string) {
  if (!ALLOWED_CHAT_IMAGE_PREFIX.test(value)) {
    return null
  }

  const base64Data = value.split(',')[1] ?? ''
  const estimatedSize = Math.floor((base64Data.length * 3) / 4)
  if (estimatedSize > MAX_CHAT_IMAGE_BYTES) {
    return null
  }

  return value
}

function summarizeTransactionsByMonth(rows: Record<string, unknown>[]) {
  const summary: Record<string, { income: number; expenses: number; transfers: number; count: number }> = {}

  for (const row of rows) {
    const date = typeof row.date === 'string' ? row.date : ''
    const month = date.slice(0, 7) || 'unknown'
    const type = typeof row.type === 'string' ? row.type : 'unknown'
    const amount = numberFrom(row.amount)

    summary[month] ??= { income: 0, expenses: 0, transfers: 0, count: 0 }
    summary[month].count += 1

    if (type === 'income') {
      summary[month].income = roundCurrency(summary[month].income + amount)
    } else if (type === 'expense') {
      summary[month].expenses = roundCurrency(summary[month].expenses + amount)
    } else if (type === 'transfer') {
      summary[month].transfers = roundCurrency(summary[month].transfers + amount)
    }
  }

  return summary
}

function summarizeAmountByField(
  rows: Record<string, unknown>[],
  groupField: string,
  amountField: string
) {
  const summary: Record<string, { count: number; total: number }> = {}

  for (const row of rows) {
    const key = typeof row[groupField] === 'string' ? row[groupField] : 'unknown'
    summary[key] ??= { count: 0, total: 0 }
    summary[key].count += 1
    summary[key].total = roundCurrency(summary[key].total + numberFrom(row[amountField]))
  }

  return summary
}

function sumSubscriptionMonthlyEstimate(rows: Record<string, unknown>[]) {
  return rows.reduce((total, row) => {
    const amount = numberFrom(row.amount)
    const interval = typeof row.interval === 'string' ? row.interval.toLowerCase() : 'monthly'

    if (interval.includes('year')) {
      return total + amount / 12
    }
    if (interval.includes('week')) {
      return total + amount * 4.345
    }
    if (interval.includes('quarter')) {
      return total + amount / 3
    }

    return total + amount
  }, 0)
}

function sumField(rows: Record<string, unknown>[], field: string) {
  return rows.reduce((total, row) => total + numberFrom(row[field]), 0)
}

function countByValue(rows: Record<string, unknown>[], field: string, value: string) {
  return rows.filter((row) => row[field] === value).length
}

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberFrom(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function clampText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

function getTextContent(content: ModelMessage['content']) {
  return typeof content === 'string' ? content : ''
}

function isString(value: string | null): value is string {
  return typeof value === 'string'
}
