import React from 'react'
import { LayoutGrid } from 'lucide-react'
import type { SubscriptionCategoryItem } from '@/app/dashboard/subscriptions/data'

interface SubscriptionCategoriesPanelProps {
  categories: SubscriptionCategoryItem[]
}

export function SubscriptionCategoriesPanel({ categories }: SubscriptionCategoriesPanelProps) {
  if (categories.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col items-center justify-center min-h-[250px] text-center h-full">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border-light)] flex items-center justify-center mb-4">
          <LayoutGrid className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
        </div>
        <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest mb-1">No Categorization Data</p>
        <p className="text-[12px] text-[var(--text-muted)] max-w-[200px]">We need active subscriptions to map their portfolio footprint.</p>
      </div>
    )
  }

 
  const totalAmount = categories.reduce((sum, cat) => sum + cat.amountMonthly, 0)

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-[var(--bg-muted)] border border-[var(--border-light)] flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-[#8B5CF6]" />
        </div>
        <div>
          <h2 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">Spend by Category</h2>
          <p className="text-[12px] text-[var(--text-muted)] font-medium">Monthly normalized allocations</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        {categories.slice(0, 4).map((category, idx) => {
          const percentage = totalAmount > 0 ? (category.amountMonthly / totalAmount) * 100 : 0
          const color = category.color || 'var(--text-main)'

          return (
            <div key={category.categoryId || `uncat-${idx}`} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }}></div>
                  <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    {category.categoryName} <span className="opacity-50 ml-1">{percentage.toFixed(0)}%</span>
                  </p>
                </div>
                <span className="text-[12px] font-light text-[var(--text-main)]">
                  ${category.amountMonthly.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden border border-[var(--border-light)]">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
          )
        })}

        {categories.length > 4 && (
          <div className="mt-2 text-center">
            <button className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest transition-colors bg-[var(--bg-muted)] px-3 py-1.5 rounded-full border border-[var(--border-light)]">
              +{categories.length - 4} More Categories
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
