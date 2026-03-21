'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addDebt } from '@/app/dashboard/goals/actions'
import { useToast } from '@/components/ui/toast-provider'
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

export function AddDebtButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await addDebt(formData)
      setOpen(false)
      addToast('Debt record added successfully!', 'success')
      router.refresh()
    } catch (error) {
      console.error(error)
      addToast('Failed to add debt', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 transition-colors">
        <Plus className="h-4 w-4" />
        Add Debt Record
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Debt Record</DialogTitle>
          <DialogDescription>
            Track loans, credit cards, and map your payoff journey.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" placeholder="e.g. Student Loan, Visa Card" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total Original Debt ($)</Label>
              <Input id="totalAmount" name="totalAmount" type="number" step="1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remainingAmount">Remaining Balance ($)</Label>
              <Input id="remainingAmount" name="remainingAmount" type="number" step="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="interestRate">Interest Rate (APR %)</Label>
              <Input id="interestRate" name="interestRate" type="number" step="0.1" defaultValue="0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimumPayment">Min. Monthly Payment ($)</Label>
              <Input id="minimumPayment" name="minimumPayment" type="number" step="1" defaultValue="0" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Saving..." : "Save Debt Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
