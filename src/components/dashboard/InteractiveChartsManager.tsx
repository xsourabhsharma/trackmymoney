'use client'

import { useState } from 'react'
import { ExpenseDonutChart } from './charts/ExpenseDonutChart'
import { CashFlowChart } from './charts/CashFlowChart'
import { TransactionDrillDown } from './TransactionDrillDown'
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: string
  merchant: string | null
  date: string
  type: 'income' | 'expense'
  categories?: {
    name: string
    icon: string | null
    color: string | null
  } | null
}

interface Props {
  donutData: any[]
  donutTotal: number
  cashFlowData: any[]
  transactions: Transaction[]
}

export function InteractiveChartsManager({ donutData, donutTotal, cashFlowData, transactions }: Props) {
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null)
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false)

  const handleSectorClick = (categoryName: string) => {
    setDrillDownCategory(categoryName)
    setIsDrillDownOpen(true)
  }

  const closeDrillDown = () => {
    setIsDrillDownOpen(false)
    setTimeout(() => setDrillDownCategory(null), 300)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm flex flex-col items-center justify-between min-h-[400px]">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5" /> Expense Breakdown
            </h3>
            <Link href="/dashboard/reports" className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">
              Full Report →
            </Link>
          </div>
          <ExpenseDonutChart 
            data={donutData} 
            total={donutTotal} 
            onSectorClick={handleSectorClick}
          />
          {donutData.length > 0 && (
            <p className="mt-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center opacity-60">
              Click any segment to drill down into category details
            </p>
          )}
        </div>

        {/* Capital Flow */}
        <div className="bg-[var(--bg-base)] rounded-[24px] border border-[var(--border-light)] p-6 shadow-sm flex flex-col min-h-[400px]">
          <div className="w-full flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Cash Flow
            </h3>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--income-green)]" />
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--expense-red)] opacity-60" />
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Expense</span>
              </div>
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <CashFlowChart data={cashFlowData} />
          </div>
        </div>
      </div>

      <TransactionDrillDown 
        isOpen={isDrillDownOpen} 
        onClose={closeDrillDown} 
        categoryName={drillDownCategory} 
        transactions={transactions}
      />
    </>
  )
}
