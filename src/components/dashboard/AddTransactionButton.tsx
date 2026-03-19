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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addTransaction } from '@/app/dashboard/actions'

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
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>(defaultType)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string; category?: string; account?: string }>({})
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const merchantInputRef = useRef<HTMLInputElement>(null)
  
  const availableCategories = categories.filter(c => c.type === transactionType || c.type === 'expense' && transactionType === 'transfer')

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
    
    let newErrors: { amount?: string; merchant?: string; category?: string; account?: string } = {}
    
    if (!amount || amount <= 0) {
      newErrors.amount = "Required"
    }
    if (!merchant || !merchant.trim()) {
      newErrors.merchant = "Required"
    }
    if (!selectedCategory && transactionType !== 'transfer') {
      newErrors.category = "Required"
    }
    if (!selectedAccount) {
      newErrors.account = "Required"
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    
    formData.set('type', transactionType)
    formData.set('categoryId', selectedCategory)
    formData.set('accountId', selectedAccount)
    
    // tags is captured but in formData natively
    // description is captured in formData natively
    
    setIsLoading(true)
    try {
      await addTransaction(formData)
      setOpen(false)
      setSelectedCategory('')
      setSelectedAccount('')
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
            ? 'border-gray-900 bg-gray-50 font-medium text-gray-900 shadow-sm' 
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
          <Button className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 transition-colors h-10">
            <Plus className="h-4 w-4" />
            {buttonLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="p-6 pb-0 flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold p-0 m-0">Add Transaction</DialogTitle>
          <DialogClose className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors" />
        </div>
        
        <form action={handleSubmit} className="flex flex-col gap-5 p-6 pt-4 max-h-[80vh] overflow-y-auto w-full">
          
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <TypeButton type="income" label="Income" />
              <TypeButton type="expense" label="Expense" />
              <TypeButton type="transfer" label="Transfer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="h-10 rounded-lg border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              />
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="amount" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`h-10 rounded-lg border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 ${errors.amount ? 'border-red-500' : ''}`}
                onKeyDown={handleAmountKeyDown}
                required
              />
              {errors.amount && <span className="absolute -bottom-4 right-0 text-[10px] text-red-500">{errors.amount}</span>}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative z-20">
            <Label htmlFor="merchant" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Merchant / Description</Label>
            <Input
              id="merchant"
              name="merchant"
              ref={merchantInputRef}
              placeholder="Enter merchant name..."
              className={`h-10 rounded-lg border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 ${errors.merchant ? 'border-red-500' : ''}`}
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={() => {
                if (errors.merchant) setErrors(prev => ({ ...prev, merchant: undefined }))
              }}
              required
            />
            {showSuggestions && merchantSuggestions.length > 0 && (
              <div className="absolute top-[68px] z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {merchantSuggestions
                  .filter(m => m.toLowerCase().includes(merchantInputRef.current?.value.toLowerCase() || ''))
                  .map(m => (
                    <button
                      key={m}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Category</Label>
              <Select name="categoryId" value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val || ''); setErrors(prev => { const { category, ...rest } = prev; return rest }) }}>
                <SelectTrigger className={`h-10 rounded-lg border-gray-200 focus:ring-1 focus:ring-gray-300 ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        {c.icon && <span>{c.icon}</span>}
                        <span>{c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Account</Label>
              <Select name="accountId" value={selectedAccount} onValueChange={(val) => { setSelectedAccount(val || ''); setErrors(prev => { const { account, ...rest } = prev; return rest }) }}>
                <SelectTrigger className={`h-10 rounded-lg border-gray-200 focus:ring-1 focus:ring-gray-300 ${errors.account ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 z-10">
            <Label htmlFor="tags" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Tags (Comma Separated)</Label>
            <Input 
              id="tags" 
              name="source_metadata" 
              placeholder="e.g., business, recurring" 
              className="h-10 rounded-lg border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Notes</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Add any additional notes..." 
              className="min-h-[80px] rounded-lg border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-full px-6 border-gray-200 hover:bg-gray-50 h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="rounded-full bg-black hover:bg-gray-800 text-white px-6 h-10"
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
