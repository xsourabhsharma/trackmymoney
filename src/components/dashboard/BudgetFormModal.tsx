'use client'

import { useState, useTransition } from 'react'
import { X, Plus, Edit3, Loader2 } from 'lucide-react'
import { createBudget, updateBudget } from '@/app/dashboard/budgets/actions'
import { CategoryBudgetItem } from '@/app/dashboard/budgets/data'

interface Category {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  type: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  editBudget?: CategoryBudgetItem | null
  categories: Category[]
}

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export function BudgetFormModal({ isOpen, onClose, editBudget, categories }: Props) {
  const expenseCategories = categories
    .filter(c => c.type === 'expense')
    .filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
  const isEdit = !!editBudget

  const [form, setForm] = useState({
    categoryId: editBudget?.categoryId || '',
    limitAmount: editBudget ? editBudget.budgetAmount.toString() : '',
    periodType: (editBudget?.period || 'monthly') as 'monthly' | 'quarterly' | 'yearly' | 'custom',
    rollover: editBudget?.rollover || false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(field: keyof typeof form, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.categoryId && !isEdit) {
      setError('Please select a category.')
      return
    }
    if (!form.limitAmount || parseFloat(form.limitAmount) <= 0) {
      setError('Please enter a valid budget amount.')
      return
    }

    startTransition(async () => {
      try {
        if (isEdit && editBudget) {
          await updateBudget(editBudget.budgetId, {
            categoryId: form.categoryId || undefined,
            limitAmount: parseFloat(form.limitAmount),
            periodType: form.periodType,
            rollover: form.rollover,
          })
        } else {
          await createBudget({
            categoryId: form.categoryId,
            limitAmount: parseFloat(form.limitAmount),
            periodType: form.periodType,
            rollover: form.rollover,
          })
        }
        onClose()
      } catch (err: any) {
        setError(err.message || 'Something went wrong.')
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              {isEdit ? <Edit3 className="w-4 h-4 text-[var(--accent)]" /> : <Plus className="w-4 h-4 text-[var(--accent)]" />}
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tighter">
                {isEdit ? 'Edit Budget' : 'Set Budget Limit'}
              </h2>
              <p className="text-[12px] text-[var(--text-muted)]">
                {isEdit ? `Editing ${editBudget?.categoryName}` : 'Create a monthly spending cap for a category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center hover:border-[var(--border-dark)] transition-all"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Category Select */}
          {!isEdit && (
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={e => handleChange('categoryId', e.target.value)}
                required
                className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[13px] font-medium text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all cursor-pointer"
              >
                <option value="">Select a category...</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-lg">$</span>
              <input
                type="number"
                value={form.limitAmount}
                onChange={e => handleChange('limitAmount', e.target.value)}
                placeholder="500"
                min="1"
                step="1"
                required
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[15px] font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--border-dark)] transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Period */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERIOD_OPTIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleChange('periodType', p.value)}
                  className={`py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all border ${
                    form.periodType === p.value
                      ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-sm'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--border-dark)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rollover */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
            <button
              type="button"
              onClick={() => handleChange('rollover', !form.rollover)}
              className={`w-10 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
                form.rollover ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.rollover ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight">Enable Rollover</p>
              <p className="text-[11px] text-[var(--text-muted)]">Carry unused budget to the next period</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[11px] font-bold text-[var(--expense-red)] bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              ⚠️ {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[var(--text-muted)] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:border-[var(--border-dark)] hover:text-[var(--text-main)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : (
                isEdit ? 'Update Budget' : 'Create Budget'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
