import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text: rawText } = await req.json();

  if (!rawText) {
    return NextResponse.json({ error: 'Missing text content' }, { status: 400 });
  }

  try {
     // Mock if no API key
     if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
            candidates: [
                { date: '2026-05-12', description: 'UBER TRIP', amount: 24.50, type: 'expense', inferredCategoryId: 'Transport', confidence: 0.95 },
                { date: '2026-05-13', description: 'STARBUCKS', amount: 5.40, type: 'expense', inferredCategoryId: 'Dining', confidence: 0.98 },
            ]
        });
     }

    const prompt = `
      Extract financial transactions from the following text (bank statement, email, or sms):
      "${rawText}"

      Return a JSON array of objects with these keys:
      - date (YYYY-MM-DD, infer year as 2026 if missing)
      - description (original merchant/desc)
      - amount (number, absolute value)
      - type ('income' or 'expense')
      - inferredCategoryId (e.g. Dining, Transport, Groceries, Salary)
      - confidence (0.0 to 1.0)
    `;

    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: prompt,
    });

    let candidates = [];
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        candidates = JSON.parse(cleaned);
    } catch (e) {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('Auto Parse Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
