import { TrendingDown, TrendingUp, Wallet, Percent, CircleDollarSign } from 'lucide-react'

interface KpiRowProps {
  metrics: {
    totalInflow: number
    totalOutflow: number
    netPosition: number
    totalBalance: number
    savingsRate: number | null
  }
}

export function KpiRow({ metrics }: KpiRowProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const kpis = [
    {
      label: 'Net Position',
      value: formatCurrency(metrics.netPosition),
      icon: metrics.netPosition >= 0 ? TrendingUp : TrendingDown,
      colorClass: metrics.netPosition > 0 ? 'text-green-600 dark:text-green-400' : metrics.netPosition < 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-main)]',
      tooltip: 'Income minus expenses. Positive means you saved money.'
    },
    {
      label: 'Total Inflow',
      value: formatCurrency(metrics.totalInflow),
      icon: CircleDollarSign,
      colorClass: 'text-green-600 dark:text-green-400',
      tooltip: 'Total money coming in (Income, Transfers).'
    },
    {
      label: 'Total Outflow',
      value: formatCurrency(metrics.totalOutflow),
      icon: CircleDollarSign,
      colorClass: 'text-red-600 dark:text-red-400',
      tooltip: 'Total money going out (Expenses).'
    },
    {
      label: 'Savings Rate',
      value: metrics.savingsRate !== null ? `${metrics.savingsRate.toFixed(1)}%` : '—',
      icon: Percent,
      colorClass: (metrics.savingsRate || 0) >= 20 ? 'text-green-600 dark:text-green-400' : (metrics.savingsRate || 0) > 0 ? 'text-[var(--text-main)]' : 'text-red-600 dark:text-red-400',
      tooltip: "Percentage of inflow that wasn't spent."
    },
    {
      label: 'Total Balance',
      value: formatCurrency(metrics.totalBalance),
      icon: Wallet,
      colorClass: 'text-[var(--text-main)]',
      tooltip: 'Sum of all your account balances.'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <div 
          key={idx} 
          className="group relative flex flex-col p-4 bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-help"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{kpi.label}</span>
            <kpi.icon className={`w-5 h-5 ${kpi.colorClass}`} strokeWidth={2.5} />
          </div>
          <div className={`text-2xl font-black tracking-tight ${kpi.colorClass}`}>
            {kpi.value}
          </div>
          
          {/* Tooltip */}
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--text-main)] text-[var(--bg-base)] text-xs font-medium rounded-lg pointer-events-none z-10 text-center shadow-lg">
            {kpi.tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-main)]"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
