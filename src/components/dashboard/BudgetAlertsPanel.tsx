'use client'

import { BudgetAlertItem } from '@/app/dashboard/budgets/data'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface Props {
  alerts: BudgetAlertItem[]
}

export function BudgetAlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="py-8 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
          <span className="text-xl">✅</span>
        </div>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          All budgets on track
        </p>
      </div>
    )
  }

  const config = {
    critical: {
      icon: <AlertTriangle className="w-4 h-4 text-[var(--expense-red)] flex-shrink-0" />,
      bg: 'bg-[var(--expense-red)]/5 dark:bg-[var(--expense-red)]/10',
      border: 'border-[var(--expense-red)]/20',
      titleColor: 'text-[var(--expense-red)]',
      dot: 'bg-[var(--expense-red)]',
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />,
      bg: 'bg-orange-500/5 dark:bg-orange-500/10',
      border: 'border-orange-500/20',
      titleColor: 'text-orange-600 dark:text-orange-400',
      dot: 'bg-orange-500',
    },
    info: {
      icon: <Info className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />,
      bg: 'bg-[var(--accent)]/5 dark:bg-[var(--accent)]/10',
      border: 'border-[var(--accent)]/20',
      titleColor: 'text-[var(--accent)]',
      dot: 'bg-[var(--accent)]',
    },
  }

  const titleMap = {
    over_budget: 'Over Budget',
    near_limit: 'Near Limit',
    unused_buffer: 'Unused Buffer',
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert, i) => {
        const c = config[alert.severity]
        return (
          <div
            key={i}
            className={`flex gap-3 p-4 rounded-xl border ${c.bg} ${c.border} hover:brightness-95 transition-all`}
          >
            {c.icon}
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className={`text-[11px] font-bold uppercase tracking-tight leading-tight ${c.titleColor}`}>
                {titleMap[alert.type]}
              </p>
              <p className="text-[12px] font-medium text-[var(--text-main)] opacity-70 leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
