'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
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

const RECEIPT_MAX_SIZE = 5 * 1024 * 1024
const RECEIPT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

 
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
      currency: String(formData.get('currency') || 'INR').toUpperCase() === 'USD' ? 'USD' : 'INR'
    })
  }

 
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

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date provided.')
  }
  const parsedDateISO = parsedDate.toISOString()

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

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptFile)

    if (uploadError) {
      console.error('Receipt upload failed:', uploadError)
    } else {
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
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
    date: parsedDateISO,
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

const updateTransactionSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  amount: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be positive'),
  type: z.enum(['income', 'expense']),
  merchant: z.string().min(1, 'Merchant is required'),
  categoryId: z.string().optional().default(''),
  accountId: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional().default(''),
})

export async function updateTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = updateTransactionSchema.safeParse({
    id: formData.get('id'),
    amount: formData.get('amount'),
    type: formData.get('type'),
    merchant: formData.get('merchant'),
    categoryId: formData.get('categoryId'),
    accountId: formData.get('accountId'),
    date: formData.get('date'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    throw new Error(`Validation failed: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { id, amount: amountStr, type, merchant: rawMerchant, categoryId, accountId, date, description } = parsed.data
  const merchant = rawMerchant
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date provided.')
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      amount: parseFloat(amountStr),
      type,
      category_id: categoryId || null,
      account_id: accountId || null,
      merchant,
      description: description || null,
      date: parsedDate.toISOString(),
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
