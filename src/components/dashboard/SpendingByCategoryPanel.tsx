'use client'

import { SpendingByCategoryItem } from '@/app/dashboard/transactions/data'
import { PieChart, ListMinus } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

export function SpendingByCategoryPanel({ items }: { items: SpendingByCategoryItem[] }) {
  const { fmt } = useCurrency()
  
  const totalSpending = items.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm animate-slide-in-right hover-glow">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
        <PieChart className="w-3.5 h-3.5" /> Spending by Category
      </h3>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center gap-3 opacity-50">
          <ListMinus className="w-6 h-6 text-[var(--text-muted)]" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">No expenses tracked<br/>in this period.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.slice(0, 10).map((item, idx) => {
            const pct = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0
            return (
              <div key={item.categoryId} className="group" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex items-center gap-3 mb-1.5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform shrink-0"
                    style={{ backgroundColor: item.categoryColor ? `${item.categoryColor}20` : 'var(--bg-surface)' }}
                  >
                    {item.categoryIcon || '🔹'}
                  </div>
                  <span className="flex-grow text-[11px] font-bold uppercase tracking-tight text-[var(--text-main)] truncate max-w-[100px]">
                    {item.categoryName || 'Uncategorized'}
                  </span>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold tabular-nums text-[var(--text-main)]">{fmt(item.amount)}</span>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] ml-1.5">{pct.toFixed(0)}%</span>
                  </div>
                </div>
                {/* Progress bar with animation */}
                <div className="ml-11 h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full animate-progress-fill"
                    style={{ 
                      width: `${pct}%`,
                      backgroundColor: item.categoryColor || 'var(--accent)',
                      animationDelay: `${0.3 + idx * 0.08}s`
                    }}
                  />
                </div>
              </div>
            )
          })}
          {items.length > 10 && (
            <div className="text-center pt-2 border-t border-[var(--border-light)]">
               <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--text-muted)]">+ {items.length - 10} more categories</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
