import { format } from 'date-fns'
import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface UpcomingChargesCardProps {
  subscriptions: Array<{
    id: string
    merchant: string
    amount: number
    currency: string
    nextChargeDate: Date | null
  }>
}

export function UpcomingChargesCard({ subscriptions }: UpcomingChargesCardProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="w-8 h-8 text-[var(--text-muted)]" />}
        title="No Upcoming Charges"
        description="You have no active subscriptions charging in the next 14 days."
        primaryActionLabel="Manage"
        primaryActionHref="/dashboard/subscriptions"
      />
    )
  }

  return (
    <div className="flex flex-col p-6 bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--text-main)]">
          Upcoming Charges
        </h3>
        <Link 
          href="/dashboard/subscriptions"
          className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
        >
          Manage <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {subscriptions.map((sub) => {
          return (
            <div key={sub.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
                  <CalendarClock className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-main)] line-clamp-1">{sub.merchant}</h4>
                  <div className="text-xs font-medium text-[var(--text-muted)]">
                    {sub.nextChargeDate ? format(new Date(sub.nextChargeDate), 'MMM d, yyyy') : 'Unknown Date'}
                  </div>
                </div>
              </div>
              <div className="text-right font-black tracking-tight text-[var(--text-main)]">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: sub.currency === 'USD' ? 'INR' : sub.currency || 'INR',
                  maximumFractionDigits: 0
                }).format(sub.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
