import isEqual from 'lodash.isequal'
import { App, Platform } from 'obsidian'

import { SmartComposerSettings } from '../../settings/schema/setting.types'
import {
  McpClient,
  McpHttpParameters,
  McpServerConfig,
  McpServerParameters,
  McpServerState,
  McpServerStatus,
  McpSseParameters,
  McpStdioParameters,
  McpTool,
} from '../../types/mcp.types'
import {
  ToolCallResponse,
  ToolCallResponseStatus,
} from '../../types/tool-call.types'

import { BearerAuthProvider } from './bearerAuthProvider'
import { InvalidToolNameException, McpNotAvailableException } from './exception'
import { McpOAuthProvider, OAuthTokenStore } from './oauthProvider'
import {
  getToolName,
  parseToolName,
  validateServerName,
} from './tool-name-utils'

type CreateClientResult =
  | McpClient
  | Error
  | { awaitingAuth: true; state: string }

type PendingOAuthFlow = {
  serverName: string
  transport: import('@modelcontextprotocol/client').StreamableHTTPClientTransport |
    import('@modelcontextprotocol/client').SSEClientTransport
  provider: McpOAuthProvider
  serverConfig: McpServerConfig
}

type AuthProviderShape =
  | { kind: 'none' }
  | { kind: 'bearer'; provider: BearerAuthProvider }
  | { kind: 'oauth'; provider: McpOAuthProvider }

export class McpManager {
  static readonly TOOL_NAME_DELIMITER = '__' // Delimiter for tool name construction (serverName__toolName)

  public readonly disabled = !Platform.isDesktop // MCP should be disabled on mobile since it doesn't support node.js

  private settings: SmartComposerSettings
  private unsubscribeFromSettings: () => void
  private defaultEnv: Record<string, string>
  private oauthTokenStore: OAuthTokenStore | null = null
  private pendingOAuthFlows: Map<string, PendingOAuthFlow> = new Map()

  private servers: McpServerState[] = [] // IMPORTANT: Always use this.updateServers() to update this array
  private activeToolCalls: Map<string, AbortController> = new Map()
  private allowedToolsByConversation: Map<string, Set<string>> = new Map()
  private subscribers = new Set<(servers: McpServerState[]) => void>()

  private availableToolsCache: McpTool[] | null = null

  constructor({
    settings,
    registerSettingsListener,
    app,
  }: {
    settings: SmartComposerSettings
    registerSettingsListener: (
      listener: (settings: SmartComposerSettings) => void,
    ) => () => void
    app: App
  }) {
    this.settings = settings
    this.oauthTokenStore = new OAuthTokenStore(app)
    this.unsubscribeFromSettings = registerSettingsListener((newSettings) => {
      this.handleSettingsUpdate(newSettings)
    })
  }

  public async initialize() {
    if (this.disabled) {
      return
    }

    if (this.oauthTokenStore) {
      await this.oauthTokenStore.load()
    }

    // Get default environment variables
    const { shellEnvSync } = await import('shell-env')
    this.defaultEnv = shellEnvSync()

    // Create MCP servers
    const servers = await Promise.all(
      this.settings.mcp.servers.map((serverConfig) =>
        this.connectServer(serverConfig),
      ),
    )
    this.updateServers(servers)
  }

  public cleanup() {
    // Disconnect all clients
    void Promise.all(
      this.servers
        .filter((s) => s.status === McpServerStatus.Connected)
        .map((s) => s.client.close()),
    )

    if (this.unsubscribeFromSettings) {
      this.unsubscribeFromSettings()
    }

    this.servers = []
    this.subscribers.clear()
    this.activeToolCalls.clear()
  }

  public getServers() {
    return this.servers
  }

