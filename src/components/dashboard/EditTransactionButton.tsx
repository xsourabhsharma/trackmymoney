'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, Wallet, CalendarIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTransaction } from '@/app/dashboard/actions'

export function EditTransactionButton({ transaction, categories, accounts = [] }: { transaction: any, categories: any[], accounts?: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>(transaction.type)
  const [selectedCategory, setSelectedCategory] = useState<string>(transaction.category_id || transaction.categories?.id || transaction.categoryId || '')
  const [selectedAccount, setSelectedAccount] = useState<string>(transaction.account_id || transaction.accountId || '')
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string; category?: string }>({})
  
  const availableCategories = categories.filter(c => c.type === transactionType)

  const handleTypeChange = (val: 'expense' | 'income') => {
    setTransactionType(val)
    setSelectedCategory('')
    setErrors(prev => ({ ...prev, category: undefined }))
  }

  async function handleSubmit(formData: FormData) {
    const amount = Number(formData.get('amount'))
    const merchant = formData.get('merchant') as string
    
    let newErrors: { amount?: string; merchant?: string; category?: string } = {}

    if (!amount || amount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0"
    }
    if (!merchant || !merchant.trim()) {
      newErrors.merchant = "Please enter a merchant name"
    }
    if (!selectedCategory) {
      newErrors.category = "Please select a category"
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    
    formData.set('id', transaction.id)
    formData.set('categoryId', selectedCategory)
    formData.set('accountId', selectedAccount)
    
    setIsLoading(true)
    try {
      await updateTransaction(formData)
      setOpen(false)
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

  // Format date for input default value
  const dateObj = new Date(transaction.date)
  const formattedDate = dateObj.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit Transaction">
            <PenLine className="h-4 w-4" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of your transaction.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-gray-600">Type</Label>
              <Select 
                name="type" 
                value={transactionType} 
                onValueChange={(val: any) => handleTypeChange(val as 'expense' | 'income')}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-gray-600">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={transaction.amount}
                  className={`pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                  onKeyDown={handleAmountKeyDown}
                  required
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="merchant" className="text-gray-600">Merchant / Source</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="merchant"
                name="merchant"
                defaultValue={transaction.merchant}
                className={`pl-9 ${errors.merchant ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {errors.merchant && <p className="text-xs text-red-500 mt-1">{errors.merchant}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-gray-600">Category</Label>
              <Select name="categoryId" value={selectedCategory} onValueChange={(val: any) => setSelectedCategory(val || '')} required>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category">
                    {selectedCategory 
                      ? availableCategories.find(c => c.id === selectedCategory)?.name 
                      : "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-gray-500">No categories found</div>
                  ) : (
                    availableCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span>{c.icon}</span>
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-gray-600">Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={formattedDate}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="account" className="text-gray-600">Account</Label>
              <Select name="accountId" value={selectedAccount} onValueChange={(val: any) => setSelectedAccount(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account">
                    {selectedAccount 
                      ? accounts.find(a => a.id === selectedAccount)?.name 
                      : "Select account"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-gray-500">No accounts found</div>
                  ) : (
                    accounts.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-gray-600">Notes (Optional)</Label>
            <div className="relative">
              <PenLine className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="description"
                name="description"
                defaultValue={transaction.description || ''}
                placeholder="Any extra details..."
                className="pl-9"
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
              {isLoading ? "Saving..." : "Update Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
