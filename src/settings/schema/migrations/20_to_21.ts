import { SettingMigration } from '../setting.types'

const SYSTEM_PROMPT_MODES = ['default', 'minimal', 'custom']

export const migrateFrom20To21: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 21

  if (
    typeof newData.systemPromptMode !== 'string' ||
    !SYSTEM_PROMPT_MODES.includes(newData.systemPromptMode)
  ) {
    newData.systemPromptMode = 'default'
  }

  return newData
}
