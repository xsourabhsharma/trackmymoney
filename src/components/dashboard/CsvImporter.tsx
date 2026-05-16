'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2, Sparkles, X, ArchiveRestore } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'
import { ImportJob, ImportRow } from '@/lib/types'
import { getImportJobDetails, updateImportRow, cancelImportJob } from '@/app/dashboard/auto-parse/actions'
import { IMPORT_CSV_MAX_FILE_SIZE_BYTES, IMPORT_CSV_MAX_FILE_SIZE_LABEL } from '@/lib/import/constants'

interface CategoryItem {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: string
}

interface AccountItem {
  id: string
  name: string
  type: string
  color: string | null
}

interface UploadResponse {
  jobId?: string
  rowCount?: number
  error?: string
}

interface CommitResponse {
  importedCount?: number
  duplicateSkippedCount?: number
  warnings?: string[]
  error?: string
}

export function CsvImporter({ 
  initialJob,
  categories = [],
  accounts = []
}: { 
  initialJob: ImportJob | null
  categories?: CategoryItem[]
  accounts?: AccountItem[]
}) {
  const [job, setJob] = useState<ImportJob | null>(initialJob)
  const [rows, setRows] = useState<ImportRow[]>([])
  
 
  const [isUploading, setIsUploading] = useState(false)
  const [isAiRunning, setIsAiRunning] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  
  const { addToast } = useToast()

 
  const loadJobData = useCallback(async (jobId: string) => {
    try {
      const data = await getImportJobDetails(jobId)
      setJob(data.job)
      setRows(data.rows)
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load active import job."))
    }
  }, [])

  useEffect(() => {
    if (job && job.status !== 'pending' && job.status !== 'failed' && rows.length === 0) {
      loadJobData(job.id)
    }
  }, [job, rows.length, loadJobData])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    const selected = acceptedFiles[0]
    if (!selected) return

    if (selected.type !== 'text/csv' && !selected.name.toLowerCase().endsWith('.csv')) {
      setError("Please drop a valid .csv file")
      return
    }

    if (selected.size > IMPORT_CSV_MAX_FILE_SIZE_BYTES) {
      setError(`File too large. Max ${IMPORT_CSV_MAX_FILE_SIZE_LABEL}.`)
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selected)

    try {
      const res = await fetch('/api/ai/auto-parse/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json() as UploadResponse
      
      if (!res.ok) throw new Error(data.error || "Failed to upload CSV.")
      if (!data.jobId || typeof data.rowCount !== 'number') throw new Error("Upload response was incomplete.")
      
      addToast(`Successfully parsed ${data.rowCount} rows.`, "success")
      await loadJobData(data.jobId)
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload CSV."))
    } finally {
      setIsUploading(false)
    }
  }, [addToast, loadJobData])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: IMPORT_CSV_MAX_FILE_SIZE_BYTES
  })

  const runAiCategorization = async () => {
    if (!job) return
    setIsAiRunning(true)
    
    try {
      let active = true;
      while (active) {
        const res = await fetch('/api/ai/auto-parse/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ importJobId: job.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        
        if (data.remaining === 0) {
          active = false
        }
      }
      addToast("AI Categorization complete!", "success")
      await loadJobData(job.id)
    } catch (err: unknown) {
       addToast(getErrorMessage(err, "Failed to categorize rows."), "error")
    } finally {
      setIsAiRunning(false)
    }
  }

  const toggleRowSelection = async (rowId: string, currentStatus: boolean) => {
     setRows(prev => prev.map(r => r.id === rowId ? { ...r, is_selected_for_import: !currentStatus } : r))
     await updateImportRow(rowId, { is_selected_for_import: !currentStatus })
  }

  const handleTypeChange = async (rowId: string, newType: 'income' | 'expense') => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, parsed_type: newType } : r))
    await updateImportRow(rowId, { parsed_type: newType })
  }

  const handleCategoryChange = async (rowId: string, newCategoryId: string) => {
    const cat = categories.find(c => c.id === newCategoryId)
    setRows(prev => prev.map(r => r.id === rowId ? { 
      ...r, 
      parsed_category_id: newCategoryId || null,
      categories: cat ? { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color } : null
    } : r))
    await updateImportRow(rowId, { parsed_category_id: newCategoryId || null })
  }

  const cancelJob = async () => {
    if (!job) return
    await cancelImportJob(job.id)
    setJob(null)
    setRows([])
    setError(null)
  }

  const commitImport = async () => {
    if (!job) return
    setIsCommitting(true)
    try {
      const res = await fetch('/api/ai/auto-parse/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importJobId: job.id, accountId: selectedAccountId || null }),
      })
      const data = await res.json() as CommitResponse
      if (!res.ok) throw new Error(data.error || "Failed to commit import.")
      
      addToast(`Imported ${data.importedCount ?? 0} transactions. Skipped ${data.duplicateSkippedCount ?? 0} duplicates.`, "success")
      if (data.warnings && data.warnings.length > 0) {
        addToast(data.warnings.join(' '), "warning", 7000)
      }
      setJob({ ...job, status: 'completed' })
    } catch (err: unknown) {
      addToast(getErrorMessage(err, "Failed to commit import."), "error")
    } finally {
      setIsCommitting(false)
    }
  }

 
  const selectedCount = rows.filter(r => r.is_selected_for_import && !r.has_error).length
  const duplicatesCount = rows.filter(r => r.is_duplicate_guess).length
  const errorsCount = rows.filter(r => r.has_error).length
  const uncategorizedCount = rows.filter(r => r.is_selected_for_import && !r.has_error && !r.parsed_category_id).length
  
  const totalIncome = rows.filter(r => r.is_selected_for_import && !r.has_error && r.parsed_type === 'income').reduce((sum, r) => sum + (r.parsed_amount || 0), 0)
  const totalExpense = rows.filter(r => r.is_selected_for_import && !r.has_error && r.parsed_type === 'expense').reduce((sum, r) => sum + (r.parsed_amount || 0), 0)

  if (job?.status === 'completed') {
    return (
      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-8 flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-16 h-16 rounded-full bg-[var(--income-green)]/10 flex items-center justify-center mb-6">
           <CheckCircle2 className="w-8 h-8 text-[var(--income-green)]" />
         </div>
         <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Import Successful</h2>
         <p className="text-[13px] text-[var(--text-muted)] text-center max-w-md mb-8">
           All selected transactions have been added to your ledger. You can now view them in the Transactions logs or see how they affect your Dashboard metrics.
         </p>
         <div className="flex gap-4">
           <button onClick={() => { setJob(null); setRows([]); }} className="px-6 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-light)] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors">
             Import Another File
           </button>
           <a href="/dashboard/transactions" className="px-6 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity">
             View Transactions
           </a>
         </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
      
      {}
      <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-surface)] flex justify-between items-center z-20 relative">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          {job ? <Sparkles className="w-4 h-4 text-[var(--accent)]" /> : <FileType className="w-4 h-4" />} 
          {job ? 'Review & Import' : 'Drop Zone'}
        </h3>
        {job && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[12px] uppercase font-bold tracking-widest">
              <span className={`w-2 h-2 rounded-full ${job.status === 'ready_for_review' ? 'bg-[var(--income-green)]' : 'bg-[var(--expense-red)] animate-pulse'}`}></span>
              {job.status.replace(/_/g, ' ')}
            </div>
            <button onClick={cancelJob} className="text-[12px] font-bold text-[var(--text-muted)] hover:text-[var(--expense-red)] transition-colors flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel Job
            </button>
          </div>
        )}
      </div>

      {}
      {!job ? (
       
        <div 
          {...getRootProps()} 
          className={`flex-grow m-6 border-2 border-dashed rounded-[16px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${
            isDragActive ? 'border-[var(--text-main)] bg-[var(--text-main)]/5' : 'border-[var(--border-light)] bg-[var(--bg-surface)]/30 hover:bg-[var(--bg-surface)] hover:border-[var(--border-dark)]'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] shadow-sm flex items-center justify-center mb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[var(--text-main)] animate-spin" />
            ) : (
              <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-[var(--text-main)] animate-bounce' : 'text-[var(--text-muted)]'}`} />
            )}
          </div>
          
          {isUploading ? (
             <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider mb-2 text-center">Uploading & Parsing...</p>
          ) : (
             <>
               <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider mb-2 text-center">
                 {isDragActive ? "Drop the CSV here..." : "Drag & Drop CSV"}
               </p>
               <p className="text-[11px] font-medium text-[var(--text-muted)] text-center max-w-[250px] leading-relaxed">
                 Supports standard CSV exports from Chase, Amex, BoA, and more.
               </p>
             </>
          )}

          {error && (
            <div className="mt-6 px-4 py-2 bg-[var(--expense-red)]/10 text-[var(--expense-red)] border border-[var(--expense-red)]/20 rounded-lg text-[12px] font-bold tracking-widest uppercase flex items-center gap-2">
               <AlertCircle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
        </div>
      ) : (
       
        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
          
          {}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-[var(--border-light)] relative">
            
            {}
            <div className="p-4 bg-[var(--bg-base)] border-b border-[var(--border-light)] flex items-center justify-between gap-4">
              <div className="flex gap-4">
                 <button 
                  onClick={runAiCategorization}
                  disabled={isAiRunning || job.status === 'ai_categorizing'}
                  className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-[12px] font-bold tracking-widest uppercase flex items-center gap-2 hover:border-[var(--text-main)] transition-colors disabled:opacity-50"
                 >
                   {isAiRunning ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3 text-[var(--accent)]" />}
                   {isAiRunning ? 'AI is sorting...' : 'Auto-Categorize'}
                 </button>
              </div>
              <div className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-4">
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--income-green)]"></div> Selected ({selectedCount})</span>
                 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--warn-yellow)]"></div> Duplicates ({duplicatesCount})</span>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="sticky top-0 bg-[var(--bg-surface)] z-10 shadow-sm">
                  <tr>
                    <th className="p-4 w-[50px] text-center"><ArchiveRestore className="w-4 h-4 text-[var(--text-muted)] mx-auto"/></th>
                    <th className="p-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Date</th>
                    <th className="p-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Merchant / Description</th>
                    <th className="p-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Type</th>
                    <th className="p-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Category</th>
                    <th className="p-4 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Loading rows...
                      </td>
                    </tr>
                  ) : rows.map((row) => {
                    const isLowConfidence = row.ai_confidence !== null && row.ai_confidence < 0.5
                    return (
                    <tr 
                      key={row.id} 
                      className={`group transition-colors ${
                        !row.is_selected_for_import ? 'bg-[var(--bg-surface)] opacity-50' : 'hover:bg-[var(--bg-surface)]'
                      } ${row.is_duplicate_guess ? 'border-l-4 border-l-[var(--warn-yellow)]' : ''} ${
                        isLowConfidence && row.is_selected_for_import ? 'border-l-4 border-l-[var(--accent)]' : !row.is_duplicate_guess ? 'border-l-4 border-l-transparent' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={row.is_selected_for_import}
                          onChange={() => toggleRowSelection(row.id, row.is_selected_for_import)}
                          className="w-4 h-4 accent-[var(--text-main)] cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">
                        {row.parsed_date ? row.parsed_date.substring(0, 10) : 'Invalid Date'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <span className="text-[12px] font-bold text-[var(--text-main)]">{row.parsed_merchant}</span>
                           {row.is_duplicate_guess && <span className="px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-bold bg-[var(--warn-yellow)]/20 text-[#b45309]">Duplicate</span>}
                           {isLowConfidence && <span className="px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-bold bg-[var(--accent)]/20 text-[var(--accent)]">Review</span>}
                           {row.ai_confidence !== null && row.ai_confidence > 0.8 && <Sparkles className="w-3 h-3 text-[var(--accent)] opacity-50" />}
                        </div>
                        {row.parsed_merchant !== row.parsed_description && (
                          <div className="text-[11px] font-medium text-[var(--text-muted)] truncate max-w-[250px] mt-0.5" title={row.parsed_description || ''}>
                            Raw: {row.parsed_description}
                          </div>
                        )}
                      </td>
                      {}
                      <td className="p-4">
                        <select
                          value={row.parsed_type || 'expense'}
                          onChange={(e) => handleTypeChange(row.id, e.target.value as 'income' | 'expense')}
                          className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-light)] text-[12px] uppercase font-bold tracking-widest text-[var(--text-main)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </td>
                      {}
                      <td className="p-4">
                        <select
                          value={row.parsed_category_id || ''}
                          onChange={(e) => handleCategoryChange(row.id, e.target.value)}
                          className="px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-light)] text-[12px] uppercase font-bold tracking-widest text-[var(--text-main)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)] max-w-[160px]"
                        >
                          <option value="">Uncategorized</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`p-4 text-[12px] font-bold text-right ${row.parsed_type === 'income' ? 'text-[var(--income-green)]' : 'text-[var(--text-main)]'}`}>
                        {row.parsed_type === 'income' ? '+' : '-'}${Math.abs(row.parsed_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            
            {}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--bg-base)] to-transparent pointer-events-none"></div>
          </div>

          {}
          <div className="w-full lg:w-[320px] bg-[var(--bg-surface)] p-6 flex flex-col justify-between shrink-0">
            <div>
              <h4 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6">Import Summary</h4>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">Total Rows</span>
                  <span className="text-[12px] font-bold text-[var(--text-main)]">{rows.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">Selected</span>
                  <span className="text-[12px] font-bold text-[var(--income-green)]">{selectedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">Duplicates Skipped</span>
                  <span className="text-[12px] font-bold text-[var(--warn-yellow)]">{duplicatesCount}</span>
                </div>
               {errorsCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-[var(--expense-red)]">Errors</span>
                    <span className="text-[12px] font-bold text-[var(--expense-red)]">{errorsCount}</span>
                  </div>
                )}
                {uncategorizedCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">Uncategorized</span>
                    <span className="text-[12px] font-bold text-[var(--text-main)]">{uncategorizedCount}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-[var(--border-light)]">
                 <div className="space-y-2">
                  <label htmlFor="import-account" className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Account</label>
                  <select
                    id="import-account"
                    value={selectedAccountId}
                    onChange={(event) => setSelectedAccountId(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-light)] text-[12px] font-bold text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="">Unassigned account</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                  {!selectedAccountId && (
                    <p className="text-[11px] font-medium text-[var(--warn-yellow)] leading-relaxed">
                      Imported rows will not be linked to an account.
                    </p>
                  )}
                </div>

                 <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Income</span>
                  <span className="text-[14px] font-black text-[var(--income-green)]">+${totalIncome.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Total Outflow</span>
                  <span className="text-[14px] font-black text-[var(--text-main)]">-${totalExpense.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={commitImport}
              disabled={isCommitting || selectedCount === 0 || isAiRunning}
              className="w-full py-3.5 mt-6 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCommitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
              {isCommitting ? 'Importing...' : `Import ${selectedCount} Rows`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
