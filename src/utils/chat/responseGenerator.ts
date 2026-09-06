import { v4 as uuidv4 } from 'uuid'

import { BaseLLMProvider } from '../../core/llm/base'
import { McpManager } from '../../core/mcp/mcpManager'
import {
  READ_SKILL_TOOL_NAME,
  findSkill,
  getReadSkillTool,
} from '../../core/skills/skillTool'
import { Skill } from '../../core/skills/types'
import { ChatMessage, ChatToolMessage } from '../../types/chat'
import { ChatModel } from '../../types/chat-model.types'
import { RequestTool } from '../../types/llm/request'
import {
  Annotation,
  LLMResponseStreaming,
  ToolCallDelta,
} from '../../types/llm/response'
import { LLMProvider } from '../../types/provider.types'
import {
  ToolCallRequest,
  ToolCallResponse,
  ToolCallResponseStatus,
} from '../../types/tool-call.types'
import { logger } from '../logger'

import { fetchAnnotationTitles } from './fetch-annotation-titles'
import { PromptGenerator } from './promptGenerator'

export type ResponseGeneratorParams = {
  providerClient: BaseLLMProvider<LLMProvider>
  model: ChatModel
  messages: ChatMessage[]
  conversationId: string
  enableTools: boolean
  maxAutoIterations: number
  promptGenerator: PromptGenerator
  mcpManager: McpManager
  skills: Skill[]
  abortSignal?: AbortSignal
}

export class ResponseGenerator {
  private readonly providerClient: BaseLLMProvider<LLMProvider>
  private readonly model: ChatModel
  private readonly conversationId: string
  private readonly enableTools: boolean
  private readonly promptGenerator: PromptGenerator
  private readonly mcpManager: McpManager
  private readonly skills: Skill[]
  private readonly abortSignal?: AbortSignal
  private readonly receivedMessages: ChatMessage[]
  private readonly maxAutoIterations: number

  private responseMessages: ChatMessage[] = [] // Response messages that are generated after the initial messages
  private subscribers: ((messages: ChatMessage[]) => void)[] = []

  constructor(params: ResponseGeneratorParams) {
    this.providerClient = params.providerClient
    this.model = params.model
    this.conversationId = params.conversationId
    this.enableTools = params.enableTools
    this.maxAutoIterations = Math.max(1, params.maxAutoIterations) // Ensure maxAutoIterations is at least 1
    this.receivedMessages = params.messages
    this.promptGenerator = params.promptGenerator
    this.mcpManager = params.mcpManager
    this.skills = params.skills
    this.abortSignal = params.abortSignal
  }

