'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPublicSiteUrl } from '@/lib/env'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = await createClient()

 
 
  const redirectOrigin = getPublicSiteUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectOrigin}/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?message=Check your email for the password reset link.')
}
