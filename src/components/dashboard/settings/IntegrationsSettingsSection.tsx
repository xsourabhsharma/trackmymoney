'use client'

import { Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Integration } from '@/app/dashboard/settings/data'
import { useRouter } from 'next/navigation'

interface Props {
  integrations: Integration[]
}

export function IntegrationsSettingsSection({ integrations }: Props) {
  const router = useRouter()
  
  const bankCount = integrations.filter(i => i.type === 'bank' && i.status === 'connected').length
  const cardCount = integrations.filter(i => i.type === 'card' && i.status === 'connected').length
  const upiCount = integrations.filter(i => i.type === 'upi' && i.status === 'connected').length
  const csvEnabled = integrations.some(i => i.type === 'csv_import' && i.status === 'connected')

  const items = [
    { 
      id: 'bank', 
      icon: '🏦', 
      name: 'Bank Accounts', 
      status: bankCount ? `${bankCount} Connected` : 'Offline', 
      active: bankCount > 0 
    },
    { 
      id: 'card', 
      icon: '💳', 
      name: 'Cards & Wallets', 
      status: cardCount ? `${cardCount} Connected` : 'Offline', 
      active: cardCount > 0 
    },
    { 
      id: 'upi', 
      icon: '📱', 
      name: 'UPI / Local Providers', 
      status: upiCount ? `${upiCount} Connected` : 'Offline', 
      active: upiCount > 0 
    },
    { 
      id: 'csv_import', 
      icon: '📄', 
      name: 'CSV / Excel Imports', 
      status: csvEnabled ? 'Enabled' : 'Offline', 
      active: csvEnabled 
    },
  ]

  function handleManage(id: string) {
    if (id === 'csv_import') {
      router.push('/dashboard/ai-auto-parse')
    } else {
      alert(`Management flow for ${id} is coming soon.`)
    }
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6 h-full">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-[var(--accent)]" /> Accounts & Integrations
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {items.map((acc) => (
          <div key={acc.name} className="flex items-center gap-4 p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]/50 group cursor-pointer hover:bg-white transition-all">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
              {acc.icon}
            </div>
            <div className="flex-grow min-w-0">
              <div className="text-[11px] font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{acc.name}</div>
              <div className={`text-[9px] font-bold uppercase tracking-widest ${acc.active ? 'text-[var(--income-green)]' : 'text-[var(--text-muted)]'}`}>
                {acc.status}
              </div>
            </div>
            <Button 
              onClick={() => handleManage(acc.id)}
              variant="ghost" 
              className="h-8 px-3 rounded-full text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-[var(--border-light)] hover:bg-[var(--bg-base)] shadow-sm transition-all"
            >
              {acc.active ? 'Manage' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
