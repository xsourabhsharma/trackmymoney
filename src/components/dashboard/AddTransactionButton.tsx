'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CalendarDays, ChevronDown, Loader2, Plus, WalletCards } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addTransaction } from '@/app/dashboard/actions'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { cn } from '@/lib/utils'

type TransactionType = 'expense' | 'income'

interface TransactionCategory {
  color?: string | null
  icon?: string | null
  id?: string
  name?: string
  type?: TransactionType | string | null
}

interface AddTransactionButtonProps {
  accounts?: Array<{ id?: string; name?: string; type?: string | null }>
  buttonLabel?: string
  categories: TransactionCategory[]
  defaultType?: TransactionType | 'transfer'
}

export function AddTransactionButton({
  accounts = [],
  buttonLabel = 'New Transaction',
  categories,
  defaultType = 'expense',
}: AddTransactionButtonProps) {
  const router = useRouter()
  const currentCurrency = useCurrencyStore((state) => state.currency)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType === 'income' ? 'income' : 'expense')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id ?? '')
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string; category?: string; submit?: string }>({})
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const merchantInputRef = useRef<HTMLInputElement>(null)

  const availableCategories = useMemo(() => {
    const seen = new Set<string>()
    return categories
      .filter((category) => category.type === transactionType)
      .filter((category) => {
        const key = category.id || category.name || ''
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [categories, transactionType])

  useEffect(() => {
    if (!open) return

    async function fetchMerchants() {
      try {
        const res = await fetch('/api/merchants')
        if (res.ok) {
          const data = await res.json() as { merchants?: string[] }
          setMerchantSuggestions(data.merchants ?? [])
        }
      } catch {
        setMerchantSuggestions([])
      }
    }

    void fetchMerchants()
  }, [open])

  useEffect(() => {
    if (!selectedAccount && accounts[0]?.id) {
      setSelectedAccount(accounts[0].id)
    }
  }, [accounts, selectedAccount])

  function handleTypeChange(type: TransactionType) {
    setTransactionType(type)
    setSelectedCategory('')
    setErrors((prev) => ({ ...prev, category: undefined, submit: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const amount = Number(formData.get('amount'))
    const merchant = String(formData.get('merchant') ?? '')

    const nextErrors: typeof errors = {}
    if (!amount || amount <= 0) nextErrors.amount = 'Enter a positive amount.'
    if (!merchant.trim()) nextErrors.merchant = 'Merchant or description is required.'
    if (!selectedCategory) nextErrors.category = 'Select a category.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    formData.set('type', transactionType)
    formData.set('categoryId', selectedCategory)
    formData.set('accountId', selectedAccount)
    formData.set('currency', currentCurrency)

    setErrors({})
    setIsLoading(true)

    try {
      await addTransaction(formData)
      setOpen(false)
      setSelectedCategory('')
      setErrors({})
      event.currentTarget.reset()
      router.refresh()
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save transaction.' })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSuggestions = merchantSuggestions
    .filter((merchant) => merchant.toLowerCase().includes(merchantInputRef.current?.value.toLowerCase() || ''))
    .slice(0, 6)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button suppressHydrationWarning className="h-11 rounded-[14px] border border-[var(--accent)] bg-[var(--accent)] px-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-none hover:brightness-110">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>
        }
      />
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[26px] border border-[var(--border-light)] bg-[var(--bg-base)] p-0 shadow-2xl sm:max-w-[560px]">
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4 sm:px-6">
          <div>
            <DialogTitle className="m-0 p-0 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-main)]">
              Add Transaction
            </DialogTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Record one real income or expense entry.</p>
          </div>
          <DialogClose className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]" />
        </div>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-7rem)] w-full flex-col gap-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-1">
            {(['expense', 'income'] as TransactionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={cn(
                  'rounded-[14px] px-4 py-3 text-sm font-semibold capitalize transition-all',
                  transactionType === type
                    ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="date">
              <div className="relative">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                  className="h-12 rounded-xl border-[var(--border-light)] bg-[var(--bg-surface)] pr-10 text-[var(--text-main)]"
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>
            </Field>

            <Field label={`Amount (${currentCurrency})`} htmlFor="amount" error={errors.amount}>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={cn('h-12 rounded-xl border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)]', errors.amount && 'border-[var(--expense-red)]')}
                onKeyDown={(event) => {
                  if (['-', '+', 'e', 'E'].includes(event.key)) event.preventDefault()
                }}
                required
              />
            </Field>
          </div>

          <Field label="Merchant / Description" htmlFor="merchant" error={errors.merchant}>
            <div className="relative">
              <Input
                id="merchant"
                name="merchant"
                ref={merchantInputRef}
                placeholder="e.g. Grocery store, salary, rent"
                className={cn('h-12 rounded-xl border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)]', errors.merchant && 'border-[var(--expense-red)]')}
                autoComplete="off"
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                onChange={() => setErrors((prev) => ({ ...prev, merchant: undefined, submit: undefined }))}
                required
              />
              {showSuggestions && filteredSuggestions.length > 0 ? (
                <div className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] shadow-xl">
                  {filteredSuggestions.map((merchant) => (
                    <button
                      key={merchant}
                      type="button"
                      className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                      onClick={() => {
                        if (merchantInputRef.current) merchantInputRef.current.value = merchant
                        setShowSuggestions(false)
                      }}
                    >
                      {merchant}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </Field>

          <Field label="Category" error={errors.category}>
            <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-surface)] p-2 sm:grid-cols-2">
              {availableCategories.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-[var(--border-light)] p-4 text-sm text-[var(--text-muted)]">
                  No {transactionType} categories yet.
                </div>
              ) : (
                availableCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id ?? '')
                      setErrors((prev) => ({ ...prev, category: undefined, submit: undefined }))
                    }}
                    className={cn(
                      'flex min-w-0 items-center gap-3 rounded-[14px] border px-3 py-2.5 text-left transition-all',
                      selectedCategory === category.id
                        ? 'border-[var(--text-main)] bg-[var(--bg-base)] shadow-sm'
                        : 'border-transparent hover:border-[var(--border-light)] hover:bg-[var(--bg-base)]'
                    )}
                  >
                    <CategoryIcon className="h-8 w-8 rounded-[10px]" color={category.color} icon={category.icon} name={category.name} />
                    <span className="truncate text-sm font-semibold text-[var(--text-main)]">{category.name}</span>
                  </button>
                ))
              )}
            </div>
          </Field>

          <Field label="Account" htmlFor="accountId">
            <div className="relative">
              <select
                id="accountId"
                name="accountId"
                value={selectedAccount}
                onChange={(event) => setSelectedAccount(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 pr-10 text-sm font-medium text-[var(--text-main)] outline-none focus:border-[var(--border-dark)]"
              >
                <option value="">No account selected</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <WalletCards className="pointer-events-none absolute left-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
          </Field>

          <Field label="Notes" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="Optional note for this transaction"
              className="min-h-[92px] resize-none rounded-xl border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
            />
          </Field>

          {errors.submit ? (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--expense-red)]/30 bg-[var(--expense-red)]/10 p-3 text-sm font-medium text-[var(--expense-red)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errors.submit}
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-3 border-t border-[var(--border-light)] bg-[var(--bg-base)] px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-full border-[var(--border-light)] px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-11 rounded-full bg-[var(--text-main)] px-6 text-[var(--bg-base)] hover:opacity-90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode
  error?: string
  htmlFor?: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </Label>
      {children}
      {error ? <span className="px-1 text-[12px] font-medium text-[var(--expense-red)]">{error}</span> : null}
    </div>
  )
}
