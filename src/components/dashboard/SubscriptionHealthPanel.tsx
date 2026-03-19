import React from 'react'
import { Activity, AlertTriangle, TrendingDown } from 'lucide-react'
import type { SubscriptionHealthMetrics } from '@/app/dashboard/subscriptions/data'

interface SubscriptionHealthPanelProps {
  health: SubscriptionHealthMetrics
}

export function SubscriptionHealthPanel({ health }: SubscriptionHealthPanelProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-[var(--bg-muted)] border border-[var(--border-light)] flex items-center justify-center">
          <Activity className="w-4 h-4 text-[var(--text-main)]" />
        </div>
        <div>
          <h2 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">Subscription Health</h2>
          <p className="text-[10px] text-[var(--text-muted)] font-medium">Auto-analyzed portfolio metrics</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        
        {/* Cost vs Income Line */}
        <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-muted)]/50">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Vs Monthly Income</p>
            <span className="text-lg font-light text-[var(--text-main)]">{health.monthlyCostVsIncomePercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${health.monthlyCostVsIncomePercent > 10 ? 'bg-[var(--expense-red)]' : 'bg-[var(--income-green)]'}`}
              style={{ width: `${Math.min(100, health.monthlyCostVsIncomePercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Underutilized Flag */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${health.rarelyUsedCount > 0 ? 'bg-[var(--expense-red)]/10 text-[var(--expense-red)]' : 'bg-[var(--border-light)] text-[var(--text-muted)]'}`}>
               <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-main)] tracking-wide">{health.rarelyUsedCount} rarely used</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Based on usage scores</p>
            </div>
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${health.rarelyUsedCount > 0 ? 'text-[var(--expense-red)]' : 'text-[var(--text-muted)]'}`}>
            {health.rarelyUsedCount > 0 ? 'Action Needed' : 'Optimized'}
          </div>
        </div>

        {/* Overdue/Failed Payments */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${health.overdueCount > 0 ? 'bg-[#FF9800]/10 text-[#FF9800]' : 'bg-[var(--border-light)] text-[var(--text-muted)]'}`}>
               <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--text-main)] tracking-wide">{health.overdueCount} overdue</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Expected but undetected</p>
            </div>
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${health.overdueCount > 0 ? 'text-[#FF9800]' : 'text-[var(--text-muted)]'}`}>
            {health.overdueCount > 0 ? 'Investigate' : 'Up to date'}
          </div>
        </div>

      </div>
    </div>
  )
}
