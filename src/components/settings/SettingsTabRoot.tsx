import { App } from 'obsidian'

// TEMPORARY DEBUG ISOLATION: the MCP enabled toggle has been observed
// switching back and forth while settings and connection state update
// asynchronously. Skills are not proven to be the cause, but this section
// also mounts SkillsProvider and writes disabledSkills through SettingsProvider
// in the same settings surface. Keep it hidden while isolating whether skill
// settings wiring contributes to the state race. Runtime skill discovery,
// prompt filtering, read_skill, and the chat skills modal remain active.
// import { AppProvider } from '../../contexts/app-context'
// import { SkillsProvider } from '../../contexts/skills-context'
import SmartAssistantPlugin from '../../main'

import { ChatSection } from './sections/ChatSection'
import { McpSection } from './sections/McpSection'
import { MiscSection } from './sections/MiscSection'
import { ModelsSection } from './sections/ModelsSection'
import { ProvidersSection } from './sections/ProvidersSection'
// import { SkillsSection } from './sections/SkillsSection'

type SettingsTabRootProps = {
  app: App
  plugin: SmartAssistantPlugin
}

export function SettingsTabRoot({ app, plugin }: SettingsTabRootProps) {
  return (
    <>
      <ChatSection app={app} />
      <ProvidersSection app={app} plugin={plugin} />
      <ModelsSection app={app} plugin={plugin} />
      <McpSection app={app} plugin={plugin} />
      {/*
        TEMPORARY DEBUG ISOLATION: restore this block after the MCP/settings
        race investigation. The SkillsSection is read-only in the UI, but its
        SkillsProvider can persist disabledSkills through the shared settings
        context. Keep the provider and section wiring intact so the experiment
        can be reversed without reconstructing the original settings surface.
        <AppProvider app={app}>
          <SkillsProvider>
            <SkillsSection app={app} />
          </SkillsProvider>
        </AppProvider>
      */}
      <MiscSection app={app} plugin={plugin} />
    </>
  )
}
