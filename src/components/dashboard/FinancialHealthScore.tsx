'use client'

import type { FinancialHealthDetails } from '@/lib/types'

interface Props {
  details: FinancialHealthDetails
}

export function FinancialHealthScore({ details }: Props) {
  const { score, label, savingsRateScore, budgetAdherenceScore, goalProgressScore, debtManagementScore } = details

  const getGrade = (s: number) => {
    if (s >= 80) return { color: 'text-[var(--income-green)]', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900/50' }
    if (s >= 60) return { color: 'text-[#1565C0]', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900/50' }
    if (s >= 40) return { color: 'text-[var(--warning)]', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900/50' }
    return { color: 'text-[var(--expense-red)]', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50' }
  }

  // Check if user has no meaningful data (all sub-scores at default values)
  const isNewUser = savingsRateScore === 0 && budgetAdherenceScore <= 50 && goalProgressScore <= 50

  const validScore = Number.isNaN(score) ? 0 : score
  const grade = getGrade(validScore)
  const circumference = 2 * Math.PI * 58
  const dashOffset = circumference - (validScore / 100) * circumference

  if (isNewUser) {
    return (
      <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm flex flex-col items-center gap-4">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] self-start">Financial Health</h3>
        <div className="py-6 text-center flex flex-col items-center gap-3">
          <div className="text-3xl opacity-40">💪</div>
          <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Not enough data yet</p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-[200px] leading-relaxed">
            Start by adding income, expenses, and setting a budget to get your health score
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm flex flex-col items-center gap-4">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] self-start">Financial Health</h3>
      
      {/* Circular Score */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="58" stroke="var(--border-light)" strokeWidth="8" fill="none" />
          <circle
            cx="64" cy="64" r="58"
            stroke={score >= 70 ? '#2D5A3D' : score >= 50 ? '#B8860B' : '#6B3A3A'}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums tracking-tighter ${grade.color}`}>{validScore}</span>
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">/100</span>
        </div>
      </div>

      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${grade.bg} ${grade.color} border ${grade.border}`}>
        {label}
      </span>

      {/* Breakdown */}
      <div className="w-full flex flex-col gap-3 mt-2">
        {[
          { label: 'Savings Rate', value: savingsRateScore, weight: '30%' },
          { label: 'Budget Adherence', value: budgetAdherenceScore, weight: '25%' },
          { label: 'Goal Progress', value: goalProgressScore, weight: '25%' },
          { label: 'Debt Management', value: debtManagementScore, weight: '20%' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-[var(--text-muted)]">{item.label}</span>
              <span className="text-[var(--text-main)] tabular-nums">{item.value}%</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: item.value >= 70 ? '#2D5A3D' : item.value >= 40 ? '#B8860B' : '#6B3A3A'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
