import { Metadata } from 'next'
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav'
import { getActiveImportJob } from '@/app/dashboard/auto-parse/actions'

export const metadata: Metadata = {
  title: 'AI Auto-Parse',
  description: 'Upload bank statements and receipts to automatically extract transactions using AI.',
}
import { AutoParseClientWrapper } from './AutoParseClientWrapper'
import { createClient } from '@/utils/supabase/server'

export default async function AutoParsePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [activeJob, categoriesRes, accountsRes, recentJobsRes] = await Promise.all([
    getActiveImportJob().catch(() => null),
    supabase.from('categories').select('id, name, icon, color, type'),
    supabase.from('accounts').select('id, name, type, color'),
    supabase.from('import_jobs')
      .select('id, file_path, row_count, status, created_at, completed_at')
      .eq('user_id', user.id)
      .in('status', ['completed', 'failed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 overflow-x-auto rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
        <DashboardSubNav />
      </div>

      <AutoParseClientWrapper
        initialJob={activeJob}
        categories={categoriesRes.data || []}
        accounts={accountsRes.data || []}
        recentJobs={(recentJobsRes.data || []).map((job) => ({
          ...job,
          row_count: job.row_count ?? 0,
          created_at: job.created_at ?? new Date(0).toISOString(),
        }))}
      />
    </div>
  )
}
