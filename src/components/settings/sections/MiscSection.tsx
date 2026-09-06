import { App, Notice } from 'obsidian'

import { useSettings } from '../../../contexts/settings-context'
import SmartAssistantPlugin from '../../../main'
import { smartAssistantSettingsSchema } from '../../../settings/schema/setting.types'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ConfirmModal } from '../../modals/ConfirmModal'

type MiscSectionProps = {
  app: App
  plugin: SmartAssistantPlugin
}

export function MiscSection({ app }: MiscSectionProps) {
  const { setSettings } = useSettings()

  const handleResetSettings = () => {
    new ConfirmModal(app, {
      title: 'Reset settings',
      message:
        'Are you sure you want to reset all settings to default values? This cannot be undone.',
      ctaText: 'Reset',
      onConfirm: async () => {
        const defaultSettings = smartAssistantSettingsSchema.parse({})
        await setSettings(defaultSettings)
        new Notice('Settings have been reset to defaults')
      },
    }).open()
  }

  return (
    <div className="smtcmp-settings-section">
      <div className="smtcmp-settings-header">Miscellaneous</div>

      <ObsidianSetting
        name="Reset settings"
        desc="Reset all settings to default values"
      >
        <ObsidianButton text="Reset" warning onClick={handleResetSettings} />
      </ObsidianSetting>
    </div>
  )
}
