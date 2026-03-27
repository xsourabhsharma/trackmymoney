'use client'

import { SummaryMetrics } from '@/app/dashboard/reports/data'
import { Wallet, TrendingUp, TrendingDown, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  summary: SummaryMetrics
}



function TrendBadge({ pct, inverse = false }: { pct: number; inverse?: boolean }) {
  const isPositive = inverse ? pct < 0 : pct > 0
  return (
    <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
      isPositive ? 'bg-green-50 text-[var(--income-green)] border-green-100' : 'bg-red-50 text-[var(--expense-red)] border-red-100'
    }`}>
      {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

export function ReportsSummaryCards({ summary }: Props) {
  const { fmt } = useCurrency()
  const INCOME_TARGET = 8000

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">

      {}
      <div className="group relative p-5 bg-[var(--bg-surface)] rounded-2xl border border-transparent hover:border-[var(--border-light)] hover:bg-white transition-all flex flex-col items-center text-center gap-2 hover-lift">
        <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-2xl font-bold tabular-nums tracking-tighter text-green-600 dark:text-green-400 animate-count-up">{fmt(summary.periodIncome)}</div>
        <div className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Period Income</div>
        <div className="text-[11px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-tighter">
          Target: {fmt(INCOME_TARGET)} · {((summary.periodIncome / INCOME_TARGET) * 100).toFixed(0)}%
        </div>
        <TrendBadge pct={summary.incomeChangeVsPrev} />
        {}
        <div className="w-full h-1 bg-[var(--bg-base)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--income-green)] rounded-full" style={{ width: `${Math.min(100, (summary.periodIncome / INCOME_TARGET) * 100)}%` }} />
        </div>
      </div>

      {}
      <div className="group relative p-5 bg-[var(--bg-surface)] rounded-2xl border border-transparent hover:border-[var(--border-light)] hover:bg-white transition-all flex flex-col items-center text-center gap-2 hover-lift">
        <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/10 flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-2xl font-bold tabular-nums tracking-tighter text-red-600 dark:text-red-400 animate-count-up">{fmt(summary.periodExpenses)}</div>
        <div className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Period Expenses</div>
        <div className="text-[11px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-tighter">Selected range flow</div>
        {}
        <TrendBadge pct={summary.expenseChangeVsPrev} inverse />
      </div>

      {}
      <div className="group relative p-5 bg-[var(--bg-surface)] rounded-2xl border border-transparent hover:border-[var(--border-light)] hover:bg-white transition-all flex flex-col items-center text-center gap-2 hover-lift">
        <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/10 flex items-center justify-center">
          <Percent className="w-4 h-4 text-blue-600 dark:text-sky-400" />
        </div>
        <div className="text-2xl font-bold tabular-nums tracking-tighter text-blue-600 dark:text-sky-400">{summary.savingsRate.toFixed(1)}%</div>
        <div className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">Savings Rate</div>
        <div className="text-[11px] font-bold text-[var(--text-main)] opacity-80 uppercase tracking-tighter">(Income − Expenses) / Income</div>
        <div className="w-full h-1 bg-[var(--bg-base)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${summary.savingsRate >= 20 ? 'bg-[var(--income-green)]' : summary.savingsRate >= 10 ? 'bg-blue-600 dark:bg-sky-400' : 'bg-orange-400'}`}
            style={{ width: `${Math.min(100, summary.savingsRate)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
