import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PublicButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'lime'
type PublicButtonSize = 'sm' | 'md' | 'lg'

type PublicButtonCommonProps = {
  children: ReactNode
  className?: string
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  showArrow?: boolean
  size?: PublicButtonSize
  variant?: PublicButtonVariant
}

type PublicButtonLinkProps = PublicButtonCommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & {
    href: LinkProps['href']
    prefetch?: LinkProps['prefetch']
  }

type PublicButtonNativeProps = PublicButtonCommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

export type PublicButtonProps = PublicButtonLinkProps | PublicButtonNativeProps

const variantClasses: Record<PublicButtonVariant, string> = {
  primary:
    'border-[var(--public-orange)] bg-[var(--public-orange)] text-black shadow-[0_16px_36px_rgba(255,90,31,0.24)] hover:bg-[var(--public-orange-strong)] hover:shadow-[0_18px_46px_rgba(255,90,31,0.34)]',
  secondary:
    'border-[var(--public-border-strong)] bg-[var(--public-surface)] text-[var(--public-text)] hover:border-[var(--public-orange)] hover:bg-[var(--public-surface-strong)]',
  ghost:
    'border-transparent bg-transparent text-[var(--public-muted)] hover:text-[var(--public-text)] hover:bg-white/[0.04]',
  outline:
    'border-[var(--public-border)] bg-transparent text-[var(--public-text)] hover:border-[var(--public-border-strong)] hover:bg-white/[0.04]',
  lime:
    'border-[var(--public-lime)] bg-[var(--public-lime)] text-black shadow-[0_16px_36px_rgba(217,255,116,0.16)] hover:brightness-105',
}

const sizeClasses: Record<PublicButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-[10px]',
  md: 'min-h-12 px-5 py-3 text-[11px]',
  lg: 'min-h-14 px-7 py-4 text-[12px]',
}

export function PublicButton(props: PublicButtonProps) {
  const {
    children,
    className,
    fullWidth = false,
    icon,
    iconPosition = 'right',
    showArrow = false,
    size = 'md',
    variant = 'primary',
    ...rest
  } = props

  const content = (
    <>
      {icon && iconPosition === 'left' ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate">{children}</span>
      {icon && iconPosition === 'right' ? <span className="shrink-0">{icon}</span> : null}
      {showArrow ? (
        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
      ) : null}
    </>
  )

  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-[14px] border font-mono font-bold uppercase tracking-[0.16em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--public-bg)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none motion-reduce:active:scale-100',
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && 'w-full',
    className
  )

  if ('href' in rest && rest.href) {
    const { href, prefetch, ...linkProps } = rest

    return (
      <Link href={href} prefetch={prefetch} className={classes} {...linkProps}>
        {content}
      </Link>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button className={classes} type={buttonProps.type ?? 'button'} {...buttonProps}>
      {content}
    </button>
  )
}
