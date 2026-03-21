'use client'

import { useState, useRef, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Check, Loader2, Sparkles, Receipt, DollarSign, Calendar, Tag } from 'lucide-react'
import { useToast } from '@/components/ui/toast-provider'
import Image from 'next/image'
import { saveReceiptTransaction } from '@/app/dashboard/auto-parse/receipt-actions'

interface OCRResult {
  merchant: string
  amount: number
  date: string
  category: string
  confidence: number
}

export function ReceiptScanner() {
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, startSaveTransition] = useTransition()
  const [result, setResult] = useState<OCRResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const response = await fetch('/api/receipt-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.details || 'OCR failed')
      }

      const data = await response.json()
      setResult(data)
      addToast('Receipt scanned successfully!', 'success')
    } catch (error: any) {
      console.error(error)
      addToast(`Error: ${error.message}`, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setResult(null)
  }

  const handleSave = () => {
    if (!result) return
    startSaveTransition(async () => {
      try {
        await saveReceiptTransaction({
          merchant: result.merchant,
          amount: result.amount,
          date: result.date,
          category_name: result.category,
        })
        addToast('Transaction saved!', 'success')
        handleClear()
      } catch (error: any) {
        addToast(error.message || 'Failed to save transaction.', 'error')
      }
    })
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-surface)] flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <Camera className="w-4 h-4" /> Receipt Scanner
        </h3>
        {(image || result) && (
          <button 
            onClick={handleClear}
            className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--expense-red)] transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6 flex-grow">
        <AnimatePresence mode="wait">
          {!image && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-grow border-2 border-dashed border-[var(--border-light)] rounded-[16px] bg-[var(--bg-surface)]/30 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-[var(--bg-surface)] hover:border-[var(--border-dark)] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-light)] shadow-sm flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider mb-2">Upload Receipt</p>
              <p className="text-[11px] font-medium text-[var(--text-muted)] text-center max-w-[200px] leading-relaxed">
                Take a photo or upload an image of your receipt.
              </p>
            </motion.div>
          )}

          {image && !result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-grow flex flex-col gap-6"
            >
              <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto rounded-[16px] overflow-hidden border border-[var(--border-light)] shadow-lg">
                <Image src={image} alt="Receipt Preview" fill className="object-cover" />
                
                {/* 3D Hologram Scan Line */}
                {isProcessing && (
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-[var(--income-green)] shadow-[0_0_20px_4px_var(--income-green)] z-20"
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                  >
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[var(--income-green)]/30 -translate-y-full pointer-events-none" />
                  </motion.div>
                )}

                <button 
                  onClick={handleClear}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleScan}
                disabled={isProcessing}
                className="w-full py-4 bg-[var(--text-main)] text-[var(--bg-base)] rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 relative overflow-hidden"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                    <span className="relative z-10">Extracting Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze with AI
                  </>
                )}
              </button>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-[var(--bg-surface)] rounded-[16px] border border-[var(--border-light)] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Extracted Data</h4>
                  <div className="px-3 py-1 bg-[var(--income-green)]/10 text-[var(--income-green)] rounded-full text-[9px] font-bold uppercase">
                    {Math.round(result.confidence * 100)}% Confidence
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <Receipt className="w-3 h-3" /> Merchant
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{result.merchant}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3" /> Amount
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">${result.amount.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{result.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Category
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{result.category}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleClear}
                   className="flex-1 py-4 border border-[var(--border-light)] text-[var(--text-main)] rounded-xl font-bold uppercase tracking-widest hover:bg-[var(--bg-surface)] transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-[var(--income-green)] text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
