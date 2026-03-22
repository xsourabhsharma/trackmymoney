import React from 'react'
import { CalendarClock, ArrowRight } from 'lucide-react'
import type { UpcomingChargeItem } from '@/app/dashboard/subscriptions/data'
import { format, parseISO } from 'date-fns'

interface UpcomingChargesPanelProps {
  charges: UpcomingChargeItem[]
}

export function UpcomingChargesPanel({ charges }: UpcomingChargesPanelProps) {
  if (charges.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col h-full items-center justify-center min-h-[250px] text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] border border-[var(--border-light)] flex items-center justify-center mb-4">
          <CalendarClock className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
        </div>
        <p className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-widest mb-1">No Pending Charges</p>
        <p className="text-[12px] text-[var(--text-muted)] max-w-[200px]">You have no active subscription renewals coming up.</p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--bg-muted)] border border-[var(--border-light)] flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider">Upcoming Charges</h2>
            <p className="text-[12px] text-[var(--text-muted)] font-medium">Next 5 renewals</p>
          </div>
        </div>
        <button className="text-[12px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {charges.map((charge) => {
          const dateObj = parseISO(charge.nextChargeDate)
          const daysAway = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          
          let alertClass = ""
          if (daysAway <= 3) alertClass = "border-[var(--expense-red)]/30 bg-[var(--expense-red)]/5"
          else if (daysAway <= 7) alertClass = "border-[#FF9800]/30 bg-[#FF9800]/5"

          return (
            <div key={charge.id} className={`flex items-center justify-between p-3 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-muted)] transition-colors group ${alertClass}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-light)] flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-0.5">{format(dateObj, 'MMM')}</span>
                  <span className="text-xs font-light text-[var(--text-main)] leading-none">{format(dateObj, 'dd')}</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[var(--text-main)] tracking-wide">{charge.serviceName || charge.merchant}</p>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest">{daysAway === 0 ? 'Today' : `In ${daysAway} days`}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-light text-[var(--text-main)]">${Number(charge.amount).toFixed(2)}</p>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest">{charge.interval}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
