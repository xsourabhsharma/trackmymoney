import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const MAX_BATCH_SIZE = 50;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { importJobId } = await req.json();

    if (!importJobId) {
      return NextResponse.json({ error: 'Missing importJobId' }, { status: 400 });
    }

    // 1. Fetch categories
    const { data: categories } = await supabase.from('categories').select('id, name');
    const categoryMap = (categories || []).map(c => ({ id: c.id, name: c.name }));

    // 2. Fetch un-categorized rows for this job
    const { data: rowsToProcess, error: rowsError } = await supabase
      .from('import_rows')
      .select('id, parsed_description, parsed_amount, parsed_date')
      .eq('import_job_id', importJobId)
      .eq('has_error', false)
      .is('parsed_category_id', null)
      .limit(MAX_BATCH_SIZE);

    if (rowsError || !rowsToProcess) {
      return NextResponse.json({ error: 'Failed to fetch rows' }, { status: 500 });
    }

    if (rowsToProcess.length === 0) {
      return NextResponse.json({ message: 'No more rows to categorize.', remaining: 0 });
    }

    await supabase.from('import_jobs').update({ status: 'ai_categorizing' }).eq('id', importJobId);

    // 3. Check for AI API key
    const aiApiKey = process.env.AI_API_KEY;
    const aiBaseUrl = process.env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/';
    const aiModel = process.env.AI_MODEL || 'glm-4-flash';

    if (!aiApiKey) {
      console.warn("No AI_API_KEY found. Falling back to rule-based parsing.");
      await fallbackRuleCategorization(supabase, importJobId, rowsToProcess, categories || []);
      return NextResponse.json({ message: 'Categorized via fallback.', remaining: 0 });
    }

    // 4. Build prompt
    const payload = {
      available_categories: categoryMap,
      transactions: rowsToProcess.map(r => ({
        id: r.id,
        desc: r.parsed_description || 'Unknown',
        amount: Number(r.parsed_amount) || 0,
      }))
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

    // 5. Call AI via OpenAI-compatible endpoint
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
      const errText = await aiResponse.text();
      console.error("AI API Error:", aiResponse.status, errText);
      // Fallback to rule-based if AI fails
      await fallbackRuleCategorization(supabase, importJobId, rowsToProcess, categories || []);
      return NextResponse.json({ message: 'AI failed, categorized via fallback.', remaining: 0 });
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || '';

    // 6. Parse AI Response
    let aiResults = [];
    try {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResults = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse LLM JSON:", rawText);
      await fallbackRuleCategorization(supabase, importJobId, rowsToProcess, categories || []);
      return NextResponse.json({ message: 'AI response invalid, used fallback.', remaining: 0 });
    }

    // 7. Update rows
    for (const res of aiResults) {
      const validCategory = categoryMap.find(c => c.id === res.category_id) ? res.category_id : null;
      
      await supabase.from('import_rows').update({
        parsed_merchant: res.merchant_name || null,
        parsed_category_id: validCategory,
        ai_confidence: res.confidence || null,
        ai_payload: { raw: res },
      }).eq('id', res.id).eq('import_job_id', importJobId);
    }

    // 8. Check if more remain
    const { count } = await supabase
      .from('import_rows')
      .select('id', { count: 'exact', head: true })
      .eq('import_job_id', importJobId)
      .eq('has_error', false)
      .is('parsed_category_id', null);

    const remaining = count || 0;
    if (remaining === 0) {
      await supabase.from('import_jobs').update({ status: 'ready_for_review' }).eq('id', importJobId);
    }

    return NextResponse.json({ message: `Categorized ${aiResults.length} rows.`, remaining });
  } catch (error: any) {
    console.error('Categorize API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Very basic rule-based fallback if AI APIs are absent or fail
async function fallbackRuleCategorization(supabase: any, jobId: string, rows: any[], categories: any[]) {
  const dictionary: Record<string, string> = {
    'uber': 'Transport', 'lyft': 'Transport', 'ola': 'Transport', 'rapido': 'Transport',
    'doordash': 'Dining', 'ubereats': 'Dining', 'starbucks': 'Dining', 'mcdonald': 'Dining', 'zomato': 'Dining', 'swiggy': 'Dining',
    'amazon': 'Shopping', 'target': 'Shopping', 'walmart': 'Shopping', 'flipkart': 'Shopping', 'myntra': 'Shopping',
    'netflix': 'Entertainment', 'spotify': 'Entertainment', 'hotstar': 'Entertainment', 'prime video': 'Entertainment',
    'safeway': 'Groceries', 'kroger': 'Groceries', 'trader joe': 'Groceries', 'bigbasket': 'Groceries',
    'pge': 'Utilities', 'comcast': 'Utilities', 'airtel': 'Utilities', 'jio': 'Utilities',
    'salary': 'Salary', 'payroll': 'Salary', 'stipend': 'Salary',
  };

  const getCatId = (name: string) => categories.find((c: any) => c.name.toLowerCase() === name.toLowerCase())?.id || null;

  for (const row of rows) {
    const desc = (row.parsed_description || '').toLowerCase();
    let merchant = row.parsed_description;
    let fallbackCatName = null;

    for (const [key, catName] of Object.entries(dictionary)) {
      if (desc.includes(key)) {
        merchant = key.charAt(0).toUpperCase() + key.slice(1);
        fallbackCatName = catName;
        break;
      }
    }

    await supabase.from('import_rows').update({
      parsed_merchant: merchant,
      parsed_category_id: fallbackCatName ? getCatId(fallbackCatName) : null,
      ai_confidence: fallbackCatName ? 0.99 : 0.0,
      ai_payload: { fallback: true },
    }).eq('id', row.id).eq('import_job_id', jobId);
  }
  
  await supabase.from('import_jobs').update({ status: 'ready_for_review' }).eq('id', jobId);
}
