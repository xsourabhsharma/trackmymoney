import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { transactionTypeSchema } from '@/lib/contracts'
import {
  generateAiObject,
  getAiTextState,
  isAiDisabledError,
  logAiServiceError,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'

const categorySchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(80),
})

const suggestCategoryRequestSchema = z.object({
  merchant: z.string().trim().min(1).max(160),
  type: transactionTypeSchema.default('expense'),
  categories: z.array(categorySchema).min(1).max(100),
})

const categorySuggestionSchema = z.object({
  categoryId: z.string().min(1).max(120),
})

type CategoryOption = z.infer<typeof categorySchema>

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsedBody = suggestCategoryRequestSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const consent = await requireAiConsent(supabase, user.id, 'categorization')
    if (!consent.allowed) {
      return NextResponse.json(
        { error: consent.message, code: consent.code },
        { status: 403 }
      )
    }

    const { merchant, type, categories } = parsedBody.data
    if (!getAiTextState().enabled) {
      return NextResponse.json({ categoryId: fallbackCategoryId(categories), source: 'local' })
    }

    const categoryContext = categories
      .map((category) => `- ${category.name} (ID: ${category.id})`)
      .join('\n')

    const { object } = await generateAiObject({
      schema: categorySuggestionSchema,
      system: `You categorize financial transactions.
Pick the single best category ID from the provided category list.
Respond with only the requested JSON object.`,
      prompt: `Transaction type: ${type}
Merchant: ${merchant}

Available categories:
${categoryContext}`,
      temperature: 0.1,
      maxOutputTokens: 150,
    })

    const allowedIds = new Set(categories.map((category) => category.id))
    const categoryId = allowedIds.has(object.categoryId)
      ? object.categoryId
      : fallbackCategoryId(categories)

    return NextResponse.json({ categoryId })
  } catch (error) {
    logAiServiceError('category suggestion route failed', error)
    if (isAiDisabledError(error)) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    return NextResponse.json({ error: 'Failed to suggest category' }, { status: 500 })
  }
}

function fallbackCategoryId(categories: CategoryOption[]) {
  return categories.find((category) => category.name.toLowerCase() === 'other')?.id ?? categories[0].id
}
