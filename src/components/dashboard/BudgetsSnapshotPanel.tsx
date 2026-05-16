import { createClient } from '@/utils/supabase/server'
import { Target, AlertTriangle } from 'lucide-react'

type BudgetSnapshotRow = {
  id: string
  limit_amount: string | number
  spent: string | number | null
  categories?: {
    id?: string | null
    name?: string | null
    icon?: string | null
    color?: string | null
  } | null
}

export async function BudgetsSnapshotPanel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

 
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select(`
      id,
      limit_amount,
      spent,
      categories ( id, name, icon, color )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(5)

  if (error || !budgets || budgets.length === 0) {
    return (
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" /> Budgets Snapshot
        </h3>
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3 opacity-50">
          <Target className="w-6 h-6 text-[var(--text-muted)]" />
          <p className="text-[12px] uppercase tracking-widest font-bold text-[var(--text-muted)]">No active budgets set.</p>
        </div>
      </div>
    )
  }

  const formatMoney = (val: number) => `$ ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6 flex items-center gap-2">
        <Target className="w-3.5 h-3.5" /> Budgets Snapshot
      </h3>
      <div className="flex flex-col gap-6">
        {(budgets as BudgetSnapshotRow[]).map((b) => {
          const limit = Number(b.limit_amount) || 1
          const spent = Number(b.spent) || 0
          const rawPercent = (spent / limit) * 100
          const percent = Math.min(Math.max(rawPercent, 0), 100)
          
          let statusColor = 'var(--text-muted)'
          let barColor = 'bg-[var(--accent)]'
          let isDanger = false

          if (rawPercent >= 100) {
            statusColor = 'var(--expense-red)'
            barColor = 'bg-[var(--expense-red)]'
            isDanger = true
          } else if (rawPercent >= 80) {
            statusColor = 'var(--expense-red)'
            barColor = 'bg-orange-400'
            isDanger = true
          }

          return (
            <div key={b.id} className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-light)]/50 transition-all hover:border-[var(--border-light)]">
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[var(--bg-base)] text-xs shadow-sm">
                    {b.categories?.icon || '📦'}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-tight text-[var(--text-main)] max-w-[120px] truncate">
                    {b.categories?.name || 'General'}
                  </span>
                </span>
                <span className={`text-[12px] font-bold flex items-center gap-1`} style={{ color: statusColor }}>
                  {isDanger && <AlertTriangle className="w-3 h-3" />}
                  {Math.round(rawPercent)}%
                </span>
              </div>
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest mb-2">
                <span className="text-[var(--text-main)] tabular-nums">{formatMoney(spent)}</span>
                <span className="text-[var(--text-muted)] tabular-nums">/ {formatMoney(limit)}</span>
              </div>
              <div className="h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden shadow-inner flex">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
                  style={{ width: `${percent}%` }} 
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
