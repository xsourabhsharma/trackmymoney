import { create } from 'zustand'
import { FALLBACK_USD_TO_INR_RATE, type CurrencyCode } from '@/lib/currency'

type RateStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error'

interface CurrencyState {
  currency: CurrencyCode
  exchangeRateUpdatedAt: string | null
  fetchExchangeRate: () => Promise<void>
  rateStatus: RateStatus
  setCurrency: (currency: CurrencyCode) => void
  toggleCurrency: () => void
  usdToInrRate: number
}

export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  currency: 'USD',
  exchangeRateUpdatedAt: null,
  rateStatus: 'idle',
  usdToInrRate: FALLBACK_USD_TO_INR_RATE,
  setCurrency: (currency: CurrencyCode) => set({ currency }),
  toggleCurrency: () => set((state) => ({ currency: state.currency === 'USD' ? 'INR' : 'USD' })),
  fetchExchangeRate: async () => {
    const current = get()
    if (current.rateStatus === 'loading') return

    set({ rateStatus: 'loading' })
    try {
      const response = await fetch('/api/currency/rate?base=USD&quote=INR', {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Currency rate request failed')
      const data = await response.json() as {
        asOf?: string
        fallback?: boolean
        rate?: number
      }
      const rate = Number(data.rate)
      if (!Number.isFinite(rate) || rate <= 0) throw new Error('Currency rate response was invalid')

      set({
        exchangeRateUpdatedAt: data.asOf ?? null,
        rateStatus: data.fallback ? 'fallback' : 'ready',
        usdToInrRate: rate,
      })
    } catch {
      set({
        exchangeRateUpdatedAt: null,
        rateStatus: 'error',
        usdToInrRate: FALLBACK_USD_TO_INR_RATE,
      })
    }
  },
}))

export type { CurrencyCode }