  public subscribe(callback: (messages: ChatMessage[]) => void) {
    this.subscribers.push(callback)

    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  public async run() {
    logger.info('ResponseGenerator', 'run', 'Starting response generation...')
    for (let i = 0; i < this.maxAutoIterations; i++) {
      const { toolCallRequests } = await this.streamSingleResponse()
      if (toolCallRequests.length === 0) {
        logger.info('ResponseGenerator', 'run', 'Response generation complete')
        return
      }

      const toolMessage: ChatToolMessage = {
        role: 'tool' as const,
        id: uuidv4(),
        toolCalls: toolCallRequests.map((toolCall) => ({
          request: toolCall,
          response: {
            status: this.isBuiltinTool(toolCall.name)
              ? ToolCallResponseStatus.Running
              : this.mcpManager.isToolExecutionAllowed({
                    requestToolName: toolCall.name,
                    conversationId: this.conversationId,
                  })
                ? ToolCallResponseStatus.Running
                : ToolCallResponseStatus.PendingApproval,
          },
        })),
      }

      this.updateResponseMessages((messages) => [...messages, toolMessage])

      await Promise.all(
        toolMessage.toolCalls
          .filter(
            (toolCall) =>
              toolCall.response.status === ToolCallResponseStatus.Running,
          )
          .map(async (toolCall) => {
            const response = await this.executeToolCall(toolCall.request)
            this.updateResponseMessages((messages) =>
              messages.map((message) =>
                message.id === toolMessage.id && message.role === 'tool'
                  ? {
                      ...message,
                      toolCalls: message.toolCalls?.map((tc) =>
                        tc.request.id === toolCall.request.id
                          ? {
                              ...tc,
                              response,
                            }
                          : tc,
                      ),
                    }
                  : message,
              ),
            )
          }),
      )

      const updatedToolMessage = this.responseMessages.find(
        (message) => message.id === toolMessage.id && message.role === 'tool',
      ) as ChatToolMessage | undefined
      if (
        !updatedToolMessage?.toolCalls?.every((toolCall) =>
          [
            ToolCallResponseStatus.Success,
            ToolCallResponseStatus.Error,
          ].includes(toolCall.response.status),
        )
      ) {
        // Exit the auto-iteration loop if any tool call hasn't completed
        // Only 'success' or 'error' states are considered complete
        return
      }
    }
  }

  private isBuiltinTool(toolName: string): boolean {
    return toolName === READ_SKILL_TOOL_NAME
  }

  private async executeToolCall(toolCall: ToolCallRequest): Promise<
    Extract<
      ToolCallResponse,
      {
        status:
          | ToolCallResponseStatus.Success
          | ToolCallResponseStatus.Error
          | ToolCallResponseStatus.Aborted
      }
    >
  > {
    if (this.isBuiltinTool(toolCall.name)) {
      logger.debug(
        'ResponseGenerator',
        'run',
        `Built-in tool dispatched: ${toolCall.name}`,
      )
      return this.executeBuiltinTool(toolCall)
    }
    logger.debug(
      'ResponseGenerator',
      'run',
      `Tool call requested: ${toolCall.name}`,
    )
    return this.mcpManager.callTool({
      name: toolCall.name,
      args: toolCall.arguments,
      id: toolCall.id,
      signal: this.abortSignal,
    })
  }

  private async executeBuiltinTool(toolCall: ToolCallRequest): Promise<
    Extract<
      ToolCallResponse,
      {
        status:
          | ToolCallResponseStatus.Success
          | ToolCallResponseStatus.Error
          | ToolCallResponseStatus.Aborted
      }
    >
  > {
    if (toolCall.name === READ_SKILL_TOOL_NAME) {
      return this.executeReadSkill(toolCall)
    }
    return {
      status: ToolCallResponseStatus.Error,
      error: `Unknown built-in tool: ${toolCall.name}`,
    }
  }

  private async executeReadSkill(toolCall: ToolCallRequest): Promise<
    Extract<
      ToolCallResponse,
      {
        status: ToolCallResponseStatus.Success | ToolCallResponseStatus.Error
      }
    >
  > {
    try {
      let parsedArgs: Record<string, unknown> = {}
      if (toolCall.arguments) {
        parsedArgs =
          typeof toolCall.arguments === 'string'
            ? JSON.parse(toolCall.arguments)
            : toolCall.arguments
      }
      const skillName = parsedArgs.name
      if (typeof skillName !== 'string') {
        return {
          status: ToolCallResponseStatus.Error,
          error: 'read_skill requires a "name" string argument',
        }
      }
      const skill = findSkill(this.skills, skillName)
      if (!skill) {
        return {
          status: ToolCallResponseStatus.Error,
          error: `Skill not found: ${skillName}`,
        }
      }
      return {
        status: ToolCallResponseStatus.Success,
        data: {
          type: 'text',
          text: skill.body,
        },
      }
    } catch (error) {
      return {
        status: ToolCallResponseStatus.Error,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private async streamSingleResponse(): Promise<{
    toolCallRequests: ToolCallRequest[]
  }> {
    const requestMessages = await this.promptGenerator.generateRequestMessages({
      messages: [...this.receivedMessages, ...this.responseMessages],
    })

    const mcpTools = this.enableTools
      ? await this.mcpManager.listAvailableTools()
      : []
    const builtinTools =
      this.enableTools && this.skills.length > 0 ? [getReadSkillTool()] : []
    const mcpRequestTools: RequestTool[] = mcpTools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          ...tool.inputSchema,
          properties: tool.inputSchema.properties ?? {},
        },
      },
    }))
    const availableTools: RequestTool[] = [...mcpRequestTools, ...builtinTools]

    // Set tools to undefined when no tools are available since some providers
    // reject empty tools arrays.
    const tools: RequestTool[] | undefined =
      availableTools.length > 0 ? availableTools : undefined

    const stream = await this.providerClient.streamResponse(
      this.model,
      {
        model: this.model.model,
        messages: requestMessages,
        tools,
        stream: true,
      },
      {
        signal: this.abortSignal,
      },
    )

    // Create a new assistant message for the response if it doesn't exist
    if (this.responseMessages.at(-1)?.role !== 'assistant') {
      this.responseMessages.push({
        role: 'assistant',
        content: '',
        id: uuidv4(),
        metadata: {
          model: this.model,
        },
      })
    }
    const lastMessage = this.responseMessages.at(-1)
    if (lastMessage?.role !== 'assistant') {
      throw new Error('Last message is not an assistant message')
    }
    const responseMessageId = lastMessage.id
    let responseToolCalls: Record<number, ToolCallDelta> = {}
    for await (const chunk of stream) {
      const { updatedToolCalls } = this.processChunk(
        chunk,
        responseMessageId,
        responseToolCalls,
      )
      responseToolCalls = updatedToolCalls
    }
    const toolCallRequests: ToolCallRequest[] = Object.values(responseToolCalls)
      .map((toolCall) => {
        // filter out invalid tool calls without a name
        if (!toolCall.function?.name) {
          return null
        }
        return {
          id: toolCall.id ?? uuidv4(),
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        }
      })
      .filter((toolCall) => toolCall !== null)

