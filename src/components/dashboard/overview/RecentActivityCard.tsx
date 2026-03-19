import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface RecentActivityCardProps {
  transactions: Array<{
    id: string
    amount: number
    type: string | null
    merchant: string | null
    description: string | null
    date: Date
    categoryName: string | null
    currency: string
  }>
}

export function RecentActivityCard({ transactions }: RecentActivityCardProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8 text-[var(--text-muted)]" />}
        title="No Recent Activity"
        description="Transactions will appear here once added."
        primaryActionLabel="View All"
        primaryActionHref="/dashboard/transactions"
      />
    )
  }

  return (
    <div className="flex flex-col p-6 bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--text-main)]">
          Recent Activity
        </h3>
        <Link 
          href="/dashboard/transactions"
          className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
        >
          View All <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income'
          const displayTitle = tx.merchant || tx.description || 'Unknown Transaction'
          
          return (
            <div key={tx.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-sm ${
                  isIncome 
                    ? 'bg-green-100 border-green-600 text-green-700 dark:bg-green-900/30' 
                    : 'bg-red-100 border-red-600 text-red-700 dark:bg-red-900/30'
                }`}>
                  {isIncome ? <ArrowDownRight className="w-5 h-5" strokeWidth={2.5} /> : <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)] line-clamp-1">{displayTitle}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <span>{tx.categoryName || 'Uncategorized'}</span>
                    <span>&bull;</span>
                    <span>{format(new Date(tx.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className={`text-right font-black tracking-tight ${
                isIncome ? 'text-green-600 dark:text-green-400' : 'text-[var(--text-main)]'
              }`}>
                {isIncome ? '+' : '-'}{new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: tx.currency === 'USD' ? 'INR' : tx.currency || 'INR',
                  maximumFractionDigits: 0
                }).format(tx.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
