import { TransactionsMetrics } from '@/app/dashboard/transactions/data'

export function TransactionsSummaryMetrics({ metrics }: { metrics: TransactionsMetrics }) {
  const formatMoney = (val: number) => `$ ${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm">
        <div className="text-xl lg:text-3xl font-black tabular-nums mb-2 text-[var(--income-green)]">
          {formatMoney(metrics.inflow)}
        </div>
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Current Period Inflow</div>
      </div>
      
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm">
        <div className="text-xl lg:text-3xl font-black tabular-nums mb-2 text-[var(--expense-red)]">
          {formatMoney(metrics.outflow)}
        </div>
        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Current Period Outflow</div>
      </div>

      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
        {/* Subtle background glow for Net Position */}
        <div className={`absolute inset-0 opacity-5 pointer-events-none ${metrics.netPosition >= 0 ? 'bg-[var(--income-green)]' : 'bg-[var(--expense-red)]'}`} />
        
        <div className={`relative z-10 text-xl lg:text-3xl font-black tabular-nums mb-2 ${metrics.netPosition >= 0 ? 'text-[var(--text-main)]' : 'text-[var(--expense-red)]'}`}>
          {metrics.netPosition < 0 ? '-' : ''}{formatMoney(metrics.netPosition)}
        </div>
        <div className="relative z-10 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Net Position</div>
      </div>
    </div>
  )
}
