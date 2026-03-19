'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) {
      redirect('/update-password?error=Passwords do not match')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}
