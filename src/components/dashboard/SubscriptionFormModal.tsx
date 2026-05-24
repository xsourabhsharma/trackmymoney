'use client'

import React, { useState, useTransition } from 'react'
import { AlertCircle, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createSubscription, updateSubscription, type CreateSubscriptionPayload } from '@/app/dashboard/subscriptions/actions'
import type { SubscriptionRow } from '@/app/dashboard/subscriptions/data'
import { format } from 'date-fns'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { useCurrencyStore } from '@/store/useCurrencyStore'

interface CategoryItem {
  id: string
  name: string
  icon?: string | null
  color?: string | null
}

interface SubscriptionFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: SubscriptionRow | null
  categories: CategoryItem[]
}

type SubscriptionFormData = Partial<CreateSubscriptionPayload>

function getInitialFormData(initialData: SubscriptionRow | null): SubscriptionFormData {
  if (!initialData) {
    return {
      merchant: '',
      serviceName: '',
      amount: 0,
      currency: 'USD',
      interval: 'monthly',
      status: 'active',
      nextChargeDate: format(new Date(), 'yyyy-MM-dd'),
      categoryId: '',
      potentialSavings: false,
    }
  }

  return {
    merchant: initialData.merchant,
    serviceName: initialData.serviceName || '',
    amount: initialData.amount,
    currency: initialData.currency,
    interval: initialData.interval,
    status: initialData.status,
    nextChargeDate: initialData.nextChargeDate ? initialData.nextChargeDate.split('T')[0] : '',
    categoryId: initialData.categoryId || '',
    potentialSavings: initialData.potentialSavings,
  }
}

export function SubscriptionFormModal({ isOpen, onClose, initialData, categories }: SubscriptionFormModalProps) {
  if (!isOpen) return null

  return (
    <SubscriptionFormModalContent
      key={initialData?.id ?? 'new-subscription'}
      onClose={onClose}
      initialData={initialData}
      categories={categories}
    />
  )
}

function SubscriptionFormModalContent({
  onClose,
  initialData,
  categories,
}: Omit<SubscriptionFormModalProps, 'isOpen'>) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const currentCurrency = useCurrencyStore((state) => state.currency)
  const [formData, setFormData] = useState<SubscriptionFormData>(() => ({
    ...getInitialFormData(initialData),
    currency: initialData?.currency || currentCurrency,
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
     
      if (!formData.merchant || formData.amount === undefined) return
      
     
      const payload: CreateSubscriptionPayload = {
        merchant: formData.merchant,
        serviceName: formData.serviceName || undefined,
        amount: Number(formData.amount),
        currency: formData.currency || currentCurrency,
        interval: formData.interval || 'monthly',
        status: formData.status || 'active',
        nextChargeDate: formData.nextChargeDate ? new Date(formData.nextChargeDate).toISOString() : undefined,
        categoryId: formData.categoryId || undefined,
        potentialSavings: formData.potentialSavings
      }

      const res = initialData 
        ? await updateSubscription(initialData.id, payload)
        : await createSubscription(payload)

      if (res.success) {
        onClose()
      } else {
        setError(res.error || 'Failed to save subscription')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
          <h3 className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-[0.2em]">
            {initialData ? 'Edit Subscription' : 'Add Subscription'}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-full hover:bg-[var(--border-light)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="sub-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2">Merchant <span className="text-[var(--expense-red)]">*</span></label>
                <input 
                  type="text" 
                  value={formData.merchant}
                  onChange={e => setFormData({...formData, merchant: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-light)] rounded-xl text-sm font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow placeholder:text-[var(--text-muted)]/50"
                  placeholder="Netflix, Spotify..."
                  required
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2">Service Name</label>
                <input 
                  type="text" 
                  value={formData.serviceName}
                  onChange={e => setFormData({...formData, serviceName: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-light)] rounded-xl text-sm font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow placeholder:text-[var(--text-muted)]/50"
                  placeholder="e.g. Premium Family"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2">Amount <span className="text-[var(--expense-red)]">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-light">
                    {currentCurrency === 'INR' ? 'Rs.' : '$'}
                  </span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full pl-8 pr-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-light)] rounded-xl text-sm font-medium text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2">Category</label>
                <select 
                  value={formData.categoryId || ''}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-light)] rounded-xl text-sm font-medium text-[var(--text-main)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--text-main)] transition-shadow cursor-pointer"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-[var(--border-light)] rounded-xl p-4 bg-[var(--bg-muted)]/30 flex flex-col gap-4">
              <h4 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-light)] pb-2 mb-2">Billing Cycle</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2 relative">
                  <label className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest pl-2">Interval</label>
                  <select 
                    value={formData.interval}
                    onChange={e => setFormData({...formData, interval: e.target.value as CreateSubscriptionPayload['interval']})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-main)] cursor-pointer"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest pl-2">Next Charge On</label>
                  <input 
                    type="date"
                    value={formData.nextChargeDate}
                    onChange={e => setFormData({...formData, nextChargeDate: e.target.value})}
                    className="w-full px-4 py-2 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-main)] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2 relative">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as CreateSubscriptionPayload['status']})}
                  className="w-full px-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-light)] rounded-xl text-sm font-medium text-[var(--text-main)] cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

               <div className="flex items-center mt-6">
                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors w-full border border-transparent hover:border-[var(--border-light)]">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.potentialSavings ? 'bg-[var(--income-green)] border-[var(--income-green)] text-white' : 'bg-[var(--bg-base)] border-[var(--border-light)]'}`}>
                    {formData.potentialSavings && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[var(--text-main)] tracking-wider">Flag for Savings</p>
                    <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest">Mark as &quot;rarely used&quot; manually</p>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.potentialSavings || false} onChange={e => setFormData({...formData, potentialSavings: e.target.checked})} />
                </label>
              </div>
            </div>

            {formData.categoryId ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)]/30 p-3 text-sm text-[var(--text-muted)]">
                {(() => {
                  const selected = categories.find(category => category.id === formData.categoryId)
                  return selected ? (
                    <>
                      <CategoryIcon className="h-8 w-8 rounded-[10px]" color={selected.color} icon={selected.icon} name={selected.name} />
                      <span>{selected.name}</span>
                    </>
                  ) : null
                })()}
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-[var(--expense-red)]/30 bg-[var(--expense-red)]/10 p-3 text-sm font-medium text-[var(--expense-red)]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

          </form>
        </div>

        <div className="p-6 border-t border-[var(--border-light)] bg-[var(--bg-base)] flex justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="px-6 py-2.5 h-auto rounded-xl text-[12px] font-bold uppercase tracking-widest border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-light)]">
            Cancel
          </Button>
          <Button type="submit" form="sub-form" disabled={isPending} className="px-6 py-2.5 h-auto rounded-xl text-[12px] font-bold uppercase tracking-widest bg-[var(--text-main)] text-[var(--bg-base)] hover:bg-[var(--text-main)]/90 shadow-sm transition-all border border-transparent shadow-black/20">
            {isPending ? 'Saving...' : initialData ? 'Update Details' : 'Save Subscription'}
          </Button>
        </div>
      </div>
    </div>
  )
}
