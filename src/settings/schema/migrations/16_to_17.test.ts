import { migrateFrom16To17 } from './16_to_17'

describe('Migration from v16 to v17', () => {
  it('should increment version to 17', () => {
    const oldSettings = {
      version: 16,
    }
    const result = migrateFrom16To17(oldSettings)
    expect(result.version).toBe(17)
  })

  it('should add type: "stdio" to MCP server params without a type field', () => {
    const oldSettings = {
      version: 16,
      mcp: {
        servers: [
          {
            id: 'github',
            enabled: true,
            toolOptions: {},
            parameters: {
              command: 'npx',
              args: ['-y', '@modelcontextprotocol/server-github'],
              env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'tok' },
            },
          },
        ],
      },
    }

    const result = migrateFrom16To17(oldSettings)
    const servers = (
      result.mcp as { servers: { parameters: { type: string } }[] }
    ).servers
    expect(servers[0].parameters.type).toBe('stdio')
    expect(servers[0].parameters).toMatchObject({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
    })
  })

  it('should leave servers that already have a type field unchanged', () => {
    const oldSettings = {
      version: 16,
      mcp: {
        servers: [
          {
            id: 'remote',
            enabled: true,
            toolOptions: {},
            parameters: {
              type: 'http',
              url: 'https://example.com/mcp',
            },
          },
        ],
      },
    }

    const result = migrateFrom16To17(oldSettings)
    const servers = (
      result.mcp as { servers: { parameters: { type: string } }[] }
    ).servers
    expect(servers[0].parameters.type).toBe('http')
  })

  it('should handle missing mcp config gracefully', () => {
    const oldSettings = {
      version: 16,
    }
    const result = migrateFrom16To17(oldSettings)
    expect(result.version).toBe(17)
  })
})
