'use client'

import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  totalInflow: number
  totalOutflow: number
  netPosition: number
  savingsRate: number | null
}

export function IntelligenceHubSummary({ totalInflow, totalOutflow, netPosition, savingsRate }: Props) {
  const { fmt } = useCurrency()

  return (
    <div className="text-[11px] font-bold uppercase tracking-widest bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)] mb-6 text-[var(--text-main)]">
      MONTH SUMMARY: YOU EARNED {fmt(totalInflow)} AND SPENT {fmt(totalOutflow)}. NET SAVED: {fmt(netPosition)} ({savingsRate !== null ? savingsRate.toFixed(1) : '0'}% EFFICIENCY).
    </div>
  )
}
