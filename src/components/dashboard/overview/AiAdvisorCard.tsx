'use client'

import { AiAdvisorState } from '@/lib/dal/overview'
import { Sparkles, AlertTriangle, Lightbulb, PiggyBank, RefreshCw, Zap } from 'lucide-react'
import Link from 'next/link'
import { AiOrb3D } from '@/components/3d/AiOrb3D'

interface AiAdvisorCardProps {
  insight: {
    state: AiAdvisorState
    title: string
    message: string
    actions: Array<{ label: string; href: string }>
  }
}

export function AiAdvisorCard({ insight }: AiAdvisorCardProps) {
  let Icon = Sparkles
  let titleColor = 'text-blue-400'

  switch (insight.state) {
    case 'warning':
      Icon = AlertTriangle
      titleColor = 'text-red-400'
      break
    case 'opportunity':
      Icon = PiggyBank
      titleColor = 'text-green-400'
      break
    case 'neutral':
      Icon = Lightbulb
      titleColor = 'text-blue-400'
      break
    case 'no_data':
    default:
      Icon = Sparkles
      titleColor = 'text-gray-400'
      break
  }

  return (
    <div className="flex flex-col h-full bg-[#42423d] text-white rounded-[32px] overflow-hidden shadow-md relative">
      
      {/* 3D Orb Background Top Half */}
      <div className="absolute top-0 left-0 w-full h-[250px] opacity-70 pointer-events-none mix-blend-screen">
         <AiOrb3D state={insight.state} />
      </div>

      <div className="p-6 sm:p-8 flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 z-10">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-300" />
              AI Advisor
            </h2>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
              Updated just now
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 backdrop-blur-md">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>

        {/* Spacer to let the 3D orb show through clearly */}
        <div className="flex-grow min-h-[40px]"></div>

        {/* Insight Card (Glassmorphism) */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/50 transition-colors z-10 mt-auto shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${titleColor}`} strokeWidth={3} />
            <h3 className={`text-[11px] font-black uppercase tracking-widest ${titleColor}`}>
              {insight.title}
            </h3>
          </div>
          <p className="text-[13px] leading-relaxed text-gray-200 font-medium">
            {insight.message}
          </p>
          
          {insight.actions.length > 0 && (
            <div className="mt-3">
              {insight.actions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#d5c5a3] hover:text-white transition-colors"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
    </div>
  )
}
