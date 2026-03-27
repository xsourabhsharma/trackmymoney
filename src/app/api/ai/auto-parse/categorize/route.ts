import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const MAX_BATCH_SIZE = 50;
const categorizeImportRequestSchema = z.object({
  importJobId: z.string().uuid(),
});

type CategoryRow = {
  id: string;
  name: string;
};

type ImportRow = {
  id: string;
  parsed_description: string | null;
  parsed_amount: string | number | null;
};

type CategorizationResult = {
  id: string;
  merchant_name?: string | null;
  category_id?: string | null;
  confidence?: number | null;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedBody = categorizeImportRequestSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Missing importJobId' }, { status: 400 });
    }

    const { importJobId } = parsedBody.data;

    const { data: importJob, error: importJobError } = await supabase
      .from('import_jobs')
      .select('id')
      .eq('id', importJobId)
      .eq('user_id', user.id)
      .single();

    if (importJobError || !importJob) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 });
    }

    const { data: categories } = await supabase.from('categories').select('id, name');
    const categoryMap = (categories || []) as CategoryRow[];

    const { data: rowsToProcess, error: rowsError } = await supabase
      .from('import_rows')
      .select('id, parsed_description, parsed_amount, parsed_date')
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('has_error', false)
      .is('parsed_category_id', null)
      .limit(MAX_BATCH_SIZE);

    if (rowsError || !rowsToProcess) {
      return NextResponse.json({ error: 'Failed to fetch rows' }, { status: 500 });
    }

    if (rowsToProcess.length === 0) {
      return NextResponse.json({ message: 'No more rows to categorize.', remaining: 0 });
    }

    await supabase
      .from('import_jobs')
      .update({ status: 'ai_categorizing' })
      .eq('id', importJobId)
      .eq('user_id', user.id);

    const aiApiKey = process.env.AI_API_KEY;
    const aiBaseUrl = process.env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
    const aiModel = process.env.AI_MODEL || 'glm-4-flash';

    if (!aiApiKey) {
      console.warn('No AI_API_KEY found. Falling back to rule-based parsing.');
      await fallbackRuleCategorization(supabase, user.id, importJobId, rowsToProcess as ImportRow[], categoryMap);
      return NextResponse.json({ message: 'Categorized via fallback.', remaining: 0 });
    }

    const payload = {
      available_categories: categoryMap,
      transactions: (rowsToProcess as ImportRow[]).map((row) => ({
        id: row.id,
        desc: row.parsed_description || 'Unknown',
        amount: Number(row.parsed_amount) || 0,
      })),
    };

    const prompt = `You are an expert financial categorization AI.
I have a list of raw bank transaction descriptions.
Task: Clean up the merchant name and map it to the closest available category.

Available Categories:
${JSON.stringify(categoryMap, null, 2)}

Transactions To Process:
${JSON.stringify(payload.transactions, null, 2)}

Rules:
- 'merchant_name' should be Title Cased and stripped of garbage bank codes (e.g. "TST* DOORDASH" -> "DoorDash").
- 'category_id' must EXACTLY match one of the UUIDs from Available Categories. If none fit perfectly, pick the closest or return null.
- 'confidence' should be a decimal between 0.0 and 1.0.

Respond with ONLY a valid JSON array of objects with keys: id, merchant_name, category_id, confidence, notes (optional). No markdown formatting.`;

    const chatUrl = `${aiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
    const aiResponse = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: 'You are a financial transaction categorization assistant. Respond only with valid JSON arrays.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      await fallbackRuleCategorization(supabase, user.id, importJobId, rowsToProcess as ImportRow[], categoryMap);
      return NextResponse.json({ message: 'AI failed, categorized via fallback.', remaining: 0 });
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || '';

    let aiResults: CategorizationResult[] = [];
    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResults = JSON.parse(cleaned) as CategorizationResult[];
    } catch {
      console.error('Failed to parse LLM JSON:', rawText);
      await fallbackRuleCategorization(supabase, user.id, importJobId, rowsToProcess as ImportRow[], categoryMap);
      return NextResponse.json({ message: 'AI response invalid, used fallback.', remaining: 0 });
    }

    for (const result of aiResults) {
      const validCategory = categoryMap.find((category) => category.id === result.category_id) ? result.category_id : null;

      await supabase
        .from('import_rows')
        .update({
          parsed_merchant: result.merchant_name || null,
          parsed_category_id: validCategory,
          ai_confidence: result.confidence || null,
          ai_payload: { raw: result },
        })
        .eq('id', result.id)
        .eq('import_job_id', importJobId)
        .eq('user_id', user.id);
    }

    const { count } = await supabase
      .from('import_rows')
      .select('id', { count: 'exact', head: true })
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('has_error', false)
      .is('parsed_category_id', null);

    const remaining = count || 0;
    if (remaining === 0) {
      await supabase
        .from('import_jobs')
        .update({ status: 'ready_for_review' })
        .eq('id', importJobId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ message: `Categorized ${aiResults.length} rows.`, remaining });
  } catch (error) {
    console.error('Categorize API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function fallbackRuleCategorization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  jobId: string,
  rows: ImportRow[],
  categories: CategoryRow[]
) {
  const dictionary: Record<string, string> = {
    uber: 'Transport',
    lyft: 'Transport',
    ola: 'Transport',
    rapido: 'Transport',
    doordash: 'Dining',
    ubereats: 'Dining',
    starbucks: 'Dining',
    mcdonald: 'Dining',
    zomato: 'Dining',
    swiggy: 'Dining',
    amazon: 'Shopping',
    target: 'Shopping',
    walmart: 'Shopping',
    flipkart: 'Shopping',
    myntra: 'Shopping',
    netflix: 'Entertainment',
    spotify: 'Entertainment',
    hotstar: 'Entertainment',
    'prime video': 'Entertainment',
    safeway: 'Groceries',
    kroger: 'Groceries',
    'trader joe': 'Groceries',
    bigbasket: 'Groceries',
    pge: 'Utilities',
    comcast: 'Utilities',
    airtel: 'Utilities',
    jio: 'Utilities',
    salary: 'Salary',
    payroll: 'Salary',
    stipend: 'Salary',
  };

  const getCategoryId = (name: string) =>
    categories.find((category) => category.name.toLowerCase() === name.toLowerCase())?.id || null;

  for (const row of rows) {
    const description = (row.parsed_description || '').toLowerCase();
    let merchant = row.parsed_description;
    let fallbackCategoryName: string | null = null;

    for (const [keyword, categoryName] of Object.entries(dictionary)) {
      if (description.includes(keyword)) {
        merchant = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        fallbackCategoryName = categoryName;
        break;
      }
    }

    await supabase
      .from('import_rows')
      .update({
        parsed_merchant: merchant,
        parsed_category_id: fallbackCategoryName ? getCategoryId(fallbackCategoryName) : null,
        ai_confidence: fallbackCategoryName ? 0.99 : 0.0,
        ai_payload: { fallback: true },
      })
      .eq('id', row.id)
      .eq('import_job_id', jobId)
      .eq('user_id', userId);
  }

  await supabase
    .from('import_jobs')
    .update({ status: 'ready_for_review' })
    .eq('id', jobId)
    .eq('user_id', userId);
}
