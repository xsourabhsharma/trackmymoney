'use client'

import React, { useState } from 'react'
import { PiggyBank, RefreshCw, Activity, ArrowRight } from 'lucide-react'
import type { SubscriptionsOverviewMetrics } from '@/app/dashboard/subscriptions/data'

interface SubscriptionsOverviewProps {
  metrics: SubscriptionsOverviewMetrics
}

export function SubscriptionsOverview({ metrics }: SubscriptionsOverviewProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')

  const multiplier = viewMode === 'yearly' ? 12 : 1
  
  const displayOutflow = metrics.totalMonthlyOutflow * multiplier
  const displaySavings = metrics.potentialSavingsMonthly * multiplier

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase">Subscriptions Overview</h2>
        
        {/* Toggle Mode */}
        <div className="flex items-center bg-[var(--bg-muted)] p-1 rounded-full border border-[var(--border-light)]">
          <button 
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'monthly' ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'yearly' ? 'bg-[var(--text-main)] text-[var(--bg-base)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Outflow Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] relative overflow-hidden group hover:border-[var(--expense-red)]/30 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <RefreshCw className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">{viewMode} Outflow</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-light tracking-tight text-[var(--text-main)]">
              ${displayOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-light)]">
            <Activity className="w-3 h-3 text-[var(--expense-red)]" />
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Recurring Drain</span>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] relative overflow-hidden group hover:border-[var(--accent)]/30 transition-colors">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Active Subscriptions</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-light tracking-tight text-[var(--text-main)]">
              {metrics.activeCount}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-muted)] border border-[var(--border-light)]">
            <span className="w-2 h-2 rounded-full bg-[var(--income-green)] animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Tracking Live</span>
          </div>
        </div>

        {/* Potential Savings Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] border-b-4 border-b-[var(--income-green)] relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-[var(--income-green)]">
            <PiggyBank className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-bold text-[var(--income-green)] uppercase tracking-[0.2em] mb-2">Potential Savings</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-light tracking-tight text-[var(--text-main)]">
              ${displaySavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--income-green)]/10 border border-[var(--income-green)]/20 text-[var(--income-green)] cursor-pointer hover:bg-[var(--income-green)]/20 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-wider">Review Underutilized</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
