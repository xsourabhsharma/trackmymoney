'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface Props {
  data: MonthlyData[]
}

export function CashFlowChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] gap-3">
        {/* Ghost chart outline */}
        <svg className="w-48 h-24 opacity-15" viewBox="0 0 200 100" fill="none">
          <path d="M10 80 Q50 60 80 50 T150 30 T190 20" stroke="var(--border-dark)" strokeWidth="2" strokeDasharray="6 4" />
          <path d="M10 90 Q50 75 80 70 T150 60 T190 55" stroke="var(--border-dark)" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="10" y1="95" x2="190" y2="95" stroke="var(--border-dark)" strokeWidth="1" />
        </svg>
        <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No cash flow data yet</p>
        <p className="text-[11px] text-[var(--text-muted)] text-center max-w-[220px]">
          Track income & expenses over time to visualize your cash flow trends
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B3A3A" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6B3A3A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-light)' }}
            />
            <YAxis
              tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-muted)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
            />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || payload.length === 0) return null
                return (
                  <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-xl px-4 py-3 shadow-lg">
                    <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">{label}</div>
                    {payload.map((p) => (
                      <div key={p.name} className="flex items-center justify-between gap-4 text-[11px] font-bold tabular-nums">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name === 'income' ? 'Income' : 'Expenses'}
                        </span>
                        <span>$ {(p.value as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#2D5A3D"
              strokeWidth={2.5}
              fill="url(#incomeGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#2D5A3D', fill: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#6B3A3A"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#expenseGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#6B3A3A', fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
