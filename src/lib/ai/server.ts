import 'server-only'

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import {
  generateObject,
  generateText,
  stepCountIs,
  streamText,
  type LanguageModel,
  type ModelMessage,
  type StopCondition,
  type TimeoutConfiguration,
  type ToolSet,
} from 'ai'
import { z } from 'zod'

type AiProvider = 'gateway' | 'groq' | 'openai' | 'google'
type AiCapability = 'text' | 'vision'

export type AiDisabledState =
  | {
      enabled: true
      capability: AiCapability
      provider: AiProvider
      model: string
    }
  | {
      enabled: false
      capability: AiCapability
      reason: string
      missingEnv: string[]
    }

export type AiImageInput = string | URL | Uint8Array | ArrayBuffer

export interface GenerateAiTextOptions {
  prompt?: string
  messages?: ModelMessage[]
  system?: string
  model?: string
  temperature?: number
  maxOutputTokens?: number
  abortSignal?: AbortSignal
  timeout?: TimeoutConfiguration
}

export interface GenerateAiVisionOptions extends Omit<GenerateAiTextOptions, 'messages'> {
  images: AiImageInput[]
}

export interface GenerateAiObjectOptions<SCHEMA extends z.ZodType>
  extends GenerateAiTextOptions {
  schema: SCHEMA
  schemaName?: string
  schemaDescription?: string
}

export interface GenerateAiVisionObjectOptions<SCHEMA extends z.ZodType>
  extends GenerateAiVisionOptions {
  schema: SCHEMA
  schemaName?: string
  schemaDescription?: string
}

export const AI_TIMEOUTS = {
  text: { totalMs: 20_000 },
  stream: { totalMs: 30_000, chunkMs: 10_000 },
  vision: { totalMs: 25_000 },
} as const satisfies Record<string, TimeoutConfiguration>

export class AiDisabledError extends Error {
  readonly state: AiDisabledState

  constructor(state: AiDisabledState) {
    super(state.enabled ? 'AI is enabled' : state.reason)
    this.name = 'AiDisabledError'
    this.state = state
  }
}

function hasGatewayAuth() {
  return Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY)
}

function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY || process.env.AI_API_KEY || ''
}

function getGoogleApiKey() {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || ''
}

function stripProviderPrefix(model: string, provider: AiProvider) {
  const prefix = `${provider}/`
  return model.startsWith(prefix) ? model.slice(prefix.length) : model
}

function requestedModel(capability: AiCapability) {
  return capability === 'vision'
    ? process.env.AI_VISION_MODEL || process.env.AI_MODEL || ''
    : process.env.AI_TEXT_MODEL || process.env.AI_MODEL || ''
}

function requestedModelProvider(model: string): AiProvider | null {
  if (model.startsWith('groq/')) return 'groq'
  if (model.startsWith('openai/')) return 'openai'
  if (model.startsWith('google/')) return 'google'
  return null
}

function hasDirectProviderCredential(provider: AiProvider) {
  if (provider === 'groq') return Boolean(process.env.GROQ_API_KEY)
  if (provider === 'google') return Boolean(getGoogleApiKey())
  if (provider === 'openai') return Boolean(getOpenAiApiKey())
  return false
}

function hasAnyDirectProviderCredential() {
  return (
    hasDirectProviderCredential('groq') ||
    hasDirectProviderCredential('google') ||
    hasDirectProviderCredential('openai')
  )
}

function shouldUseGateway(providerPreference: AiProvider | null) {
  if (!hasGatewayAuth()) {
    return false
  }

  if (process.env.AI_GATEWAY_API_KEY) {
    return true
  }

  if (providerPreference) {
    return !hasDirectProviderCredential(providerPreference)
  }

  return !hasAnyDirectProviderCredential()
}

function modelForProvider(provider: AiProvider, capability: AiCapability, fallback: string) {
  const model = requestedModel(capability)
  if (!model) {
    return fallback
  }

  if (provider === 'gateway') {
    return requestedModelProvider(model) ? model : fallback
  }

  const requestedProvider = requestedModelProvider(model)
  if (requestedProvider === provider) {
    return stripProviderPrefix(model, provider)
  }

  if (!requestedProvider && provider === 'openai') {
    return model
  }

  return fallback
}

