import type { CallToolResult, Client, Tool } from '@modelcontextprotocol/client'
import { z } from 'zod'

export type McpTool = Tool
export type McpToolCallResult = CallToolResult
export type McpClient = Client

export const mcpStdioParamsSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
})

export const mcpServerParametersSchema = mcpStdioParamsSchema
export type McpServerParameters = z.infer<typeof mcpServerParametersSchema>

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
}

export type McpServerState = {
  name: string
  config: McpServerConfig
} & (
  | {
      status: McpServerStatus.Connecting | McpServerStatus.Disconnected
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
