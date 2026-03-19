'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteSavingsGoal } from '@/app/dashboard/goals/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteGoalButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteSavingsGoal(id)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete goal')
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50" title="Delete Goal">
        <Trash2 className="w-4 h-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Savings Goal?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your savings goal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete it"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
