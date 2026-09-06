import type { SmartAssistantSettings } from '../settings/schema/setting.types'

import { toggleSkillEnabledLogic } from './toggleSkillEnabledLogic'

function makeSettings(disabledSkills: string[] = []): SmartAssistantSettings {
  return {
    version: 20,
    providers: [],
    chatModels: [],
    chatModelId: 'gpt-5.6-sol',
    applyModelId: 'gpt-5.6-luna',
    systemPromptFile: '',
    systemPrompt: '',
    disabledSkills,
    mcp: { servers: [] },
    chatOptions: {
      includeCurrentFileContent: true,
      enableTools: true,
      maxAutoIterations: 1,
    },
  }
}

describe('toggleSkillEnabledLogic', () => {
  it('should add a skill to disabledSkills when it is enabled', () => {
    const settings = makeSettings([])
    const result = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(result.disabledSkills).toEqual(['skill-a'])
  })

  it('should remove a skill from disabledSkills when it is disabled', () => {
    const settings = makeSettings(['skill-a', 'skill-b'])
    const result = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(result.disabledSkills).toEqual(['skill-b'])
  })

  it('should not mutate the original settings object', () => {
    const settings = makeSettings(['skill-a'])
    const result = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(settings.disabledSkills).toEqual(['skill-a'])
    expect(result.disabledSkills).toEqual([])
  })

  it('should preserve other settings fields', () => {
    const settings = makeSettings(['skill-a'])
    settings.chatModelId = 'custom-model'
    const result = toggleSkillEnabledLogic(settings, 'skill-b')
    expect(result.chatModelId).toBe('custom-model')
    expect(result.disabledSkills).toEqual(['skill-a', 'skill-b'])
  })

  it('should handle toggling the same skill multiple times', () => {
    let settings = makeSettings([])

    settings = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(settings.disabledSkills).toEqual(['skill-a'])

    settings = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(settings.disabledSkills).toEqual([])

    settings = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(settings.disabledSkills).toEqual(['skill-a'])
  })

  it('should toggle using stale settings reference without losing other skills', () => {
    const staleSettings = makeSettings(['skill-a', 'skill-b', 'skill-c'])
    const result = toggleSkillEnabledLogic(staleSettings, 'skill-b')
    expect(result.disabledSkills).toEqual(['skill-a', 'skill-c'])
  })

  it('should add to an empty disabledSkills array', () => {
    const settings = makeSettings([])
    const result = toggleSkillEnabledLogic(settings, 'new-skill')
    expect(result.disabledSkills).toEqual(['new-skill'])
  })

  it('should not add a duplicate if skill is already disabled', () => {
    const settings = makeSettings(['skill-a'])
    const result = toggleSkillEnabledLogic(settings, 'skill-a')
    expect(result.disabledSkills).not.toContain('skill-a')
    expect(result.disabledSkills).toEqual([])
  })
})
