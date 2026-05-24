function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}.\n` +
        '   Add it to .env.local or your deployment environment.'
    )
  }
  return value
}

export function validateEnv() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  requireEnv('DATABASE_URL')

  const hasGateway = Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY)
  const hasGroq = Boolean(process.env.GROQ_API_KEY)
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY || process.env.AI_API_KEY)
  const hasGoogle = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY)

  if (!hasGateway && !hasGroq && !hasOpenAI && !hasGoogle) {
    console.warn('No AI credential found. AI features will be disabled until a supported provider is configured.')
  }
}

export function getPublicSiteUrl() {
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL

  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (vercelProductionUrl ? `https://${vercelProductionUrl}` : '') ||
    'https://trackmymoney.app'
  )
}

export const env = {
  get SUPABASE_URL() { return requireEnv('NEXT_PUBLIC_SUPABASE_URL') },
  get SUPABASE_ANON_KEY() { return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') },
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv('SUPABASE_SERVICE_ROLE_KEY') },
  get DATABASE_URL() { return requireEnv('DATABASE_URL') },
  get GROQ_API_KEY() { return process.env.GROQ_API_KEY || '' },
  get OPENAI_API_KEY() { return process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '' },
  get AI_API_KEY() { return process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '' },
  get GOOGLE_GENERATIVE_AI_API_KEY() { return process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '' },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '' },
  get AI_GATEWAY_API_KEY() { return process.env.AI_GATEWAY_API_KEY || '' },
  get AI_MODEL() { return process.env.AI_MODEL || 'glm-4-flash' },
  get AI_TEXT_MODEL() { return process.env.AI_TEXT_MODEL || process.env.AI_MODEL || '' },
  get AI_VISION_MODEL() { return process.env.AI_VISION_MODEL || '' },
  get AI_BASE_URL() { return process.env.AI_BASE_URL },
  get SITE_URL() { return getPublicSiteUrl() },
} as const
