'use client'

import { useEffect } from 'react'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { formatCurrency } from '@/lib/currency'


export function useCurrency(defaultBaseCurrency: 'USD' | 'INR' = 'USD') {
  const { currency, exchangeRateUpdatedAt, fetchExchangeRate, rateStatus, usdToInrRate } = useCurrencyStore()

  useEffect(() => {
    if (rateStatus === 'idle' || rateStatus === 'error') {
      void fetchExchangeRate()
    }
  }, [fetchExchangeRate, rateStatus])

  const fmt = (value: number, txCurrency?: 'USD' | 'INR' | string): string => {
    const base = (txCurrency as 'USD' | 'INR') || defaultBaseCurrency
    return formatCurrency(value, currency, base, usdToInrRate)
  }

  return { currency, exchangeRateUpdatedAt, fmt, rateStatus, usdToInrRate }
}
