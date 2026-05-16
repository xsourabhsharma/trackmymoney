import { createClient } from '@/utils/supabase/server'
import { Progress } from "@/components/ui/progress"

type BudgetSummaryRow = {
  id: string
  category_id: string
  limit_amount: string | number
  categories?: {
    id: string
    name: string
    icon: string | null
  } | null
}

type ExpenseRow = {
  amount: string | number
  category_id: string | null
}

export async function BudgetSummaryWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: budgets } = await supabase
    .from('budgets')
    .select('id, category_id, limit_amount, categories(id, name, icon)')
    .eq('user_id', user.id)
  
  if (!budgets || budgets.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-full">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Budget Health</h3>
        <p className="text-sm text-gray-500">No budgets set up. Head to the Budgets page to create one.</p>
      </div>
    )
  }

  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: expenses } = await supabase
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', currentMonthStart)
  
  const spentByCat: Record<string, number> = {}
  ;((expenses || []) as ExpenseRow[]).forEach((e) => {
    if (!e.category_id) return
    spentByCat[e.category_id] = (spentByCat[e.category_id] || 0) + Number(e.amount || 0)
  })

 
  const topBudgets = (budgets as BudgetSummaryRow[]).slice(0, 4)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-full">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Budget Health</h3>
      <div className="space-y-4">
        {topBudgets.map((b) => {
          const limit = Number(b.limit_amount || 0)
          const catId = b.categories?.id || b.category_id
          const spent = spentByCat[catId] || 0
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
          const isOver = spent > limit

          return (
            <div key={b.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-2">
                  <span>{b.categories?.icon || '📦'}</span> {b.categories?.name || 'Unknown'}
                </span>
                <span className={isOver ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                  ${spent.toFixed(0)} / ${limit.toFixed(0)}
                </span>
              </div>
              <Progress value={pct} className={`h-2 ${isOver ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-zinc-800'}`} indicatorColor={isOver ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500'} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
