import { CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'

interface GettingStartedChecklistProps {
  status: {
    hasAccount: boolean
    hasTransaction: boolean
    hasBudget: boolean
    hasSubscription: boolean
    hasGoal: boolean
  }
}

export function GettingStartedChecklist({ status }: GettingStartedChecklistProps) {
  const steps = [
    {
      id: 'account',
      label: 'Add your first account',
      description: 'Connect a bank or create a manual wallet.',
      href: '/dashboard', 
      isComplete: status.hasAccount
    },
    {
      id: 'transaction',
      label: 'Record a transaction',
      description: 'Log an income or expense to see cash flow.',
      href: '/dashboard/transactions',
      isComplete: status.hasTransaction
    },
    {
      id: 'budget',
      label: 'Create a budget',
      description: 'Set spending limits to stay on track.',
      href: '/dashboard/budgets',
      isComplete: status.hasBudget
    },
    {
      id: 'subscription',
      label: 'Track subscriptions',
      description: 'Never miss a recurring charge.',
      href: '/dashboard/subscriptions',
      isComplete: status.hasSubscription
    },
    {
      id: 'goal',
      label: 'Set a savings goal',
      description: 'Plan for the future.',
      href: '/dashboard/goals',
      isComplete: status.hasGoal
    }
  ]

  const completedCount = steps.filter(s => s.isComplete).length
  const progress = (completedCount / steps.length) * 100
  const allDone = completedCount === steps.length

  if (allDone) {
    return null
  }

  return (
    <div className="flex flex-col p-6 bg-[var(--bg-base)] border-[3px] border-[var(--border-main)] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black uppercase tracking-tight text-[var(--text-main)]">
          Getting Started
        </h3>
        <span className="text-xs font-bold bg-[var(--accent-main)] text-white px-2 py-1 rounded-full border-2 border-[var(--border-main)]">
          {completedCount} / {steps.length}
        </span>
      </div>
      
      <div className="w-full bg-[var(--bg-muted)] h-3 rounded-full border-2 border-[var(--border-main)] mb-6 overflow-hidden">
        <div 
          className="h-full bg-[var(--accent-main)] border-r-2 border-[var(--border-main)] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`group flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${
              step.isComplete 
                ? 'bg-[var(--bg-muted)] border-transparent opacity-60 pointer-events-none'
                : 'bg-transparent border-[var(--border-main)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {step.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-main)]" />
              )}
            </div>
            <div>
              <h4 className={`text-sm font-bold ${step.isComplete ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                {step.label}
              </h4>
              <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                {step.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
