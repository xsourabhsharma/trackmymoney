'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { generateFinancialInsights } from '@/app/dashboard/advisor-actions'

export function AIAdvisorPanel() {
  const [insights, setInsights] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  const fetchInsights = async () => {
    setIsLoading(true)
    setDisplayedText('')
    try {
      const result = await generateFinancialInsights()
      setInsights(result)
    } catch (error) {
      console.error(error)
      setInsights("Failed to connect to the AI Advisor. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

 
  useEffect(() => {
    if (!insights || isLoading) return
    
    let i = 0
    setDisplayedText('')
    
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + insights.charAt(i))
      i++
      if (i >= insights.length) {
        clearInterval(interval)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [insights, isLoading])

 
  useEffect(() => {
    fetchInsights()
  }, [])

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 p-6 shadow-sm mb-8 relative overflow-hidden group transition-all duration-500 hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-800">
      {}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Sparkles className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
          <h3 className="text-lg font-bold">AI Financial Advisor</h3>
        </div>
        <button 
          onClick={fetchInsights} 
          disabled={isLoading}
          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 disabled:opacity-50"
          title="Refresh Insights"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative z-10 min-h-[60px] flex items-center">
        {isLoading ? (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-medium text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your spending patterns...
          </div>
        ) : displayedText ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
            {displayedText.split('\n').map((line, i) => (
              <p key={i} className={line.trim().startsWith('-') ? "pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-blue-500" : ""}>
                {line.replace(/^- /, '')}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Click the refresh icon to generate your daily insights.</p>
        )}
      </div>
    </div>
  )
}
