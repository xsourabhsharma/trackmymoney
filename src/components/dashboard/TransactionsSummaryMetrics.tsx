'use client'

import { TransactionsMetrics } from '@/app/dashboard/transactions/data'
import { useCurrency } from '@/hooks/useCurrency'
import { ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react'

export function TransactionsSummaryMetrics({ metrics }: { metrics: TransactionsMetrics }) {
  const { fmt } = useCurrency()
  const savingsRate = metrics.inflow > 0 ? ((metrics.netPosition / metrics.inflow) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-stagger">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 shadow-sm hover-lift hover-glow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--income-green)]/10 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-[var(--income-green)]" />
          </div>
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Income</span>
        </div>
        <div className="text-xl lg:text-2xl font-black tabular-nums text-[var(--income-green)] animate-count-up">
          {fmt(metrics.inflow)}
        </div>
      </div>
      
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 shadow-sm hover-lift hover-glow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--expense-red)]/10 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4 text-[var(--expense-red)]" />
          </div>
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Expenses</span>
        </div>
        <div className="text-xl lg:text-2xl font-black tabular-nums text-[var(--expense-red)] animate-count-up">
          {fmt(metrics.outflow)}
        </div>
      </div>

      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl p-6 shadow-sm relative overflow-hidden hover-lift hover-glow">
        <div className={`absolute inset-0 opacity-5 pointer-events-none ${metrics.netPosition >= 0 ? 'bg-[var(--income-green)]' : 'bg-[var(--expense-red)]'}`} />
        <div className="relative z-10 flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${metrics.netPosition >= 0 ? 'bg-[var(--income-green)]/10' : 'bg-[var(--expense-red)]/10'}`}>
            <Scale className={`w-4 h-4 ${metrics.netPosition >= 0 ? 'text-[var(--income-green)]' : 'text-[var(--expense-red)]'}`} />
          </div>
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Net Position</span>
        </div>
        <div className={`relative z-10 text-xl lg:text-2xl font-black tabular-nums animate-count-up ${metrics.netPosition >= 0 ? 'text-[var(--text-main)]' : 'text-[var(--expense-red)]'}`}>
          {metrics.netPosition < 0 ? '-' : '+'}{fmt(Math.abs(metrics.netPosition))}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 shadow-sm hover-lift hover-glow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Savings Rate</span>
        </div>
        <div className={`text-xl lg:text-2xl font-black tabular-nums animate-count-up ${savingsRate >= 20 ? 'text-[var(--income-green)]' : savingsRate > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'}`}>
          {savingsRate.toFixed(1)}%
        </div>
        <div className="mt-2 h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-light)]">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${savingsRate >= 20 ? 'bg-[var(--income-green)]' : savingsRate > 0 ? 'bg-[var(--warning)]' : 'bg-[var(--text-muted)]'}`}
            style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
