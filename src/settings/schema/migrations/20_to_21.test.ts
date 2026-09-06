import { migrateFrom20To21 } from './20_to_21'

describe('Migration from v20 to v21', () => {
  it('should default the system prompt mode to default', () => {
    const result = migrateFrom20To21({ version: 20 })

    expect(result.version).toBe(21)
    expect(result.systemPromptMode).toBe('default')
  })

  it('should preserve a valid system prompt mode and legacy fields', () => {
    const result = migrateFrom20To21({
      version: 20,
      systemPromptMode: 'custom',
      systemPrompt: 'Use my instructions.',
      systemPromptFile: 'legacy.md',
    })

    expect(result.systemPromptMode).toBe('custom')
    expect(result.systemPrompt).toBe('Use my instructions.')
    expect(result.systemPromptFile).toBe('legacy.md')
  })

  it('should replace an invalid system prompt mode with default', () => {
    const result = migrateFrom20To21({
      version: 20,
      systemPromptMode: 'unknown',
    })

    expect(result.systemPromptMode).toBe('default')
  })
})
