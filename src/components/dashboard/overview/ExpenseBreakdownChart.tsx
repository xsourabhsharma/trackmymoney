'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { EmptyState } from './EmptyState'
import { PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

interface ExpenseBreakdownChartProps {
  data: Array<{
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
  }>
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<PieChartIcon className="w-12 h-12 text-[var(--text-muted)]" />}
        title="No Expenses Recorded"
        description="Add some expense transactions to see where your money goes."
      />
    )
  }


  const chartData = data.map(d => ({
    name: d.categoryName,
    value: d.amount
  }))

  return (
    <div className="w-full h-[350px] p-6 flex flex-col items-center bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
      <h3 className="w-full text-left text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-2">
        Expense Breakdown
      </h3>
      <ResponsiveContainer width="100%" height="90%" initialDimension={{ width: 560, height: 300 }}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="var(--border-main)"
            strokeWidth={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown) => [
              `₹${Number(value).toLocaleString()}`,
              'Amount'
            ]}
            contentStyle={{
              backgroundColor: 'var(--bg-base)',
              border: '3px solid var(--border-main)',
              borderRadius: '12px',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              fontWeight: 'bold',
              color: 'var(--text-main)'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
