'use client'
import { Progress } from "@/components/ui/progress"

export function TopCategoriesWidget({ expenses }: { expenses: any[] }) {
  const categoryMap: Record<string, { name: string, icon: string, amount: number }> = {}
  let total = 0
  
  expenses.forEach(e => {
    if (e.type === 'expense') {
      const amt = parseFloat(e.amount)
      total += amt
      const catId = e.categories?.name || 'Other'
      if (!categoryMap[catId]) {
        categoryMap[catId] = { name: catId, icon: e.categories?.icon || '📦', amount: 0 }
      }
      categoryMap[catId].amount += amt
    }
  })

  const topCats = Object.values(categoryMap).sort((a, b) => b.amount - a.amount).slice(0, 5)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-full">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Spending Categories</h3>
      {topCats.length === 0 ? (
        <div className="text-sm text-gray-500">No expenses yet.</div>
      ) : (
        <div className="space-y-4">
          {topCats.map(cat => (
            <div key={cat.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.name}
                </span>
                <span className="font-semibold">${cat.amount.toFixed(2)}</span>
              </div>
              <Progress value={(cat.amount / total) * 100} className="h-2 bg-gray-100 dark:bg-zinc-800" indicatorColor="bg-blue-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}