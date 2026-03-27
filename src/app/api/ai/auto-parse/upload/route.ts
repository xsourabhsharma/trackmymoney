import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parseCsvFile } from '@/lib/csv-parser';

const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_CSV_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'text/plain',
  '',
]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }

    if (!ALLOWED_CSV_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      return NextResponse.json({ error: 'CSV file must be 5 MB or smaller' }, { status: 413 });
    }

    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .insert({
        user_id: user.id,
        status: 'parsing',
        source: 'csv',
        file_path: file.name,
      })
      .select('id')
      .single();

    if (jobError || !job) {
      console.error('Job Creation Error:', jobError);
      return NextResponse.json({ error: 'Failed to initialize import job' }, { status: 500 });
    }

    const jobId = job.id;
    const csvContent = await file.text();
    const { rows, error: parseError } = parseCsvFile(csvContent);

    if (parseError) {
      await supabase
        .from('import_jobs')
        .update({ status: 'failed', error_message: parseError })
        .eq('id', jobId)
        .eq('user_id', user.id);
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    const stagedRows = rows.map((row) => ({
      import_job_id: jobId,
      user_id: user.id,
      raw_row: row.raw,
      parsed_date: row.date,
      parsed_description: row.description,
      parsed_amount: row.amount,
      parsed_type: row.type,
      parsed_merchant: row.description,
      has_error: !row.date || row.amount === null || row.amount === undefined,
      error_message: !row.date ? 'Missing/Invalid Date' : (row.amount === null ? 'Missing/Invalid Amount' : null),
      is_selected_for_import: !!row.date && row.amount !== null,
    }));

    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    for (let index = 0; index < stagedRows.length; index += BATCH_SIZE) {
      const batch = stagedRows.slice(index, index + BATCH_SIZE);
      const { error: insertError } = await supabase.from('import_rows').insert(batch);
      if (insertError) {
        console.error('Batch Insert Error:', insertError);
        await supabase
          .from('import_jobs')
          .update({ status: 'failed', error_message: 'Database insert failed' })
          .eq('id', jobId)
          .eq('user_id', user.id);
        return NextResponse.json({ error: 'Failed to save parsed rows to database' }, { status: 500 });
      }
      insertedCount += batch.length;
    }

    const earliestDate = stagedRows.reduce(
      (min, row) => (row.parsed_date && row.parsed_date < min) ? row.parsed_date : min,
      '9999-12-31'
    );
    const latestDate = stagedRows.reduce(
      (max, row) => (row.parsed_date && row.parsed_date > max) ? row.parsed_date : max,
      '1000-01-01'
    );

    if (earliestDate !== '9999-12-31') {
      const minDate = new Date(earliestDate);
      minDate.setDate(minDate.getDate() - 5);
      const maxDate = new Date(latestDate);
      maxDate.setDate(maxDate.getDate() + 5);

      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('id, amount, date')
        .eq('user_id', user.id)
        .gte('date', minDate.toISOString())
        .lte('date', maxDate.toISOString());

      if (existingTransactions && existingTransactions.length > 0) {
        const { data: currentStaged } = await supabase
          .from('import_rows')
          .select('id, parsed_amount, parsed_date, has_error')
          .eq('import_job_id', jobId)
          .eq('user_id', user.id);

        if (currentStaged) {
          const duplicateIds: string[] = [];

          currentStaged.forEach((staged) => {
            if (staged.has_error || !staged.parsed_amount || !staged.parsed_date) {
              return;
            }

            const stagedDate = new Date(staged.parsed_date);
            const amount = Number(staged.parsed_amount);

            const isDuplicate = existingTransactions.some((transaction) => {
              const transactionDate = new Date(transaction.date);
              const diffTime = Math.abs(transactionDate.getTime() - stagedDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 3 && Math.abs(Number(transaction.amount) - amount) < 0.01;
            });

            if (isDuplicate) {
              duplicateIds.push(staged.id);
            }
          });

          if (duplicateIds.length > 0) {
            for (let index = 0; index < duplicateIds.length; index += BATCH_SIZE) {
              const chunk = duplicateIds.slice(index, index + BATCH_SIZE);
              await supabase
                .from('import_rows')
                .update({ is_duplicate_guess: true, is_selected_for_import: false })
                .in('id', chunk)
                .eq('user_id', user.id);
            }
          }
        }
      }
    }

    await supabase
      .from('import_jobs')
      .update({
        status: 'ready_for_review',
        row_count: insertedCount,
      })
      .eq('id', jobId)
      .eq('user_id', user.id);

    return NextResponse.json({ jobId, rowCount: insertedCount });
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
