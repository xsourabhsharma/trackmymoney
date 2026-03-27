'use client'

import React, { useState, useTransition, useOptimistic } from 'react'
import { MoreHorizontal, Pause, Play, Download, Trash2, ArrowUpDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { SubscriptionRow } from '@/app/dashboard/subscriptions/data'
import { pauseSubscriptions, deleteSubscriptions } from '@/app/dashboard/subscriptions/actions'
import { Button } from '@/components/ui/button'

interface SubscriptionsTableProps {
  subscriptions: SubscriptionRow[]
  totalCount: number
  page: number
  pageSize: number
  onEdit: (sub: SubscriptionRow) => void
}

export function SubscriptionsTable({
  subscriptions,
  totalCount,
  page,
  pageSize,
  onEdit
}: SubscriptionsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

 
  const [optimisticSubs, setOptimisticSubs] = useOptimistic(
    subscriptions,
    (state, info: { type: 'pause' | 'delete', ids: string[] }) => {
      if (info.type === 'delete') {
        return state.filter(s => !info.ids.includes(s.id))
      }
      if (info.type === 'pause') {
        return state.map(s => info.ids.includes(s.id) ? { ...s, status: 'paused' as const } : s)
      }
      return state
    }
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(optimisticSubs.map(s => s.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  const handleBulkPause = () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      setOptimisticSubs({ type: 'pause', ids })
      await pauseSubscriptions(ids)
      setSelectedIds(new Set())
    })
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Permanently delete ${selectedIds.size} subscriptions?`)) return
    
    const ids = Array.from(selectedIds)
    startTransition(async () => {
      setOptimisticSubs({ type: 'delete', ids })
      await deleteSubscriptions(ids)
      setSelectedIds(new Set())
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {}
      <div className="flex items-center justify-between py-2 border-b border-[var(--border-light)] min-h-[40px]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--accent)] focus:ring-0 cursor-pointer"
              checked={selectedIds.size === optimisticSubs.length && optimisticSubs.length > 0} 
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </label>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkPause}
                disabled={isPending}
                className="h-7 rounded-full border-[var(--border-light)] text-[#FF9800] hover:bg-[#FF9800]/10 text-[12px] font-bold uppercase tracking-widest px-3"
              >
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
              <div className="h-4 w-[1px] bg-[var(--border-light)] mx-1"></div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkDelete}
                disabled={isPending}
                className="h-7 rounded-full border-[var(--expense-red)] text-[var(--expense-red)] hover:bg-[var(--expense-red)] hover:text-white text-[12px] font-bold uppercase tracking-widest px-3"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-light)] text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <th className="py-4 px-4 w-12"></th>
              <th className="py-4 px-4 whitespace-nowrap min-w-[200px]">Service</th>
              <th className="py-4 px-4 whitespace-nowrap text-right">Cost</th>
              <th className="py-4 px-4 whitespace-nowrap">Cadence</th>
              <th className="py-4 px-4 whitespace-nowrap">Status</th>
              <th className="py-4 px-4 whitespace-nowrap">Next Charge</th>
              <th className="py-4 px-4 whitespace-nowrap text-center">Score</th>
              <th className="py-4 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {optimisticSubs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest">
                  No Subscriptions Found Matching Filters.
                </td>
              </tr>
            ) : (
              optimisticSubs.map((sub) => {
                const isPaused = sub.status === 'paused'
                const isCancelled = sub.status === 'cancelled'
                
                return (
                  <tr key={sub.id} className={`group border-b border-[var(--border-light)] hover:bg-[var(--bg-muted)] transition-colors ${isCancelled ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        value={sub.id} 
                        checked={selectedIds.has(sub.id)}
                        onChange={(e) => handleSelectOne(sub.id, e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {sub.categoryIcon && (
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-[14px]">
                            {sub.categoryIcon}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[var(--text-main)] mb-0.5" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                            {sub.serviceName || sub.merchant}
                          </p>
                          {sub.categoryName && (
                            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{sub.categoryName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className={`text-sm font-light ${isPaused ? 'text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                        ${sub.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate max-w-[120px]">
                        {sub.interval}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${
                        sub.status === 'active' ? 'bg-[var(--income-green)]/10 text-[var(--income-green)] border-[var(--income-green)]/30' : 
                        sub.status === 'paused' ? 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/30' : 
                        'bg-[var(--border-light)] text-[var(--text-muted)] border-[var(--border-light)]'
                      }`}>
                        {sub.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                        {sub.status}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {sub.nextChargeDate ? (
                        <p className="text-[11px] font-medium text-[var(--text-main)] truncate">
                          {format(parseISO(sub.nextChargeDate), 'MMM d, yyyy')}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[var(--text-muted)]">-</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                     <p className={`text-[11px] font-bold ${
                        (sub.usageScore ?? null) !== null && (sub.usageScore as number) < 30 ? 'text-[var(--expense-red)]' : 
                        (sub.usageScore ?? null) !== null && (sub.usageScore as number) > 80 ? 'text-[var(--income-green)]' : 'text-[var(--text-muted)]'
                      }`}>
                        {(sub.usageScore ?? null) !== null ? `${sub.usageScore}` : '--'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => onEdit(sub)}
                        className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text-main)] transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Row"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
