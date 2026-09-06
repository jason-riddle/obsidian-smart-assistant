import type { CallToolResult, Client, Tool } from '@modelcontextprotocol/client'
import { z } from 'zod'

export type McpTool = Tool
export type McpToolCallResult = CallToolResult
export type McpClient = Client

export type McpTransportType = 'stdio' | 'http' | 'sse'

export const mcpStdioParamsSchema = z.object({
  type: z.literal('stdio'),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
})

export const mcpAuthSchema = z.object({
  type: z.literal('oauth'),
})

export const mcpHttpParamsSchema = z.object({
  type: z.literal('http'),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  auth: mcpAuthSchema.optional(),
})

export const mcpSseParamsSchema = z.object({
  type: z.literal('sse'),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  auth: mcpAuthSchema.optional(),
})

export const mcpServerParametersSchema = z.discriminatedUnion('type', [
  mcpStdioParamsSchema,
  mcpHttpParamsSchema,
  mcpSseParamsSchema,
])
export type McpServerParameters = z.infer<typeof mcpServerParametersSchema>

export type McpStdioParameters = z.infer<typeof mcpStdioParamsSchema>
export type McpHttpParameters = z.infer<typeof mcpHttpParamsSchema>
export type McpSseParameters = z.infer<typeof mcpSseParamsSchema>

export type McpAuth = z.infer<typeof mcpAuthSchema>

export const mcpServerToolOptionsSchema = z.record(
  z.string(),
  z.object({
    disabled: z.boolean().optional(),
    allowAutoExecution: z.boolean().optional(),
  }),
)

export const mcpServerConfigSchema = z.object({
  id: z.string(),
  parameters: mcpServerParametersSchema,
  enabled: z.boolean(),
  toolOptions: mcpServerToolOptionsSchema,
})
export type McpServerConfig = z.infer<typeof mcpServerConfigSchema>

export enum McpServerStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
  AwaitingAuth = 'awaiting-auth',
}

export type McpServerState = {
  name: string
  config: McpServerConfig
} & (
  | {
      status:
        | McpServerStatus.Connecting
        | McpServerStatus.Disconnected
        | McpServerStatus.AwaitingAuth
    }
  | {
      status: McpServerStatus.Connected
      client: McpClient
      tools: McpTool[]
    }
  | {
      status: McpServerStatus.Error
      error: Error
    }
)
