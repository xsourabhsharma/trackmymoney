'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

import type { TransactionRow } from '@/app/dashboard/transactions/data'

export function DashboardCharts({ transactions }: { transactions: TransactionRow[] }) {
 
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const categoryDataMap: Record<string, { name: string; value: number; color?: string }> = {}

  expenseTransactions.forEach(t => {
    const categoryName = t.categories?.name || 'Uncategorized'
    const color = t.categories?.color ?? undefined
    const amount = Number(t.amount) || 0

    if (!categoryDataMap[categoryName]) {
      categoryDataMap[categoryName] = { name: categoryName, value: 0, color }
    }
    categoryDataMap[categoryName].value += amount
  })

  const pieData = Object.values(categoryDataMap).sort((a, b) => b.value - a.value)

 
 
  const timeDataMap: Record<string, { name: string; sortKey: string; income: number; expense: number }> = {}
  
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const shortName = d.toLocaleDateString('en-US', { month: 'short' })
    timeDataMap[sortKey] = { name: shortName, sortKey, income: 0, expense: 0 }
  }

  transactions.forEach(t => {
    const dateObj = new Date(t.date)
    const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
    const amount = Number(t.amount)

   
    if (timeDataMap[sortKey]) {
      if (t.type === 'income') {
        timeDataMap[sortKey].income += amount
      } else {
        timeDataMap[sortKey].expense += amount
      }
    }
  })

  const barData = Object.values(timeDataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-[400px]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
        {pieData.length > 0 ? (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 300 }}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 137.5 % 360}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => `$${Number(value).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">No expenses recorded yet.</div>
        )}
      </div>

      {}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-[400px]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Flow</h3>
        {barData.length > 0 ? (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 300 }}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip formatter={(value: unknown) => `$${Number(value).toFixed(2)}`} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">No transactions recorded yet.</div>
        )}
      </div>
    </div>
  )
}
