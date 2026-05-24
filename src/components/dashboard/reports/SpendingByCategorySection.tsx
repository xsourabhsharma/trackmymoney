'use client'

import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import type { CategorySpendingItem } from '@/app/dashboard/reports/data'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  data: CategorySpendingItem[]
}

type ChartMode = 'stacked' | 'donut'

const PALETTE = ['#ff5a1f', '#14824f', '#1565c0', '#6b4c9a', '#c98200', '#0d7377', '#c62828', '#475569']

export function SpendingByCategorySection({ data }: Props) {
  const [mode, setMode] = useState<ChartMode>('stacked')
  const { fmt } = useCurrency()

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-surface)]/30 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--accent)]">
          <FolderOpen className="h-5 w-5" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No spending by category for this period.</p>
        <p className="text-[12px] text-[var(--text-muted)]">Add categorized transactions to see breakdowns here.</p>
      </div>
    )
  }

  const totalAmount = data.reduce((sum, category) => sum + category.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] p-1">
        {(['stacked', 'donut'] as ChartMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${mode === item ? 'bg-[var(--bg-base)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {mode === 'stacked' ? (
        <div className="flex flex-col gap-3">
          <div className="flex h-6 overflow-hidden rounded-lg border border-[var(--border-light)]/20 shadow-inner">
            {data.slice(0, 8).map((category, index) => (
              <div
                key={category.categoryName}
                style={{
                  backgroundColor: category.categoryColor || PALETTE[index % PALETTE.length],
                  width: `${category.percentOfTotal}%`,
                }}
                className="h-full transition-all hover:brightness-110"
                title={`${category.categoryName}: ${fmt(category.amount)} (${category.percentOfTotal}%)`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {data.slice(0, 8).map((category, index) => {
              const color = category.categoryColor || PALETTE[index % PALETTE.length]
              return (
                <div key={category.categoryName} className="flex items-center gap-3">
                  <CategoryIcon
                    className="h-8 w-8 rounded-[10px]"
                    color={color}
                    icon={category.categoryIcon}
                    name={category.categoryName}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[12px] font-bold uppercase text-[var(--text-main)]">{category.categoryName}</span>
                      <span className="text-[12px] font-bold tabular-nums text-[var(--text-muted)]">{category.percentOfTotal}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg-surface)]">
                      <div className="h-full rounded-full" style={{ width: `${category.percentOfTotal}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <span className="w-24 text-right text-[12px] font-bold tabular-nums text-[var(--text-main)]">{fmt(category.amount)}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {(() => {
                let offset = 0
                const circumference = 2 * Math.PI * 35
                return data.slice(0, 8).map((category, index) => {
                  const dash = (category.amount / totalAmount) * circumference
                  const gap = circumference - dash
                  const element = (
                    <circle
                      key={category.categoryName}
                      cx="50"
                      cy="50"
                      fill="none"
                      r="35"
                      stroke={category.categoryColor || PALETTE[index % PALETTE.length]}
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset}
                      strokeWidth="18"
                    />
                  )
                  offset += dash
                  return element
                })
              })()}
              <circle cx="50" cy="50" fill="var(--bg-base)" r="25" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[12px] font-bold text-[var(--text-main)]">{fmt(totalAmount)}</span>
              <span className="text-[7px] uppercase text-[var(--text-muted)]">total</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {data.slice(0, 6).map((category, index) => (
              <div key={category.categoryName} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: category.categoryColor || PALETTE[index % PALETTE.length] }} />
                <span className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase text-[var(--text-muted)]">{category.categoryName}</span>
                <span className="text-[12px] font-bold tabular-nums text-[var(--text-main)]">{category.percentOfTotal}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
