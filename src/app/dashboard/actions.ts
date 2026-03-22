'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be a positive number'),
  type: z.enum(['income', 'expense']),
  merchant: z.string().min(1, 'Merchant name is required'),
  categoryId: z.string().optional().default(''),
  accountId: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional().default(''),
  currency: z.string().optional().default('INR'),
})

const RECEIPT_MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const RECEIPT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fix missing profile issue
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email || 'unknown@example.com',
      full_name: user.user_metadata?.full_name || 'User',
      currency: 'USD'
    })
  }

  // Validate form input
  const parsed = transactionSchema.safeParse({
    amount: formData.get('amount'),
    type: formData.get('type'),
    merchant: formData.get('merchant'),
    categoryId: formData.get('categoryId'),
    accountId: formData.get('accountId'),
    date: formData.get('date'),
    description: formData.get('description'),
    currency: formData.get('currency'),
  })

  if (!parsed.success) {
    throw new Error(`Validation failed: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { amount: amountStr, type, merchant: rawMerchant, categoryId, accountId, date, description, currency } = parsed.data
  const amount = parseFloat(amountStr)
  const merchant = rawMerchant
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  let parsedDate: string
  try {
    parsedDate = new Date(date).toISOString()
  } catch {
    throw new Error('Invalid date provided.')
  }

  const admin = createAdminClient()
  let receiptUrl: string | null = null

  const receiptFile = formData.get('receipt') as File | null
  if (receiptFile && receiptFile.size > 0) {
    if (receiptFile.size > RECEIPT_MAX_SIZE) {
      throw new Error('Receipt file must be under 5 MB.')
    }
    if (!RECEIPT_ALLOWED_TYPES.includes(receiptFile.type)) {
      throw new Error('Receipt must be a JPEG, PNG, WebP, or HEIC image.')
    }

    const fileExt = receiptFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await admin.storage
      .from('receipts')
      .upload(fileName, receiptFile)

    if (uploadError) {
      console.error('Receipt upload failed:', uploadError)
    } else {
      const { data: publicUrlData } = admin.storage.from('receipts').getPublicUrl(fileName)
      receiptUrl = publicUrlData.publicUrl
    }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount,
    currency,
    type,
    category_id: categoryId || null,
    account_id: accountId || null,
    merchant,
    description: description || null,
    date: parsedDate,
    source: 'manual',
    receipt_url: receiptUrl,
    is_reviewed: true,
  })

  if (error) {
    console.error('Error inserting transaction:', error)
    throw new Error(`Failed to save transaction: ${error.message}`)
  }

  revalidatePath('/dashboard', 'layout')
}

export async function updateTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const id = formData.get('id') as string
  const amount = formData.get('amount') as string
  const type = formData.get('type') as 'income' | 'expense'
  const rawMerchant = formData.get('merchant') as string
  const merchant = rawMerchant
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
  const categoryId = formData.get('categoryId') as string
  const accountId = formData.get('accountId') as string
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  let parsedDate: string
  try {
    parsedDate = new Date(date).toISOString()
  } catch {
    throw new Error('Invalid date provided.')
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      amount: parseFloat(amount),
      type,
      category_id: categoryId || null,
      account_id: accountId || null,
      merchant,
      description: description || null,
      date: parsedDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating transaction:', error)
    throw new Error('Failed to update transaction')
  }

  revalidatePath('/dashboard', 'layout')
}
