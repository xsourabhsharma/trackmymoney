'use client'

import { useState, useTransition } from 'react'
import { X, Target, Loader2, CreditCard } from 'lucide-react'
import { addSavingsGoal, updateSavingsGoal, addDebt, updateDebt } from '@/app/dashboard/goals/actions'
import type { SavingsGoalRow, DebtRow } from '@/app/dashboard/goals/data'


interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  editGoal?: SavingsGoalRow | null
}

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '🏖️', '💰', '📱', '🛡️']

export function GoalFormModal({ isOpen, onClose, editGoal }: GoalModalProps) {
  const isEdit = !!editGoal
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedIcon, setSelectedIcon] = useState(editGoal?.icon || '🎯')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    data.set('icon', selectedIcon)
    if (isEdit && editGoal) data.set('id', editGoal.id)
    setError(null)

    startTransition(async () => {
      try {
        if (isEdit) await updateSavingsGoal(data)
        else await addSavingsGoal(data)
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Target className="w-4 h-4 text-[var(--income-green)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tighter">
                {isEdit ? 'Edit Goal' : 'New Savings Goal'}
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">
                {isEdit ? `Editing: ${editGoal?.name}` : 'Define a target and start tracking progress'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center hover:border-[var(--border-dark)] transition-all">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(icon => (
                <button type="button" key={icon} onClick={() => setSelectedIcon(icon)}
                  className={`w-9 h-9 rounded-xl text-lg transition-all border ${selectedIcon === icon ? 'bg-[var(--text-main)] shadow-md border-[var(--text-main)] scale-110' : 'bg-[var(--bg-surface)] border-[var(--border-light)] hover:border-[var(--border-dark)]'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Goal Name</label>
            <input name="name" required defaultValue={editGoal?.name || ''} placeholder="e.g. Emergency Fund"
              className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
          </div>

          {}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Target ($)</label>
              <input name="targetAmount" type="number" min="1" step="1" required defaultValue={editGoal?.targetAmount || ''}
                placeholder="5000"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all tabular-nums" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Saved So Far ($)</label>
              <input name="currentAmount" type="number" min="0" step="1" defaultValue={editGoal?.currentAmount || 0}
                placeholder="0"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all tabular-nums" />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Target Date (optional)</label>
            <input name="deadline" type="date" defaultValue={editGoal?.targetDate ? editGoal.targetDate.slice(0, 10) : ''}
              className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
          </div>

          {error && <p className="text-[11px] font-bold text-[var(--expense-red)] bg-red-50 border border-red-100 rounded-lg px-4 py-3">⚠️ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-muted)] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:border-[var(--border-dark)] transition-all">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : isEdit ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


interface DebtModalProps {
  isOpen: boolean
  onClose: () => void
  editDebt?: DebtRow | null
}

export function DebtFormModal({ isOpen, onClose, editDebt }: DebtModalProps) {
  const isEdit = !!editDebt
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (isEdit && editDebt) data.set('id', editDebt.id)
    setError(null)

    startTransition(async () => {
      try {
        if (isEdit) await updateDebt(data)
        else await addDebt(data)
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[var(--expense-red)]" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tighter">
                {isEdit ? 'Edit Debt' : 'Add Debt Record'}
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">Track balances, rates, and payments for payoff planning</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center hover:border-[var(--border-dark)] transition-all">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Debt Name</label>
              <input name="name" required defaultValue={editDebt?.name || ''} placeholder="e.g. Credit Card – Chase"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Creditor (optional)</label>
              <input name="creditor" defaultValue={editDebt?.creditor || ''} placeholder="e.g. Chase Bank"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Amount ($)</label>
              <input name="totalAmount" type="number" min="1" step="0.01" required defaultValue={editDebt?.originalPrincipal || ''}
                placeholder="10000"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold tabular-nums text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Remaining ($)</label>
              <input name="remainingAmount" type="number" min="0" step="0.01" required defaultValue={editDebt?.currentBalance || ''}
                placeholder="8500"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold tabular-nums text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Interest Rate (%)</label>
              <input name="interestRate" type="number" min="0" step="0.01" defaultValue={editDebt?.interestRate || 0}
                placeholder="19.99"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold tabular-nums text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Min. Payment/mo ($)</label>
              <input name="minimumPayment" type="number" min="0" step="0.01" defaultValue={editDebt?.minimumPayment || 0}
                placeholder="250"
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-bold tabular-nums text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all" />
            </div>
          </div>

          {error && <p className="text-[11px] font-bold text-[var(--expense-red)] bg-red-50 border border-red-100 rounded-lg px-4 py-3">⚠️ {error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-muted)] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:border-[var(--border-dark)] transition-all">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : isEdit ? 'Update Debt' : 'Add Debt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
