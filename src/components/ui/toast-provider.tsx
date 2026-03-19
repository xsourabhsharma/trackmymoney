'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} })

export const useToast = () => useContext(ToastContext)

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[var(--income-green)]" />,
    error: <AlertCircle className="w-4 h-4 text-[var(--expense-red)]" />,
    warning: <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />,
    info: <Info className="w-4 h-4 text-[var(--accent)]" />,
  }

  const borderColors = {
    success: 'border-l-[var(--income-green)]',
    error: 'border-l-[var(--expense-red)]',
    warning: 'border-l-[var(--warning)]',
    info: 'border-l-[var(--accent)]',
  }

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 bg-[var(--bg-base)] border border-[var(--border-light)] border-l-[3px] ${borderColors[toast.type]} rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-in slide-in-from-right'
      }`}
    >
      {icons[toast.type]}
      <span className="text-[12px] font-bold text-[var(--text-main)] uppercase tracking-tight flex-grow">{toast.message}</span>
      <button 
        onClick={() => { setIsExiting(true); setTimeout(() => onRemove(toast.id), 300) }}
        className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors rounded-md hover:bg-[var(--bg-surface)]"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-2 max-w-[380px] w-full pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
