import { create } from 'zustand'

export type CurrencyCode = 'USD' | 'INR'

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  toggleCurrency: () => void
}

export const useCurrencyStore = create<CurrencyState>()((set) => ({
  currency: 'USD',
  setCurrency: (currency: CurrencyCode) => set({ currency }),
  toggleCurrency: () => set((state: CurrencyState) => ({ currency: state.currency === 'USD' ? 'INR' : 'USD' }))
}))
