'use client'

import { useCurrencyStore } from '@/store/useCurrencyStore'
import { formatCurrency } from '@/lib/currency'

/**
 * Shared hook for currency-aware formatting.
 * Uses the user's preferred currency from the Zustand store.
 * 
 * @param defaultBaseCurrency - the default currency if none is provided (default: 'USD')
 * @returns `fmt(value, txCurrency)` function that converts & formats to the user's chosen currency
 */
export function useCurrency(defaultBaseCurrency: 'USD' | 'INR' = 'USD') {
  const { currency } = useCurrencyStore()

  const fmt = (value: number, txCurrency?: 'USD' | 'INR' | string): string => {
    const base = (txCurrency as 'USD' | 'INR') || defaultBaseCurrency
    return formatCurrency(value, currency, base)
  }

  return { fmt, currency }
}
