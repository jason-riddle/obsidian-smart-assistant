import { App, Notice } from 'obsidian'
import { useCallback, useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import * as z from 'zod'

import { validateServerName } from '../../../core/mcp/tool-name-utils'
import SmartAssistantPlugin from '../../../main'
import {
  McpServerParameters,
  McpTransportType,
  mcpServerParametersSchema,
} from '../../../types/mcp.types'
import { logger } from '../../../utils/logger'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianDropdown } from '../../common/ObsidianDropdown'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianTextInput } from '../../common/ObsidianTextInput'
import { ReactModal } from '../../common/ReactModal'

type AuthType = 'none' | 'bearer' | 'oauth-static' | 'oauth'

const AUTH_OPTIONS: Record<string, string> = {
  none: 'None',
  bearer: 'Bearer Token',
  'oauth-static': 'OAuth 2.0',
  oauth: 'OAuth 2.1 + DCR',
}

type McpServerFormComponentProps = {
  plugin: SmartAssistantPlugin
  onClose: () => void
  serverId?: string
}

const TRANSPORT_OPTIONS: Record<string, string> = {
  stdio: 'stdio',
  http: 'http',
  sse: 'sse',
}

const ENV_PLACEHOLDER = JSON.stringify(
  {
    GITHUB_PERSONAL_ACCESS_TOKEN: '<YOUR_TOKEN>',
  },
  null,
  2,
)

const HEADERS_PLACEHOLDER = JSON.stringify(
  {
    Authorization: 'Bearer <YOUR_TOKEN>',
  },
  null,
  2,
)

