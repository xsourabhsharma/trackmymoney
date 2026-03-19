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
import { updateDebt } from '@/app/dashboard/goals/actions'

export function EditDebtButton({ debt }: { debt: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    formData.set('id', debt.id)
    setIsLoading(true)
    try {
      await updateDebt(formData)
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
          <DialogTitle>Edit Debt Record</DialogTitle>
          <DialogDescription>Update your debt repayment progress.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Lender / Debt Name</Label>
            <Input id="name" name="name" defaultValue={debt.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total Initial ($)</Label>
              <Input id="totalAmount" name="totalAmount" type="number" step="0.01" defaultValue={debt.total_amount} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remainingAmount">Remaining ($)</Label>
              <Input id="remainingAmount" name="remainingAmount" type="number" step="0.01" defaultValue={debt.remaining_amount} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="interestRate">APR (%)</Label>
              <Input id="interestRate" name="interestRate" type="number" step="0.01" defaultValue={debt.interest_rate} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimumPayment">Min Payment ($)</Label>
              <Input id="minimumPayment" name="minimumPayment" type="number" step="0.01" defaultValue={debt.minimum_payment} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update Debt"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
