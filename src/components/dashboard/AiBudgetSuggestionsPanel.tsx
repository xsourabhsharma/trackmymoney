'use client'

import { useState, useTransition } from 'react'
import { AiBudgetSuggestion } from '@/app/dashboard/budgets/data'
import { applyBudgetSuggestion, dismissBudgetSuggestion } from '@/app/dashboard/budgets/actions'
import { Sparkles, Check, X, ArrowRight } from 'lucide-react'

interface Props {
  suggestions: AiBudgetSuggestion[]
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function AiBudgetSuggestionsPanel({ suggestions }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id) && !applied.has(s.id))

  function handleApply(id: string) {
    setApplied(prev => new Set(prev).add(id))
    startTransition(() => applyBudgetSuggestion(id))
  }

  function handleDismiss(id: string) {
    setDismissed(prev => new Set(prev).add(id))
    startTransition(() => dismissBudgetSuggestion(id))
  }

  if (suggestions.length === 0) {
    return (
      <div className="py-8 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            No suggestions yet
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-70">
            AI suggestions appear based on your spending patterns
          </p>
        </div>
      </div>
    )
  }

  if (visibleSuggestions.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[11px] font-bold text-[var(--income-green)] uppercase tracking-widest">
          ✓ All suggestions addressed
        </p>
      </div>
    )
  }

  const accentColors = [
    'border-l-[var(--accent)]',
    'border-l-[var(--income-green)]',
    'border-l-purple-400',
    'border-l-orange-400',
    'border-l-pink-400',
  ]

  return (
    <div className="flex flex-col gap-4">
      {visibleSuggestions.map((sug, i) => (
        <div
          key={sug.id}
          className={`p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] border-l-[3px] ${accentColors[i % accentColors.length]} flex flex-col gap-3 hover:shadow-md transition-all`}
        >
          <div className="flex items-start justify-between gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight leading-relaxed">
              {sug.message}
            </p>
          </div>

          {/* Amount change display */}
          {sug.fromAmount !== null && sug.toAmount !== null && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
              <span className="line-through opacity-60">${fmt(sug.fromAmount)}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="text-[var(--income-green)]">${fmt(sug.toAmount)}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleApply(sug.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
            <button
              onClick={() => handleDismiss(sug.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[var(--border-light)] text-[var(--text-muted)] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:text-[var(--text-main)] transition-all disabled:opacity-50"
            >
              <X className="w-3 h-3" />
              Dismiss
            </button>
          </div>
        </div>
      ))}
      <p className="text-[9px] text-[var(--text-muted)] text-center">
        Applying a suggestion will update your budget limit for that category.
      </p>
    </div>
  )
}
