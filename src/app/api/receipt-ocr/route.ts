import { createGroq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 30

const receiptOcrRequestSchema = z.object({
  image: z.string().min(1),
})

const ALLOWED_RECEIPT_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|webp);base64,/i
const MAX_RECEIPT_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const parsedBody = receiptOcrRequestSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      return new Response('Missing image data', { status: 400 })
    }

    const { image } = parsedBody.data
    if (!ALLOWED_RECEIPT_IMAGE_PREFIX.test(image)) {
      return new Response('Unsupported image format', { status: 400 })
    }

    const base64Data = image.split(',')[1]
    const estimatedSize = Math.floor((base64Data.length * 3) / 4)
    if (estimatedSize > MAX_RECEIPT_IMAGE_BYTES) {
      return new Response('Image too large', { status: 413 })
    }

    const imageBuffer = Buffer.from(base64Data, 'base64')

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const { object } = await generateObject({
      model: groq('llama-3.2-11b-vision-preview'),
      schema: z.object({
        merchant: z.string().describe('The name of the store or service provider'),
        amount: z.number().describe('The total amount spent'),
        date: z.string().describe('The date of the transaction in YYYY-MM-DD format'),
        category: z.string().describe('A likely category for this expense (e.g., Groceries, Dining, Transport)'),
        confidence: z.number().describe('Confidence score from 0 to 1'),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract transaction details from this receipt image.' },
            { type: 'image', image: imageBuffer },
          ],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    console.error('Receipt OCR Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process receipt', 
        details: 'Unknown error' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
