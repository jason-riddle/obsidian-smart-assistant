import { App } from 'obsidian'

import { AppProvider } from '../../contexts/app-context'
import { SkillsProvider } from '../../contexts/skills-context'
import SmartComposerPlugin from '../../main'

import { ChatSection } from './sections/ChatSection'
import { McpSection } from './sections/McpSection'
import { MiscSection } from './sections/MiscSection'
import { ModelsSection } from './sections/ModelsSection'
import { ProvidersSection } from './sections/ProvidersSection'
import { SkillsSection } from './sections/SkillsSection'

type SettingsTabRootProps = {
  app: App
  plugin: SmartComposerPlugin
}

export function SettingsTabRoot({ app, plugin }: SettingsTabRootProps) {
  return (
    <>
      <ChatSection app={app} />
      <ProvidersSection app={app} plugin={plugin} />
      <ModelsSection app={app} plugin={plugin} />
      <McpSection app={app} plugin={plugin} />
      <AppProvider app={app}>
        <SkillsProvider>
          <SkillsSection app={app} />
        </SkillsProvider>
      </AppProvider>
      <MiscSection app={app} plugin={plugin} />
    </>
  )
}
