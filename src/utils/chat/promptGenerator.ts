import { App, TFile, htmlToMarkdown, requestUrl } from 'obsidian'

import { editorStateToPlainText } from '../../components/chat-view/chat-input/utils/editor-state-to-plain-text'
import { DEFAULT_SYSTEM_PROMPT, MINIMAL_SYSTEM_PROMPT } from '../../constants'
import { Skill } from '../../core/skills/types'
import { SmartAssistantSettings } from '../../settings/schema/setting.types'
import {
  ChatAssistantMessage,
  ChatMessage,
  ChatToolMessage,
  ChatUserMessage,
} from '../../types/chat'
import { ContentPart, RequestMessage } from '../../types/llm/request'
import {
  MentionableBlock,
  MentionableFile,
  MentionableFolder,
  MentionableImage,
  MentionableUrl,
} from '../../types/mentionable'
import { ToolCallResponseStatus } from '../../types/tool-call.types'
import { logger } from '../logger'
import {
  getNestedFiles,
  readMultipleTFiles,
  readTFileContent,
} from '../obsidian'

import { YoutubeTranscript, isYoutubeUrl } from './youtube-transcript'

export function selectSystemPrompt(
  mode: SmartAssistantSettings['systemPromptMode'],
  customPrompt: string,
): string {
  if (mode === 'minimal') {
    return MINIMAL_SYSTEM_PROMPT
  }
  if (mode === 'custom') {
    return customPrompt.trim()
  }
  return DEFAULT_SYSTEM_PROMPT
}

export class PromptGenerator {
  private app: App
  private settings: SmartAssistantSettings
  private skills: Skill[]
  private MAX_CONTEXT_MESSAGES = 20

  constructor(
    app: App,
    settings: SmartAssistantSettings,
    skills: Skill[] = [],
  ) {
    this.app = app
    this.settings = settings
    this.skills = skills
  }

  public async generateRequestMessages({
    messages,
  }: {
    messages: ChatMessage[]
  }): Promise<RequestMessage[]> {
    if (messages.length === 0) {
      throw new Error('No messages provided')
    }

    // Ensure all user messages have prompt content
    // This is a fallback for cases where compilation was missed earlier in the process
    const compiledMessages = await Promise.all(
      messages.map(async (message) => {
        if (message.role === 'user' && !message.promptContent) {
          const { promptContent } = await this.compileUserMessagePrompt({
            message,
          })
          return {
            ...message,
            promptContent,
          }
        }
        return message
      }),
    )

    // find last user message
    let lastUserMessage: ChatUserMessage | undefined = undefined
    for (let i = compiledMessages.length - 1; i >= 0; --i) {
      if (compiledMessages[i].role === 'user') {
        lastUserMessage = compiledMessages[i] as ChatUserMessage
        break
      }
    }
    if (!lastUserMessage) {
      throw new Error('No user messages found')
    }

    const systemMessage = this.getSystemMessage()

    const currentFile = lastUserMessage.mentionables.find(
      (m) => m.type === 'current-file',
    )?.file
    const currentFileMessage =
      currentFile && this.settings.chatOptions.includeCurrentFileContent
        ? await this.getCurrentFileMessage(currentFile)
        : undefined

    const requestMessages: RequestMessage[] = [
      systemMessage,
      ...(currentFileMessage ? [currentFileMessage] : []),
      ...this.getChatHistoryMessages({ messages: compiledMessages }),
    ]

    return requestMessages
  }

