'use client'

import React from 'react'
import Papa from 'papaparse'
import { Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function ExportTransactionsButton({ transactions }: { transactions: any[] }) {
  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export")
      return
    }

    const exportData = transactions.map(tx => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Merchant: tx.merchant,
      Category: tx.categories?.name || 'Uncategorized',
      Type: tx.type,
      Source: tx.source,
      Amount: tx.amount,
      Currency: 'USD'
    }))

    const csv = Papa.unparse(exportData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export")
      return
    }

    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Transactions Report', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30)

    const tableColumn = ["Date", "Merchant", "Category", "Type", "Amount"]
    const tableRows: any[] = []

    transactions.forEach(tx => {
      const txData = [
        new Date(tx.date).toLocaleDateString(),
        tx.merchant,
        tx.categories?.name || 'Uncategorized',
        tx.type,
        `$${parseFloat(tx.amount).toFixed(2)}`
      ]
      tableRows.push(txData)
    })

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 }
    })

    doc.save(`transactions_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-800"
      >
        <Download className="h-4 w-4" />
        CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-800"
      >
        <FileText className="h-4 w-4" />
        PDF
      </button>
    </div>
  )
}
