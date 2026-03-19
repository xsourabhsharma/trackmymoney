import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { image } = await req.json()

    if (!image) {
      return new Response('Missing image data', { status: 400 })
    }

    // Convert base64 to Buffer
    const base64Data = image.split(',')[1]
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const { object } = await generateObject({
      model: google('models/gemini-1.5-flash'),
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
    return new Response('Failed to process receipt', { status: 500 })
  }
}
