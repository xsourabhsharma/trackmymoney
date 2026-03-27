'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import { format, parseISO, getDay } from 'date-fns'

export function ReportsCharts({ transactions }: { transactions: any[] }) {
  
 
  const monthlyDataMap: Record<string, { month: string, income: number, expense: number }> = {}
  
 
  const categoryDataMap: Record<string, { name: string, value: number, color: string }> = {}

 
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayDataMap: Record<string, { day: string, amount: number }> = {
    'Sun': { day: 'Sun', amount: 0 },
    'Mon': { day: 'Mon', amount: 0 },
    'Tue': { day: 'Tue', amount: 0 },
    'Wed': { day: 'Wed', amount: 0 },
    'Thu': { day: 'Thu', amount: 0 },
    'Fri': { day: 'Fri', amount: 0 },
    'Sat': { day: 'Sat', amount: 0 },
  }

 
  const incomeSourcesMap: Record<string, { name: string, value: number }> = {}

  transactions.forEach(t => {
    const amt = parseFloat(t.amount)
    const dateObj = parseISO(t.date)
    const monthKey = format(dateObj, 'MMM')
    const dayIndex = getDay(dateObj)
    const dayName = daysOfWeek[dayIndex]

   
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { month: monthKey, income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      monthlyDataMap[monthKey].income += amt
      
     
      const sourceName = t.source || 'Manual'
      if (!incomeSourcesMap[sourceName]) incomeSourcesMap[sourceName] = { name: sourceName, value: 0 }
      incomeSourcesMap[sourceName].value += amt
      
    } else {
      monthlyDataMap[monthKey].expense += amt

     
      const catName = t.categories?.name || 'Uncategorized'
      if (!categoryDataMap[catName]) {
        categoryDataMap[catName] = { name: catName, value: 0, color: t.categories?.color || '#8884d8' }
      }
      categoryDataMap[catName].value += amt

     
      dayDataMap[dayName].amount += amt
    }
  })

 
  const monthlyChartData = Object.values(monthlyDataMap)
  const categoryChartData = Object.values(categoryDataMap).sort((a, b) => b.value - a.value)
  const dayChartData = Object.values(dayDataMap)
  const incomeChartData = Object.values(incomeSourcesMap)

 
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px]">
        <div className="text-center">
            <p className="text-3xl opacity-40">📊</p>
            <h3 className="mt-4 text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">No Data Available</h3>
            <p className="mt-2 text-xs text-[var(--text-muted)]">There are no transactions in the selected period.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
              <RechartsTooltip formatter={(val: any) => `$${Number(val).toFixed(2)}`} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Yearly Spending by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color !== '#8884d8' ? entry.color : COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Average Spending by Day</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <RechartsTooltip formatter={(val: any) => `$${Number(val).toFixed(2)}`} cursor={{fill: 'transparent'}}/>
              <Bar dataKey="amount" name="Total Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[400px]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Income Sources</h3>
          {incomeChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">No income data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}
