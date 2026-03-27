import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const commitImportRequestSchema = z.object({
  importJobId: z.string().uuid(),
  accountId: z.string().uuid().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsedBody = commitImportRequestSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Missing importJobId' }, { status: 400 });
    }

    const { importJobId, accountId } = parsedBody.data;

    const { data: importJob, error: importJobError } = await supabase
      .from('import_jobs')
      .select('id')
      .eq('id', importJobId)
      .eq('user_id', user.id)
      .single();

    if (importJobError || !importJob) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 });
    }

    if (accountId) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (accountError || !account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
    }

    const { data: rowsToImport, error: fetchError } = await supabase
      .from('import_rows')
      .select('*')
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('is_selected_for_import', true)
      .eq('has_error', false);

    if (fetchError || !rowsToImport) {
      return NextResponse.json({ error: 'Failed to fetch rows for import' }, { status: 500 });
    }

    if (rowsToImport.length === 0) {
      await supabase
        .from('import_jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', importJobId)
        .eq('user_id', user.id);

      return NextResponse.json({ importedCount: 0, duplicateSkippedCount: 0 });
    }

    const { data: duplicateRows } = await supabase
      .from('import_rows')
      .select('id')
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('is_selected_for_import', false)
      .eq('is_duplicate_guess', true);

    const duplicateSkippedCount = duplicateRows ? duplicateRows.length : 0;

    const transactionsToInsert = rowsToImport.map((row) => ({
      user_id: user.id,
      account_id: accountId || null,
      amount: row.parsed_amount,
      currency: row.parsed_currency || 'USD',
      type: row.parsed_type || 'expense',
      category_id: row.parsed_category_id,
      merchant: row.parsed_merchant || row.parsed_description,
      description: row.parsed_description,
      date: row.parsed_date,
      status: 'cleared',
      source: 'import',
      is_reviewed: false,
      source_metadata: { import_job_id: importJobId },
    }));

    const BATCH_SIZE = 500;
    let importedCount = 0;

    for (let index = 0; index < transactionsToInsert.length; index += BATCH_SIZE) {
      const batch = transactionsToInsert.slice(index, index + BATCH_SIZE);
      const { error: insertError } = await supabase.from('transactions').insert(batch);

      if (insertError) {
        console.error('Transaction Bulk Insert Error:', insertError);
        return NextResponse.json({ error: 'Failed to commit transactions to ledger' }, { status: 500 });
      }

      importedCount += batch.length;
    }

    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', importJobId)
      .eq('user_id', user.id);

    return NextResponse.json({ importedCount, duplicateSkippedCount });
  } catch (error) {
    console.error('Commit API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
