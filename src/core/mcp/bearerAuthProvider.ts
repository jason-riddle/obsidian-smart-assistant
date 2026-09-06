import type { AuthProvider } from '@modelcontextprotocol/client'

export class BearerAuthProvider implements AuthProvider {
  private tokenValue: string

  constructor(token: string) {
    if (typeof token !== 'string') {
      throw new Error('BearerAuthProvider requires a string token')
    }
    this.tokenValue = token
  }

  async token(): Promise<string | undefined> {
    if (this.tokenValue.length === 0) {
      return undefined
    }
    return this.tokenValue
  }
}
