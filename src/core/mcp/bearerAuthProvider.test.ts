import { BearerAuthProvider } from './bearerAuthProvider'

describe('BearerAuthProvider', () => {
  describe('positive: returns the configured token', () => {
    it('should return the token passed to the constructor', async () => {
      const provider = new BearerAuthProvider('ghp_token123')
      await expect(provider.token()).resolves.toBe('ghp_token123')
    })

    it('should return undefined for an empty token', async () => {
      const provider = new BearerAuthProvider('')
      await expect(provider.token()).resolves.toBeUndefined()
    })
  })

  describe('negative: invalid construction', () => {
    it('should throw if token is not a string', () => {
      expect(
        () => new BearerAuthProvider(undefined as unknown as string),
      ).toThrow(/string token/)
    })
  })
})
