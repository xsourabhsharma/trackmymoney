'use client'

import type { ComponentType } from 'react'
import { ArrowRight, CreditCard, FileSpreadsheet, Landmark, Link as LinkIcon, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Integration } from '@/app/dashboard/settings/data'
import { SETTINGS_INTEGRATIONS } from '@/lib/settings/integrations'
import { useRouter } from 'next/navigation'

interface Props {
  integrations: Integration[]
}

const iconByType = {
  csv_import: FileSpreadsheet,
  bank: Landmark,
  card: CreditCard,
  upi: Smartphone,
} satisfies Record<Integration['type'], ComponentType<{ className?: string }>>

export function IntegrationsSettingsSection({ integrations }: Props) {
  const router = useRouter()
  const items = integrations.length > 0 ? integrations : [...SETTINGS_INTEGRATIONS]

  function handleManage(integration: Integration) {
    if (integration.status !== 'available' || !integration.href) return
    router.push(integration.href)
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6 h-full">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-600" /> Accounts & Integrations
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((integration) => {
          const Icon = iconByType[integration.type]
          const isAvailable = integration.status === 'available'

          return (
            <div
              key={integration.id}
              className="flex items-center gap-4 rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-surface)] p-3 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-base)] shadow-sm">
                <Icon className="h-4 w-4 text-[var(--text-main)]" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="truncate text-[11px] font-bold uppercase tracking-tight text-[var(--text-main)]">
                  {integration.title}
                </div>
                <div className={`text-[11px] font-bold uppercase tracking-widest ${isAvailable ? 'text-[var(--income-green)]' : 'text-[var(--text-muted)]'}`}>
                  {isAvailable ? 'Available' : 'Not implemented'}
                </div>
                <p className="mt-1 text-[11px] font-medium leading-snug text-[var(--text-muted)]">
                  {integration.description}
                </p>
              </div>
              <Button
                onClick={() => handleManage(integration)}
                disabled={!isAvailable}
                variant="ghost"
                className="h-8 rounded-full border border-transparent px-3 text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all hover:border-[var(--border-light)] hover:bg-[var(--bg-base)]"
              >
                {integration.actionLabel}
                {isAvailable ? <ArrowRight className="h-3 w-3" /> : null}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
