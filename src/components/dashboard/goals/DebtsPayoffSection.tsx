'use client'

import { DebtRow, DebtFreeCountdown, PayoffStrategy } from '@/app/dashboard/goals/data'
import { Plus, Info } from 'lucide-react'
import { format, addMonths } from 'date-fns'

interface Props {
  debts: DebtRow[]
  payoffStrategy: PayoffStrategy
  countdown: DebtFreeCountdown | null
  onChangeStrategy: (strategy: PayoffStrategy) => void
  onAddDebt: () => void
  onEditDebt: (debt: DebtRow) => void
}

const STRATEGY_CONFIG: Record<PayoffStrategy, { label: string; tooltip: string; color: string }> = {
  snowball: {
    label: 'Snowball',
    tooltip: 'Pay off smallest balance first. Builds momentum with quick wins.',
    color: 'text-blue-600',
  },
  avalanche: {
    label: 'Avalanche',
    tooltip: 'Pay off highest interest rate first. Saves the most money over time.',
    color: 'text-[var(--expense-red)]',
  },
  custom: {
    label: 'Custom',
    tooltip: 'You decide which debt to focus on each month.',
    color: 'text-purple-600',
  },
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function DebtsPayoffSection({ debts, payoffStrategy, countdown, onChangeStrategy, onAddDebt, onEditDebt }: Props) {
  const totalOriginal = debts.reduce((s, d) => s + d.originalPrincipal, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Strategy Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Payoff Strategy</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STRATEGY_CONFIG) as PayoffStrategy[]).map(s => {
            const cfg = STRATEGY_CONFIG[s]
            const isActive = payoffStrategy === s
            return (
              <div key={s} className="relative group/tip">
                <button
                  onClick={() => onChangeStrategy(s)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
                    isActive
                      ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-md'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-[var(--border-dark)]'
                  }`}
                >
                  <Info className="w-3 h-3" />
                  {cfg.label}
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--text-main)] text-[var(--bg-base)] text-[11px] font-bold rounded-xl px-3 py-2 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
                  {cfg.tooltip}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Countdown Banner (if debts exist and countdown computed) */}
      {debts.length > 0 && countdown && (
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--income-green)]/10 border border-green-100 flex items-center justify-center text-xl flex-shrink-0">
            🛤️
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight">
              Debt-free in <span className="text-[var(--income-green)]">{countdown.monthsToDebtFree} months</span> — by {countdown.debtFreeDate}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 uppercase tracking-widest">
              Using {countdown.strategy} strategy · assuming current minimum payments
            </p>
          </div>
        </div>
      )}

      {/* Debts List */}
      {debts.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-5 border-2 border-dashed border-[var(--border-light)] rounded-[24px] bg-[var(--bg-surface)]/30">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-3xl shadow-sm">
            🛡️
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--text-main)] tracking-tight mb-1">
              No debts tracked
            </p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
              Either you're debt-free (amazing!) or you haven't added any yet. Track loans, credit cards, and more.
            </p>
          </div>
          <button
            onClick={onAddDebt}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Your First Debt
          </button>
        </div>
      ) : (
        <div className="border border-[var(--border-light)] rounded-[20px] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 p-4 bg-[var(--bg-surface)] border-b border-[var(--border-light)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <span>Debt / Creditor</span>
            <span>Balance</span>
            <span>Rate</span>
            <span>Min Payment</span>
          </div>
          {debts.map((debt) => {
            const paidPct = debt.originalPrincipal > 0
              ? Math.min(100, Math.round(((debt.originalPrincipal - debt.currentBalance) / debt.originalPrincipal) * 100))
              : 0

            return (
              <div
                key={debt.id}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 p-4 items-center border-b border-[var(--border-light)]/50 last:border-b-0 hover:bg-[var(--bg-surface)]/50 transition-all cursor-pointer"
                onClick={() => onEditDebt(debt)}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{debt.name}</span>
                  {debt.creditor && (
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate opacity-70">{debt.creditor}</span>
                  )}
                  <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[var(--income-green)] rounded-full" style={{ width: `${paidPct}%` }} />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">{paidPct}% paid off</span>
                </div>
                <div>
                  <span className="text-[12px] font-bold tabular-nums text-[var(--expense-red)] tracking-tighter">
                    ${fmt(debt.currentBalance)}
                  </span>
                </div>
                <span className="text-[11px] font-bold tabular-nums text-[var(--text-muted)]">
                  {debt.interestRate}%
                </span>
                <span className="text-[11px] font-bold tabular-nums text-[var(--text-main)]">
                  ${fmt(debt.minimumPayment)}/mo
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
