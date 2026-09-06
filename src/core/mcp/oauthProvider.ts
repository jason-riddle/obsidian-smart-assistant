import type {
  OAuthClientMetadata,
  OAuthClientProvider,
  OAuthDiscoveryState,
  StoredOAuthClientInformation,
  StoredOAuthTokens,
} from '@modelcontextprotocol/client'
import { App, normalizePath } from 'obsidian'

import { logger } from '../../utils/logger'

export const OAUTH_REDIRECT_URL = 'obsidian://smart-assistant/oauth/callback'
export const OAUTH_TOKEN_STORE_PATH = '.smtcmp_oauth_tokens.json'

export type ServerOAuthState = {
  tokens?: StoredOAuthTokens
  clientInformation?: StoredOAuthClientInformation
  codeVerifier?: string
  state?: string
  discoveryState?: OAuthDiscoveryState
}

export type StaticClientInfo = {
  clientId: string
  clientSecret?: string
  authorizationUrl: string
  tokenUrl: string
}

export class OAuthTokenStore {
  private app: App
  private filePath: string
  private cache: Map<string, ServerOAuthState> = new Map()
  private loaded = false

  constructor(app: App, filePath: string = OAUTH_TOKEN_STORE_PATH) {
    this.app = app
    this.filePath = normalizePath(filePath)
  }

  async load(): Promise<void> {
    if (this.loaded) {
      return
    }
    logger.debug('OAuthTokenStore', 'load', 'Loading OAuth token store...')
    try {
      if (await this.app.vault.adapter.exists(this.filePath)) {
        const content = await this.app.vault.adapter.read(this.filePath)
        const data = JSON.parse(content) as Record<string, ServerOAuthState>
        this.cache = new Map(Object.entries(data))
      }
    } catch (error) {
      logger.error(
        'OAuthTokenStore',
        'load',
        'Failed to load OAuth token store',
        error,
      )
    }
    this.loaded = true
  }

  private async persist(): Promise<void> {
    logger.debug(
      'OAuthTokenStore',
      'persist',
      'Persisting OAuth token store...',
    )
    const data: Record<string, ServerOAuthState> = {}
    for (const [key, value] of this.cache) {
      data[key] = value
    }
    const content = JSON.stringify(data, null, 2)
    try {
      await this.app.vault.adapter.write(this.filePath, content)
    } catch (error) {
      logger.error(
        'OAuthTokenStore',
        'persist',
        'Failed to persist OAuth token store',
        error,
      )
    }
  }

  async get(serverName: string): Promise<ServerOAuthState | undefined> {
    await this.load()
    return this.cache.get(serverName)
  }

  async update(
    serverName: string,
    patch: Partial<ServerOAuthState>,
  ): Promise<void> {
    await this.load()
    const current = this.cache.get(serverName) ?? {}
    const merged: ServerOAuthState = { ...current }
    if (patch.tokens !== undefined) {
      merged.tokens = patch.tokens
    } else if (patch.tokens === undefined && 'tokens' in patch) {
      delete merged.tokens
    }
    if (patch.clientInformation !== undefined) {
      merged.clientInformation = patch.clientInformation
    } else if (
      patch.clientInformation === undefined &&
      'clientInformation' in patch
    ) {
      delete merged.clientInformation
    }
    if (patch.codeVerifier !== undefined) {
      merged.codeVerifier = patch.codeVerifier
    } else if (patch.codeVerifier === undefined && 'codeVerifier' in patch) {
      delete merged.codeVerifier
    }
    if (patch.state !== undefined) {
      merged.state = patch.state
    } else if (patch.state === undefined && 'state' in patch) {
      delete merged.state
    }
    if (patch.discoveryState !== undefined) {
      merged.discoveryState = patch.discoveryState
    } else if (
      patch.discoveryState === undefined &&
      'discoveryState' in patch
    ) {
      delete merged.discoveryState
    }
    this.cache.set(serverName, merged)
    await this.persist()
  }

  async clear(serverName: string): Promise<void> {
    await this.load()
    this.cache.delete(serverName)
    await this.persist()
  }
}

