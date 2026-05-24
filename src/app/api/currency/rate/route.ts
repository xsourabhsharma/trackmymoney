import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FALLBACK_USD_TO_INR_RATE } from '@/lib/currency'

export const revalidate = 21600

const querySchema = z.object({
  base: z.enum(['USD', 'INR']).default('USD'),
  quote: z.enum(['USD', 'INR']).default('INR'),
})

type FrankfurterPairResponse = {
  amount?: number
  base?: string
  date?: string
  rate?: number
}

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse({
    base: (req.nextUrl.searchParams.get('base') || 'USD').toUpperCase(),
    quote: (req.nextUrl.searchParams.get('quote') || 'INR').toUpperCase(),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Only USD and INR conversion is supported.' }, { status: 400 })
  }

  const { base, quote } = parsed.data
  if (base === quote) {
    return NextResponse.json({
      asOf: new Date().toISOString().slice(0, 10),
      base,
      fallback: false,
      quote,
      rate: 1,
      source: 'identity',
    })
  }

  try {
    const response = await fetch('https://api.frankfurter.dev/v2/rate/USD/INR', {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    })

    if (!response.ok) throw new Error(`Frankfurter responded ${response.status}`)

    const data = await response.json() as FrankfurterPairResponse
    const usdToInrRate = Number(data.rate)
    if (!Number.isFinite(usdToInrRate) || usdToInrRate <= 0) {
      throw new Error('Frankfurter rate was invalid')
    }

    return NextResponse.json({
      asOf: data.date ?? new Date().toISOString().slice(0, 10),
      base,
      fallback: false,
      quote,
      rate: base === 'USD' ? usdToInrRate : 1 / usdToInrRate,
      source: 'frankfurter',
    })
  } catch {
    return NextResponse.json({
      asOf: null,
      base,
      fallback: true,
      quote,
      rate: base === 'USD' ? FALLBACK_USD_TO_INR_RATE : 1 / FALLBACK_USD_TO_INR_RATE,
      source: 'fallback',
    })
  }
}
