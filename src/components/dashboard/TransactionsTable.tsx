'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import { format } from 'date-fns'
import {
  ArrowUpDown,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FolderOpen,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditTransactionButton } from '@/components/dashboard/EditTransactionButton'
import { DeleteTransactionButton } from '@/components/dashboard/DeleteTransactionButton'
import { CategoryIcon } from '@/components/dashboard/CategoryIcon'
import { bulkDeleteTransactions } from '@/app/dashboard/transactions/bulk-actions'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { TransactionRow } from '@/app/dashboard/transactions/data'

type TableTransaction = TransactionRow & {
  receipt_url?: string | null
}

interface TableCategory {
  id: string
  name: string
  icon?: string | null
  type?: string | null
}

interface TableAccount {
  id: string
  name: string
}

export function TransactionsTable({
  transactions,
  categories,
  accounts = [],
  totalCount,
  currentPage,
  pageSize
}: {
  transactions: TableTransaction[],
  categories: TableCategory[],
  accounts?: TableAccount[],
  totalCount: number,
  currentPage: number,
  pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const { fmt } = useCurrency()

  const [optimisticTransactions, removeOptimisticTransactions] = useOptimistic(
    transactions,
    (state, idsToRemove: string[]) => state.filter((tx) => !idsToRemove.includes(tx.id))
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const sortCol = searchParams.get('sort') || 'date'
  const sortDir = searchParams.get('dir') || 'desc'

  const handleSort = (col: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newDir = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc'
    params.set('sort', col)
    params.set('dir', newDir)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(optimisticTransactions.map((t) => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} transactions?`)) return

    setIsDeleting(true)
    const idsToDelete = Array.from(selectedIds)

    startTransition(() => {
      removeOptimisticTransactions(idsToDelete)
    })

    try {
      await bulkDeleteTransactions(idsToDelete)
      setSelectedIds(new Set())
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete transactions")
    } finally {
      setIsDeleting(false)
    }
  }

  const [isExporting, setIsExporting] = useState(false)

  const handleExportSelected = async () => {
    if (selectedIds.size === 0) return
    setIsExporting(true)

    try {
      const response = await fetch('/api/export/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `track_my_money_transactions_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
      alert('Failed to export CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-[var(--accent)]" /> : <ArrowDown className="w-3 h-3 text-[var(--accent)]" />
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex flex-col gap-4">
      {}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[var(--border-light)] mb-2">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-tight cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--text-main)] focus:ring-0 cursor-pointer"
              checked={selectedIds.size === optimisticTransactions.length && optimisticTransactions.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Select all
          </label>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="h-8 rounded-full border-[var(--expense-red)] text-[var(--expense-red)] hover:bg-[var(--expense-red)] hover:text-white text-[12px] font-bold uppercase tracking-widest"
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                {isDeleting ? "Wiping..." : "Delete Selected"}
              </Button>
              <div className="h-4 w-[1px] bg-[var(--border-light)] mx-1"></div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                disabled={isExporting}
                className="h-8 rounded-full border-[var(--border-light)] bg-[var(--text-main)] text-[var(--bg-base)] text-[12px] font-bold uppercase tracking-widest hover:bg-[var(--text-main)]/90"
              >
                <Download className="w-3 h-3 mr-1.5" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="tm-table">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--border-light)] bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-hover)]">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead
                  className="cursor-pointer p-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">Date <SortIcon col="date" /></div>
                </TableHead>
                <TableHead
                  className="cursor-pointer p-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                  onClick={() => handleSort('merchant')}
                >
                  <div className="flex items-center gap-2">Merchant / Description <SortIcon col="merchant" /></div>
                </TableHead>
                <TableHead className="p-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Category</TableHead>
                <TableHead className="p-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Type</TableHead>
                <TableHead className="p-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Account</TableHead>
                <TableHead
                  className="cursor-pointer p-4 text-right font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">Amount <SortIcon col="amount" /></div>
                </TableHead>
                <TableHead className="p-4 text-right font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimisticTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--accent)]">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">No transactions match your filters</span>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => router.push('/dashboard/transactions')}
                          className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-main)] transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                optimisticTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group hover:bg-[var(--bg-surface)] transition-all border-b border-[var(--border-light)]/50 last:border-0">
                    <TableCell className="p-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[var(--border-light)] text-[var(--text-main)] focus:ring-0 cursor-pointer"
                        checked={selectedIds.has(tx.id)}
                        onChange={(e) => handleSelectOne(e.target.checked, tx.id)}
                      />
                    </TableCell>
                    <TableCell className="p-4 text-[11px] font-bold tabular-nums text-[var(--text-main)] uppercase tracking-tight">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-8 w-8 rounded-lg group-hover:scale-110 transition-transform" icon={tx.categories?.icon} name={tx.categories?.name} />
                        <div className="flex flex-col overflow-hidden max-w-[180px]">
                          <span className="text-[12px] font-bold truncate text-[var(--text-main)] uppercase tracking-tight">{tx.merchant}</span>
                          {tx.description && (
                            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest truncate">{tx.description}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg">
                        <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-widest">{tx.categories?.name || 'General'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tighter border ${
                        tx.type === 'income' ? 'bg-green-50 text-[var(--income-green)] border-green-100' : 'bg-red-50 text-[var(--expense-red)] border-red-100'
                      }`}>
                        {tx.type}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {tx.accountName || '-'}
                    </TableCell>
                    <TableCell className={`p-4 text-right text-[13px] font-bold tabular-nums tracking-tighter ${
                      tx.type === 'income' ? 'text-[var(--income-green)]' : 'text-[var(--text-main)]'
                    }`}>
                      {tx.type === 'income' ? '+ ' : '- '}{fmt(Number(tx.amount), tx.currency)}
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tx.receipt_url && (
                          <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white rounded-md text-[var(--text-muted)] hover:text-blue-600 transition-colors border border-transparent hover:border-[var(--border-light)] shadow-sm" title="View Receipt">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <EditTransactionButton transaction={tx} categories={categories} accounts={accounts} />
                        <DeleteTransactionButton id={tx.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2">
        <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 w-8 p-0 rounded-lg border-[var(--border-light)] hover:bg-[var(--bg-surface)] disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 px-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`h-8 min-w-[32px] px-2 rounded-lg text-[11px] font-bold transition-all border ${
                    currentPage === p
                      ? 'bg-[var(--text-main)] text-[var(--bg-base)] border-[var(--text-main)] shadow-sm'
                      : 'bg-transparent text-[var(--text-muted)] border-transparent hover:border-[var(--border-light)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            {totalPages > 5 && <span className="px-1 text-[var(--text-muted)] text-xs">...</span>}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 w-8 p-0 rounded-lg border-[var(--border-light)] hover:bg-[var(--bg-surface)] disabled:opacity-30 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
