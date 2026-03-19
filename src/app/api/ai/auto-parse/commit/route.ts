import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { importJobId, accountId } = await req.json();

    if (!importJobId) {
      return NextResponse.json({ error: 'Missing importJobId' }, { status: 400 });
    }

    // 1. Fetch valid, selected rows
    const { data: rowsToImport, error: fetchError } = await supabase
      .from('import_rows')
      .select('*')
      .eq('import_job_id', importJobId)
      .eq('is_selected_for_import', true)
      .eq('has_error', false);

    if (fetchError || !rowsToImport) {
      return NextResponse.json({ error: 'Failed to fetch rows for import' }, { status: 500 });
    }

    if (rowsToImport.length === 0) {
      // Nothing to import, just close the job
      await supabase.from('import_jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', importJobId);
      return NextResponse.json({ importedCount: 0, duplicateSkippedCount: 0 });
    }

    // Determine skipped duplicates
    const { data: duplicateRows } = await supabase
      .from('import_rows')
      .select('id')
      .eq('import_job_id', importJobId)
      .eq('is_selected_for_import', false)
      .eq('is_duplicate_guess', true);

    const duplicateSkippedCount = duplicateRows ? duplicateRows.length : 0;

    // 2. Map staging rows to transaction rows
    const transactionsToInsert = rowsToImport.map(row => ({
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

    // 3. Bulk Insert into transactions in batches
    const BATCH_SIZE = 500;
    let importedCount = 0;
    
    for (let i = 0; i < transactionsToInsert.length; i += BATCH_SIZE) {
      const batch = transactionsToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase.from('transactions').insert(batch);
      
      if (insertError) {
        console.error("Transaction Bulk Insert Error:", insertError);
        return NextResponse.json({ error: 'Failed to commit transactions to ledger' }, { status: 500 });
      }
      importedCount += batch.length;
    }

    // 4. Update Import Job status
    await supabase.from('import_jobs').update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', importJobId);

    return NextResponse.json({ importedCount, duplicateSkippedCount });

  } catch (error: any) {
    console.error('Commit API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
