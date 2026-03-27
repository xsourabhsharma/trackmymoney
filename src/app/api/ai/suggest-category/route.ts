import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'


export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const aiClient = new OpenAI({
      apiKey: process.env.AI_API_KEY || '',
      baseURL: process.env.AI_BASE_URL,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { merchant, type, categories } = body

    if (!merchant || !categories || categories.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const categoryContext = categories.map((c: any) => `- ${c.name} (ID: ${c.id})`).join('\n')

    const systemPrompt = `You are an AI that categorizes financial transactions.
The user is adding a new transaction. The merchant is "${merchant}" and the type is "${type}".
Please select the best fitting category ID from the following list.

Available Categories:
${categoryContext}

Respond ONLY with a JSON object in this format:
{"categoryId": "the-uuid"}
If no category fits well, pick the closest one or "Other".`

    const response = await aiClient.chat.completions.create({
      model: process.env.AI_MODEL || 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.1,
    })

    const rawResponse = response.choices[0].message.content || "{}"
    const cleanedJSON = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsedData = JSON.parse(cleanedJSON)

    return NextResponse.json({ categoryId: parsedData.categoryId })
  } catch (error) {
    console.error("AI Category Suggestion Error:", error)
    return NextResponse.json({ error: 'Failed to suggest category' }, { status: 500 })
  }
}
