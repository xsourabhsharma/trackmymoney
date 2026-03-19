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
import { updateSavingsGoal } from '@/app/dashboard/goals/actions'

export function EditGoalButton({ goal }: { goal: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    formData.set('id', goal.id)
    setIsLoading(true)
    try {
      await updateSavingsGoal(formData)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''

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
          <DialogTitle>Edit Savings Goal</DialogTitle>
          <DialogDescription>Update your target or current progress.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" name="name" defaultValue={goal.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target ($)</Label>
              <Input id="targetAmount" name="targetAmount" type="number" step="0.01" defaultValue={goal.target_amount} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentAmount">Saved ($)</Label>
              <Input id="currentAmount" name="currentAmount" type="number" step="0.01" defaultValue={goal.current_amount} required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Target Date (Optional)</Label>
            <Input id="deadline" name="deadline" type="date" defaultValue={formattedDate} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update Goal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
