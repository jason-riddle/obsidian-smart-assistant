import { App, normalizePath } from 'obsidian'

import { ChatConversationManager } from '../../utils/chat/chatHistoryManager'

import { ChatManager } from './chat/ChatManager'
import { INITIAL_MIGRATION_MARKER, ROOT_DIR } from './constants'

async function hasMigrationCompleted(app: App): Promise<boolean> {
  const markerPath = normalizePath(`${ROOT_DIR}/${INITIAL_MIGRATION_MARKER}`)
  return await app.vault.adapter.exists(markerPath)
}

async function markMigrationCompleted(app: App): Promise<void> {
  const markerPath = normalizePath(`${ROOT_DIR}/${INITIAL_MIGRATION_MARKER}`)
  await app.vault.adapter.write(
    markerPath,
    `Migration completed on ${new Date().toISOString()}`,
  )
}

async function transferChatHistoryFromLegacy(app: App): Promise<void> {
  const oldChatManager = new ChatConversationManager(app)
  const newChatManager = new ChatManager(app)

  const chatList = await oldChatManager.getChatList()

  for (const chatMeta of chatList) {
    try {
      const oldChat = await oldChatManager.findChatConversation(chatMeta.id)
      if (!oldChat) {
        continue
      }

      const existingChat = await newChatManager.findById(oldChat.id)
      if (existingChat) {
        continue
      }

      await newChatManager.createChat({
        id: oldChat.id,
        title: oldChat.title,
        messages: oldChat.messages,
        createdAt: oldChat.createdAt,
        updatedAt: oldChat.updatedAt,
      })

      const verifyChat = await newChatManager.findById(oldChat.id)
      if (!verifyChat) {
        throw new Error(`Failed to verify migration of chat ${oldChat.id}`)
      }

      await oldChatManager.deleteChatConversation(oldChat.id)
    } catch (error) {
      console.error(`Error migrating chat ${chatMeta.id}:`, error)
    }
  }

  console.log('Chat history migration to JSON database completed')
}

export async function migrateToJsonDatabase(
  app: App,
  onMigrationComplete?: () => void,
): Promise<void> {
  if (await hasMigrationCompleted(app)) {
    return
  }

  await transferChatHistoryFromLegacy(app)
  await markMigrationCompleted(app)
  onMigrationComplete?.()
}
