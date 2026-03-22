'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"
import { editBudget } from '@/app/dashboard/budgets/actions'

export function EditBudgetButton({ budget, categories }: { budget: any, categories: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rollover, setRollover] = useState(budget.rollover || false)

  async function handleSubmit(formData: FormData) {
    formData.set('id', budget.id)
    formData.set('rollover', rollover.toString())
    
    setIsLoading(true)
    try {
      await editBudget(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <PenLine className="h-4 w-4" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Adjust your spending limit for this category.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Monthly Limit ($)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" defaultValue={budget.amount} required />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-[#141414]/10">
            <div className="space-y-0.5">
              <Label htmlFor="rollover">Rollover Surplus</Label>
              <p className="text-[12px] text-gray-500 font-bold uppercase">Carry over unspent funds to next month</p>
            </div>
            <Switch id="rollover" checked={rollover} onCheckedChange={setRollover} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update Budget"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
