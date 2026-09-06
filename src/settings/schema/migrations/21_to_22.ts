import { SettingMigration } from '../setting.types'

type OldServerParams = {
  type?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
}

type OldServer = {
  id: string
  parameters: OldServerParams
  enabled?: boolean
  toolOptions?: Record<string, unknown>
}

type OldMcpConfig = {
  servers?: OldServer[]
}

export const migrateFrom21To22: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 22

  const mcp = newData.mcp as OldMcpConfig | undefined
  if (mcp && Array.isArray(mcp.servers)) {
    const migratedServers = mcp.servers
      .filter((server) => {
        const params = server.parameters
        if (!params || typeof params !== 'object') {
          return false
        }
        if (params.type && params.type !== 'stdio') {
          return false
        }
        return typeof params.command === 'string'
      })
      .map((server) => {
        const { type: _type, ...rest } = server.parameters
        return {
          ...server,
          parameters: rest,
        }
      })
    newData.mcp = { servers: migratedServers }
  }

  return newData
}
