'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CsvImporter } from '@/components/dashboard/CsvImporter'
import { ReceiptScanner } from '@/components/dashboard/ReceiptScanner'
import { Sparkles, FileSpreadsheet, Zap, Camera, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { ImportJob } from '@/lib/types'

interface RecentJob {
  id: string
  file_path: string | null
  row_count: number
  status: string
  created_at: string
  completed_at: string | null
}

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: string
}

interface Account {
  id: string
  name: string
  type: string
  color: string | null
}

export function AutoParseClientWrapper({ 
  initialJob, 
  categories = [], 
  accounts = [], 
  recentJobs = [] 
}: { 
  initialJob: ImportJob | null
  categories?: Category[]
  accounts?: Account[]
  recentJobs?: RecentJob[]
}) {
  const [activeTab, setActiveTab] = useState<'csv' | 'receipt'>('csv')

  return (
    <div className="flex flex-col gap-8">
      {/* Tab Headers */}
      <div className="flex p-1 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('csv')}
          className={`relative px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'csv' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          {activeTab === 'csv' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[var(--bg-base)] border border-[var(--border-light)] shadow-sm rounded-xl" />
          )}
          <span className="relative z-10"><FileText className="w-3.5 h-3.5" /></span>
          <span className="relative z-10">CSV Importer</span>
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`relative px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'receipt' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          {activeTab === 'receipt' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[var(--bg-base)] border border-[var(--border-light)] shadow-sm rounded-xl" />
          )}
          <span className="relative z-10"><Camera className="w-3.5 h-3.5" /></span>
          <span className="relative z-10">Receipt Scanner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.5fr] gap-8">
        {/* Left Column: Info & Instructions */}
        {!initialJob || initialJob.status === 'pending' || initialJob.status === 'failed' ? (
          <div className="flex flex-col gap-6">
            <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 text-[var(--accent)]">
                <Sparkles className="w-5 h-5" /> 
                {activeTab === 'csv' ? 'CSV Auto-Parse' : 'AI Receipt Scanning'}
              </h2>
              <p className="text-[12px] font-medium text-[var(--text-muted)] leading-relaxed mb-6">
                {activeTab === 'csv' 
                  ? "Drop in a raw CSV export from any bank, and our AI will automatically classify merchants and assign categories in seconds."
                  : "Snap a photo of any receipt. Our Vision AI extracts the merchant, date, and amount with human-level accuracy."}
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center shrink-0">
                    {activeTab === 'csv' ? <FileSpreadsheet className="w-4 h-4 text-[var(--text-main)]" /> : <Camera className="w-4 h-4 text-[var(--text-main)]" />}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider mb-1">
                      {activeTab === 'csv' ? '1. Export' : '1. Capture'}
                    </h4>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] leading-loose">
                      {activeTab === 'csv' ? 'Download a CSV from your banking portal.' : 'Take a clear photo of your receipt.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-light)] flex items-center justify-center shrink-0 text-xl">
                    👇
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider mb-1">2. Process</h4>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] leading-loose">
                      {activeTab === 'csv' ? 'Drag the file into the parsing zone.' : 'Upload the image for AI analysis.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--text-main)] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[var(--bg-base)]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-wider mb-1">3. Automate</h4>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] leading-loose">The AI categorizes everything and saves it directly to your history.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Right Column: Interactive Zone */}
        <div className={`flex flex-col h-full ${initialJob && initialJob.status !== 'pending' && initialJob.status !== 'failed' ? 'xl:col-span-2' : ''}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'csv' ? (
              <motion.div
                key="csv"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <CsvImporter 
                  initialJob={initialJob} 
                  categories={categories}
                  accounts={accounts}
                />
              </motion.div>
            ) : (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ReceiptScanner />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent Imports Section */}
      {recentJobs.length > 0 && (
        <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Recent Imports
          </h3>
          <div className="divide-y divide-[var(--border-light)]">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    job.status === 'completed' ? 'bg-[var(--income-green)]/10' : 
                    job.status === 'failed' ? 'bg-[var(--expense-red)]/10' : 'bg-[var(--bg-surface)]'
                  }`}>
                    {job.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--income-green)]" /> : 
                     job.status === 'failed' ? <XCircle className="w-3.5 h-3.5 text-[var(--expense-red)]" /> :
                     <AlertCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-[var(--text-main)]">{job.file_path || 'Unknown file'}</span>
                    <span className="text-[10px] text-[var(--text-muted)] ml-2">{job.row_count} rows</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  {job.status === 'completed' && (
                    <a href="/dashboard/transactions" className="text-[10px] font-bold text-[var(--accent)] hover:underline uppercase tracking-wider">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
