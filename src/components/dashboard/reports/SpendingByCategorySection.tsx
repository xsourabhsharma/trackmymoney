'use client'

import { useState } from 'react'
import { CategorySpendingItem } from '@/app/dashboard/reports/data'

interface Props {
  data: CategorySpendingItem[]
}

type ChartMode = 'stacked' | 'donut'

const PALETTE = ['#2D5A3D', '#6B4C9A', '#B8860B', '#1565C0', '#C62828', '#0D7377', '#D35400', '#6C3483', '#1A5276', '#145A32']

export function SpendingByCategorySection({ data }: Props) {
  const [mode, setMode] = useState<ChartMode>('stacked')

  if (data.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3 border-2 border-dashed border-[var(--border-light)] rounded-[20px] bg-[var(--bg-surface)]/30">
        <span className="text-3xl">🗂️</span>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No spending by category for this period.</p>
        <p className="text-[10px] text-[var(--text-muted)]">Add transactions with categories to see breakdowns here.</p>
      </div>
    )
  }

  const totalAmount = data.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Toggle */}
      <div className="flex gap-1.5 p-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)] w-fit">
        {(['stacked', 'donut'] as ChartMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${mode === m ? 'bg-[var(--bg-base)] shadow-sm text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'stacked' ? (
        <div className="flex flex-col gap-3">
          {/* Stacked horizontal bar */}
          <div className="flex h-6 rounded-lg overflow-hidden shadow-inner border border-[var(--border-light)]/20">
            {data.slice(0, 8).map((cat, i) => (
              <div
                key={cat.categoryName}
                style={{
                  width: `${cat.percentOfTotal}%`,
                  backgroundColor: PALETTE[i % PALETTE.length],
                }}
                className="h-full hover:brightness-125 transition-all cursor-pointer"
                title={`${cat.categoryName}: $${cat.amount.toFixed(2)} (${cat.percentOfTotal}%)`}
              />
            ))}
          </div>

          {/* Category rows */}
          <div className="flex flex-col gap-2">
            {data.slice(0, 8).map((cat, i) => (
              <div key={cat.categoryName} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {cat.categoryIcon && <span className="text-sm">{cat.categoryIcon}</span>}
                  <span className="text-[10px] font-bold text-[var(--text-main)] uppercase truncate">{cat.categoryName}</span>
                </div>
                <div className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentOfTotal}%`, backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                </div>
                <span className="text-[10px] font-bold tabular-nums text-[var(--text-muted)] w-12 text-right">{cat.percentOfTotal}%</span>
                <span className="text-[10px] font-bold tabular-nums text-[var(--text-main)] w-20 text-right">
                  ${cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Donut
        <div className="flex items-center gap-8">
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {(() => {
                let offset = 0
                const circumference = 2 * Math.PI * 35
                return data.slice(0, 8).map((cat, i) => {
                  const dash = (cat.amount / totalAmount) * circumference
                  const gap = circumference - dash
                  const el = (
                    <circle
                      key={cat.categoryName}
                      cx="50" cy="50" r="35"
                      fill="none"
                      stroke={PALETTE[i % PALETTE.length]}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${gap}`}
                      strokeDashoffset={-offset}
                    />
                  )
                  offset += dash
                  return el
                })
              })()}
              <circle cx="50" cy="50" r="25" fill="var(--bg-base)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] font-bold text-[var(--text-main)]">${(totalAmount / 1000).toFixed(1)}k</span>
              <span className="text-[7px] text-[var(--text-muted)] uppercase">total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {data.slice(0, 6).map((cat, i) => (
              <div key={cat.categoryName} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase truncate flex-1">{cat.categoryName}</span>
                <span className="text-[10px] font-bold tabular-nums text-[var(--text-main)]">{cat.percentOfTotal}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
