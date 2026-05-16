import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createClient } from '@/utils/supabase/server';

interface ParsedTransactionCandidate {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  inferredCategoryId: string
  confidence: number
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error'
}

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
    
     if (!process.env.GROQ_API_KEY) {
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

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: prompt,
    });

    let candidates: ParsedTransactionCandidate[] = [];
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        candidates = JSON.parse(cleaned) as ParsedTransactionCandidate[];
    } catch {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ candidates });
  } catch (error: unknown) {
    console.error('Auto Parse Error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
