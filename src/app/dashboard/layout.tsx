import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayoutClient from './DashboardLayoutClient'
import { getUserSettings } from './settings/data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let theme: 'system' | 'light' | 'dark' = 'system'
  try {
    const settings = await getUserSettings()
    theme = settings.theme ?? 'system'
  } catch {
    // Settings table may not exist yet — fall through to 'system'
  }

  return (
    <DashboardLayoutClient user={user} initialTheme={theme}>
      {children}
    </DashboardLayoutClient>
  )
}