  private getChatHistoryMessages({
    messages,
  }: {
    messages: ChatMessage[]
  }): RequestMessage[] {
    // Get the last MAX_CONTEXT_MESSAGES messages and parse them into request messages
    const requestMessages: RequestMessage[] = messages
      .slice(-this.MAX_CONTEXT_MESSAGES)
      .flatMap((message): RequestMessage[] => {
        if (message.role === 'user') {
          // We assume that all user messages have been compiled
          return [
            {
              role: 'user',
              content: message.promptContent ?? '',
            },
          ]
        } else if (message.role === 'assistant') {
          return this.parseAssistantMessage({ message })
        } else {
          // message.role === 'tool'
          return this.parseToolMessage({ message })
        }
      })

    // TODO: Also verify that tool messages appear right after their corresponding assistant tool calls
    const filteredRequestMessages: RequestMessage[] = requestMessages
      .map((msg) => {
        switch (msg.role) {
          case 'user':
            return msg
          case 'assistant': {
            // Filter out tool calls that don't have a corresponding tool message
            const filteredToolCalls = msg.tool_calls?.filter((t) =>
              requestMessages.some(
                (rm) => rm.role === 'tool' && rm.tool_call.id === t.id,
              ),
            )
            return {
              ...msg,
              tool_calls:
                filteredToolCalls && filteredToolCalls.length > 0
                  ? filteredToolCalls
                  : undefined,
            }
          }
          case 'tool': {
            // Filter out tool messages that don't have a corresponding assistant message
            const assistantMessage = requestMessages.find(
              (rm) =>
                rm.role === 'assistant' &&
                rm.tool_calls?.some((t) => t.id === msg.tool_call.id),
            )
            if (!assistantMessage) {
              return null
            } else {
              return msg
            }
          }
          default:
            return msg
        }
      })
      .filter((m) => m !== null)

    return filteredRequestMessages
  }

  private parseAssistantMessage({
    message,
  }: {
    message: ChatAssistantMessage
  }): RequestMessage[] {
    let citationContent: string | null = null
    if (message.annotations && message.annotations.length > 0) {
      citationContent = `Citations:
${message.annotations
  .map((annotation, index) => {
    if (annotation.type === 'url_citation') {
      const { url, title } = annotation.url_citation
      return `[${index + 1}] ${title ? `${title}: ` : ''}${url}`
    }
  })
  .join('\n')}`
    }

    return [
      {
        role: 'assistant',
        content: [
          message.content,
          ...(citationContent ? [citationContent] : []),
        ].join('\n'),
        tool_calls: message.toolCallRequests,
        providerMetadata: message.providerMetadata,
      },
    ]
  }

  private parseToolMessage({
    message,
  }: {
    message: ChatToolMessage
  }): RequestMessage[] {
    return message.toolCalls.map((toolCall) => {
      switch (toolCall.response.status) {
        case ToolCallResponseStatus.PendingApproval:
        case ToolCallResponseStatus.Running:
        case ToolCallResponseStatus.Rejected:
        case ToolCallResponseStatus.Aborted:
          return {
            role: 'tool',
            tool_call: toolCall.request,
            content: `Tool call ${toolCall.request.id} is ${toolCall.response.status}`,
          }
        case ToolCallResponseStatus.Success:
          return {
            role: 'tool',
            tool_call: toolCall.request,
            content: toolCall.response.data.text,
          }
        case ToolCallResponseStatus.Error:
          return {
            role: 'tool',
            tool_call: toolCall.request,
            content: `Error: ${toolCall.response.error}`,
          }
      }
    })
  }

