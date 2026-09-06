import { migrateFrom21To22 } from './21_to_22'

describe('Migration from v21 to v22', () => {
  it('should bump version to 22', () => {
    const result = migrateFrom21To22({ version: 21 })

    expect(result.version).toBe(22)
  })

  it('should keep stdio servers and strip the type field', () => {
    const result = migrateFrom21To22({
      version: 21,
      mcp: {
        servers: [
          {
            id: 'github',
            parameters: {
              type: 'stdio',
              command: 'npx',
              args: ['-y', '@modelcontextprotocol/server-github'],
              env: { TOKEN: 'abc' },
            },
            enabled: true,
            toolOptions: {},
          },
        ],
      },
    })

    const servers = (result.mcp as { servers: unknown[] }).servers
    expect(servers).toHaveLength(1)
    expect(servers[0]).toEqual({
      id: 'github',
      parameters: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: { TOKEN: 'abc' },
      },
      enabled: true,
      toolOptions: {},
    })
  })

  it('should drop http and sse servers', () => {
    const result = migrateFrom21To22({
      version: 21,
      mcp: {
        servers: [
          {
            id: 'remote-http',
            parameters: {
              type: 'http',
              url: 'https://example.com/mcp',
            },
            enabled: true,
            toolOptions: {},
          },
          {
            id: 'remote-sse',
            parameters: {
              type: 'sse',
              url: 'https://example.com/sse',
            },
            enabled: true,
            toolOptions: {},
          },
          {
            id: 'local',
            parameters: {
              type: 'stdio',
              command: 'npx',
            },
            enabled: true,
            toolOptions: {},
          },
        ],
      },
    })

    const servers = (result.mcp as { servers: { id: string }[] }).servers
    expect(servers).toHaveLength(1)
    expect(servers[0].id).toBe('local')
  })

  it('should handle servers without a type field (legacy stdio)', () => {
    const result = migrateFrom21To22({
      version: 21,
      mcp: {
        servers: [
          {
            id: 'legacy',
            parameters: {
              command: 'node',
              args: ['server.js'],
            },
            enabled: true,
            toolOptions: {},
          },
        ],
      },
    })

    const servers = (result.mcp as { servers: unknown[] }).servers
    expect(servers).toHaveLength(1)
  })

  it('should handle missing mcp config', () => {
    const result = migrateFrom21To22({ version: 21 })

    expect(result.version).toBe(22)
  })
})
