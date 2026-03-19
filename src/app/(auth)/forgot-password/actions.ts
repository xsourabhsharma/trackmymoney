'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = await createClient()

  // Ensure you've setup a Redirect URL in your Supabase Auth settings to handle the password reset flow.
  // We'll point it back to a dedicated update-password route. For now, we redirect them to the auth callback.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/update-password`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?message=Check your email for the password reset link.')
}
