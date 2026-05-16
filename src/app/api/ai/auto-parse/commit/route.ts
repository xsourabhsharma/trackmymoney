import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { IMPORT_COMMIT_ROW_SELECT } from '@/lib/contracts';
import {
  buildImportTransactions,
  collectIds,
  validateImportCommitRows,
  type ValidatedImportCommitRow,
} from '@/lib/import/validation';
import {
  findDuplicateImportRowIds,
  parseExistingTransactionsForDuplicateCheck,
  type ImportDuplicateCandidate,
} from '@/lib/import/duplicates';

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
      .select(IMPORT_COMMIT_ROW_SELECT)
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('is_selected_for_import', true)
      .eq('has_error', false);

    if (fetchError || !Array.isArray(rowsToImport)) {
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

    const validation = validateImportCommitRows(rowsToImport);

    if (validation.invalidRows.length > 0) {
      await markInvalidRows(supabase, user.id, importJobId, validation.invalidRows);
    }

    const categoryValidation = await filterRowsWithValidCategories(
      supabase,
      user.id,
      importJobId,
      validation.validRows
    );
    const validRows = categoryValidation.validRows;

    if (validRows.length === 0) {
      return NextResponse.json({
        error: 'No valid import rows were available to commit',
        validationSkippedCount: validation.invalidRows.length + categoryValidation.invalidCategoryCount,
      }, { status: 422 });
    }

    const { data: duplicateRows } = await supabase
      .from('import_rows')
      .select('id')
      .eq('import_job_id', importJobId)
      .eq('user_id', user.id)
      .eq('is_selected_for_import', false)
      .eq('is_duplicate_guess', true);

    const existingDuplicateSkippedCount = duplicateRows ? duplicateRows.length : 0;
    const duplicateRowIds = await findExistingDuplicateRows(supabase, user.id, accountId ?? null, validRows);
    const finalRowsToInsert = validRows.filter((row) => !duplicateRowIds.has(row.id));

    if (duplicateRowIds.size > 0) {
      await markDuplicateRows(supabase, user.id, importJobId, [...duplicateRowIds]);
    }

    const transactionsToInsert = buildImportTransactions({
      rows: finalRowsToInsert,
      userId: user.id,
      accountId: accountId ?? null,
      importJobId,
    });

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

    const uncategorizedCount = finalRowsToInsert.filter((row) => !row.categoryId).length;
    const currencyDefaultedCount = finalRowsToInsert.filter((row) => row.usedDefaultCurrency).length;
    const warnings = [
      ...(accountId ? [] : ['No account was selected; imported transactions have account_id set to null.']),
      ...(uncategorizedCount > 0 ? [`${uncategorizedCount} imported transaction(s) are uncategorized.`] : []),
      ...(currencyDefaultedCount > 0 ? [`${currencyDefaultedCount} imported transaction(s) defaulted to USD.`] : []),
      ...(validation.invalidRows.length > 0 ? [`${validation.invalidRows.length} invalid selected row(s) were skipped.`] : []),
      ...(categoryValidation.invalidCategoryCount > 0 ? [`${categoryValidation.invalidCategoryCount} row(s) used unavailable categories and were skipped.`] : []),
    ];

    return NextResponse.json({
      importedCount,
      duplicateSkippedCount: existingDuplicateSkippedCount + duplicateRowIds.size,
      validationSkippedCount: validation.invalidRows.length + categoryValidation.invalidCategoryCount,
      uncategorizedCount,
      unassignedAccountCount: accountId ? 0 : importedCount,
      warnings,
    });
  } catch (error) {
    console.error('Commit API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function filterRowsWithValidCategories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  importJobId: string,
  rows: ValidatedImportCommitRow[]
) {
  const categoryIds = [...new Set(rows.map((row) => row.categoryId).filter((id): id is string => Boolean(id)))];
  if (categoryIds.length === 0) {
    return { validRows: rows, invalidCategoryCount: 0 };
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id')
    .in('id', categoryIds);

  if (error) {
    throw error;
  }

  const validCategoryIds = collectIds(categories);
  const invalidCategoryRows = rows.filter((row) => row.categoryId && !validCategoryIds.has(row.categoryId));

  if (invalidCategoryRows.length > 0) {
    await markInvalidRows(
      supabase,
      userId,
      importJobId,
      invalidCategoryRows.map((row) => ({
        id: row.id,
        message: 'Selected category is unavailable for this user.',
      }))
    );
  }

  return {
    validRows: rows.filter((row) => !row.categoryId || validCategoryIds.has(row.categoryId)),
    invalidCategoryCount: invalidCategoryRows.length,
  };
}

async function findExistingDuplicateRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  accountId: string | null,
  rows: ValidatedImportCommitRow[]
) {
  const timestamps = rows.map((row) => new Date(row.date).getTime());
  const minDate = new Date(Math.min(...timestamps));
  const maxDate = new Date(Math.max(...timestamps));
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 3);

  let query = supabase
    .from('transactions')
    .select('id, amount, date, merchant, description, account_id')
    .eq('user_id', userId)
    .gte('date', minDate.toISOString())
    .lte('date', maxDate.toISOString());

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data: existingTransactions, error } = await query;
  if (error) {
    throw error;
  }

  const duplicateCandidates: ImportDuplicateCandidate[] = rows.map((row) => ({
    id: row.id,
    amount: row.amount,
    date: row.date,
    merchant: row.merchant,
    description: row.description,
    accountId,
  }));

  return findDuplicateImportRowIds(
    duplicateCandidates,
    parseExistingTransactionsForDuplicateCheck(existingTransactions)
  );
}

async function markInvalidRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  importJobId: string,
  invalidRows: { id: string | null; message: string }[]
) {
  for (const row of invalidRows) {
    if (!row.id) {
      continue;
    }

    await supabase
      .from('import_rows')
      .update({
        has_error: true,
        is_selected_for_import: false,
        error_message: row.message,
      })
      .eq('id', row.id)
      .eq('import_job_id', importJobId)
      .eq('user_id', userId);
  }
}

async function markDuplicateRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  importJobId: string,
  duplicateRowIds: string[]
) {
  const BATCH_SIZE = 500;

  for (let index = 0; index < duplicateRowIds.length; index += BATCH_SIZE) {
    const batch = duplicateRowIds.slice(index, index + BATCH_SIZE);
    await supabase
      .from('import_rows')
      .update({
        is_duplicate_guess: true,
        is_selected_for_import: false,
      })
      .in('id', batch)
      .eq('import_job_id', importJobId)
      .eq('user_id', userId);
  }
}
