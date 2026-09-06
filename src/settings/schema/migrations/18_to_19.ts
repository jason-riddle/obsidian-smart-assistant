import { SettingMigration } from '../setting.types'

const REMOVED_DEFAULT_PROVIDER_IDS = [
  'anthropic',
  'gemini',
  'xai',
  'deepseek',
  'mistral',
  'perplexity',
]

const OLD_DEFAULT_MODEL_IDS = [
  'claude-opus-4.5',
  'claude-sonnet-4.5',
  'claude-haiku-4.5',
  'gpt-5.2',
  'gpt-5-mini',
  'gpt-4.1-mini',
  'o4-mini',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'deepseek-chat',
  'deepseek-reasoner',
  'grok-4-1-fast',
  'grok-4-1-fast-non-reasoning',
]

export const migrateFrom18To19: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 19

  const providers = (newData as { providers?: unknown[] }).providers
  if (Array.isArray(providers)) {
    newData.providers = providers.filter((provider) => {
      if (typeof provider !== 'object' || provider === null) {
        return true
      }
      const p = provider as { id?: string; apiKey?: string }
      if (!REMOVED_DEFAULT_PROVIDER_IDS.includes(p.id ?? '')) {
        return true
      }
      return p.apiKey !== undefined && p.apiKey !== ''
    })
  }

  const chatModels = (newData as { chatModels?: unknown[] }).chatModels
  if (Array.isArray(chatModels)) {
    newData.chatModels = chatModels.filter((model) => {
      if (typeof model !== 'object' || model === null) {
        return true
      }
      const m = model as { providerId?: string }
      return !REMOVED_DEFAULT_PROVIDER_IDS.includes(m.providerId ?? '')
    })
  }

  const chatModelId = (newData as { chatModelId?: string }).chatModelId
  if (
    typeof chatModelId === 'string' &&
    OLD_DEFAULT_MODEL_IDS.includes(chatModelId)
  ) {
    newData.chatModelId = 'gpt-5.6-sol'
  }

  const applyModelId = (newData as { applyModelId?: string }).applyModelId
  if (
    typeof applyModelId === 'string' &&
    OLD_DEFAULT_MODEL_IDS.includes(applyModelId)
  ) {
    newData.applyModelId = 'gpt-5.6-luna'
  }

  return newData
}
