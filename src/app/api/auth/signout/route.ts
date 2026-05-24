import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

 
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  const response = NextResponse.redirect(new URL('/login', request.url), {
    status: 302,
  })
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}
