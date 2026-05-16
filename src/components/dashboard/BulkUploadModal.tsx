'use client'

import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import { UploadCloud, FileType, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { bulkInsertTransactions, type BulkTransactionInput } from '@/app/dashboard/transactions/bulk-actions'

interface CsvTransactionRow {
  amount?: string
  Amount?: string
  merchant?: string
  Merchant?: string
  date?: string
  Date?: string
  type?: string
  Type?: string
}

export function BulkUploadModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
      setSuccessCount(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
      setSuccessCount(null)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    Papa.parse<CsvTransactionRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
         
          const expectedHeaders = ['amount', 'merchant', 'date', 'type']
          const headers = results.meta.fields?.map(h => h.toLowerCase()) || []
          
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
          if (missingHeaders.length > 0) {
            throw new Error(`Invalid CSV format. Missing headers: ${missingHeaders.join(', ')}. Expected: amount, merchant, date, type.`)
          }

         
          const validTransactions: BulkTransactionInput[] = results.data.map((row) => ({
            amount: parseFloat(row.amount || row.Amount || ''),
            merchant: row.merchant || row.Merchant,
            date: row.date || row.Date || '',
            type: (row.type || row.Type || 'expense').toLowerCase(),
          })).filter(tx => !isNaN(tx.amount) && tx.merchant && tx.date)

          if (validTransactions.length === 0) {
            throw new Error("No valid transactions found in the CSV. Please check the data format.")
          }

          await bulkInsertTransactions(validTransactions)
          
          setSuccessCount(validTransactions.length)
          setTimeout(() => {
            setOpen(false)
            setFile(null)
            setSuccessCount(null)
          }, 2000)

        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to import CSV.')
        } finally {
          setIsUploading(false)
        }
      },
      error: () => {
        setError("Failed to parse CSV file.")
        setIsUploading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-800">
        <UploadCloud className="h-4 w-4" />
        Import CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your transactions. Ensure your file has these column headers: <strong className="font-mono bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">amount, merchant, date, type</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {successCount !== null ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/50">
              <CheckCircle2 className="w-12 h-12 mb-3" />
              <p className="font-semibold text-lg">Import Successful!</p>
              <p className="text-sm">{successCount} transactions added to your ledger.</p>
            </div>
          ) : (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900/50'} cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
              {file ? (
                <>
                  <FileType className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUploading || successCount !== null}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading || successCount !== null} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
            ) : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
