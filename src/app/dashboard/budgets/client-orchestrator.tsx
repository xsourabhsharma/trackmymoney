'use client'

import { useState } from 'react'
import { BudgetsPageData, BudgetFilter, CategoryBudgetItem } from '@/app/dashboard/budgets/data'
import { BudgetOverviewHeader } from '@/components/dashboard/BudgetOverviewHeader'
import { CategoryBudgetsPanel } from '@/components/dashboard/CategoryBudgetsPanel'
import { SpendingVsBudgetPanel } from '@/components/dashboard/SpendingVsBudgetPanel'
import { BudgetAlertsPanel } from '@/components/dashboard/BudgetAlertsPanel'
import { AiBudgetSuggestionsPanel } from '@/components/dashboard/AiBudgetSuggestionsPanel'
import { BudgetFormModal } from '@/components/dashboard/BudgetFormModal'
import { TrendingUp, Bell, Sparkles, Plus, Target } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  type: string
}

interface Props {
  initialData: BudgetsPageData
  categories: Category[]
}

export function BudgetsClientOrchestrator({ initialData, categories }: Props) {
  const [filter, setFilter] = useState<BudgetFilter>(initialData.filter)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<CategoryBudgetItem | null>(null)

 
 
  const data = initialData

  function handleOpenAdd() {
    setEditingBudget(null)
    setModalOpen(true)
  }

  function handleOpenEdit(budget: CategoryBudgetItem) {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingBudget(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {}
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)] mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--text-main)]" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">Budget Overview</h2>
          </div>
          <div className="flex items-center gap-2">

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            >
              <Plus className="w-3 h-3" />
              Set Budget Limit
            </button>
          </div>
        </div>

        <BudgetOverviewHeader
          metrics={data.overview}
          filter={filter}
          onFilterChange={setFilter}
        />

        {data.dataWarning && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {data.dataWarning}
          </div>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">

        {}
        <div className="flex flex-col gap-8">

          {}
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)] mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[var(--text-main)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Category Budgets</h3>
              </div>
              {data.categoryBudgets.length > 0 && (
                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-light)] hover:border-[var(--border-dark)] rounded-full text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
            <CategoryBudgetsPanel
              categoryBudgets={data.categoryBudgets}
              onAddBudget={handleOpenAdd}
              onEditBudget={handleOpenEdit}
            />
          </div>

          {}
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-6">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--text-main)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Spending vs Budget</h3>
            </div>
            <SpendingVsBudgetPanel points={data.spendingVsBudget} />
          </div>
        </div>

        {}
        <div className="flex flex-col gap-6">

          {}
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-4">
              <Bell className="w-3.5 h-3.5 text-[var(--text-main)]" />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Budget Alerts</h3>
              {data.alerts.some(a => a.severity === 'critical') && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--expense-red)] animate-pulse" />
              )}
            </div>
            <BudgetAlertsPanel alerts={data.alerts} />
          </div>

          {}
          <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">AI Budget Suggestions</h3>
            </div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              AI budget suggestions are not configured for this database.
            </p>
            <AiBudgetSuggestionsPanel suggestions={data.aiSuggestions} />
          </div>
        </div>
      </div>

      {}
      <BudgetFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editBudget={editingBudget}
        categories={categories}
      />
    </div>
  )
}
