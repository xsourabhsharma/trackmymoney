'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

interface Props {
  data: CategoryData[]
  total: number
  onSectorClick?: (categoryName: string) => void
}

const FALLBACK_COLORS = ['#2D5A3D', '#6B4C9A', '#B8860B', '#1565C0', '#C62828', '#00695C', '#E65100']

export function ExpenseDonutChart({ data, total, onSectorClick }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        {}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90 opacity-20" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="58" stroke="var(--border-dark)" strokeWidth="8" fill="none" strokeDasharray="12 8" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl opacity-40">📊</span>
          </div>
        </div>
        <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No expense data yet</p>
        <p className="text-[11px] text-[var(--text-muted)] text-center max-w-[200px]">
          Add your first expense to see spending patterns here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-44 h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              onClick={(data) => {
                if (data?.name) onSectorClick?.(data.name)
              }}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null
                const d = payload[0].payload as CategoryData
                const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0'
                return (
                  <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl px-3 py-2 shadow-lg">
                    <div className="text-[11px] font-bold text-[var(--text-main)] uppercase">{d.icon} {d.name}</div>
                    <div className="text-[12px] font-bold text-[var(--text-muted)] tabular-nums">$ {d.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} · {pct}%</div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xl font-bold tracking-tighter">${total.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }} />
            <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase truncate">{item.name}</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)] tabular-nums ml-auto opacity-60">
              {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
