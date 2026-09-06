import { migrateFrom17To18 } from './17_to_18'

describe('Migration from v17 to v18', () => {
  it('should increment version to 18', () => {
    const oldSettings = {
      version: 17,
    }
    const result = migrateFrom17To18(oldSettings)
    expect(result.version).toBe(18)
  })

  it('should set systemPromptFile to empty string when systemPrompt is empty', () => {
    const oldSettings = {
      version: 17,
      systemPrompt: '',
    }
    const result = migrateFrom17To18(oldSettings)
    expect(result.systemPromptFile).toBe('')
  })

  it('should clear a non-empty systemPrompt to an empty systemPromptFile', () => {
    const oldSettings = {
      version: 17,
      systemPrompt: 'You are a helpful assistant',
    }
    const result = migrateFrom17To18(oldSettings)
    expect(result.systemPromptFile).toBe('')
  })

  it('should remove the old systemPrompt key', () => {
    const oldSettings = {
      version: 17,
      systemPrompt: 'You are a helpful assistant',
    }
    const result = migrateFrom17To18(oldSettings)
    expect(
      (result as { systemPrompt?: unknown }).systemPrompt,
    ).toBeUndefined()
  })

  it('should handle missing systemPrompt field', () => {
    const oldSettings = {
      version: 17,
    }
    const result = migrateFrom17To18(oldSettings)
    expect(result.systemPromptFile).toBe('')
    expect(
      (result as { systemPrompt?: unknown }).systemPrompt,
    ).toBeUndefined()
  })
})