    this.updateResponseMessages((messages) =>
      messages.map((message) =>
        message.id === responseMessageId && message.role === 'assistant'
          ? {
              ...message,
              toolCallRequests:
                toolCallRequests.length > 0 ? toolCallRequests : undefined,
            }
          : message,
      ),
    )
    return {
      toolCallRequests: toolCallRequests,
    }
  }

  private processChunk(
    chunk: LLMResponseStreaming,
    responseMessageId: string,
    responseToolCalls: Record<number, ToolCallDelta>,
  ): {
    updatedToolCalls: Record<number, ToolCallDelta>
  } {
    const content = chunk.choices[0]?.delta?.content ?? ''
    const reasoning = chunk.choices[0]?.delta?.reasoning
    const toolCalls = chunk.choices[0]?.delta?.tool_calls
    const annotations = chunk.choices[0]?.delta?.annotations

    const updatedToolCalls = toolCalls
      ? this.mergeToolCallDeltas(toolCalls, responseToolCalls)
      : responseToolCalls

    if (annotations) {
      // For annotations with empty titles, fetch the title of the URL and update the chat messages
      fetchAnnotationTitles(annotations, (url, title) => {
        this.updateResponseMessages((messages) =>
          messages.map((message) =>
            message.id === responseMessageId && message.role === 'assistant'
              ? {
                  ...message,
                  annotations: message.annotations?.map((a) =>
                    a.type === 'url_citation' && a.url_citation.url === url
                      ? {
                          ...a,
                          url_citation: {
                            ...a.url_citation,
                            title: title ?? undefined,
                          },
                        }
                      : a,
                  ),
                }
              : message,
          ),
        )
      })
    }

    const providerMetadata = chunk.choices[0]?.delta?.providerMetadata

    this.updateResponseMessages((messages) =>
      messages.map((message) =>
        message.id === responseMessageId && message.role === 'assistant'
          ? {
              ...message,
              content: message.content + content,
              reasoning: reasoning
                ? (message.reasoning ?? '') + reasoning
                : message.reasoning,
              annotations: this.mergeAnnotations(
                message.annotations,
                annotations,
              ),
              metadata: {
                ...message.metadata,
                usage: chunk.usage ?? message.metadata?.usage,
              },
              // Keep the first providerMetadata received (signature is sent once)
              providerMetadata: message.providerMetadata ?? providerMetadata,
            }
          : message,
      ),
    )

    return {
      updatedToolCalls,
    }
  }

  private updateResponseMessages(
    updaterFunction: (messages: ChatMessage[]) => ChatMessage[],
  ) {
    this.responseMessages = updaterFunction(this.responseMessages)
    this.notifySubscribers(this.responseMessages)
  }

  private notifySubscribers(messages: ChatMessage[]) {
    this.subscribers.forEach((callback) => callback(messages))
  }

  private mergeToolCallDeltas(
    toolCalls: ToolCallDelta[],
    existingToolCalls: Record<number, ToolCallDelta>,
  ): Record<number, ToolCallDelta> {
    const merged = { ...existingToolCalls }

    for (const toolCall of toolCalls) {
      const { index } = toolCall

      if (!merged[index]) {
        merged[index] = toolCall
        continue
      }

      const mergedToolCall: ToolCallDelta = {
        index,
        id: merged[index].id ?? toolCall.id,
        type: merged[index].type ?? toolCall.type,
      }

      if (merged[index].function || toolCall.function) {
        const existingArgs = merged[index].function?.arguments
        const newArgs = toolCall.function?.arguments

        mergedToolCall.function = {
          name: merged[index].function?.name ?? toolCall.function?.name,
          arguments:
            existingArgs || newArgs
              ? [existingArgs ?? '', newArgs ?? ''].join('')
              : undefined,
        }
      }

      merged[index] = mergedToolCall
    }

    return merged
  }

  private mergeAnnotations(
    prevAnnotations?: Annotation[],
    newAnnotations?: Annotation[],
  ): Annotation[] | undefined {
    if (!prevAnnotations) return newAnnotations
    if (!newAnnotations) return prevAnnotations

    const mergedAnnotations = [...prevAnnotations]
    for (const newAnnotation of newAnnotations) {
      if (
        !mergedAnnotations.find(
          (annotation) =>
            annotation.url_citation.url === newAnnotation.url_citation.url,
        )
      ) {
        mergedAnnotations.push(newAnnotation)
      }
    }
    return mergedAnnotations
  }
}
