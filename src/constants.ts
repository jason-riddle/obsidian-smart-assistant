import { ChatModel } from './types/chat-model.types'
import { LLMProvider, LLMProviderType } from './types/provider.types'

export const CHAT_VIEW_TYPE = 'smtcmp-chat-view'
export const APPLY_VIEW_TYPE = 'smtcmp-apply-view'

// Default model ids
export const DEFAULT_CHAT_MODEL_ID = 'gpt-5.6-sol'
export const DEFAULT_APPLY_MODEL_ID = 'gpt-5.6-luna'

// Recommended model ids
export const RECOMMENDED_MODELS_FOR_CHAT = ['gpt-5.6-sol', 'gpt-6-astra']
export const RECOMMENDED_MODELS_FOR_APPLY = ['gpt-5.6-luna']

export const PROVIDER_TYPES_INFO = {
  aperture: {
    label: 'Aperture',
    defaultProviderId: 'aperture',
    requireApiKey: false,
    requireBaseUrl: true,
    additionalSettings: [],
  },
  anthropic: {
    label: 'Anthropic',
    defaultProviderId: 'anthropic',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  'azure-openai': {
    label: 'Azure OpenAI',
    defaultProviderId: null,
    requireApiKey: true,
    requireBaseUrl: true,
    additionalSettings: [
      {
        label: 'Deployment',
        key: 'deployment',
        placeholder: 'Enter your deployment name',
        type: 'text',
        required: true,
      },
      {
        label: 'API Version',
        key: 'apiVersion',
        placeholder: 'Enter your API version',
        type: 'text',
        required: true,
      },
    ],
  },
  deepseek: {
    label: 'DeepSeek',
    defaultProviderId: 'deepseek',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  gemini: {
    label: 'Gemini',
    defaultProviderId: 'gemini',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  'lm-studio': {
    label: 'LM Studio',
    defaultProviderId: 'lm-studio',
    requireApiKey: false,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  mistral: {
    label: 'Mistral',
    defaultProviderId: 'mistral',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  ollama: {
    label: 'Ollama',
    defaultProviderId: 'ollama',
    requireApiKey: false,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  openai: {
    label: 'OpenAI',
    defaultProviderId: 'openai',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  'openai-compatible': {
    label: 'OpenAI Compatible',
    defaultProviderId: null,
    requireApiKey: false,
    requireBaseUrl: true,
    additionalSettings: [
      {
        label: 'No Stainless Headers',
        key: 'noStainless',
        type: 'toggle',
        required: false,
        description:
          'Enable this if you encounter CORS errors related to Stainless headers (x-stainless-os, etc.)',
      },
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    defaultProviderId: 'openrouter',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  perplexity: {
    label: 'Perplexity',
    defaultProviderId: 'perplexity',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  unsloth: {
    label: 'Unsloth',
    defaultProviderId: 'unsloth',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
  xai: {
    label: 'xAI',
    defaultProviderId: 'xai',
    requireApiKey: true,
    requireBaseUrl: false,
    additionalSettings: [],
  },
} as const satisfies Record<
  LLMProviderType,
  {
    label: string
    defaultProviderId: string | null
    requireApiKey: boolean
    requireBaseUrl: boolean
    additionalSettings: {
      label: string
      key: string
      type: 'text' | 'toggle'
      placeholder?: string
      description?: string
      required?: boolean
    }[]
  }
>

/**
 * Important
 * 1. When adding new default provider, settings migration should be added
 * 2. If there's same provider id in user's settings, it's data should be overwritten by default provider
 */
export const DEFAULT_PROVIDERS: readonly LLMProvider[] = [
  {
    type: 'aperture',
    id: PROVIDER_TYPES_INFO.aperture.defaultProviderId,
    baseUrl: 'https://aperture-ai-gateway.greyhound-little.ts.net/v1',
  },
  {
    type: 'lm-studio',
    id: PROVIDER_TYPES_INFO['lm-studio'].defaultProviderId,
  },
  {
    type: 'ollama',
    id: PROVIDER_TYPES_INFO.ollama.defaultProviderId,
  },
  {
    type: 'openai',
    id: PROVIDER_TYPES_INFO.openai.defaultProviderId,
  },
  {
    type: 'openrouter',
    id: PROVIDER_TYPES_INFO.openrouter.defaultProviderId,
  },
  {
    type: 'unsloth',
    id: PROVIDER_TYPES_INFO.unsloth.defaultProviderId,
  },
]

/**
 * Important
 * 1. When adding new default model, settings migration should be added
 * 2. If there's same model id in user's settings, it's data should be overwritten by default model
 */
export const DEFAULT_CHAT_MODELS: readonly ChatModel[] = [
  {
    providerType: 'openai',
    providerId: PROVIDER_TYPES_INFO.openai.defaultProviderId,
    id: 'gpt-5.6-sol',
    model: 'gpt-5.6-sol',
    reasoning: {
      enabled: true,
      reasoning_effort: 'medium',
    },
  },
  {
    providerType: 'openai',
    providerId: PROVIDER_TYPES_INFO.openai.defaultProviderId,
    id: 'gpt-5.6-terra',
    model: 'gpt-5.6-terra',
  },
  {
    providerType: 'openai',
    providerId: PROVIDER_TYPES_INFO.openai.defaultProviderId,
    id: 'gpt-5.6-luna',
    model: 'gpt-5.6-luna',
  },
  {
    providerType: 'openai',
    providerId: PROVIDER_TYPES_INFO.openai.defaultProviderId,
    id: 'gpt-6-astra',
    model: 'gpt-6-astra',
    reasoning: {
      enabled: true,
      reasoning_effort: 'medium',
    },
  },
]

// Pricing in dollars per million tokens
type ModelPricing = {
  input: number
  output: number
}

export const OPENAI_PRICES: Record<string, ModelPricing> = {
  'gpt-6-astra': { input: 10, output: 50 },
  'gpt-5.6-sol': { input: 5, output: 30 },
  'gpt-5.6-terra': { input: 2.5, output: 15 },
  'gpt-5.6-luna': { input: 1, output: 6 },
  'gpt-5.2': { input: 1.75, output: 14 },
  'gpt-5.1': { input: 1.25, output: 10 },
  'gpt-5': { input: 1.25, output: 10 },
  'gpt-5-mini': { input: 0.25, output: 2 },
  'gpt-5-nano': { input: 0.05, output: 0.4 },
  'gpt-4.1': { input: 2.0, output: 8.0 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  o3: { input: 10, output: 40 },
  o1: { input: 15, output: 60 },
  'o4-mini': { input: 1.1, output: 4.4 },
  'o3-mini': { input: 1.1, output: 4.4 },
  'o1-mini': { input: 1.1, output: 4.4 },
}
