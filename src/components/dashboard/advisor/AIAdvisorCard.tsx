'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, AlertCircle, Lightbulb, TrendingDown, Target } from 'lucide-react'
import type { AiInsightRecord, AiInsight } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  stats?: any
  lastInsight?: AiInsightRecord | null
}

export function AIAdvisorCard({ stats, lastInsight }: Props) {
  const [insights, setInsights] = useState<AiInsight[]>(lastInsight?.insights || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(lastInsight?.createdAt || null)
  
  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setInsights(json.insights || [])
      setLastUpdated(new Date().toISOString())
    } catch (err: any) {
      setError(err.message || "Failed to generate insights")
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityIcon = (sev: string) => {
    switch(sev) {
        case 'warning': return <TrendingDown className="w-3 h-3 text-red-400" />;
        case 'opportunity': return <Target className="w-3 h-3 text-emerald-400" />;
        default: return <Lightbulb className="w-3 h-3 text-blue-400" />;
    }
  }

  const timeAgo = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : null

  return (
    <div className="bg-[#111111] rounded-[24px] p-6 text-white flex flex-col justify-between shadow-xl min-h-[300px] border border-white/10">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-white/90" /> AI Advisor
          </h3>
          {timeAgo && (
            <span className="text-[11px] text-white/50 font-medium mt-1 block">Updated {timeAgo}</span>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-all rounded-full text-[12px] font-bold border border-white/10 uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 text-white"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="flex-grow">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center py-10 gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-[12px] text-white/50 font-bold uppercase tracking-widest">Crunching numbers...</p>
          </div>
        ) : error ? (
           <div className="w-full flex flex-col items-center justify-center text-center py-4 gap-3 text-red-300">
            <AlertCircle className="w-6 h-6 opacity-80" />
            <p className="text-xs font-medium max-w-[250px]">{error}</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="flex flex-col gap-4">
            {insights.map((insight, idx) => (
                <div key={insight.id || idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2">
                        {getSeverityIcon(insight.severity)}
                        <span className="text-[11px] font-bold uppercase tracking-wide text-white/90">{insight.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-white/70 font-medium">{insight.body}</p>
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-tighter italic mt-1">💡 {insight.actionHint}</div>
                </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center py-10 gap-3">
            <div className="text-3xl opacity-60">✨</div>
            <p className="text-xs text-white/50 leading-relaxed font-medium max-w-[250px]">
              Tap <strong>Refresh</strong> to get AI-powered insights on your spending habits and savings opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
