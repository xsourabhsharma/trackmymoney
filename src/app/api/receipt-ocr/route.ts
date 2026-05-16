import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import {
  generateAiVisionObject,
  getAiDisabledClientMessage,
  getAiVisionState,
  isAiDisabledError,
  logAiServiceError,
} from '@/lib/ai/server'
import { requireAiConsent } from '@/lib/ai/privacy'

export const maxDuration = 30

const receiptOcrRequestSchema = z.object({
  image: z.string().min(1),
})

const receiptOcrResultSchema = z.object({
  merchant: z.string().trim().min(1).max(120).describe('The store or service provider name'),
  amount: z.coerce.number().nonnegative().describe('The total amount spent'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The transaction date in YYYY-MM-DD format'),
  category: z.string().trim().min(1).max(80).describe('A likely category for this expense'),
  confidence: z.coerce.number().min(0).max(1).describe('Confidence score from 0 to 1'),
})

const ALLOWED_RECEIPT_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|webp);base64,/i
const MAX_RECEIPT_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consent = await requireAiConsent(supabase, user.id, 'receipt_ocr')
    if (!consent.allowed) {
      return Response.json(
        { error: 'AI consent required', details: consent.message, code: consent.code },
        { status: 403 }
      )
    }

    const parsedBody = receiptOcrRequestSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return Response.json({ error: 'Missing image data' }, { status: 400 })
    }

    const { image } = parsedBody.data
    if (!ALLOWED_RECEIPT_IMAGE_PREFIX.test(image)) {
      return Response.json({ error: 'Unsupported image format' }, { status: 400 })
    }

    const base64Data = image.split(',')[1] ?? ''
    const estimatedSize = Math.floor((base64Data.length * 3) / 4)
    if (estimatedSize > MAX_RECEIPT_IMAGE_BYTES) {
      return Response.json({ error: 'Image too large' }, { status: 413 })
    }

    const visionState = getAiVisionState()
    if (!visionState.enabled) {
      return Response.json(
        {
          error: 'AI service unavailable',
          details: getAiDisabledClientMessage(visionState),
        },
        { status: 503 }
      )
    }

    const imageBuffer = Buffer.from(base64Data, 'base64')

    const { object } = await generateAiVisionObject({
      schema: receiptOcrResultSchema,
      prompt: `Extract transaction details from this receipt image.
Return the merchant, total amount, transaction date, likely category, and confidence.
Use today's date only if the receipt has no visible date.`,
      images: [imageBuffer],
      temperature: 0.1,
      maxOutputTokens: 500,
    })

    return Response.json(object)
  } catch (error) {
    logAiServiceError('receipt OCR route failed', error)
    if (isAiDisabledError(error)) {
      return Response.json(
        {
          error: 'AI service unavailable',
          details: getAiDisabledClientMessage(error.state),
        },
        { status: 503 }
      )
    }

    return Response.json(
      {
        error: 'Failed to process receipt',
        details: 'Receipt processing failed.',
      },
      { status: 500 }
    )
  }
}
