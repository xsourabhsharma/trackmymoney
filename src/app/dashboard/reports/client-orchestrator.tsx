'use client'

import { useState } from 'react'
import { ReportsPageData, ReportsFilter } from '@/app/dashboard/reports/data'
import { ReportsFilterBar } from '@/components/dashboard/reports/ReportsFilterBar'
import { ReportsSummaryCards } from '@/components/dashboard/reports/ReportsSummaryCards'
import { CashFlowChartSection } from '@/components/dashboard/reports/CashFlowChartSection'
import { SpendingByCategorySection } from '@/components/dashboard/reports/SpendingByCategorySection'
import {
  TopCategoriesSection,
  TopMerchantsSection,
  PeriodComparisonSection,
} from '@/components/dashboard/reports/ReportsAnalyticsSections'
import { ReportsExportsSection } from '@/components/dashboard/reports/ReportsExportsSection'
import { Activity, BarChart3, Tag, Store, GitCompare, Download } from 'lucide-react'

interface Props {
  initialData: ReportsPageData
}

export function ReportsClientOrchestrator({ initialData }: Props) {
  const [filter, setFilter] = useState<ReportsFilter>(initialData.filter)
  const data = initialData

  function handleFilterChange(partial: Partial<ReportsFilter>) {
    setFilter(prev => ({ ...prev, ...partial }))
    // NOTE: For real-time filter updates, you'd trigger a server-side fetch here.
    // With Next.js 14, the simplest approach is router.push with searchParams.
    // For now, the page re-renders on navigation with the updated filter.
  }

  const showGoals = filter.view === 'summary' || filter.view === 'detailed'
  const showTax = filter.view === 'tax'
  const isDetailed = filter.view === 'detailed'

  return (
    <div className="flex flex-col gap-8">
      {/* ── Filter Bar + Summary ────────────────────────────────── */}
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
        <ReportsFilterBar filter={filter} onChangeFilter={handleFilterChange} />
        <div className="pt-4 border-t border-[var(--border-light)]">
          <ReportsSummaryCards summary={data.summary} />
        </div>
      </div>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Cash Flow */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-light)]">
            <Activity className="w-4 h-4 text-[var(--income-green)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Cash Flow Over Time</h2>
          </div>
          <CashFlowChartSection points={data.cashFlowSeries} comparison={data.periodComparison} />
        </div>

        {/* Spending by Category */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-light)]">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Spending by Category</h2>
          </div>
          <SpendingByCategorySection data={data.categorySpending} />
        </div>
      </div>

      {/* ── Analytics Tables ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-8">
        {/* Top Categories */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-5">
            <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Top Categories</h2>
            <span className="ml-auto text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border-light)]">
              This Period
            </span>
          </div>
          <TopCategoriesSection topCategories={data.topCategories} totalExpenses={data.summary.periodExpenses} />
        </div>

        {/* Top Merchants */}
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-5">
            <Store className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Top Merchants</h2>
          </div>
          <div className="overflow-x-auto">
            <TopMerchantsSection merchants={data.topMerchants} />
          </div>
        </div>
      </div>

      {/* ── Period Comparison ──────────────────────────────────────── */}
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-6">
          <GitCompare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">This Period vs Last Period</h2>
        </div>
        <PeriodComparisonSection comparison={data.periodComparison} />
      </div>

      {/* ── Exports ────────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-[var(--border-light)] mb-6">
          <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)]">Reports & Exports</h2>
        </div>
        <ReportsExportsSection filter={filter} />
      </div>
    </div>
  )
}