function parseArgsString(argsString: string): string[] {
  return argsString
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function argsToString(args: string[] | undefined): string {
  return (args ?? []).join('\n')
}

function jsonStringifyOrEmpty(value: unknown): string {
  if (
    !value ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  ) {
    return ''
  }
  return JSON.stringify(value, null, 2)
}

function parseJsonOrUndefined(
  text: string,
): Record<string, string> | undefined {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  return JSON.parse(trimmed) as Record<string, string>
}

export class AddMcpServerModal extends ReactModal<McpServerFormComponentProps> {
  constructor(app: App, plugin: SmartAssistantPlugin) {
    super({
      app: app,
      Component: McpServerFormComponent,
      props: { plugin },
      options: {
        title: 'Add MCP Server',
      },
    })
  }
}

export class EditMcpServerModal extends ReactModal<McpServerFormComponentProps> {
  constructor(app: App, plugin: SmartAssistantPlugin, editServerId: string) {
    super({
      app: app,
      Component: McpServerFormComponent,
      props: { plugin, serverId: editServerId },
      options: {
        title: 'Edit MCP Server',
      },
    })
  }
}

function McpServerFormComponent({
  plugin,
  onClose,
  serverId,
}: McpServerFormComponentProps) {
  const existingServer = serverId
    ? plugin.settings.mcp.servers.find((server) => server.id === serverId)
    : undefined

  const existingParams = existingServer?.parameters
  const initialType: McpTransportType =
    existingParams && 'type' in existingParams ? existingParams.type : 'stdio'

  const [name, setName] = useState(existingServer?.id ?? '')
  const [transportType, setTransportType] =
    useState<McpTransportType>(initialType)

  const [command, setCommand] = useState(
    existingParams && 'command' in existingParams ? existingParams.command : '',
  )
  const [args, setArgs] = useState(
    existingParams && 'args' in existingParams
      ? argsToString(existingParams.args)
      : '',
  )
  const [env, setEnv] = useState(
    existingParams && 'env' in existingParams
      ? jsonStringifyOrEmpty(existingParams.env)
      : '',
  )

  const [url, setUrl] = useState(
    existingParams && 'url' in existingParams ? existingParams.url : '',
  )
  const [headers, setHeaders] = useState(
    existingParams && 'headers' in existingParams
      ? jsonStringifyOrEmpty(existingParams.headers)
      : '',
  )
  const [authType, setAuthType] = useState<AuthType>(() => {
    if (existingParams && 'auth' in existingParams && existingParams.auth) {
      const t = existingParams.auth.type
      if (t === 'oauth' || t === 'oauth-static' || t === 'bearer') {
        return t
      }
    }
    return 'none'
  })
  const [bearerToken, setBearerToken] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'bearer'
      ? existingParams.auth.token
      : '',
  )
  const [oauthClientId, setOauthClientId] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'oauth-static'
      ? existingParams.auth.clientId
      : '',
  )
  const [oauthClientSecret, setOauthClientSecret] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'oauth-static'
      ? (existingParams.auth.clientSecret ?? '')
      : '',
  )
  const [oauthAuthorizationUrl, setOauthAuthorizationUrl] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'oauth-static'
      ? existingParams.auth.authorizationUrl
      : '',
  )
  const [oauthTokenUrl, setOauthTokenUrl] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'oauth-static'
      ? existingParams.auth.tokenUrl
      : '',
  )
  const [oauthScopes, setOauthScopes] = useState(
    existingParams &&
      'auth' in existingParams &&
      existingParams.auth?.type === 'oauth-static'
      ? (existingParams.auth.scopes ?? []).join(', ')
      : '',
  )

  const [validationError, setValidationError] = useState<string | null>(null)

  const buildParameters = useCallback((): unknown => {
    if (transportType === 'stdio') {
      const params: Record<string, unknown> = {
        type: 'stdio',
        command: command.trim(),
      }
      const parsedArgs = parseArgsString(args)
      if (parsedArgs.length > 0) {
        params.args = parsedArgs
      }
      const parsedEnv = parseJsonOrUndefined(env)
      if (parsedEnv) {
        params.env = parsedEnv
      }
      return params
    }
    const params: Record<string, unknown> = {
      type: transportType,
      url: url.trim(),
    }
    const parsedHeaders = parseJsonOrUndefined(headers)
    if (parsedHeaders) {
      params.headers = parsedHeaders
    }
    if (authType === 'bearer') {
      params.auth = { type: 'bearer', token: bearerToken }
    } else if (authType === 'oauth-static') {
      const auth: Record<string, unknown> = {
        type: 'oauth-static',
        clientId: oauthClientId.trim(),
        authorizationUrl: oauthAuthorizationUrl.trim(),
        tokenUrl: oauthTokenUrl.trim(),
      }
      const secret = oauthClientSecret.trim()
      if (secret.length > 0) {
        auth.clientSecret = secret
      }
      const scopes = oauthScopes
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      if (scopes.length > 0) {
        auth.scopes = scopes
      }
      params.auth = auth
    } else if (authType === 'oauth') {
      params.auth = { type: 'oauth' }
    }
    return params
  }, [
    transportType,
    command,
    args,
    env,
    url,
    headers,
    authType,
    bearerToken,
    oauthClientId,
    oauthClientSecret,
    oauthAuthorizationUrl,
    oauthTokenUrl,
    oauthScopes,
  ])

  const validateParameters = useCallback(() => {
    try {
      const built = buildParameters()
      mcpServerParametersSchema.parse(built)
      setValidationError(null)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors
          .map((err) => {
            const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
            return `${path}${err.message}`
          })
          .join('\n')
        setValidationError(formattedErrors)
      } else if (error instanceof SyntaxError) {
        setValidationError('Env or headers must be valid JSON')
      } else {
        setValidationError(
          error instanceof Error ? error.message : 'Invalid parameters',
        )
      }
    }
  }, [buildParameters])

  useEffect(() => {
    validateParameters()
  }, [validateParameters])

  const saveServer = async (): Promise<string | null> => {
    try {
      const serverName = name.trim()
      if (serverName.length === 0) {
        throw new Error('Name is required')
      }
      validateServerName(serverName)

      if (
        plugin.settings.mcp.servers.find(
          (server) =>
            server.id === serverName && server.id !== existingServer?.id,
        )
      ) {
        throw new Error('Server with same name already exists')
      }

      let validatedParameters: McpServerParameters
      try {
        const built = buildParameters()
        validatedParameters = mcpServerParametersSchema.parse(built)
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            error.errors
              .map((err) => `${err.path.join('.')}: ${err.message}`)
              .join('\n'),
          )
        }
        if (error instanceof SyntaxError) {
          throw new Error('Env or headers must be valid JSON')
        }
        throw error
      }

      const newSettings = {
        ...plugin.settings,
        mcp: {
          ...plugin.settings.mcp,
          servers: existingServer
            ? plugin.settings.mcp.servers.map((server) =>
                server.id === existingServer.id
                  ? {
                      ...server,
                      id: serverName,
                      parameters: validatedParameters,
                    }
                  : server,
              )
            : [
                ...plugin.settings.mcp.servers,
                {
                  id: serverName,
                  parameters: validatedParameters,
                  toolOptions: {},
                  enabled: true,
                },
              ],
        },
      }

      await plugin.setSettings(newSettings)
      return serverName
    } catch (error) {
      if (error instanceof Error) {
        new Notice(error.message)
      } else {
        logger.error(
          'McpServerFormModal',
          'saveServer',
          'Failed to save MCP server',
          error,
        )
        new Notice('Failed to save MCP server.')
      }
      return null
    }
  }

  const handleSubmit = async () => {
    const serverName = await saveServer()
    if (serverName !== null) {
      onClose()
    }
  }

  const handleOAuthConnect = async () => {
    const serverName = await saveServer()
    if (serverName === null) {
      return
    }
    try {
      const mcpManager = await plugin.getMcpManager()
      await mcpManager.reconnectServer(serverName)
      new Notice(
        'OAuth flow initiated. Complete authorization in your browser.',
      )
    } catch (error) {
      new Notice(
        `Failed to initiate OAuth: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    <>
      <ObsidianSetting name="Name" desc="The name of the MCP server" required>
        <ObsidianTextInput
          value={name}
          onChange={(value: string) => setName(value)}
          placeholder="e.g. 'github'"
        />
      </ObsidianSetting>

      <ObsidianSetting
        name="Transport"
        desc="How to connect to the MCP server"
        required
      >
        <ObsidianDropdown
          value={transportType}
          options={TRANSPORT_OPTIONS}
          onChange={(value: string) =>
            setTransportType(value as McpTransportType)
          }
        />
      </ObsidianSetting>

      {transportType === 'stdio' && (
        <>
          <ObsidianSetting
            name="Command"
            desc="The executable name to run (e.g. 'npx', 'node')"
            required
          >
            <ObsidianTextInput
              value={command}
              onChange={(value: string) => setCommand(value)}
              placeholder="npx"
            />
          </ObsidianSetting>
          <ObsidianSetting
            name="Args"
            desc="One argument per line"
            className="smtcmp-settings-textarea-header smtcmp-settings-description-preserve-whitespace"
          >
            <TextareaAutosize
              value={args}
              placeholder={'-y\n@modelcontextprotocol/server-github'}
              onChange={(e) => setArgs(e.target.value)}
              className="smtcmp-mcp-server-modal-textarea"
              maxRows={10}
              minRows={2}
            />
          </ObsidianSetting>
          <ObsidianSetting
            name="Env"
            desc="Optional environment variables as a JSON object"
            className="smtcmp-settings-textarea-header smtcmp-settings-description-preserve-whitespace"
          >
            <TextareaAutosize
              value={env}
              placeholder={ENV_PLACEHOLDER}
              onChange={(e) => setEnv(e.target.value)}
              className="smtcmp-mcp-server-modal-textarea"
              maxRows={20}
              minRows={ENV_PLACEHOLDER.split('\n').length}
            />
          </ObsidianSetting>
        </>
      )}

      {(transportType === 'http' || transportType === 'sse') && (
        <>
          <ObsidianSetting
            name="URL"
            desc={`The ${transportType.toUpperCase()} endpoint URL of the MCP server`}
            required
          >
            <ObsidianTextInput
              value={url}
              onChange={(value: string) => setUrl(value)}
              placeholder="https://example.com/mcp"
            />
          </ObsidianSetting>
          <ObsidianSetting
            name="Headers"
            desc="Optional request headers as a JSON object"
            className="smtcmp-settings-textarea-header smtcmp-settings-description-preserve-whitespace"
          >
            <TextareaAutosize
              value={headers}
              placeholder={HEADERS_PLACEHOLDER}
              onChange={(e) => setHeaders(e.target.value)}
              className="smtcmp-mcp-server-modal-textarea"
              maxRows={20}
              minRows={HEADERS_PLACEHOLDER.split('\n').length}
            />
          </ObsidianSetting>
          <ObsidianSetting
            name="Authentication"
            desc="Bearer: static token. OAuth 2.0: static client (no DCR). OAuth 2.1 + DCR: dynamic registration with PKCE."
          >
            <ObsidianDropdown
              value={authType}
              options={AUTH_OPTIONS}
              onChange={(value: string) => setAuthType(value as AuthType)}
            />
          </ObsidianSetting>
          {authType === 'bearer' && (
            <ObsidianSetting
              name="Bearer Token"
              desc="Static API key or personal access token sent as the Authorization header"
              required
            >
              <ObsidianTextInput
                value={bearerToken}
                onChange={(value: string) => setBearerToken(value)}
                placeholder="ghp_xxxxxxxxxxxx"
                type="password"
              />
            </ObsidianSetting>
          )}
          {authType === 'oauth-static' && (
            <>
              <ObsidianSetting
                name="Client ID"
                desc="Pre-registered OAuth client identifier"
                required
              >
                <ObsidianTextInput
                  value={oauthClientId}
                  onChange={(value: string) => setOauthClientId(value)}
                  placeholder="client-id"
                />
              </ObsidianSetting>
              <ObsidianSetting
                name="Client Secret"
                desc="Optional for public clients (PKCE)"
              >
                <ObsidianTextInput
                  value={oauthClientSecret}
                  onChange={(value: string) => setOauthClientSecret(value)}
                  placeholder="client-secret"
                  type="password"
                />
              </ObsidianSetting>
              <ObsidianSetting
                name="Authorization URL"
                desc="OAuth 2.0 authorization endpoint"
                required
              >
                <ObsidianTextInput
                  value={oauthAuthorizationUrl}
                  onChange={(value: string) => setOauthAuthorizationUrl(value)}
                  placeholder="https://example.com/oauth/authorize"
                />
              </ObsidianSetting>
              <ObsidianSetting
                name="Token URL"
                desc="OAuth 2.0 token endpoint"
                required
              >
                <ObsidianTextInput
                  value={oauthTokenUrl}
                  onChange={(value: string) => setOauthTokenUrl(value)}
                  placeholder="https://example.com/oauth/token"
                />
              </ObsidianSetting>
              <ObsidianSetting
                name="Scopes"
                desc="Comma-separated list of OAuth scopes"
              >
                <ObsidianTextInput
                  value={oauthScopes}
                  onChange={(value: string) => setOauthScopes(value)}
                  placeholder="read, write"
                />
              </ObsidianSetting>
              <ObsidianSetting
                name="OAuth Connection"
                desc="Save the server first, then click Connect to start the authorization flow in your browser"
              >
                <ObsidianButton text="Connect" onClick={handleOAuthConnect} />
              </ObsidianSetting>
            </>
          )}
          {authType === 'oauth' && (
            <ObsidianSetting
              name="OAuth Connection"
              desc="Save the server first, then click Connect to start the authorization flow in your browser"
            >
              <ObsidianButton text="Connect" onClick={handleOAuthConnect} />
            </ObsidianSetting>
          )}
        </>
      )}

      {validationError !== null ? (
        <div className="smtcmp-mcp-server-modal-validation smtcmp-mcp-server-modal-validation--error">
          {validationError}
        </div>
      ) : (
        <div className="smtcmp-mcp-server-modal-validation smtcmp-mcp-server-modal-validation--success">
          Valid parameters
        </div>
      )}

      <ObsidianSetting>
        <ObsidianButton text="Save" onClick={handleSubmit} cta />
        <ObsidianButton text="Cancel" onClick={onClose} />
      </ObsidianSetting>
    </>
  )
}
