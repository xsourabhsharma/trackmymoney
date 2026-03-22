'use client'

import { useState } from 'react'
import { GoalsDebtsPageData, GoalsDebtsFilter, SavingsGoalRow, DebtRow, PayoffStrategy } from '@/app/dashboard/goals/data'
import { GoalsDebtsSummaryHeader } from '@/components/dashboard/goals/GoalsDebtsSummaryHeader'
import { SavingsGoalsSection } from '@/components/dashboard/goals/SavingsGoalsSection'
import { DebtsPayoffSection } from '@/components/dashboard/goals/DebtsPayoffSection'
import { GoalProgressSnapshotPanel, DebtFreeCountdownPanel } from '@/components/dashboard/goals/SnapshotPanels'
import { AiGoalDebtTipsPanel } from '@/components/dashboard/goals/AiGoalDebtTipsPanel'
import { GoalFormModal, DebtFormModal } from '@/components/dashboard/goals/GoalsFormModals'
import { Target, TrendingDown, Activity, Sparkles } from 'lucide-react'

interface Props {
  initialData: GoalsDebtsPageData
}

export function GoalsDebtsClientOrchestrator({ initialData }: Props) {
  const [filter, setFilter] = useState<GoalsDebtsFilter>(initialData.filter)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoalRow | null>(null)
  const [editingDebt, setEditingDebt] = useState<DebtRow | null>(null)

  const data = initialData

  function handleFilterChange(partial: Partial<GoalsDebtsFilter>) {
    setFilter(prev => ({ ...prev, ...partial }))
  }

  function handleOpenAddGoal() { setEditingGoal(null); setGoalModalOpen(true) }
  function handleOpenEditGoal(goal: SavingsGoalRow) { setEditingGoal(goal); setGoalModalOpen(true) }
  function handleOpenAddDebt() { setEditingDebt(null); setDebtModalOpen(true) }
  function handleOpenEditDebt(debt: DebtRow) { setEditingDebt(debt); setDebtModalOpen(true) }

  // Apply scope filter for display
  const showGoals = filter.scope === 'all' || filter.scope === 'savings'
  const showDebts = filter.scope === 'all' || filter.scope === 'debt'

  return (
    <div className="flex flex-col gap-8">
      {/* ── Summary Header ─────────────────────────────── */}
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
        <GoalsDebtsSummaryHeader
          summary={data.summary}
          filter={filter}
          onChangeFilter={handleFilterChange}
          onAddGoal={handleOpenAddGoal}
          onAddDebt={handleOpenAddDebt}
        />
      </div>

      {/* ── Main 2-column Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* Left: Savings Goals */}
        {showGoals && (
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--income-green)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Savings Goals</h3>
              </div>
              <span className="text-[12px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-light)]">
                {data.savingsGoals.length} goal{data.savingsGoals.length !== 1 ? 's' : ''}
              </span>
            </div>
            <SavingsGoalsSection
              goals={data.savingsGoals}
              activeTab={filter.goalsTab}
              onTabChange={tab => handleFilterChange({ goalsTab: tab })}
              onAddGoal={handleOpenAddGoal}
              onEditGoal={handleOpenEditGoal}
            />
          </div>
        )}

        {/* Right: Debts */}
        {showDebts && (
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[var(--expense-red)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Debts & Payoff Plan</h3>
              </div>
              {data.debts.length > 0 && (
                <span className="text-[12px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border-light)]">
                  {data.debts.length} debt{data.debts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <DebtsPayoffSection
              debts={data.debts}
              payoffStrategy={filter.payoffStrategy}
              countdown={data.debtFreeCountdown}
              onChangeStrategy={strategy => handleFilterChange({ payoffStrategy: strategy })}
              onAddDebt={handleOpenAddDebt}
              onEditDebt={handleOpenEditDebt}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Row: Snapshot + Countdown + AI Tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Goal Progress Snapshot */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-5">
            <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Goal Progress Snapshot</h3>
          </div>
          <GoalProgressSnapshotPanel snapshot={data.goalProgressSnapshot} />
        </div>

        {/* Debt-Free Countdown */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-5">
            <TrendingDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Debt-Free Countdown</h3>
          </div>
          <DebtFreeCountdownPanel
            countdown={data.debtFreeCountdown}
            totalDebt={data.summary.totalDebt}
          />
        </div>

        {/* AI Tips */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">AI Goal & Debt Tips</h3>
          </div>
          <AiGoalDebtTipsPanel suggestions={data.aiSuggestions} />
        </div>
      </div>

      {/* ── Form Modals ────────────────────────────────── */}
      <GoalFormModal
        isOpen={goalModalOpen}
        onClose={() => { setGoalModalOpen(false); setEditingGoal(null) }}
        editGoal={editingGoal}
      />
      <DebtFormModal
        isOpen={debtModalOpen}
        onClose={() => { setDebtModalOpen(false); setEditingDebt(null) }}
        editDebt={editingDebt}
      />
    </div>
  )
}
