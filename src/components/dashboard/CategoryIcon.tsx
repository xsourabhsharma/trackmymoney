import {
  Banknote,
  BriefcaseBusiness,
  Car,
  CircleDollarSign,
  CreditCard,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  Plane,
  ReceiptText,
  Repeat2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Tag,
  Utensils,
  WalletCards,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_BY_KEY: Record<string, LucideIcon> = {
  accounts: WalletCards,
  bank: Landmark,
  bonus: Gift,
  business: BriefcaseBusiness,
  card: CreditCard,
  debt: CreditCard,
  dining: Utensils,
  education: GraduationCap,
  entertainment: Smartphone,
  food: Utensils,
  gift: Gift,
  groceries: ShoppingCart,
  health: HeartPulse,
  home: Home,
  housing: Home,
  income: Banknote,
  insurance: Shield,
  investments: CircleDollarSign,
  other: MoreHorizontal,
  receipt: ReceiptText,
  salary: Banknote,
  shopping: ShoppingBag,
  subscriptions: Repeat2,
  transport: Car,
  transportation: Car,
  travel: Plane,
  utilities: Zap,
  wellness: Dumbbell,
}

const LEGACY_ICON_KEYS: Record<string, string> = {
  '\u{1F3E0}': 'home',
  '\u{1F354}': 'dining',
  '\u{1F37D}\uFE0F': 'dining',
  '\u{1F6D2}': 'groceries',
  '\u{1F697}': 'transport',
  '\u{1F695}': 'transport',
  '\u2708\uFE0F': 'travel',
  '\u{1F48D}': 'gift',
  '\u{1F393}': 'education',
  '\u{1F3AC}': 'entertainment',
  '\u{1F4B5}': 'salary',
  '\u{1F4B0}': 'income',
  '\u{1F389}': 'bonus',
  '\u26A1': 'utilities',
  '\u{1F4F1}': 'subscriptions',
  '\u{1F6E1}\uFE0F': 'insurance',
  '\u{1F3E6}': 'bank',
  '\u{1F4BB}': 'shopping',
  '\u{1F4E6}': 'other',
}

export function getCategoryIconKey(icon?: string | null, categoryName?: string | null) {
  const normalizedIcon = icon?.trim().toLowerCase()
  if (normalizedIcon) {
    if (ICON_BY_KEY[normalizedIcon]) return normalizedIcon
    if (LEGACY_ICON_KEYS[icon?.trim() ?? '']) return LEGACY_ICON_KEYS[icon?.trim() ?? '']
  }

  const name = categoryName?.toLowerCase() ?? ''
  if (/grocery|market|supermarket/.test(name)) return 'groceries'
  if (/dining|restaurant|food|coffee|cafe/.test(name)) return 'dining'
  if (/transport|car|taxi|uber|fuel|gas|commute/.test(name)) return 'transport'
  if (/rent|home|housing|mortgage/.test(name)) return 'home'
  if (/utility|electric|water|internet|phone/.test(name)) return 'utilities'
  if (/subscription|software|streaming|recurring/.test(name)) return 'subscriptions'
  if (/salary|payroll/.test(name)) return 'salary'
  if (/bonus|gift|reward/.test(name)) return 'bonus'
  if (/shopping|retail|amazon|target/.test(name)) return 'shopping'
  if (/health|medical|doctor|pharmacy/.test(name)) return 'health'
  if (/travel|flight|hotel/.test(name)) return 'travel'
  if (/education|school|course/.test(name)) return 'education'
  if (/insurance/.test(name)) return 'insurance'
  if (/bank|account/.test(name)) return 'bank'
  return 'other'
}

export function CategoryIcon({
  className,
  color,
  icon,
  name,
}: {
  className?: string
  color?: string | null
  icon?: string | null
  name?: string | null
}) {
  const key = getCategoryIconKey(icon, name)
  const Icon = ICON_BY_KEY[key] ?? Tag

  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)]',
        className
      )}
      style={color ? { color } : undefined}
    >
      <Icon className="h-[52%] w-[52%]" strokeWidth={2.2} />
    </span>
  )
}
