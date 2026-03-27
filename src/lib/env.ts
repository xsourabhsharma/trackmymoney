

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}.\n` +
      `   Add it to .env.local or your deployment environment.`
    )
  }
  return value
}


export function validateEnv() {
 
  requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  requireEnv('SUPABASE_SERVICE_ROLE_KEY')

 
  requireEnv('DATABASE_URL')

 
  const hasGroq = !!process.env.GROQ_API_KEY
  const hasOpenAI = !!process.env.AI_API_KEY
  if (!hasGroq && !hasOpenAI) {
    console.warn(
      '⚠️  No AI API key found (GROQ_API_KEY or AI_API_KEY). AI features will not work.'
    )
  }
}

export const env = {
  get SUPABASE_URL() { return requireEnv('NEXT_PUBLIC_SUPABASE_URL') },
  get SUPABASE_ANON_KEY() { return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') },
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv('SUPABASE_SERVICE_ROLE_KEY') },
  get DATABASE_URL() { return requireEnv('DATABASE_URL') },
  get GROQ_API_KEY() { return process.env.GROQ_API_KEY || '' },
  get AI_API_KEY() { return process.env.AI_API_KEY || '' },
  get AI_MODEL() { return process.env.AI_MODEL || 'glm-4-flash' },
  get AI_BASE_URL() { return process.env.AI_BASE_URL },
  get SITE_URL() { return process.env.NEXT_PUBLIC_SITE_URL || 'https://trackmymoney.app' },
} as const
