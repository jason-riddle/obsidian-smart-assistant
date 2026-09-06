import { migrateFrom18To19 } from './18_to_19'

describe('Migration from v18 to v19', () => {
  it('should increment version to 19', () => {
    const oldSettings = {
      version: 18,
    }
    const result = migrateFrom18To19(oldSettings)
    expect(result.version).toBe(19)
  })

  it('should remove default providers that have no apiKey set', () => {
    const oldSettings = {
      version: 18,
      providers: [
        { id: 'anthropic', apiKey: '' },
        { id: 'gemini', apiKey: '' },
        { id: 'xai', apiKey: '' },
        { id: 'deepseek', apiKey: '' },
        { id: 'mistral', apiKey: '' },
        { id: 'perplexity', apiKey: '' },
      ],
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { providers?: { id: string }[] }).providers).toEqual([])
  })

  it('should remove chat models associated with removed providers', () => {
    const oldSettings = {
      version: 18,
      providers: [{ id: 'anthropic', apiKey: '' }],
      chatModels: [
        { id: 'claude-sonnet', providerId: 'anthropic' },
        { id: 'gpt-5.6-sol', providerId: 'openai' },
      ],
    }
    const result = migrateFrom18To19(oldSettings)
    const chatModels = (
      result as { chatModels?: { id: string; providerId: string }[] }
    ).chatModels
    expect(chatModels).toEqual([{ id: 'gpt-5.6-sol', providerId: 'openai' }])
  })

  it('should update chatModelId when it points to an old default model ID', () => {
    const oldSettings = {
      version: 18,
      chatModelId: 'claude-sonnet-4.5',
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { chatModelId?: string }).chatModelId).toBe('gpt-5.6-sol')
  })

  it('should update applyModelId when it points to an old default model ID', () => {
    const oldSettings = {
      version: 18,
      applyModelId: 'gpt-4.1-mini',
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { applyModelId?: string }).applyModelId).toBe(
      'gpt-5.6-luna',
    )
  })

  it('should keep default providers that have an apiKey set', () => {
    const oldSettings = {
      version: 18,
      providers: [
        { id: 'anthropic', apiKey: 'sk-ant-xxx' },
        { id: 'gemini', apiKey: 'AIzaSyXXX' },
        { id: 'openai', apiKey: 'sk-xxx' },
      ],
    }
    const result = migrateFrom18To19(oldSettings)
    const providers = (
      result as { providers?: { id: string; apiKey?: string }[] }
    ).providers
    expect(providers).toHaveLength(3)
    expect(providers?.map((p) => p.id)).toEqual([
      'anthropic',
      'gemini',
      'openai',
    ])
  })

  it('should not remove custom providers (non-default IDs)', () => {
    const oldSettings = {
      version: 18,
      providers: [
        { id: 'my-custom-provider', apiKey: '' },
        { id: 'anthropic', apiKey: '' },
      ],
    }
    const result = migrateFrom18To19(oldSettings)
    const providers = (result as { providers?: { id: string }[] }).providers
    expect(providers).toEqual([{ id: 'my-custom-provider', apiKey: '' }])
  })

  it('should not remove chat models for non-removed providers', () => {
    const oldSettings = {
      version: 18,
      providers: [{ id: 'openai', apiKey: '' }],
      chatModels: [
        { id: 'gpt-5.6-sol', providerId: 'openai' },
        { id: 'gpt-5.6-terra', providerId: 'openai' },
      ],
    }
    const result = migrateFrom18To19(oldSettings)
    const chatModels = (
      result as { chatModels?: { id: string; providerId: string }[] }
    ).chatModels
    expect(chatModels).toHaveLength(2)
    expect(chatModels?.map((m) => m.id)).toEqual([
      'gpt-5.6-sol',
      'gpt-5.6-terra',
    ])
  })

  it('should not change chatModelId if it points to a non-old model ID', () => {
    const oldSettings = {
      version: 18,
      chatModelId: 'gpt-5.6-sol',
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { chatModelId?: string }).chatModelId).toBe('gpt-5.6-sol')
  })

  it('should not change applyModelId if it points to a non-old model ID', () => {
    const oldSettings = {
      version: 18,
      applyModelId: 'gpt-5.6-luna',
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { applyModelId?: string }).applyModelId).toBe(
      'gpt-5.6-luna',
    )
  })

  it('should handle missing providers array', () => {
    const oldSettings = {
      version: 18,
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { providers?: unknown }).providers).toBeUndefined()
  })

  it('should handle missing chatModels array', () => {
    const oldSettings = {
      version: 18,
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { chatModels?: unknown }).chatModels).toBeUndefined()
  })

  it('should handle missing chatModelId and applyModelId', () => {
    const oldSettings = {
      version: 18,
    }
    const result = migrateFrom18To19(oldSettings)
    expect((result as { chatModelId?: unknown }).chatModelId).toBeUndefined()
    expect((result as { applyModelId?: unknown }).applyModelId).toBeUndefined()
  })
})
