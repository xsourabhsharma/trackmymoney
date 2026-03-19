'use client'

import { useState, useTransition } from 'react'
import { AiGoalDebtSuggestion } from '@/app/dashboard/goals/data'
import { applyGoalDebtSuggestion, dismissGoalDebtSuggestion } from '@/app/dashboard/goals/actions'
import { Sparkles, Check, X, ArrowRight } from 'lucide-react'

interface Props {
  suggestions: AiGoalDebtSuggestion[]
}

export function AiGoalDebtTipsPanel({ suggestions }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visible = suggestions.filter(s => !dismissed.has(s.id) && !applied.has(s.id))

  function handleApply(id: string) {
    setApplied(prev => new Set(prev).add(id))
    startTransition(() => applyGoalDebtSuggestion(id))
  }

  function handleDismiss(id: string) {
    setDismissed(prev => new Set(prev).add(id))
    startTransition(() => dismissGoalDebtSuggestion(id))
  }

  if (suggestions.length === 0) {
    return (
      <div className="py-6 text-center flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[var(--text-muted)]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No tips yet</p>
          <p className="text-[9px] text-[var(--text-muted)] mt-1 opacity-70">AI tips appear based on your goals and spending patterns</p>
        </div>
      </div>
    )
  }

  if (visible.length === 0) {
    return <p className="text-[10px] font-bold text-[var(--income-green)] text-center uppercase tracking-widest py-4">✓ All tips addressed</p>
  }

  const ACCENT_COLORS = ['border-l-[var(--accent)]', 'border-l-[var(--income-green)]', 'border-l-purple-400', 'border-l-orange-400']

  return (
    <div className="flex flex-col gap-4">
      {visible.map((tip, i) => (
        <div
          key={tip.id}
          className={`p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] border-l-[3px] ${ACCENT_COLORS[i % ACCENT_COLORS.length]} flex flex-col gap-3 hover:shadow-md transition-all`}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-3 h-3 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight leading-relaxed">
              {tip.message}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleApply(tip.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Check className="w-3 h-3" /> Apply Plan
            </button>
            <button
              onClick={() => handleDismiss(tip.id)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-light)] text-[var(--text-muted)] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:text-[var(--text-main)] transition-all disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
