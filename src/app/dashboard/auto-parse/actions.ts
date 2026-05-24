'use server'

import { createClient } from '@/utils/supabase/server'
import { ImportJob, ImportRow } from '@/lib/types'

type ImportJobOwnerJoin = {
  import_jobs?: { user_id?: string | null } | null
}

export async function getActiveImportJob() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: job } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return job as ImportJob | null
}

export async function getImportJobDetails(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: job } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) throw new Error('Job not found')

  const { data: rows } = await supabase
    .from('import_rows')
    .select('*, categories(id, name, color, icon)')
    .eq('import_job_id', jobId)
    .order('parsed_date', { ascending: false })

  return { job: job as ImportJob, rows: rows as ImportRow[] }
}

export async function updateImportRow(rowId: string, updates: Partial<ImportRow>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

 
  const { data: row } = await supabase
    .from('import_rows')
    .select('import_job_id, import_jobs!inner(user_id)')
    .eq('id', rowId)
    .single()

  const ownedRow = row as ImportJobOwnerJoin | null
  if (!ownedRow || ownedRow.import_jobs?.user_id !== user.id) {
    throw new Error('Forbidden')
  }

  const { error } = await supabase
    .from('import_rows')
    .update({
      parsed_merchant: updates.parsed_merchant,
      parsed_category_id: updates.parsed_category_id,
      parsed_type: updates.parsed_type,
      is_selected_for_import: updates.is_selected_for_import,
    })
    .eq('id', rowId)

  if (error) console.error('Error updating row:', error)
}

export async function cancelImportJob(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('import_jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .eq('user_id', user.id)
}
