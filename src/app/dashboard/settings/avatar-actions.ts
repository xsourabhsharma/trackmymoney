'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) throw new Error('No file provided')

  if (file.size > 2 * 1024 * 1024) throw new Error('Avatar must be under 2 MB')
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) throw new Error('Avatar must be a JPEG, PNG, WebP, or GIF')

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

  await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  })

  return { url: publicUrl }
}
