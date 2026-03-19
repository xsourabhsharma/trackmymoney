import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parseCsvFile } from '@/lib/csv-parser';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }

    // 1. Create Import Job
    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .insert({
        user_id: user.id,
        status: 'parsing',
        source: 'csv',
        file_path: file.name, // In a real prod environment, upload to Supabase Storage and store path here
      })
      .select('id')
      .single();

    if (jobError || !job) {
      console.error("Job Creation Error:", jobError);
      return NextResponse.json({ error: 'Failed to initialize import job' }, { status: 500 });
    }

    const jobId = job.id;

    // 2. Parse CSV
    const csvContent = await file.text();
    const { rows, error: parseError } = parseCsvFile(csvContent);

    if (parseError) {
      await supabase.from('import_jobs').update({ status: 'failed', error_message: parseError }).eq('id', jobId);
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    // 3. Stage Rows for Bulk Insert
    const stagedRows = rows.map(r => ({
      import_job_id: jobId,
      user_id: user.id,
      raw_row: r.raw,
      parsed_date: r.date,
      parsed_description: r.description,
      parsed_amount: r.amount,
      parsed_type: r.type,
      // Initial guess for merchant is just the description. AI will override this.
      parsed_merchant: r.description, 
      has_error: !r.date || r.amount === null || r.amount === undefined,
      error_message: !r.date ? "Missing/Invalid Date" : (r.amount === null ? "Missing/Invalid Amount" : null),
      is_selected_for_import: !!r.date && r.amount !== null, // Only pre-select valid rows
    }));

    // Insert securely in batches of 1000 to avoid request size limits
    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    for (let i = 0; i < stagedRows.length; i += BATCH_SIZE) {
      const batch = stagedRows.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase.from('import_rows').insert(batch);
      if (insertError) {
        console.error("Batch Insert Error:", insertError);
        await supabase.from('import_jobs').update({ status: 'failed', error_message: 'Database insert failed' }).eq('id', jobId);
        return NextResponse.json({ error: 'Failed to save parsed rows to database' }, { status: 500 });
      }
      insertedCount += batch.length;
    }

    // 4. Fire Duplicate Detection (via RPC or manual query)
    // For simplicity, doing logic via API. Get all transactions for user in date range.
    const earliestDate = stagedRows.reduce((min, r) => (r.parsed_date && r.parsed_date < min) ? r.parsed_date : min, '9999-12-31');
    const latestDate = stagedRows.reduce((max, r) => (r.parsed_date && r.parsed_date > max) ? r.parsed_date : max, '1000-01-01');

    if (earliestDate !== '9999-12-31') {
      const minDate = new Date(earliestDate);
      minDate.setDate(minDate.getDate() - 5); // Pad by 5 days
      const maxDate = new Date(latestDate);
      maxDate.setDate(maxDate.getDate() + 5);

      const { data: existingTxs } = await supabase
        .from('transactions')
        .select('id, amount, date')
        .eq('user_id', user.id)
        .gte('date', minDate.toISOString())
        .lte('date', maxDate.toISOString());

      if (existingTxs && existingTxs.length > 0) {
        // Find potential duplicates
        const { data: currentStaged } = await supabase.from('import_rows').select('id, parsed_amount, parsed_date, has_error').eq('import_job_id', jobId);
        if (currentStaged) {
          const duplicateIds: string[] = [];
          
          currentStaged.forEach(staged => {
            if (staged.has_error || !staged.parsed_amount || !staged.parsed_date) return;
            
            const stagedDate = new Date(staged.parsed_date);
            const amt = Number(staged.parsed_amount);
            
            const isDup = existingTxs.some(tx => {
               const txDate = new Date(tx.date);
               const diffTime = Math.abs(txDate.getTime() - stagedDate.getTime());
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               return diffDays <= 3 && Math.abs(Number(tx.amount) - amt) < 0.01;
            });

            if (isDup) duplicateIds.push(staged.id);
          });

          if (duplicateIds.length > 0) {
             // Update duplicates
             for (let i = 0; i < duplicateIds.length; i+= BATCH_SIZE) {
               const chunk = duplicateIds.slice(i, i + BATCH_SIZE);
               await supabase.from('import_rows')
                  .update({ is_duplicate_guess: true, is_selected_for_import: false })
                  .in('id', chunk);
             }
          }
        }
      }
    }

    // 5. Update Job Status to ready for AI
    await supabase.from('import_jobs').update({ 
      status: 'ready_for_review',  // We fast-track to review if AI is run manually later, but usually it goes 'ai_categorizing'
      row_count: insertedCount 
    }).eq('id', jobId);

    return NextResponse.json({ jobId, rowCount: insertedCount });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
