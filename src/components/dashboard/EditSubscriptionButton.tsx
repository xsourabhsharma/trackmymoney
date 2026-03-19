'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, Calendar, Wallet } from 'lucide-react'
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
import { updateSubscription } from '@/app/dashboard/subscriptions/actions'

export function EditSubscriptionButton({ subscription, categories }: { subscription: any, categories: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(subscription.category_id || subscription.categories?.id || '')

  async function handleSubmit(formData: FormData) {
    const id = subscription.id
    const payload = {
      merchant: formData.get('merchant') as string,
      amount: parseFloat(formData.get('amount') as string),
      interval: formData.get('frequency') as 'weekly' | 'monthly' | 'yearly',
      categoryId: selectedCategory,
      nextChargeDate: formData.get('next_due_date') as string
    }
    
    setIsLoading(true)
    try {
      await updateSubscription(id, payload)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const dateObj = subscription.next_due_date ? new Date(subscription.next_due_date) : new Date()
  const formattedDate = dateObj.toISOString().split('T')[0]

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
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>Update details for your recurring service.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="merchant">Service / Merchant</Label>
            <Input id="merchant" name="merchant" defaultValue={subscription.merchant} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" defaultValue={subscription.amount} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" defaultValue={subscription.frequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val ?? '')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="next_due_date">Next Due Date</Label>
            <Input id="next_due_date" name="next_due_date" type="date" defaultValue={formattedDate} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update Subscription"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
