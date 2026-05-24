import { createClient } from '@/utils/supabase/server'
import { format, differenceInDays } from 'date-fns'

type UpcomingSubscriptionRow = {
  id: string
  merchant: string
  amount: string | number
  next_charge_date: string
  categories?: {
    name: string | null
    icon: string | null
  } | null
}

export async function UpcomingSubscriptionsWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, merchant, amount, next_charge_date, categories(name, icon)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .not('next_charge_date', 'is', null)
    .order('next_charge_date', { ascending: true })
    .limit(3)

  if (!subscriptions || subscriptions.length === 0) return null

  const rows = subscriptions as UpcomingSubscriptionRow[]

  return (
    <div className="panel shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <div className="panel-header bg-[#9ac2dc]">
        <h3 className="panel-title">Upcoming</h3>
      </div>
      <div className="p-4 space-y-4">
        {rows.map((sub) => {
          const daysLeft = differenceInDays(new Date(sub.next_charge_date), new Date())
          return (
            <div key={sub.id} className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="text-xl">{sub.categories?.icon || '💳'}</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tighter truncate max-w-[100px]">{sub.merchant}</p>
                  <p className="text-[12px] font-bold text-gray-500">{format(new Date(sub.next_charge_date), 'MMM dd')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black">${Number(sub.amount || 0).toFixed(2)}</p>
                <span className={`text-[11px] font-black uppercase px-1.5 py-0.5 rounded-sm ${daysLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {daysLeft} days
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
