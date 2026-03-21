'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addSavingsGoal } from '@/app/dashboard/goals/actions'
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

export function AddGoalButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await addSavingsGoal(formData)
      setOpen(false)
      addToast('Goal created successfully!', 'success')
      router.refresh()
    } catch (error) {
      console.error(error)
      addToast('Failed to add goal', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors">
        <Plus className="h-4 w-4" />
        New Savings Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
          <DialogDescription>
            Set a target for your emergency fund, vacation, or big purchase.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" name="name" placeholder="e.g. Emergency Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target Amount ($)</Label>
              <Input id="targetAmount" name="targetAmount" type="number" step="1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currentAmount">Already Saved ($)</Label>
              <Input id="currentAmount" name="currentAmount" type="number" step="1" defaultValue="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input id="deadline" name="deadline" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Emoji Icon</Label>
              <Input id="icon" name="icon" placeholder="🏖️" defaultValue="🎯" maxLength={2} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? "Saving..." : "Save Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
