import { migrateFrom19To20 } from './19_to_20'

describe('Migration from v19 to v20', () => {
  it('should increment version to 20', () => {
    const oldSettings = {
      version: 19,
    }
    const result = migrateFrom19To20(oldSettings)
    expect(result.version).toBe(20)
  })

  it('should add disabledSkills as empty array when it does not exist', () => {
    const oldSettings = {
      version: 19,
    }
    const result = migrateFrom19To20(oldSettings)
    expect((result as { disabledSkills?: unknown[] }).disabledSkills).toEqual(
      [],
    )
  })

  it('should preserve existing disabledSkills array if already set', () => {
    const oldSettings = {
      version: 19,
      disabledSkills: ['my-skill', 'other-skill'],
    }
    const result = migrateFrom19To20(oldSettings)
    expect((result as { disabledSkills?: string[] }).disabledSkills).toEqual([
      'my-skill',
      'other-skill',
    ])
  })

  it('should not overwrite disabledSkills if it already exists with values', () => {
    const oldSettings = {
      version: 19,
      disabledSkills: ['keep-this'],
    }
    const result = migrateFrom19To20(oldSettings)
    expect((result as { disabledSkills?: string[] }).disabledSkills).toEqual([
      'keep-this',
    ])
  })

  it('should not modify other settings fields', () => {
    const oldSettings = {
      version: 19,
      chatModelId: 'gpt-5.6-sol',
      applyModelId: 'gpt-5.6-luna',
      systemPromptFile: 'prompts/system.md',
      providers: [{ id: 'openai', apiKey: 'sk-xxx' }],
      chatModels: [{ id: 'gpt-5.6-sol', providerId: 'openai' }],
    }
    const result = migrateFrom19To20(oldSettings)
    const typed = result as {
      chatModelId?: string
      applyModelId?: string
      systemPromptFile?: string
      providers?: { id: string }[]
      chatModels?: { id: string }[]
    }
    expect(typed.chatModelId).toBe('gpt-5.6-sol')
    expect(typed.applyModelId).toBe('gpt-5.6-luna')
    expect(typed.systemPromptFile).toBe('prompts/system.md')
    expect(typed.providers).toEqual([{ id: 'openai', apiKey: 'sk-xxx' }])
    expect(typed.chatModels).toEqual([
      { id: 'gpt-5.6-sol', providerId: 'openai' },
    ])
  })

  it('should add disabledSkills when disabledSkills is not an array', () => {
    const oldSettings = {
      version: 19,
      disabledSkills: 'not-an-array',
    }
    const result = migrateFrom19To20(oldSettings)
    expect((result as { disabledSkills?: unknown[] }).disabledSkills).toEqual(
      [],
    )
  })

  it('should set disabledSkills to empty array when it is null', () => {
    const oldSettings = {
      version: 19,
      disabledSkills: null,
    }
    const result = migrateFrom19To20(oldSettings)
    expect((result as { disabledSkills?: unknown[] }).disabledSkills).toEqual(
      [],
    )
  })
})