export class McpOAuthProvider implements OAuthClientProvider {
  private serverName: string
  private store: OAuthTokenStore
  private staticClientInfo: StoredOAuthClientInformation | undefined
  private staticDiscoveryState: OAuthDiscoveryState | undefined

  constructor(serverName: string, store: OAuthTokenStore) {
    this.serverName = serverName
    this.store = store
  }

  static createStatic(
    serverName: string,
    store: OAuthTokenStore,
    staticConfig: StaticClientInfo,
  ): McpOAuthProvider {
    const provider = new McpOAuthProvider(serverName, store)
    const clientInfo: StoredOAuthClientInformation = {
      client_id: staticConfig.clientId,
    }
    if (staticConfig.clientSecret !== undefined) {
      ;(
        clientInfo as {
          client_secret?: string
        }
      ).client_secret = staticConfig.clientSecret
    }
    provider.staticClientInfo = clientInfo
    const serverInfo = {
      authorizationServerUrl: staticConfig.authorizationUrl,
      authorizationServerMetadata: {
        issuer: staticConfig.authorizationUrl,
        authorization_endpoint: staticConfig.authorizationUrl,
        token_endpoint: staticConfig.tokenUrl,
      },
    } as unknown as OAuthDiscoveryState
    provider.staticDiscoveryState = serverInfo
    return provider
  }

  get redirectUrl(): URL {
    return new URL(OAUTH_REDIRECT_URL)
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      redirect_uris: [OAUTH_REDIRECT_URL],
      client_name: 'Smart Assistant',
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
      scope: '',
    }
  }

  async clientInformation(): Promise<StoredOAuthClientInformation | undefined> {
    if (this.staticClientInfo !== undefined) {
      return this.staticClientInfo
    }
    const state = await this.store.get(this.serverName)
    return state?.clientInformation
  }

  async saveClientInformation(
    clientInformation: StoredOAuthClientInformation,
  ): Promise<void> {
    await this.store.update(this.serverName, { clientInformation })
  }

  async tokens(): Promise<StoredOAuthTokens | undefined> {
    const state = await this.store.get(this.serverName)
    return state?.tokens
  }

  async saveTokens(tokens: StoredOAuthTokens): Promise<void> {
    await this.store.update(this.serverName, { tokens })
  }

  async codeVerifier(): Promise<string> {
    const state = await this.store.get(this.serverName)
    if (!state?.codeVerifier) {
      throw new Error(
        `No PKCE code verifier stored for MCP server: ${this.serverName}`,
      )
    }
    return state.codeVerifier
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    await this.store.update(this.serverName, { codeVerifier })
  }

  async state(): Promise<string> {
    const state = await this.store.get(this.serverName)
    if (!state?.state) {
      throw new Error(
        `No OAuth state stored for MCP server: ${this.serverName}`,
      )
    }
    return state.state
  }

  async saveState(oauthState: string): Promise<void> {
    await this.store.update(this.serverName, { state: oauthState })
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    logger.info(
      'McpOAuthProvider',
      'redirectToAuthorization',
      `Redirecting to authorization URL: ${authorizationUrl.toString()}`,
    )
    window.open(authorizationUrl.toString(), '_blank')
  }

  async saveDiscoveryState(discoveryState: OAuthDiscoveryState): Promise<void> {
    await this.store.update(this.serverName, { discoveryState })
  }

  async discoveryState(): Promise<OAuthDiscoveryState | undefined> {
    if (this.staticDiscoveryState !== undefined) {
      return this.staticDiscoveryState
    }
    const state = await this.store.get(this.serverName)
    return state?.discoveryState
  }

  async invalidateCredentials(
    scope: 'all' | 'client' | 'tokens' | 'verifier' | 'discovery',
  ): Promise<void> {
    if (scope === 'all') {
      await this.store.clear(this.serverName)
      return
    }
    const patch: Partial<ServerOAuthState> = {}
    if (scope === 'client') {
      patch.clientInformation = undefined
    }
    if (scope === 'tokens') {
      patch.tokens = undefined
    }
    if (scope === 'verifier') {
      patch.codeVerifier = undefined
    }
    if (scope === 'discovery') {
      patch.discoveryState = undefined
    }
    await this.store.update(this.serverName, patch)
  }
}
