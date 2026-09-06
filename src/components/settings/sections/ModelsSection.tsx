import { App } from 'obsidian'
import React from 'react'

import SmartAssistantPlugin from '../../../main'

import { ChatModelsSubSection } from './models/ChatModelsSubSection'

type ModelsSectionProps = {
  app: App
  plugin: SmartAssistantPlugin
}

export function ModelsSection({ app, plugin }: ModelsSectionProps) {
  return (
    <div className="smtcmp-settings-section">
      <div className="smtcmp-settings-header">Models</div>
      <ChatModelsSubSection app={app} plugin={plugin} />
    </div>
  )
}
