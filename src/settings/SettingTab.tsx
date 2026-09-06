import { App, PluginSettingTab } from 'obsidian'
import { Root, createRoot } from 'react-dom/client'

import { SettingsTabRoot } from '../components/settings/SettingsTabRoot'
import { SettingsProvider } from '../contexts/settings-context'
import SmartAssistantPlugin from '../main'

export class SmartAssistantSettingTab extends PluginSettingTab {
  plugin: SmartAssistantPlugin
  private root: Root | null = null

  constructor(app: App, plugin: SmartAssistantPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    this.root = createRoot(containerEl)
    this.root.render(
      <SettingsProvider
        settings={this.plugin.settings}
        setSettings={(newSettings) => this.plugin.setSettings(newSettings)}
        addSettingsChangeListener={(listener) =>
          this.plugin.addSettingsChangeListener(listener)
        }
      >
        <SettingsTabRoot app={this.app} plugin={this.plugin} />
      </SettingsProvider>,
    )
  }

  hide(): void {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }
}