  public subscribeServersChange(callback: (servers: McpServerState[]) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  public async handleSettingsUpdate(settings: SmartComposerSettings) {
    this.settings = settings
    const updatedServers = settings.mcp.servers.map(
      (serverConfig: McpServerConfig): McpServerState => {
        const existingServer = this.servers.find(
          (s) => s.name === serverConfig.id,
        )
        if (
          existingServer &&
          isEqual(existingServer.config.parameters, serverConfig.parameters) &&
          existingServer.config.enabled === serverConfig.enabled
        ) {
          // Server is already up to date
          return {
            ...existingServer,
            config: serverConfig,
          }
        }
        return {
          name: serverConfig.id,
          config: serverConfig,
          status: McpServerStatus.Connecting,
        }
      },
    )

    this.updateServers(updatedServers)

    await Promise.all(
      updatedServers
        .filter((s) => s.status === McpServerStatus.Connecting)
        .map(async (s) => {
          const server = await this.connectServer(s.config)
          this.updateServers((prevServers) =>
            prevServers.map((prevServer) =>
              prevServer.name === server.name ? server : prevServer,
            ),
          )
        }),
    )
  }

  private notifySubscribers() {
    for (const cb of this.subscribers) cb(this.servers)
  }

  private updateServers(
    newServersOrUpdater?:
      | McpServerState[]
      | ((prevServers: McpServerState[]) => McpServerState[]),
  ) {
    const currentServers = this.servers
    const nextServers =
      typeof newServersOrUpdater === 'function'
        ? newServersOrUpdater(currentServers)
        : (newServersOrUpdater ?? currentServers)

    // Find clients that need to be disconnected
    const clientsToDisconnect = currentServers
      .filter((server) => server.status === McpServerStatus.Connected)
      .map((server) => server.client)
      .filter(
        (client) =>
          !nextServers.some(
            (server) =>
              server.status === McpServerStatus.Connected &&
              server.client === client,
          ),
      )

    // Disconnect clients in the background
    if (clientsToDisconnect.length > 0) {
      void Promise.all(clientsToDisconnect.map((client) => client.close()))
    }

    this.servers = nextServers
    this.availableToolsCache = null // Invalidate available tools cache
    this.notifySubscribers() // Should call after invalidating the cache
  }

  private async connectServer(
    serverConfig: McpServerConfig,
  ): Promise<McpServerState> {
    if (this.disabled) {
      throw new McpNotAvailableException()
    }

    const { id: name, parameters: serverParams, enabled } = serverConfig

    if (!enabled) {
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.Disconnected,
      }
    }

    try {
      validateServerName(name)
    } catch (error) {
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.Error,
        error: error as Error,
      }
    }

    const clientResult = await this.createClientForTransport(
      name,
      serverParams,
      serverConfig,
    )

