'use client'

import { useCurrencyStore } from '@/store/useCurrencyStore'
import { formatCurrency } from '@/lib/currency'


export function useCurrency(defaultBaseCurrency: 'USD' | 'INR' = 'USD') {
  const { currency } = useCurrencyStore()

  const fmt = (value: number, txCurrency?: 'USD' | 'INR' | string): string => {
    const base = (txCurrency as 'USD' | 'INR') || defaultBaseCurrency
    return formatCurrency(value, currency, base)
  }

  return { fmt, currency }
}
