'use client'

import type { SavingsGoalRow, GoalStatus } from '@/app/dashboard/goals/data'
import { Banknote, BriefcaseBusiness, Car, Clock, GraduationCap, Home, Laptop, Lightbulb, Plane, Plus, Shield, Target } from 'lucide-react'
import { format } from 'date-fns'
import { ConfettiCelebration } from '@/components/dashboard/goals/ConfettiCelebration'
import { useCurrency } from '@/hooks/useCurrency'

interface Props {
  goals: SavingsGoalRow[]
  activeTab: 'active' | 'completed' | 'all'
  onTabChange: (tab: 'active' | 'completed' | 'all') => void
  onAddGoal: () => void
  onEditGoal: (goal: SavingsGoalRow) => void
}

const STATUS_COLORS: Record<GoalStatus, string> = {
  active: 'bg-blue-50 text-blue-600 border-blue-100',
  completed: 'bg-green-50 text-green-600 border-green-100',
  paused: 'bg-orange-50 text-orange-600 border-orange-100',
}

const GOAL_ICON_BY_KEY = {
  business: BriefcaseBusiness,
  car: Car,
  cash: Banknote,
  device: Laptop,
  education: GraduationCap,
  home: Home,
  protected: Shield,
  target: Target,
  travel: Plane,
}

function GoalCard({ goal, onEdit }: { goal: SavingsGoalRow; onEdit: () => void }) {
  const { fmt } = useCurrency()
  const pct = goal.progressPercent
  const isCompleted = goal.status === 'completed'
  const isPaused = goal.status === 'paused'

  const barColor = isCompleted
    ? 'bg-[var(--income-green)]'
    : isPaused
    ? 'bg-orange-400'
    : pct >= 80
    ? 'bg-[var(--income-green)]'
    : pct >= 50
    ? 'bg-[var(--accent)]'
    : 'bg-[var(--accent)]/70'

  return (
    <div
      className="group p-5 bg-[var(--bg-base)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-2xl transition-all hover:shadow-md cursor-pointer relative overflow-hidden"
      onClick={onEdit}
    >
      <ConfettiCelebration percentage={pct} />

      {}
      {goal.color && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ backgroundColor: goal.color }}
        />
      )}

      <div className="flex flex-col gap-3 mt-1">
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl flex items-center justify-center text-[var(--accent)] shadow-sm group-hover:scale-110 transition-transform">
              {(() => {
                const Icon = GOAL_ICON_BY_KEY[(goal.icon || 'target') as keyof typeof GOAL_ICON_BY_KEY] || Target
                return <Icon className="h-5 w-5" />
              })()}
            </div>
            <div>
              <span className="text-[13px] font-bold text-[var(--text-main)] uppercase tracking-tight block">
                {goal.name}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[goal.status]}`}>
                {goal.status}
                {goal.priority === 1 && <span className="ml-1 text-[var(--accent)]">Priority</span>}
              </span>
            </div>
          </div>
          <span className={`text-sm font-bold tabular-nums ${isCompleted ? 'text-[var(--income-green)]' : 'text-[var(--text-main)]'}`}>
            {pct}%
          </span>
        </div>

        {}
        <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tabular-nums text-[var(--text-main)]">
              {fmt(goal.currentAmount, goal.currency)}
            </span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">
              / {fmt(goal.targetAmount, goal.currency)}
            </span>
          </div>
          {goal.targetDate && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
              <Clock className="w-3 h-3" />
              {format(new Date(goal.targetDate), 'MMM yyyy')}
            </div>
          )}
        </div>

        {}
        {!isCompleted && (
          <div className="text-[12px] text-[var(--text-muted)] font-bold">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5 text-[var(--accent)]" /> {fmt(goal.targetAmount - goal.currentAmount, goal.currency)} to go
          </div>
        )}
      </div>
    </div>
  )
}

export function SavingsGoalsSection({ goals, activeTab, onTabChange, onAddGoal, onEditGoal }: Props) {
  const TABS: Array<'active' | 'completed' | 'all'> = ['active', 'completed', 'all']

  return (
    <div className="flex flex-col gap-4">
      {}
      <div className="flex gap-1.5 p-1 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)] w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-[var(--bg-base)] shadow-sm text-[var(--text-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {}
      {goals.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-5 border-2 border-dashed border-[var(--border-light)] rounded-[24px] bg-[var(--bg-surface)]/30">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-3xl shadow-sm">
            <Target className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--text-main)] tracking-tight mb-1">
              {activeTab === 'completed' ? 'No completed goals yet' : 'No savings goals yet'}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
              {activeTab === 'completed'
                ? 'Keep working on your active goals - completions will show up here.'
                : 'Start tracking money toward something meaningful. Emergency fund, vacation, home - anything works.'}
            </p>
          </div>
          {activeTab !== 'completed' && (
            <button
              onClick={onAddGoal}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[12px] font-bold uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onEdit={() => onEditGoal(goal)} />
          ))}
        </div>
      )}
    </div>
  )
}