    if (clientResult instanceof Error) {
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.Error,
        error: clientResult,
      }
    }

    if (typeof clientResult === 'object' && 'awaitingAuth' in clientResult) {
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.AwaitingAuth,
      }
    }

    const client = clientResult

    try {
      const toolList = await client.listTools()
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.Connected,
        client,
        tools: toolList.tools,
      }
    } catch (error) {
      await client.close().catch(() => {})
      return {
        name,
        config: serverConfig,
        status: McpServerStatus.Error,
        error: new Error(
          `Failed to list tools for MCP server ${name}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      }
    }
  }

  private async createClientForTransport(
    name: string,
    serverParams: McpServerParameters,
    serverConfig: McpServerConfig,
  ): Promise<CreateClientResult> {
    if (serverParams.type === 'stdio') {
      return this.createStdioClient(name, serverParams)
    }
    if (serverParams.type === 'http') {
      return this.createHttpClient(name, serverParams, serverConfig)
    }
    return this.createSseClient(name, serverParams, serverConfig)
  }

  private async createStdioClient(
    name: string,
    serverParams: McpStdioParameters,
  ): Promise<McpClient | Error> {
    const { Client } = await import('@modelcontextprotocol/client')
    const { StdioClientTransport } = await import(
      '@modelcontextprotocol/client/stdio'
    )
    const client = new Client({ name, version: '1.0.0' })
    try {
      await client.connect(
        new StdioClientTransport({
          command: serverParams.command,
          args: serverParams.args,
          env: {
            ...this.defaultEnv,
            ...(serverParams.env ?? {}),
          },
        }),
      )
      return client
    } catch (error) {
      await client.close().catch(() => {})
      return new Error(
        `Failed to connect to MCP server ${name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  private buildAuthProvider(
    name: string,
    serverParams: McpHttpParameters | McpSseParameters,
  ): AuthProviderShape {
    const auth = serverParams.auth
    if (auth === undefined) {
      return { kind: 'none' }
    }
    if (auth.type === 'bearer') {
      return { kind: 'bearer', provider: new BearerAuthProvider(auth.token) }
    }
    if (auth.type === 'oauth-static') {
      if (!this.oauthTokenStore) {
        return { kind: 'none' }
      }
      const provider = McpOAuthProvider.createStatic(name, this.oauthTokenStore, {
        clientId: auth.clientId,
        clientSecret: auth.clientSecret,
        authorizationUrl: auth.authorizationUrl,
        tokenUrl: auth.tokenUrl,
      })
      return { kind: 'oauth', provider }
    }
    if (!this.oauthTokenStore) {
      return { kind: 'none' }
    }
    return {
      kind: 'oauth',
      provider: new McpOAuthProvider(name, this.oauthTokenStore),
    }
  }

  private async createHttpClient(
    name: string,
    serverParams: McpHttpParameters,
    serverConfig: McpServerConfig,
  ): Promise<CreateClientResult> {
    const { Client, StreamableHTTPClientTransport, SSEClientTransport, UnauthorizedError } =
      await import('@modelcontextprotocol/client')
    const headers = serverParams.headers ?? {}
    const url = new URL(serverParams.url)
    const auth = this.buildAuthProvider(name, serverParams)

    const tryConnect = async (
      TransportClass: typeof StreamableHTTPClientTransport | typeof SSEClientTransport,
    ): Promise<CreateClientResult> => {
      const opts: Record<string, unknown> = { requestInit: { headers } }
      if (auth.kind !== 'none') {
        opts.authProvider = auth.provider
      }
      const transport = new TransportClass(url, opts)
      const client = new Client({ name, version: '1.0.0' })
      try {
        await client.connect(transport)
        return client
      } catch (error) {
        await client.close().catch(() => {})
        if (auth.kind === 'oauth' && error instanceof UnauthorizedError) {
          return this.registerPendingOAuthFlow(
            name,
            transport,
            auth.provider,
            serverConfig,
          )
        }
        return new Error(
          `Failed to connect to MCP server ${name}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    const result = await tryConnect(StreamableHTTPClientTransport)
    if (!(result instanceof Error)) {
      return result
    }

    const fallbackResult = await tryConnect(SSEClientTransport)
    if (fallbackResult instanceof Error) {
      return new Error(
        `${result.message}; SSE fallback failed: ${fallbackResult.message}`,
      )
    }
    return fallbackResult
  }

  private async createSseClient(
    name: string,
    serverParams: McpSseParameters,
    serverConfig: McpServerConfig,
  ): Promise<CreateClientResult> {
    const { Client, SSEClientTransport, UnauthorizedError } = await import(
      '@modelcontextprotocol/client'
    )
    const headers = serverParams.headers ?? {}
    const url = new URL(serverParams.url)
    const auth = this.buildAuthProvider(name, serverParams)

    const opts: Record<string, unknown> = { requestInit: { headers } }
    if (auth.kind !== 'none') {
      opts.authProvider = auth.provider
    }
    const transport = new SSEClientTransport(url, opts)
    const client = new Client({ name, version: '1.0.0' })
    try {
      await client.connect(transport)
      return client
    } catch (error) {
      await client.close().catch(() => {})
      if (auth.kind === 'oauth' && error instanceof UnauthorizedError) {
        return this.registerPendingOAuthFlow(
          name,
          transport,
          auth.provider,
          serverConfig,
        )
      }
      return new Error(
        `Failed to connect to MCP server ${name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  private async registerPendingOAuthFlow(
    name: string,
    transport: import('@modelcontextprotocol/client').StreamableHTTPClientTransport |
      import('@modelcontextprotocol/client').SSEClientTransport,
    provider: McpOAuthProvider,
    serverConfig: McpServerConfig,
  ): Promise<CreateClientResult> {
    try {
      const state = await provider.state()
      this.pendingOAuthFlows.set(state, {
        serverName: name,
        transport,
        provider,
        serverConfig,
      })
      return { awaitingAuth: true, state }
    } catch {
      return new Error(
        `OAuth flow initiated for ${name} but no state was saved`,
      )
    }
  }

  public async completeOAuthFlow(
    state: string,
    params: URLSearchParams,
  ): Promise<void> {
    if (this.disabled) {
      throw new McpNotAvailableException()
    }

    const pending = this.pendingOAuthFlows.get(state)
    if (!pending) {
      throw new Error(`No pending OAuth flow for state: ${state}`)
    }
    this.pendingOAuthFlows.delete(state)

    const { serverName, transport, serverConfig } = pending

    await transport.finishAuth(params)

    const server = await this.connectServer(serverConfig)
    this.updateServers((prevServers) =>
      prevServers.map((prevServer) =>
        prevServer.name === serverName ? server : prevServer,
      ),
    )
  }

  public async reconnectServer(serverName: string): Promise<void> {
    if (this.disabled) {
      throw new McpNotAvailableException()
    }

    const serverConfig = this.settings.mcp.servers.find(
      (s) => s.id === serverName,
    )
    if (!serverConfig) {
      return
    }

    this.updateServers((prevServers) =>
      prevServers.map((prevServer) =>
        prevServer.name === serverName
          ? {
              ...prevServer,
              status: McpServerStatus.Connecting,
            }
          : prevServer,
      ),
    )

    const server = await this.connectServer(serverConfig)
    this.updateServers((prevServers) =>
      prevServers.map((prevServer) =>
        prevServer.name === serverName ? server : prevServer,
      ),
    )
  }

  public async listAvailableTools(): Promise<McpTool[]> {
    if (this.disabled) {
      return []
    }

    if (this.availableToolsCache) {
      return this.availableToolsCache
    }

    const availableTools = (
      await Promise.all(
        this.servers.map(async (server): Promise<McpTool[]> => {
          if (server.status !== McpServerStatus.Connected) {
            return []
          }
          try {
            const toolList = await server.client.listTools()
            return toolList.tools
              .filter((tool) => !server.config.toolOptions[tool.name]?.disabled)
              .map((tool) => ({
                ...tool,
                name: getToolName(server.name, tool.name),
              }))
          } catch (error) {
            console.error(
              `Failed to list tools for MCP server ${server.name}: ${error instanceof Error ? error.message : String(error)}`,
            )
            return []
          }
        }),
      )
    ).flat()

    this.availableToolsCache = [...availableTools]
    return availableTools
  }

  public allowToolForConversation(
    requestToolName: string,
    conversationId: string,
  ): void {
    let allowedTools = this.allowedToolsByConversation.get(conversationId)
    if (!allowedTools) {
      allowedTools = new Set<string>()
      this.allowedToolsByConversation.set(conversationId, allowedTools)
    }
    allowedTools.add(requestToolName)
  }

  public isToolExecutionAllowed({
    requestToolName,
    conversationId,
  }: {
    requestToolName: string
    conversationId?: string
  }): boolean {
    // Check if the tool is allowed for the conversation
    if (conversationId) {
      if (
        this.allowedToolsByConversation
          .get(conversationId)
          ?.has(requestToolName)
      ) {
        return true
      }
    }

    try {
      const { serverName, toolName } = parseToolName(requestToolName)
      const server = this.servers.find((server) => server.name === serverName)
      if (!server) {
        return false
      }
      const toolOption = server.config.toolOptions[toolName]
      if (!toolOption) {
        return false
      }
      return toolOption.allowAutoExecution ?? false
    } catch (error) {
      if (error instanceof InvalidToolNameException) {
        return false
      }
      throw error
    }
  }

  public async callTool({
    name,
    args,
    id,
    signal,
  }: {
    name: string
    args?: Record<string, unknown> | string | undefined
    id?: string
    signal?: AbortSignal
  }): Promise<
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
    if (this.disabled) {
      throw new McpNotAvailableException()
    }

    const toolAbortController = new AbortController()
    if (id !== undefined) {
      const existingAbortController = this.activeToolCalls.get(id)
      if (existingAbortController) {
        existingAbortController.abort()
      }
      this.activeToolCalls.set(id, toolAbortController)
    }
    const compositeSignal = toolAbortController.signal
    if (signal) {
      signal.addEventListener('abort', () => toolAbortController.abort())
    }

    try {
      const { serverName, toolName } = parseToolName(name)
      const server = this.servers.find((server) => server.name === serverName)
      if (!server) {
        throw new Error(`MCP server ${serverName} not found`)
      }
      if (server.status !== McpServerStatus.Connected) {
        throw new Error(`MCP server ${serverName} is not connected`)
      }
      const { client } = server

      const parsedArgs: Record<string, unknown> | undefined =
        typeof args === 'string' ? (args === '' ? {} : JSON.parse(args)) : args

      const result = await client.callTool(
        {
          name: toolName,
          arguments: parsedArgs,
        },
        {
          signal: compositeSignal,
        },
      )

      if (result.content.length === 0) {
        throw new Error('Tool call returned no content')
      }
      if (result.content[0].type !== 'text') {
        throw new Error(
          `Tool result with content type ${result.content[0].type} is not currently supported.`,
        )
      }
      if (result.isError) {
        return {
          status: ToolCallResponseStatus.Error,
          error: result.content[0].text,
        }
      }
      return {
        status: ToolCallResponseStatus.Success,
        data: {
          type: 'text',
          text: result.content[0].text,
        },
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          status: ToolCallResponseStatus.Aborted,
        }
      }

      // Handle other errors
      return {
        status: ToolCallResponseStatus.Error,
        error: error.message || 'Unknown error occurred',
      }
    } finally {
      if (id !== undefined) {
        this.activeToolCalls.delete(id)
      }
    }
  }

  public abortToolCall(id: string): boolean {
    if (this.disabled) {
      return false
    }
    const toolAbortController = this.activeToolCalls.get(id)
    if (toolAbortController) {
      toolAbortController.abort()
      this.activeToolCalls.delete(id)
      return true
    }
    return false
  }
}
