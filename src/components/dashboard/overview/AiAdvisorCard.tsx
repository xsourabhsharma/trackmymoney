import { AiAdvisorState } from '@/lib/dal/overview'
import { Sparkles, AlertTriangle, Lightbulb, PiggyBank } from 'lucide-react'
import Link from 'next/link'

interface AiAdvisorCardProps {
  insight: {
    state: AiAdvisorState
    title: string
    message: string
    actions: Array<{ label: string; href: string }>
  }
}

export function AiAdvisorCard({ insight }: AiAdvisorCardProps) {
  let themeStyles = ''
  let Icon = Sparkles

  switch (insight.state) {
    case 'warning':
      themeStyles = 'bg-red-50 border-red-500 text-red-900 dark:bg-red-950/30'
      Icon = AlertTriangle
      break
    case 'opportunity':
      themeStyles = 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/30'
      Icon = PiggyBank
      break
    case 'neutral':
      themeStyles = 'bg-green-50 border-green-500 text-green-900 dark:bg-green-950/30'
      Icon = Lightbulb
      break
    case 'no_data':
    default:
      themeStyles = 'bg-[var(--bg-muted)] border-[var(--border-main)] text-[var(--text-main)]'
      Icon = Sparkles
      break
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-6 p-6 border-[3px] rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] ${themeStyles}`}>
      <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-white dark:bg-black border-[3px] border-[var(--border-main)] rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Icon className="w-8 h-8" strokeWidth={2.5} />
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-sm font-black uppercase tracking-widest mb-1 shadow-sm opacity-60">AI Advisor</h3>
        <h4 className="text-xl font-bold tracking-tight mb-2">{insight.title}</h4>
        <p className="text-sm font-medium leading-relaxed max-w-lg mb-4">{insight.message}</p>
        
        {insight.actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {insight.actions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="px-4 py-2 bg-[var(--text-main)] text-[var(--bg-base)] text-xs font-bold uppercase tracking-wider rounded-full border-2 border-transparent hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition-all"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
