export const FALLBACK_USD_TO_INR_RATE = 83

export type CurrencyCode = 'USD' | 'INR'

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  return value?.toUpperCase() === 'INR' ? 'INR' : 'USD'
}

export function convertCurrency(
  value: number,
  targetCurrencyRaw: string = 'USD',
  baseCurrencyRaw: string = 'USD',
  usdToInrRate: number = FALLBACK_USD_TO_INR_RATE
) {
  const targetCurrency = normalizeCurrency(targetCurrencyRaw)
  const baseCurrency = normalizeCurrency(baseCurrencyRaw)

  if (baseCurrency === targetCurrency) return value
  if (baseCurrency === 'USD' && targetCurrency === 'INR') return value * usdToInrRate
  if (baseCurrency === 'INR' && targetCurrency === 'USD') return value / usdToInrRate

  return value
}

export function formatCurrency(
  value: number,
  targetCurrencyRaw: string = 'USD',
  baseCurrencyRaw: string = 'USD',
  usdToInrRate: number = FALLBACK_USD_TO_INR_RATE
): string {
  const targetCurrency = normalizeCurrency(targetCurrencyRaw)
  const convertedValue = convertCurrency(value, targetCurrency, baseCurrencyRaw, usdToInrRate)
  const abs = Math.abs(convertedValue)
  const sign = convertedValue < 0 ? '-' : ''

  if (targetCurrency === 'USD') {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
    if (abs >= 10_000) return `${sign}$${(abs / 10_000).toFixed(2)}K`

    return `${sign}$${abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  if (abs >= 10_000_000) return `${sign}Rs. ${(abs / 10_000_000).toFixed(2)}Cr`
  if (abs >= 100_000) return `${sign}Rs. ${(abs / 100_000).toFixed(2)}L`

  return `${sign}Rs. ${abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
