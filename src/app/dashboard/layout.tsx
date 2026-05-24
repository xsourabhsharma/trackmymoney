import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayoutClient from './DashboardLayoutClient'
import { getUserSettings } from './settings/data'
import { GlobalAiWidget } from '@/components/dashboard/advisor/GlobalAiWidget'

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
  let currency: 'USD' | 'INR' = 'INR'
  
  try {
    const settings = await getUserSettings()
    theme = settings.theme ?? 'system'
    currency = (settings.currency as 'USD' | 'INR') || 'INR'
  } catch {
   
  }

  return (
    <DashboardLayoutClient user={user} initialTheme={theme} initialCurrency={currency}>
      {children}
      <GlobalAiWidget />
    </DashboardLayoutClient>
  )
}
