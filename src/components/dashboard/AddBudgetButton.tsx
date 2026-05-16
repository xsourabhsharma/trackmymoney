'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addBudget } from '@/app/dashboard/budgets/actions'
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

import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from '@/components/ui/toast-provider'

interface BudgetCategory {
  id: string
  name: string
  icon?: string | null
  type?: string | null
}

export function AddBudgetButton({ categories }: { categories: BudgetCategory[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [rollover, setRollover] = useState<boolean>(false)
  const router = useRouter()
  const { addToast } = useToast()

  const expenseCategories = categories.filter(c => c.type === 'expense')

  async function handleSubmit(formData: FormData) {
    if (!selectedCategory) {
      addToast('Please select a category', 'warning')
      return
    }
    
    formData.set('categoryId', selectedCategory)
    formData.set('rollover', rollover.toString())
    
    setIsLoading(true)
    
    try {
      await addBudget(formData)
      setOpen(false)
      setSelectedCategory('')
      router.refresh()
    } catch (error) {
      console.error(error)
      addToast('Failed to set budget', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="btn-primary gap-2 px-4 py-2 text-sm h-10">
            <Plus className="h-4 w-4" />
            Set Budget Limit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogDescription>
            Create a spending limit for a specific category.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 w-full rounded-md border bg-[var(--bg-surface)] text-[var(--text-main)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 border-[var(--border-light)]"
            >
              <option value="">Select category</option>
              {expenseCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Monthly Limit ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="1"
              min="1"
              placeholder="500"
              required
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="rollover" 
              checked={rollover}
              onCheckedChange={(checked) => setRollover(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="rollover"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable Rollover
              </label>
              <p className="text-xs text-muted-foreground text-gray-500">
                Carry over unused budget to the next month.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
              {isLoading ? "Saving..." : "Save Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
