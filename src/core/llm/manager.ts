import { SmartComposerSettings } from '../../settings/schema/setting.types'
import { ChatModel } from '../../types/chat-model.types'
import { LLMProvider } from '../../types/provider.types'
import { logger } from '../../utils/logger'

import { AnthropicProvider } from './anthropic'
import { ApertureProvider } from './apertureProvider'
import { AzureOpenAIProvider } from './azureOpenaiProvider'
import { BaseLLMProvider } from './base'
import { DeepSeekStudioProvider } from './deepseekStudioProvider'
import { LLMModelNotFoundException } from './exception'
import { GeminiProvider } from './gemini'
import { LmStudioProvider } from './lmStudioProvider'
import { MistralProvider } from './mistralProvider'
import { OllamaProvider } from './ollama'
import { OpenAIAuthenticatedProvider } from './openai'
import { OpenAICompatibleProvider } from './openaiCompatibleProvider'
import { OpenRouterProvider } from './openRouterProvider'
import { PerplexityProvider } from './perplexityProvider'
import { UnslothProvider } from './unslothProvider'
import { XaiProvider } from './xaiProvider'

/*
 * OpenAI, OpenAI-compatible, and Anthropic providers include token usage statistics
 * in the final chunk of the stream (following OpenAI's behavior).
 */

export function getProviderClient({
  providerId,
  settings,
}: {
  providerId: string
  settings: SmartComposerSettings
}): BaseLLMProvider<LLMProvider> {
  const provider = settings.providers.find((p) => p.id === providerId)
  if (!provider) {
    throw new Error(`Provider ${providerId} not found`)
  }

  switch (provider.type) {
    case 'aperture': {
      return new ApertureProvider(provider)
    }
    case 'anthropic': {
      return new AnthropicProvider(provider)
    }
    case 'openai': {
      return new OpenAIAuthenticatedProvider(provider)
    }
    case 'gemini': {
      return new GeminiProvider(provider)
    }
    case 'openrouter': {
      return new OpenRouterProvider(provider)
    }
    case 'ollama': {
      return new OllamaProvider(provider)
    }
    case 'lm-studio': {
      return new LmStudioProvider(provider)
    }
    case 'unsloth': {
      return new UnslothProvider(provider)
    }
    case 'deepseek': {
      return new DeepSeekStudioProvider(provider)
    }
    case 'perplexity': {
      return new PerplexityProvider(provider)
    }
    case 'mistral': {
      return new MistralProvider(provider)
    }
    case 'xai': {
      return new XaiProvider(provider)
    }
    case 'azure-openai': {
      return new AzureOpenAIProvider(provider)
    }
    case 'openai-compatible': {
      return new OpenAICompatibleProvider(provider)
    }
  }
}

export function getChatModelClient({
  modelId,
  settings,
}: {
  modelId: string
  settings: SmartComposerSettings
}): {
  providerClient: BaseLLMProvider<LLMProvider>
  model: ChatModel
} {
  const chatModel = settings.chatModels.find((model) => model.id === modelId)
  if (!chatModel) {
    throw new LLMModelNotFoundException(`Chat model ${modelId} not found`)
  }

  logger.debug(
    'LLMManager',
    'getChatModelClient',
    `Creating chat model client for provider: ${chatModel.providerType}, model: ${chatModel.model}`,
  )

  const providerClient = getProviderClient({
    providerId: chatModel.providerId,
    settings,
  })

  return {
    providerClient,
    model: chatModel,
  }
}