function textModelChoice(): AiDisabledState {
  const model = requestedModel('text')
  const providerPreference = requestedModelProvider(model)

  if ((providerPreference === 'openai' || process.env.AI_BASE_URL) && getOpenAiApiKey()) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'openai',
      model: modelForProvider('openai', 'text', 'gpt-5.4'),
    }
  }

  if (providerPreference === 'google' && getGoogleApiKey()) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'google',
      model: modelForProvider('google', 'text', 'gemini-2.5-flash'),
    }
  }

  if (providerPreference === 'groq' && process.env.GROQ_API_KEY) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'groq',
      model: modelForProvider('groq', 'text', 'llama-3.1-8b-instant'),
    }
  }

  if (shouldUseGateway(providerPreference)) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'gateway',
      model: modelForProvider('gateway', 'text', 'openai/gpt-5.4'),
    }
  }

  if (!providerPreference && process.env.GROQ_API_KEY) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'groq',
      model: modelForProvider('groq', 'text', 'llama-3.1-8b-instant'),
    }
  }

  if (getOpenAiApiKey()) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'openai',
      model: modelForProvider('openai', 'text', 'gpt-5.4'),
    }
  }

  if (getGoogleApiKey()) {
    return {
      enabled: true,
      capability: 'text',
      provider: 'google',
      model: modelForProvider('google', 'text', 'gemini-2.5-flash'),
    }
  }

  return {
    enabled: false,
    capability: 'text',
    reason: 'Text AI is disabled because no supported AI credential is configured.',
    missingEnv: [
      'VERCEL_OIDC_TOKEN or AI_GATEWAY_API_KEY',
      'GROQ_API_KEY',
      'OPENAI_API_KEY or AI_API_KEY',
      'GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY',
    ],
  }
}

function visionModelChoice(): AiDisabledState {
  const model = requestedModel('vision')
  const providerPreference = requestedModelProvider(model)

  if ((providerPreference === 'google' || !providerPreference) && getGoogleApiKey()) {
    return {
      enabled: true,
      capability: 'vision',
      provider: 'google',
      model: modelForProvider('google', 'vision', 'gemini-2.5-flash'),
    }
  }

  if (providerPreference === 'groq' && process.env.GROQ_API_KEY) {
    return {
      enabled: true,
      capability: 'vision',
      provider: 'groq',
      model: modelForProvider('groq', 'vision', 'llama-3.2-11b-vision-preview'),
    }
  }

  if (shouldUseGateway(providerPreference)) {
    return {
      enabled: true,
      capability: 'vision',
      provider: 'gateway',
      model: modelForProvider('gateway', 'vision', 'google/gemini-2.5-flash'),
    }
  }

  if (!providerPreference && process.env.GROQ_API_KEY) {
    return {
      enabled: true,
      capability: 'vision',
      provider: 'groq',
      model: modelForProvider('groq', 'vision', 'llama-3.2-11b-vision-preview'),
    }
  }

  if (getOpenAiApiKey()) {
    return {
      enabled: true,
      capability: 'vision',
      provider: 'openai',
      model: modelForProvider('openai', 'vision', 'gpt-5.4'),
    }
  }

  return {
    enabled: false,
    capability: 'vision',
    reason: 'Vision AI is disabled because no supported vision credential is configured.',
    missingEnv: [
      'VERCEL_OIDC_TOKEN or AI_GATEWAY_API_KEY',
      'GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY',
      'GROQ_API_KEY',
      'OPENAI_API_KEY or AI_API_KEY',
    ],
  }
}

function getLanguageModel(state: AiDisabledState, overrideModel?: string): LanguageModel {
  if (!state.enabled) {
    throw new AiDisabledError(state)
  }

  const model = overrideModel || state.model

  if (state.provider === 'gateway') {
    return model
  }

  if (state.provider === 'groq') {
    return createGroq({ apiKey: process.env.GROQ_API_KEY })(stripProviderPrefix(model, 'groq'))
  }

  if (state.provider === 'google') {
    return createGoogleGenerativeAI({ apiKey: getGoogleApiKey() })(stripProviderPrefix(model, 'google'))
  }

  return createOpenAI({
    apiKey: getOpenAiApiKey(),
    baseURL: process.env.AI_BASE_URL,
  })(stripProviderPrefix(model, 'openai'))
}

function getPromptInput(options: GenerateAiTextOptions): { prompt: string } | { messages: ModelMessage[] } {
  if (options.messages?.length) {
    return { messages: options.messages }
  }

  if (typeof options.prompt === 'string' && options.prompt.length > 0) {
    return { prompt: options.prompt }
  }

  throw new Error('AI text calls require either prompt or messages.')
}

export function getAiTextState(): AiDisabledState {
  return textModelChoice()
}

export function getAiVisionState(): AiDisabledState {
  return visionModelChoice()
}

