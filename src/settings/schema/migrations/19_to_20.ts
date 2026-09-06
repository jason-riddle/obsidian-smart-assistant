import { SettingMigration } from '../setting.types'

export const migrateFrom19To20: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 20

  if (
    !Array.isArray((newData as { disabledSkills?: unknown }).disabledSkills)
  ) {
    newData.disabledSkills = []
  }

  return newData
}
