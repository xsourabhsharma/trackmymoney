'use client'

import { motion, Variants } from 'framer-motion'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const transactions = [
  { emoji: '🛒', name: 'Whole Foods Market', cat: 'Groceries', date: 'Mar 15', amount: '-₹4,280', color: 'var(--expense-red)' },
  { emoji: '💼', name: 'Client Payment (Acme)', cat: 'Income', date: 'Mar 14', amount: '+₹42,250', color: 'var(--income-green)' },
  { emoji: '🎬', name: 'Netflix Premium', cat: 'Subscriptions', date: 'Mar 12', amount: '-₹649', color: 'var(--expense-red)' },
  { emoji: '🏠', name: 'Rent Transfer', cat: 'Housing', date: 'Mar 10', amount: '-₹18,000', color: 'var(--expense-red)' },
  { emoji: '💳', name: 'Freelance (Figma Co.)', cat: 'Income', date: 'Mar 8', amount: '+₹28,500', color: 'var(--income-green)' },
]

const budgets = [
  { name: 'Groceries', spent: 6500, total: 10000, color: 'var(--income-green)' },
  { name: 'Dining Out', spent: 4400, total: 5000, color: 'var(--warning)' },
  { name: 'Transport', spent: 1200, total: 3000, color: 'var(--income-green)' },
  { name: 'Entertainment', spent: 2800, total: 3000, color: 'var(--expense-red)' },
]

export default function DemoSection() {
  return (
    <section id="demo" className="py-[80px] md:py-[120px] bg-[var(--bg-base)]">
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-[600px] mx-auto mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-[var(--income-green)] font-bold mb-4">
            Product Preview
          </div>
          <h2 className="text-[2rem] md:text-[2.75rem] font-bold mb-4 leading-tight tracking-tight text-[var(--text-main)]">
            Your money, one clean dashboard
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Everything you need at a glance: balances, transactions, budgets, and trends. All illustrative data below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[var(--bg-surface)] rounded-[24px] border border-[var(--border-light)] shadow-2xl shadow-black/5 overflow-hidden"
        >
          {/* Top bar */}
          <div className="px-5 py-3 border-b border-[var(--border-light)] flex items-center gap-2">
            <span className="w-[10px] h-[10px] rounded-full bg-[#FF6B6B]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#FFD93D]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#6BCB77]" />
            <span className="ml-3 text-[12px] text-[var(--text-muted)] font-medium tracking-wide">Dashboard · March 2026</span>
          </div>

          <div className="p-5 md:p-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Balance', value: '₹1,24,580', sub: '+12.3% vs last month', color: 'var(--text-main)', subColor: 'var(--income-green)' },
                { label: "This Month's Income", value: '₹70,750', sub: 'From 3 sources', color: 'var(--income-green)', subColor: 'var(--text-muted)' },
                { label: "This Month's Spending", value: '₹29,329', sub: '41% of income', color: 'var(--expense-red)', subColor: 'var(--text-muted)' },
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-5 bg-[var(--bg-base)] rounded-2xl border border-[var(--border-light)]"
                >
                  <div className="text-[12px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-2">
                    {c.label}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: c.color }}>
                    {c.value}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: c.subColor }}>
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Income vs Expenses bar */}
            <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-light)] p-5 mb-6">
              <div className="text-[12px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-4">
                Income vs Expenses · March
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16 shrink-0">Income</span>
                  <div className="flex-grow h-5 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg bg-[var(--income-green)]" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs font-bold w-16 text-right">₹70,750</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16 shrink-0">Expenses</span>
                  <div className="flex-grow h-5 bg-[var(--bg-surface)] rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg bg-[var(--expense-red)]" style={{ width: '41.5%' }} />
                  </div>
                  <span className="text-xs font-bold w-16 text-right">₹29,329</span>
                </div>
              </div>
            </div>

            {/* Bottom: transactions + budgets */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Transactions */}
              <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-light)] p-5">
                <div className="text-[12px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3">
                  Recent Transactions
                </div>
                <div className="flex flex-col gap-2">
                  {transactions.map((tx) => (
                    <div key={tx.name + tx.date} className="flex items-center gap-3 text-[13px] py-2 border-b border-[var(--border-light)]/50 last:border-0">
                      <span className="w-8 h-8 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center text-sm">
                        {tx.emoji}
                      </span>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium truncate">{tx.name}</div>
                        <div className="text-[12px] text-[var(--text-muted)]">{tx.cat} · {tx.date}</div>
                      </div>
                      <span className="font-semibold shrink-0" style={{ color: tx.color }}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budgets */}
              <div className="bg-[var(--bg-base)] rounded-2xl border border-[var(--border-light)] p-5">
                <div className="text-[12px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-3">
                  Budget Progress
                </div>
                <div className="flex flex-col gap-4">
                  {budgets.map((b) => {
                    const pct = Math.round((b.spent / b.total) * 100)
                    return (
                      <div key={b.name}>
                        <div className="flex justify-between text-[13px] mb-1.5">
                          <span className="font-medium">{b.name}</span>
                          <span className="text-[var(--text-muted)]">
                            ₹{b.spent.toLocaleString()} / ₹{b.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: b.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-[var(--text-muted)] mt-4 italic">
          * All data above is illustrative. Your real dashboard will reflect your actual finances.
        </p>
      </div>
    </section>
  )
}