export function isAiTextEnabled() {
  return getAiTextState().enabled
}

export function isAiVisionEnabled() {
  return getAiVisionState().enabled
}

export function getConfiguredTextModel(model?: string): LanguageModel {
  return getLanguageModel(getAiTextState(), model)
}

export function getConfiguredVisionModel(model?: string): LanguageModel {
  return getLanguageModel(getAiVisionState(), model)
}

export function isAiDisabledError(error: unknown): error is AiDisabledError {
  return error instanceof AiDisabledError
}

export function getAiDisabledClientMessage(state: AiDisabledState) {
  if (state.enabled) {
    return 'AI service is available.'
  }

  return state.capability === 'vision'
    ? 'AI vision is unavailable until a supported provider is configured.'
    : 'AI service is unavailable until a supported provider is configured.'
}

export function logAiServiceError(scope: string, error: unknown) {
  const errorInfo =
    error instanceof Error
      ? {
          name: error.name,
          message: sanitizeErrorMessage(error.message),
        }
      : { name: 'UnknownError', message: 'Unknown AI service error' }

  console.error(`[AI] ${scope}`, errorInfo)
}

export async function generateAiText<TOOLS extends ToolSet = ToolSet>(
  options: GenerateAiTextOptions & { tools?: TOOLS; stopWhen?: StopCondition<TOOLS> | Array<StopCondition<TOOLS>> } = {}
) {
  const hasTools = options.tools && Object.keys(options.tools).length > 0

  return generateText({
    model: getConfiguredTextModel(options.model),
    system: options.system,
    ...getPromptInput(options),
    tools: options.tools,
    stopWhen: options.stopWhen ?? (hasTools ? stepCountIs(5) : undefined),
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
    timeout: options.timeout ?? AI_TIMEOUTS.text,
  })
}

export function streamAiText<TOOLS extends ToolSet = ToolSet>(
  options: GenerateAiTextOptions & { tools?: TOOLS; stopWhen?: StopCondition<TOOLS> | Array<StopCondition<TOOLS>> } = {}
) {
  const hasTools = options.tools && Object.keys(options.tools).length > 0

  return streamText({
    model: getConfiguredTextModel(options.model),
    system: options.system,
    ...getPromptInput(options),
    tools: options.tools,
    stopWhen: options.stopWhen ?? (hasTools ? stepCountIs(5) : undefined),
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
    timeout: options.timeout ?? AI_TIMEOUTS.stream,
  })
}

export async function generateAiObject<SCHEMA extends z.ZodType>(
  options: GenerateAiObjectOptions<SCHEMA>
) {
  const result = await generateObject({
    model: getConfiguredTextModel(options.model),
    system: options.system,
    ...getPromptInput(options),
    schema: options.schema,
    schemaName: options.schemaName,
    schemaDescription: options.schemaDescription,
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
    timeout: options.timeout ?? AI_TIMEOUTS.text,
  })

  return {
    ...result,
    object: options.schema.parse(result.object) as z.output<SCHEMA>,
  }
}

export async function generateAiVisionText(
  options: GenerateAiVisionOptions
) {
  if (!options.images.length) {
    throw new Error('AI vision calls require at least one image.')
  }

  return generateText({
    model: getConfiguredVisionModel(options.model),
    system: options.system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: options.prompt || 'Describe the image.' },
          ...options.images.map((image) => ({ type: 'image' as const, image })),
        ],
      },
    ],
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
    timeout: options.timeout ?? AI_TIMEOUTS.vision,
  })
}

export async function generateAiVisionObject<SCHEMA extends z.ZodType>(
  options: GenerateAiVisionObjectOptions<SCHEMA>
) {
  if (!options.images.length) {
    throw new Error('AI vision calls require at least one image.')
  }

  const result = await generateObject({
    model: getConfiguredVisionModel(options.model),
    system: options.system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: options.prompt || 'Extract the requested data from the image.' },
          ...options.images.map((image) => ({ type: 'image' as const, image })),
        ],
      },
    ],
    schema: options.schema,
    schemaName: options.schemaName,
    schemaDescription: options.schemaDescription,
    temperature: options.temperature,
    maxOutputTokens: options.maxOutputTokens,
    abortSignal: options.abortSignal,
    timeout: options.timeout ?? AI_TIMEOUTS.vision,
  })

  return {
    ...result,
    object: options.schema.parse(result.object) as z.output<SCHEMA>,
  }
}

function sanitizeErrorMessage(message: string) {
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/gsk_[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/AIza[A-Za-z0-9_-]+/g, '[redacted]')
    .slice(0, 500)
}
