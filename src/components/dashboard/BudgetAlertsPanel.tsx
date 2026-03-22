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
      icon: <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />,
      bg: 'bg-red-50/60',
      border: 'border-red-100',
      titleColor: 'text-red-700',
      dot: 'bg-red-500',
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />,
      bg: 'bg-orange-50/60',
      border: 'border-orange-100',
      titleColor: 'text-orange-700',
      dot: 'bg-orange-500',
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
      bg: 'bg-blue-50/60',
      border: 'border-blue-100',
      titleColor: 'text-blue-700',
      dot: 'bg-blue-500',
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
              <p className="text-[12px] font-medium text-[var(--text-muted)] leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
