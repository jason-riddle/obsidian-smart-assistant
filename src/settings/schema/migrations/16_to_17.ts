import { SettingMigration } from '../setting.types'

export const migrateFrom16To17: SettingMigration['migrate'] = (data) => {
  const newData = { ...data }
  newData.version = 17

  const mcp = (newData.mcp ?? {}) as {
    servers?: { parameters?: Record<string, unknown> }[]
  }
  const servers = mcp.servers ?? []

  newData.mcp = {
    ...mcp,
    servers: servers.map((server) => {
      const params = server.parameters ?? {}
      // Old stdio configs had no `type` field; default to stdio for the new
      // discriminated-union schema.
      if (!('type' in params) || params.type === undefined) {
        return {
          ...server,
          parameters: { ...params, type: 'stdio' },
        }
      }
      return server
    }),
  }

  return newData
}
