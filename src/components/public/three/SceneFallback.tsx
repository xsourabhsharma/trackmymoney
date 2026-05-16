import { cn } from '@/lib/utils'
import type { DecorativeSceneVariant } from './types'

type SceneFallbackProps = {
  className?: string
  variant: DecorativeSceneVariant
}

const shellClasses =
  'pointer-events-none relative h-full min-h-[220px] w-full overflow-hidden rounded-[var(--public-radius-lg)] border border-[var(--public-border)] bg-[radial-gradient(circle_at_50%_8%,rgba(255,90,31,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015))]'

export function SceneFallback({ className, variant }: SceneFallbackProps) {
  return (
    <div className={cn(shellClasses, className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(217,255,116,0.08),transparent_28%),radial-gradient(circle_at_28%_72%,rgba(255,90,31,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      {variant === 'hero' ? <HeroFallbackMotif /> : null}
      {variant === 'auth' ? <AuthFallbackMotif /> : null}
      {variant === 'legal' ? <LegalFallbackMotif /> : null}
    </div>
  )
}

function HeroFallbackMotif() {
  return (
    <>
      <div className="absolute left-[18%] top-[31%] h-[38%] w-[48%] -rotate-6 rounded-[24px] border border-white/15 bg-[#111]/70 shadow-[0_24px_80px_rgba(0,0,0,0.42)]" />
      <div className="absolute left-[24%] top-[25%] h-[30%] w-[44%] rotate-3 rounded-[20px] border border-white/20 bg-[linear-gradient(135deg,#f7f2e8,#d7c8ab)] shadow-[0_20px_50px_rgba(255,90,31,0.13)]" />
      <div className="absolute right-[20%] top-[26%] h-14 w-14 rounded-full border border-[#ffb347]/50 bg-[radial-gradient(circle,#ffd485,#ff7a2f)] shadow-[0_0_34px_rgba(255,90,31,0.28)]" />
      <div className="absolute bottom-[23%] left-[22%] h-10 w-10 rounded-full border border-[#ffb347]/40 bg-[#ff6f2f]" />
      <div className="absolute bottom-[28%] right-[18%] flex items-end gap-2">
        <span className="h-9 w-4 rounded-t bg-[var(--public-lime)]/55" />
        <span className="h-16 w-4 rounded-t bg-[var(--public-orange)]/70" />
        <span className="h-12 w-4 rounded-t bg-white/25" />
      </div>
    </>
  )
}

function AuthFallbackMotif() {
  return (
    <>
      <div className="absolute left-1/2 top-1/2 h-48 w-40 -translate-x-1/2 -translate-y-1/2 rounded-t-[54px] rounded-b-[34px] border border-[var(--public-lime)]/28 bg-[linear-gradient(180deg,rgba(217,255,116,0.12),rgba(255,255,255,0.04))] shadow-[0_22px_70px_rgba(217,255,116,0.08)]" />
      <div className="absolute left-1/2 top-[41%] h-20 w-24 -translate-x-1/2 rounded-t-full border-[12px] border-[var(--public-orange)]/70 border-b-0" />
      <div className="absolute left-1/2 top-[51%] h-20 w-28 -translate-x-1/2 rounded-[22px] border border-white/16 bg-black/45" />
      <div className="absolute left-1/2 top-[61%] h-7 w-3 -translate-x-1/2 rounded-full bg-[var(--public-lime)]/75" />
      <div className="absolute right-[18%] top-[27%] h-9 w-9 rounded-full border border-[#ffb347]/40 bg-[var(--public-orange)]/70" />
      <div className="absolute bottom-[24%] left-[18%] h-7 w-7 rounded-full border border-[var(--public-lime)]/35 bg-[var(--public-lime)]/30" />
    </>
  )
}

function LegalFallbackMotif() {
  return (
    <>
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18 bg-[radial-gradient(circle,rgba(247,242,232,0.16),rgba(255,255,255,0.03)_54%,rgba(255,90,31,0.08))]" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-[var(--public-orange)]/38" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40" />
      <div className="absolute left-1/2 top-1/2 h-44 w-3 -translate-x-1/2 -translate-y-1/2 bg-white/12" />
      <div className="absolute left-1/2 top-1/2 h-3 w-44 -translate-x-1/2 -translate-y-1/2 bg-white/12" />
      <div className="absolute bottom-[18%] right-[18%] h-12 w-28 rounded-[16px] border border-[var(--public-lime)]/24 bg-[var(--public-lime)]/10" />
    </>
  )
}
