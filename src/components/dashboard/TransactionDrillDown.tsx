'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Calendar, Receipt, DollarSign, Tag } from 'lucide-react'
import { format } from 'date-fns'

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
  isOpen: boolean
  onClose: () => void
  categoryName: string | null
  transactions: Transaction[]
}

export function TransactionDrillDown({ isOpen, onClose, categoryName, transactions }: Props) {
  const filtered = transactions.filter(t => 
    categoryName ? t.categories?.name === categoryName : true
  )
  const total = filtered.reduce((s, t) => s + parseFloat(t.amount), 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-[var(--bg-base)] shadow-2xl z-[60] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-surface)]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-1 flex items-center gap-2">
                  Analytics <ArrowRight className="w-3 h-3" /> {categoryName}
                </h3>
                <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-loose">
                  Detailed transaction history for this category
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center hover:bg-[var(--bg-surface)] transition-all active:scale-95"
              >
                <X className="w-5 h-5 text-[var(--text-main)]" />
              </button>
            </div>

            {/* Summary Block */}
            <div className="p-6 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-base)] border-b border-[var(--border-light)]">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]">Target Allocation Spent</p>
                    <p className="text-2xl font-bold tracking-tighter text-[var(--text-main)]">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]">Data Points</p>
                    <p className="text-xl font-bold tracking-tighter text-[var(--text-main)]">{filtered.length}</p>
                  </div>
               </div>
            </div>

            {/* Transaction List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[var(--bg-surface)]/20">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-40">
                   <Receipt className="w-10 h-10 mb-3" />
                   <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">No historical entries</p>
                </div>
              ) : (
                filtered.map((t) => (
                  <motion.div 
                    layout
                    key={t.id}
                    className="p-4 bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                          {t.categories?.icon || '📦'}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tight">{t.merchant || t.categories?.name || 'Unknown'}</p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)] uppercase">
                              <Calendar className="w-3 h-3" /> {format(new Date(t.date), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)] uppercase opacity-60">
                              <Tag className="w-3 h-3" /> {t.categories?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className={`text-sm font-bold tracking-tight ${t.type === 'expense' ? 'text-[var(--expense-red)]' : 'text-[var(--income-green)]'}`}>
                          {t.type === 'expense' ? '-' : '+'}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] text-[7px] font-bold uppercase tracking-wider">Review</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-light)] bg-[var(--bg-base)]">
               <button 
                onClick={onClose}
                className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
               >
                 Close Drill-Down view
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
