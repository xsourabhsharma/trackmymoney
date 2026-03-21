'use client'

import { TrendingDown, TrendingUp, Wallet, Percent, CircleDollarSign, Landmark, Activity } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { TiltCard } from '@/components/3d/TiltCard'

interface KpiRowProps {
  metrics: {
    totalInflow: number
    totalOutflow: number
    netPosition: number
    totalBalance: number
    savingsRate: number | null
  }
  accountsCount: number
}

export function KpiRow({ metrics, accountsCount }: KpiRowProps) {
  const { fmt } = useCurrency()

  const kpis = [
    {
      label: 'Net Position',
      value: fmt(metrics.netPosition),
      icon: TrendingUp,
      colorClass: 'text-[var(--income-green)]',
      subtext: 'NET THIS PERIOD',
    },
    {
      label: 'Account Balance',
      value: fmt(metrics.totalBalance),
      icon: Landmark,
      colorClass: 'text-[var(--text-main)]',
      subtext: 'ACROSS ALL ACCOUNTS',
    },
    {
      label: 'Total Accounts',
      value: accountsCount.toString(),
      icon: Wallet,
      colorClass: 'text-[var(--text-main)]',
      subtext: `${accountsCount} LINKED`,
    },
    {
      label: 'Inflow',
      value: fmt(metrics.totalInflow),
      icon: TrendingUp,
      colorClass: 'text-[var(--text-main)]',
      subtext: 'TOTAL INCOME',
    },
    {
      label: 'Outflow',
      value: fmt(metrics.totalOutflow),
      icon: TrendingDown,
      colorClass: 'text-[var(--text-main)]',
      subtext: 'TOTAL EXPENSES',
    },
    {
      label: '% Savings Rate',
      value: metrics.savingsRate !== null ? `${metrics.savingsRate.toFixed(1)}%` : '—',
      icon: Percent,
      colorClass: 'text-[var(--text-main)]',
      subtext: 'EFFICIENCY',
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 perspective-[1000px]">
      {kpis.map((kpi, idx) => (
        <TiltCard key={idx}>
          <div className="group relative flex flex-col p-4 bg-white border border-[var(--border-main)] rounded-2xl shadow-sm h-full w-full cursor-default text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 opacity-60">
              <kpi.icon className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[9px] font-black uppercase tracking-widest">{kpi.label}</span>
            </div>
            <div className={`text-xl font-black tracking-tighter ${kpi.colorClass}`}>
              {kpi.value}
            </div>
            <div className="mt-2 text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
              {kpi.subtext}
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}
