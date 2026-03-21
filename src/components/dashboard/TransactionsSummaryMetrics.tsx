'use client'

import { TransactionsMetrics } from '@/app/dashboard/transactions/data'
import { useCurrency } from '@/hooks/useCurrency'

export function TransactionsSummaryMetrics({ metrics }: { metrics: TransactionsMetrics }) {
  const { fmt } = useCurrency()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm hover-lift hover-glow">
        <div className="text-xl lg:text-3xl font-black tabular-nums mb-2 text-[var(--income-green)] animate-count-up">
          {fmt(metrics.inflow)}
        </div>
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Current Period Inflow</div>
      </div>
      
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm hover-lift hover-glow">
        <div className="text-xl lg:text-3xl font-black tabular-nums mb-2 text-[var(--expense-red)] animate-count-up">
          {fmt(metrics.outflow)}
        </div>
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Current Period Outflow</div>
      </div>

      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm relative overflow-hidden hover-lift hover-glow">
        {/* Subtle background glow for Net Position */}
        <div className={`absolute inset-0 opacity-5 pointer-events-none ${metrics.netPosition >= 0 ? 'bg-[var(--income-green)]' : 'bg-[var(--expense-red)]'}`} />
        
        <div className={`relative z-10 text-xl lg:text-3xl font-black tabular-nums mb-2 animate-count-up ${metrics.netPosition >= 0 ? 'text-[var(--text-main)]' : 'text-[var(--expense-red)]'}`}>
          {metrics.netPosition < 0 ? '-' : ''}{fmt(Math.abs(metrics.netPosition))}
        </div>
        <div className="relative z-10 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Net Position</div>
      </div>
    </div>
  )
}
