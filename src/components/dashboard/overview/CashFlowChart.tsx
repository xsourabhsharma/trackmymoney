'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { EmptyState } from './EmptyState'
import { Activity } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface CashFlowChartProps {
  data: Array<{
    date: string
    income: number
    expense: number
  }>
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const { fmt } = useCurrency()

  if (!data || data.length === 0 || data.every(d => d.income === 0 && d.expense === 0)) {
    return (
      <EmptyState
        icon={<Activity className="w-12 h-12 text-[var(--text-muted)]" />}
        title="No Cash Flow Data"
        description="We couldn't find any income or expenses for this period."
      />
    )
  }

 
 
 
  
 
 
 
  const convertedData = data.map(d => ({
    ...d,
   
    incomeConverted: Number(fmt(d.income).replace(/[^0-9.-]+/g,"")),
    expenseConverted: Number(fmt(d.expense).replace(/[^0-9.-]+/g,""))
  }))

  return (
    <div className="w-full h-[350px] p-6 bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)] mb-6">Cash Flow Over Time</h3>
      <ResponsiveContainer width="100%" height="85%" initialDimension={{ width: 560, height: 300 }}>
        <BarChart data={convertedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-main)" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
            dy={10}
            tickFormatter={(value) => String(value).substring(5)}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
            tickFormatter={(value) => fmt(Number(value))}
          />
          <Tooltip 
            cursor={{ fill: 'var(--bg-muted)', opacity: 0.4 }}
            formatter={(value: unknown) => [fmt(Number(value) || 0), ""]}
            contentStyle={{ 
              backgroundColor: 'var(--bg-base)', 
              border: '3px solid var(--border-main)',
              borderRadius: '12px',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              fontWeight: 'bold',
              color: 'var(--text-main)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
          <Bar dataKey="incomeConverted" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={32} />
          <Bar dataKey="expenseConverted" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
