import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PublicPanelElement = 'article' | 'aside' | 'div' | 'section'
type PublicPanelPadding = 'none' | 'sm' | 'md' | 'lg'
type PublicPanelVariant = 'default' | 'glass' | 'accent' | 'lime' | 'quiet'

export type PublicPanelProps = HTMLAttributes<HTMLElement> & {
  as?: PublicPanelElement
  children: ReactNode
  interactive?: boolean
  padding?: PublicPanelPadding
  variant?: PublicPanelVariant
}

const variantClasses: Record<PublicPanelVariant, string> = {
  default:
    'border-[var(--public-border)] bg-[var(--public-surface)] shadow-[0_22px_70px_rgba(0,0,0,0.32)]',
  glass:
    'border-white/10 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl',
  accent:
    'border-[color-mix(in_srgb,var(--public-orange)_78%,black)] bg-[var(--public-orange)] text-black shadow-[0_22px_70px_rgba(255,90,31,0.26)]',
  lime:
    'border-[color-mix(in_srgb,var(--public-lime)_72%,black)] bg-[var(--public-lime)] text-black shadow-[0_22px_70px_rgba(217,255,116,0.16)]',
  quiet: 'border-[var(--public-border)] bg-white/[0.035]',
}

const paddingClasses: Record<PublicPanelPadding, string> = {
  none: '',
  sm: 'p-5',
  md: 'p-6 sm:p-7',
  lg: 'p-7 sm:p-9',
}

export function PublicPanel({
  as: Component = 'div',
  children,
  className,
  interactive = false,
  padding = 'md',
  variant = 'default',
  ...props
}: PublicPanelProps) {
  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-[var(--public-radius-lg)] border',
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          'transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--public-border-strong)] hover:shadow-[0_26px_90px_rgba(0,0,0,0.46)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