  public async compileUserMessagePrompt({
    message,
  }: {
    message: ChatUserMessage
  }): Promise<{
    promptContent: ChatUserMessage['promptContent']
  }> {
    logger.debug(
      'PromptGenerator',
      'compileUserMessagePrompt',
      'Compiling user message prompt...',
    )
    try {
      if (!message.content) {
        return {
          promptContent: '',
        }
      }
      const query = editorStateToPlainText(message.content)

      const files = message.mentionables
        .filter((m): m is MentionableFile => m.type === 'file')
        .map((m) => m.file)
      const folders = message.mentionables
        .filter((m): m is MentionableFolder => m.type === 'folder')
        .map((m) => m.folder)
      const nestedFiles = folders.flatMap((folder) =>
        getNestedFiles(folder, this.app.vault),
      )
      const allFiles = [...files, ...nestedFiles]
      const fileContents = await readMultipleTFiles(allFiles, this.app.vault)

      const filePrompt = allFiles
        .map((file, index) => {
          return `\`\`\`${file.path}\n${fileContents[index]}\n\`\`\`\n`
        })
        .join('')

      const blocks = message.mentionables.filter(
        (m): m is MentionableBlock => m.type === 'block',
      )
      const blockPrompt = blocks
        .map(({ file, content }) => {
          return `\`\`\`${file.path}\n${content}\n\`\`\`\n`
        })
        .join('')

      const urls = message.mentionables.filter(
        (m): m is MentionableUrl => m.type === 'url',
      )

      const urlPrompt =
        urls.length > 0
          ? `## Potentially Relevant Websearch Results
${(
  await Promise.all(
    urls.map(
      async ({ url }) => `\`\`\`
Website URL: ${url}
Website Content:
${await this.getWebsiteContent(url)}
\`\`\``,
    ),
  )
).join('\n')}
`
          : ''

      const imageDataUrls = message.mentionables
        .filter((m): m is MentionableImage => m.type === 'image')
        .map(({ data }) => data)

      return {
        promptContent: [
          ...imageDataUrls.map(
            (data): ContentPart => ({
              type: 'image_url',
              image_url: {
                url: data,
              },
            }),
          ),
          {
            type: 'text',
            text: `${filePrompt}${blockPrompt}${urlPrompt}\n\n${query}\n\n`,
          },
        ],
      }
    } catch (error) {
      logger.error(
        'PromptGenerator',
        'compileUserMessagePrompt',
        'Failed to compile user message',
        error,
      )
      throw error
    }
  }

  private getSystemMessage(): RequestMessage {
    const systemPrompt = selectSystemPrompt(
      this.settings.systemPromptMode,
      this.settings.systemPrompt,
    )

    const skillsAppendedPrompt = this.appendSkillsToPrompt(systemPrompt)
    const finalPrompt = this.appendTimestampToPrompt(skillsAppendedPrompt)

    return {
      role: 'system',
      content: finalPrompt,
    }
  }

  private appendTimestampToPrompt(basePrompt: string): string {
    if (!this.settings.injectTimestamp) {
      return basePrompt
    }
    const now = new Date()
    const timestamp = now.toISOString()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    return `${basePrompt}

Current time: ${timestamp}
Current day: ${day}`
  }

  private appendSkillsToPrompt(basePrompt: string): string {
    if (this.skills.length === 0) {
      return basePrompt
    }
    const skillsSection = this.skills
      .map((skill) => `- ${skill.name}: ${skill.description}`)
      .join('\n')
    return `${basePrompt}

## Available Skills

${skillsSection}

Use the \`read_skill\` tool with a skill's name to load its full instructions when you need them.`
  }

  private async getCurrentFileMessage(
    currentFile: TFile,
  ): Promise<RequestMessage> {
    const fileContent = await readTFileContent(currentFile, this.app.vault)
    return {
      role: 'user',
      content: `# Inputs
## Current File
Here is the file I'm looking at.
\`\`\`${currentFile.path}
${fileContent}
\`\`\`\n\n`,
    }
  }

  /**
   * TODO: Improve markdown conversion logic
   * - filter visually hidden elements
   * ...
   */
  private async getWebsiteContent(url: string): Promise<string> {
    if (isYoutubeUrl(url)) {
      try {
        // TODO: pass language based on user preferences
        const { title, transcript } =
          await YoutubeTranscript.fetchTranscriptAndMetadata(url)

        return `Title: ${title}
Video Transcript:
${transcript.map((t) => `${t.offset}: ${t.text}`).join('\n')}`
      } catch (error) {
        logger.error(
          'PromptGenerator',
          'getWebsiteContent',
          'Error fetching YouTube transcript',
          error,
        )
      }
    }

    const response = await requestUrl({ url })
    return htmlToMarkdown(response.text)
  }
}
