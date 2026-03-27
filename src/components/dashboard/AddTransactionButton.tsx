'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addTransaction } from '@/app/dashboard/actions'
import { useCurrencyStore } from '@/store/useCurrencyStore'

export function AddTransactionButton({ 
  categories, 
  accounts = [], 
  defaultType = 'expense', 
  buttonLabel = 'New Transaction' 
}: { 
  categories: any[], 
  accounts?: any[], 
  defaultType?: 'expense' | 'income' | 'transfer', 
  buttonLabel?: string 
}) {
  const router = useRouter()
  const currentCurrency = useCurrencyStore((state) => state.currency)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>(defaultType)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string; category?: string; account?: string }>({})
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const merchantInputRef = useRef<HTMLInputElement>(null)
  
  const availableCategories = categories
    .filter(c => c.type === transactionType || c.type === 'expense' && transactionType === 'transfer')
    .filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);

  useEffect(() => {
    if (open) {
      const fetchMerchants = async () => {
        try {
          const res = await fetch('/api/merchants')
          if (res.ok) {
            const data = await res.json()
            if (data.merchants) setMerchantSuggestions(data.merchants)
          }
        } catch (e) {
          console.error("Failed to fetch merchants")
        }
      }
      fetchMerchants()
    }
  }, [open])

  const handleTypeChange = (val: 'expense' | 'income' | 'transfer') => {
    setTransactionType(val)
    setSelectedCategory('')
    setErrors(prev => { const { category, ...rest } = prev; return rest })
  }

  async function handleSubmit(formData: FormData) {
    const amount = Number(formData.get('amount'))
    const merchant = formData.get('merchant') as string
    
    const newErrors: { amount?: string; merchant?: string; category?: string; account?: string } = {}
    
    if (!amount || amount <= 0) {
      newErrors.amount = "Required"
    }
    if (!merchant || !merchant.trim()) {
      newErrors.merchant = "Required"
    }
    if (!selectedCategory && transactionType !== 'transfer') {
      newErrors.category = "Required"
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    
    formData.set('type', transactionType)
    formData.set('categoryId', selectedCategory)
    formData.set('accountId', selectedAccount)
    formData.set('currency', currentCurrency)
    
   
   
    
    setIsLoading(true)
    try {
      await addTransaction(formData)
      setOpen(false)
      setSelectedCategory('')
      if (merchantInputRef.current) merchantInputRef.current.value = ''
      setErrors({})
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const TypeButton = ({ type, label }: { type: 'income' | 'expense' | 'transfer', label: string }) => {
    const isActive = transactionType === type
    return (
      <button 
        type="button" 
        onClick={() => handleTypeChange(type)} 
        className={`py-2 px-3 text-sm rounded-lg border transition-all ${
          isActive 
            ? 'border-[var(--text-main)] bg-[var(--bg-surface)] font-medium text-[var(--text-main)] shadow-sm' 
            : 'border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button suppressHydrationWarning className="bg-[var(--text-main)] text-[var(--bg-base)] gap-2 h-10 px-5 text-sm font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-all border border-[var(--border-light)] shadow-lg">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border border-[var(--border-light)] shadow-2xl rounded-2xl bg-[var(--bg-base)]">
        <div className="p-6 pb-0 flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold p-0 m-0">Add Transaction</DialogTitle>
          <DialogClose className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors" />
        </div>
        
        <form action={handleSubmit} className="flex flex-col gap-5 p-6 pt-4 max-h-[80vh] overflow-y-auto w-full">
          
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <TypeButton type="income" label="Income" />
              <TypeButton type="expense" label="Expense" />
              <TypeButton type="transfer" label="Transfer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="h-10 rounded-lg border-[var(--border-light)] focus:border-[var(--border-dark)] focus:ring-1 focus:ring-[var(--border-dark)]"
              />
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="amount" className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`h-10 rounded-lg border-[var(--border-light)] focus:border-[var(--border-dark)] focus:ring-1 focus:ring-[var(--border-dark)] ${errors.amount ? 'border-red-500' : ''}`}
                onKeyDown={handleAmountKeyDown}
                required
              />
              {errors.amount && <span className="absolute -bottom-4 right-0 text-[12px] text-red-500">{errors.amount}</span>}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative z-20">
            <Label htmlFor="merchant" className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Merchant / Description</Label>
            <Input
              id="merchant"
              name="merchant"
              ref={merchantInputRef}
              placeholder="Enter merchant name..."
              className={`h-10 rounded-lg border-[var(--border-light)] focus:border-[var(--border-dark)] focus:ring-1 focus:ring-[var(--border-dark)] ${errors.merchant ? 'border-red-500' : ''}`}
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={() => {
                if (errors.merchant) setErrors(prev => ({ ...prev, merchant: undefined }))
              }}
              required
            />
            {showSuggestions && merchantSuggestions.length > 0 && (
              <div className="absolute top-[68px] z-50 w-full bg-[var(--bg-base)] border border-[var(--border-light)] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {merchantSuggestions
                  .filter(m => m.toLowerCase().includes(merchantInputRef.current?.value.toLowerCase() || ''))
                  .map(m => (
                    <button
                      key={m}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
                      onClick={() => {
                        if (merchantInputRef.current) merchantInputRef.current.value = m
                        setShowSuggestions(false)
                      }}
                    >
                      {m}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Category</Label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setErrors(prev => { const { category, ...rest } = prev; return rest }) }}
                className={`h-10 w-full rounded-lg border bg-[var(--bg-surface)] text-[var(--text-main)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 border-[var(--border-light)] ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select category</option>
                {availableCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 z-10">
            <Label htmlFor="tags" className="text-xs font-bold text-[var(--text-main)] opacity-70 tracking-wider uppercase">Tags (Comma Separated)</Label>
            <Input 
              id="tags" 
              name="source_metadata" 
              placeholder="e.g., business, recurring" 
              className="h-10 rounded-lg border-[var(--border-light)] focus:border-[var(--border-dark)] focus:ring-1 focus:ring-[var(--border-dark)]" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Notes</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Add any additional notes..." 
              className="min-h-[80px] rounded-lg border-[var(--border-light)] focus:border-[var(--border-dark)] focus:ring-1 focus:ring-[var(--border-dark)] resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-full px-6 border-[var(--border-light)] hover:bg-[var(--bg-surface)] h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="rounded-full bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-base)] px-6 h-10"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
