'use client'

import type { GoalProgressSnapshot, DebtFreeCountdown } from '@/app/dashboard/goals/data'

interface SnapshotProps {
  snapshot: GoalProgressSnapshot
}

export function GoalProgressSnapshotPanel({ snapshot }: SnapshotProps) {
  const pct = Math.round(snapshot.percentFunded)

  function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="flex flex-col items-center text-center gap-5 h-full">
      {}
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {}
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-surface)" strokeWidth="14" />
          {}
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="var(--income-green)"
            strokeWidth="14"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold tabular-nums tracking-tighter text-[var(--text-main)]">{pct}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold text-[var(--text-main)] uppercase leading-relaxed px-2">
          You&apos;ve saved ${fmt(snapshot.totalSaved)} out of ${fmt(snapshot.totalTarget)} in savings goals.
        </p>
        <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest inline-block shadow-sm border ${
          pct >= 75 ? 'bg-green-50 text-[var(--income-green)] border-green-100' :
          pct >= 40 ? 'bg-blue-50 text-blue-600 border-blue-100' :
          'bg-orange-50 text-orange-600 border-orange-100'
        }`}>
          {pct >= 75 ? '🎯 Great progress' : pct >= 40 ? '📈 On track' : '⚡ Keep going'}
        </span>
      </div>
    </div>
  )
}


interface CountdownProps {
  countdown: DebtFreeCountdown | null
  totalDebt: number
}

export function DebtFreeCountdownPanel({ countdown, totalDebt }: CountdownProps) {
  if (totalDebt === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 h-full py-4">
        <div className="text-4xl">🎉</div>
        <div>
          <p className="text-[13px] font-bold text-[var(--income-green)] uppercase tracking-tight">Debt-Free!</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">You have no tracked debts. Amazing!</p>
        </div>
      </div>
    )
  }

  if (!countdown) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 h-full py-4">
        <p className="text-[11px] text-[var(--text-muted)]">Add debts with minimum payments to see your countdown.</p>
      </div>
    )
  }

  const progressPct = Math.max(5, Math.min(95, (1 / (1 + countdown.monthsToDebtFree / 12)) * 100))

  return (
    <div className="flex flex-col items-center text-center gap-5 w-full">
      <div>
        <div className="text-4xl font-bold tracking-tighter text-[var(--income-green)] mb-1">
          {countdown.monthsToDebtFree} mo
        </div>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
          Debt-free by {countdown.debtFreeDate} (assuming current minimum payments)
        </p>
      </div>

      <div className="w-full space-y-3">
        <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-light)]/20 shadow-inner p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--expense-red)] via-orange-400 to-[var(--income-green)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">
          <span>Now</span>
          <span>{countdown.debtFreeDate}</span>
        </div>
      </div>

      <div className="text-[11px] text-[var(--text-muted)] px-2 py-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
        Strategy: <span className="font-bold uppercase">{countdown.strategy}</span>
      </div>
    </div>
  )
}
