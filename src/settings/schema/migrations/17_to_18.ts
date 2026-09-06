import { SettingMigration } from '../setting.types'

export const migrateFrom17To18: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 18

  // The old `systemPrompt` (an inline text string) is replaced by
  // `systemPromptFile` (a vault file path). We cannot auto-convert an
  // inline string into a file, so clear the value and let the user
  // create a file and set the path.
  delete (newData as { systemPrompt?: unknown }).systemPrompt
  newData.systemPromptFile = ''

  return newData
}
