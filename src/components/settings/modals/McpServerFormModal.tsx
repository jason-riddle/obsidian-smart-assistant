import { App, Notice } from 'obsidian'
import { useCallback, useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import * as z from 'zod'

import { validateServerName } from '../../../core/mcp/tool-name-utils'
import SmartComposerPlugin from '../../../main'
import {
  McpServerParameters,
  mcpServerParametersSchema,
  McpTransportType,
} from '../../../types/mcp.types'
import { ObsidianButton } from '../../common/ObsidianButton'
import { ObsidianDropdown } from '../../common/ObsidianDropdown'
import { ObsidianSetting } from '../../common/ObsidianSetting'
import { ObsidianTextInput } from '../../common/ObsidianTextInput'
import { ReactModal } from '../../common/ReactModal'

type AuthType = 'none' | 'oauth'

const AUTH_OPTIONS: Record<string, string> = {
  none: 'None',
  oauth: 'OAuth 2.1',
}

type McpServerFormComponentProps = {
  plugin: SmartComposerPlugin
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
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
    return ''
  }
  return JSON.stringify(value, null, 2)
}

function parseJsonOrUndefined(text: string): Record<string, string> | undefined {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  return JSON.parse(trimmed) as Record<string, string>
}

export class AddMcpServerModal extends ReactModal<McpServerFormComponentProps> {
  constructor(app: App, plugin: SmartComposerPlugin) {
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
  constructor(app: App, plugin: SmartComposerPlugin, editServerId: string) {
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
    existingParams && 'type' in existingParams
      ? existingParams.type
      : 'stdio'

  const [name, setName] = useState(existingServer?.id ?? '')
  const [transportType, setTransportType] =
    useState<McpTransportType>(initialType)

  const [command, setCommand] = useState(
    existingParams && 'command' in existingParams
      ? existingParams.command
      : '',
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
  const [authType, setAuthType] = useState<AuthType>(
    existingParams && 'auth' in existingParams && existingParams.auth?.type === 'oauth'
      ? 'oauth'
      : 'none',
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
    if (authType === 'oauth') {
      params.auth = { type: 'oauth' }
    }
    return params
  }, [transportType, command, args, env, url, headers, authType])

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
        console.error(error)
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
      new Notice('OAuth flow initiated. Complete authorization in your browser.')
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
            desc="OAuth 2.1 uses Dynamic Client Registration (DCR) and PKCE"
          >
            <ObsidianDropdown
              value={authType}
              options={AUTH_OPTIONS}
              onChange={(value: string) => setAuthType(value as AuthType)}
            />
          </ObsidianSetting>
          {authType === 'oauth' && (
            <ObsidianSetting
              name="OAuth Connection"
              desc="Save the server first, then click Connect to start the authorization flow in your browser"
            >
              <ObsidianButton
                text="Connect"
                onClick={handleOAuthConnect}
              />
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
