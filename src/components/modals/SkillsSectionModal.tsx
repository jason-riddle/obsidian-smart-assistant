import { App } from 'obsidian'

import { AppProvider } from '../../contexts/app-context'
import { SettingsProvider } from '../../contexts/settings-context'
import { SkillsProvider } from '../../contexts/skills-context'
import SmartAssistantPlugin from '../../main'
import { ReactModal } from '../common/ReactModal'
import { SkillsSection } from '../settings/sections/SkillsSection'

type SkillsSectionModalProps = {
  app: App
  plugin: SmartAssistantPlugin
}

export class SkillsSectionModal extends ReactModal<SkillsSectionModalProps> {
  constructor(app: App, plugin: SmartAssistantPlugin) {
    super({
      app: app,
      Component: SkillsSectionComponent,
      props: {
        app,
        plugin,
      },
    })
    this.modalEl.style.width = '720px'
  }
}

function SkillsSectionComponent({ app, plugin }: SkillsSectionModalProps) {
  return (
    <AppProvider app={app}>
      <SettingsProvider
        settings={plugin.settings}
        setSettings={(newSettings) => plugin.setSettings(newSettings)}
        addSettingsChangeListener={(listener) =>
          plugin.addSettingsChangeListener(listener)
        }
      >
        <SkillsProvider>
          <SkillsSection app={app} />
        </SkillsProvider>
      </SettingsProvider>
    </AppProvider>
  )
}
