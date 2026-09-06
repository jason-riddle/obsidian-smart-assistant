import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'

import { ApplyView } from './ApplyView'
import { ChatView } from './ChatView'
import { ChatProps } from './components/chat-view/Chat'
import { APPLY_VIEW_TYPE, CHAT_VIEW_TYPE } from './constants'
import { McpManager } from './core/mcp/mcpManager'
import { migrateToJsonDatabase } from './database/json/migrateToJsonDatabase'
import {
  SmartAssistantSettings,
  smartAssistantSettingsSchema,
} from './settings/schema/setting.types'
import { parseSmartAssistantSettings } from './settings/schema/settings'
import { SmartAssistantSettingTab } from './settings/SettingTab'
import { logger } from './utils/logger'
import { getMentionableBlockData } from './utils/obsidian'

export default class SmartAssistantPlugin extends Plugin {
  settings: SmartAssistantSettings
  initialChatProps?: ChatProps // TODO: change this to use view state like ApplyView
  settingsChangeListeners: ((newSettings: SmartAssistantSettings) => void)[] =
    []
  mcpManager: McpManager | null = null

  async onload() {
    logger.info('main', 'onload', 'Plugin loading...')
    await this.loadSettings()
    logger.info('main', 'onload', 'Plugin loaded successfully')

    this.registerView(CHAT_VIEW_TYPE, (leaf) => new ChatView(leaf, this))
    this.registerView(APPLY_VIEW_TYPE, (leaf) => new ApplyView(leaf))

    // This creates an icon in the left ribbon.
    this.addRibbonIcon('wand-sparkles', 'Open Smart Assistant', () =>
      this.openChatView(),
    )

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-new-chat',
      name: 'Open chat',
      callback: () => this.openChatView(true),
    })

    this.addCommand({
      id: 'add-selection-to-chat',
      name: 'Add selection to chat',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.addSelectionToChat(editor, view)
      },
    })

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SmartAssistantSettingTab(this.app, this))

    this.registerObsidianProtocolHandler(
      'smart-assistant/oauth/callback',
      async (params) => {
        await this.handleOAuthCallback(params)
      },
    )

    void this.migrateToJsonStorage()
  }

  onunload() {
    logger.info('main', 'onunload', 'Plugin unloading...')
    // McpManager cleanup
    this.mcpManager?.cleanup()
    this.mcpManager = null
  }

  async loadSettings() {
    logger.debug('main', 'loadSettings', 'Loading settings...')
    this.settings = parseSmartAssistantSettings(await this.loadData())
    await this.saveData(this.settings) // Save updated settings
  }

  async setSettings(newSettings: SmartAssistantSettings) {
    const validationResult = smartAssistantSettingsSchema.safeParse(newSettings)

    if (!validationResult.success) {
      new Notice(`Invalid settings:
${validationResult.error.issues.map((v) => v.message).join('\n')}`)
      return
    }

    this.settings = newSettings
    await this.saveData(newSettings)
    this.settingsChangeListeners.forEach((listener) => listener(newSettings))
    logger.debug('main', 'setSettings', 'Settings updated')
  }

  addSettingsChangeListener(
    listener: (newSettings: SmartAssistantSettings) => void,
  ) {
    this.settingsChangeListeners.push(listener)
    return () => {
      this.settingsChangeListeners = this.settingsChangeListeners.filter(
        (l) => l !== listener,
      )
    }
  }

  async openChatView(openNewChat = false) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)
    const editor = view?.editor
    if (!view || !editor) {
      this.activateChatView(undefined, openNewChat)
      return
    }
    const selectedBlockData = await getMentionableBlockData(editor, view)
    this.activateChatView(
      {
        selectedBlock: selectedBlockData ?? undefined,
      },
      openNewChat,
    )
  }

  async activateChatView(chatProps?: ChatProps, openNewChat = false) {
    // chatProps is consumed in ChatView.tsx
    this.initialChatProps = chatProps

    const leaf = this.app.workspace.getLeavesOfType(CHAT_VIEW_TYPE)[0]

    await (leaf ?? this.app.workspace.getRightLeaf(false))?.setViewState({
      type: CHAT_VIEW_TYPE,
      active: true,
    })

    if (openNewChat && leaf && leaf.view instanceof ChatView) {
      leaf.view.openNewChat(chatProps?.selectedBlock)
    }

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(CHAT_VIEW_TYPE)[0],
    )
  }

  async addSelectionToChat(editor: Editor, view: MarkdownView) {
    const data = await getMentionableBlockData(editor, view)
    if (!data) return

    const leaves = this.app.workspace.getLeavesOfType(CHAT_VIEW_TYPE)
    if (leaves.length === 0 || !(leaves[0].view instanceof ChatView)) {
      await this.activateChatView({
        selectedBlock: data,
      })
      return
    }

    // bring leaf to foreground (uncollapse sidebar if it's collapsed)
    await this.app.workspace.revealLeaf(leaves[0])

    const chatView = leaves[0].view
    chatView.addSelectionToChat(data)
    chatView.focusMessage()
  }

  async getMcpManager(): Promise<McpManager> {
    if (this.mcpManager) {
      return this.mcpManager
    }

    try {
      this.mcpManager = new McpManager({
        settings: this.settings,
        registerSettingsListener: (
          listener: (settings: SmartAssistantSettings) => void,
        ) => this.addSettingsChangeListener(listener),
        app: this.app,
      })
      await this.mcpManager.initialize()
      return this.mcpManager
    } catch (error) {
      this.mcpManager = null
      throw error
    }
  }

  private async migrateToJsonStorage() {
    try {
      await migrateToJsonDatabase(this.app, async () => {
        await this.reloadChatView()
        logger.info(
          'main',
          'migrateToJsonStorage',
          'Migration to JSON storage completed successfully',
        )
      })
    } catch (error) {
      logger.error(
        'main',
        'migrateToJsonStorage',
        'Failed to migrate to JSON storage',
        error,
      )
      new Notice(
        'Failed to migrate to JSON storage. Please check the console for details.',
      )
    }
  }

  private async reloadChatView() {
    const leaves = this.app.workspace.getLeavesOfType(CHAT_VIEW_TYPE)
    if (leaves.length === 0 || !(leaves[0].view instanceof ChatView)) {
      return
    }
    new Notice('Reloading "smart-assistant" due to migration', 1000)
    leaves[0].detach()
    await this.activateChatView()
  }

  private async handleOAuthCallback(params: {
    action: string
    [key: string]: string | 'true'
  }): Promise<void> {
    const urlParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (key !== 'action') {
        urlParams.set(key, String(value))
      }
    }

    const state = urlParams.get('state')
    if (!state) {
      new Notice('OAuth callback missing state parameter')
      return
    }

    try {
      const mcpManager = await this.getMcpManager()
      await mcpManager.completeOAuthFlow(state, urlParams)
      new Notice('MCP server authentication successful')
    } catch (error) {
      logger.error(
        'main',
        'handleOAuthCallback',
        'MCP OAuth callback error',
        error,
      )
      new Notice(
        `MCP server authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
