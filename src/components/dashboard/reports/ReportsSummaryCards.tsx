'use client'

import type { SummaryMetrics } from '@/app/dashboard/reports/data'
import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Percent, TrendingDown, TrendingUp } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  summary: SummaryMetrics
}

function TrendBadge({ inverse = false, pct }: { inverse?: boolean; pct: number }) {
  const isPositive = inverse ? pct < 0 : pct > 0
  const neutral = pct === 0

  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${
      neutral
        ? 'border-[var(--border-light)] text-[var(--text-muted)]'
        : isPositive
          ? 'border-green-200 bg-green-50 text-[var(--income-green)] dark:border-green-900/40 dark:bg-green-950/20'
          : 'border-red-200 bg-red-50 text-[var(--expense-red)] dark:border-red-900/40 dark:bg-red-950/20'
    }`}>
      {!neutral && (isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
      {neutral ? 'No change' : `${Math.abs(pct).toFixed(1)}%`}
    </span>
  )
}

export function ReportsSummaryCards({ summary }: Props) {
  const { fmt } = useCurrency()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        icon={<TrendingUp className="h-4 w-4 text-[var(--income-green)]" />}
        label="Period Income"
        tone="income"
        value={fmt(summary.periodIncome)}
        note="Recorded income in selected range"
        trend={<TrendBadge pct={summary.incomeChangeVsPrev} />}
      />
      <SummaryCard
        icon={<TrendingDown className="h-4 w-4 text-[var(--expense-red)]" />}
        label="Period Expenses"
        tone="expense"
        value={fmt(summary.periodExpenses)}
        note="Recorded expenses in selected range"
        trend={<TrendBadge pct={summary.expenseChangeVsPrev} inverse />}
      />
      <SummaryCard
        icon={<Percent className="h-4 w-4 text-[var(--accent)]" />}
        label="Savings Rate"
        tone="neutral"
        value={`${summary.savingsRate.toFixed(1)}%`}
        note="(Income - expenses) / income"
        trend={
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-base)]">
            <div
              className={`h-full rounded-full ${summary.savingsRate >= 20 ? 'bg-[var(--income-green)]' : summary.savingsRate >= 10 ? 'bg-[var(--accent)]' : 'bg-[var(--expense-red)]'}`}
              style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
            />
          </div>
        }
      />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  note,
  tone,
  trend,
  value,
}: {
  icon: ReactNode
  label: string
  note: string
  tone: 'income' | 'expense' | 'neutral'
  trend: ReactNode
  value: string
}) {
  const valueClass =
    tone === 'income'
      ? 'text-[var(--income-green)]'
      : tone === 'expense'
        ? 'text-[var(--expense-red)]'
        : 'text-[var(--text-main)]'

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-5 text-center shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)]">
        {icon}
      </div>
      <div className={`text-2xl font-bold tabular-nums tracking-tighter ${valueClass}`}>{value}</div>
      <div className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-main)]">{label}</div>
      <div className="text-[11px] font-bold uppercase tracking-tighter text-[var(--text-muted)]">{note}</div>
      <div className="mt-1 w-full">{trend}</div>
    </div>
  )
}
