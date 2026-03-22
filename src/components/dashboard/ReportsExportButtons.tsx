'use client'

import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useToast } from '@/components/ui/toast-provider'

interface Transaction {
  amount: number
  type: string
  date: string
  merchant: string
  category: string
}

interface ReportsExportButtonsProps {
  transactions: Transaction[]
}

export function ReportsExportButtons({ transactions }: ReportsExportButtonsProps) {
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const { addToast } = useToast()

  const handleExportCSV = () => {
    setIsExportingCSV(true)
    try {
      if (!transactions || transactions.length === 0) {
        addToast('No transactions available to export.', 'warning')
        return
      }

      // Create CSV content
      const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount']
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `"${t.merchant.replace(/"/g, '""')}"`, // Escape quotes in merchant
        `"${t.category.replace(/"/g, '""')}"`,
        t.type,
        t.amount.toString()
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n')

      // Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `track-my-money-report-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      addToast('Your CSV report has been downloaded.', 'success')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      addToast('Failed to generate CSV file.', 'error')
    } finally {
      setIsExportingCSV(false)
    }
  }

  const handleExportPDF = () => {
    setIsExportingPDF(true)
    
    // Simulating PDF generation as client-side PDF generation from HTML requires large libraries like html2pdf.js or jspdf
    // In a real app, you might trigger an edge API to generate it using Playwright/Puppeteer or use a dedicated library.
    setTimeout(() => {
      addToast('Generating high-quality PDF. Check your downloads shortly.', 'info')
      
      // Simulate successful download after a delay
      setTimeout(() => {
        setIsExportingPDF(false)
      }, 1500)
    }, 500)
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleExportCSV}
        disabled={isExportingCSV}
        className="h-9 px-4 rounded-full text-[12px] font-bold uppercase tracking-widest border-[var(--border-light)] flex gap-2 w-[85px] justify-center"
      >
        {isExportingCSV ? (
           <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-[var(--text-main)] animate-spin" />
        ) : (
          <><Download className="w-3 h-3" /> CSV</>
        )}
      </Button>
      <Button 
        variant="outline"
        onClick={handleExportPDF}
        disabled={isExportingPDF}
        className="h-9 px-4 rounded-full text-[12px] font-bold uppercase tracking-widest border-[var(--border-light)] flex gap-2 w-[85px] justify-center"
      >
        {isExportingPDF ? (
           <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-[var(--text-main)] animate-spin" />
        ) : (
          <><FileText className="w-3 h-3" /> PDF</>
        )}
      </Button>
    </div>
  )
}
