import type { SmartAssistantSettings } from '../settings/schema/setting.types'

export function toggleSkillEnabledLogic(
  settings: SmartAssistantSettings,
  skillName: string,
): SmartAssistantSettings {
  const isDisabled = settings.disabledSkills.includes(skillName)
  const newDisabledSkills = isDisabled
    ? settings.disabledSkills.filter((name) => name !== skillName)
    : [...settings.disabledSkills, skillName]
  return {
    ...settings,
    disabledSkills: newDisabledSkills,
  }
}
