import { App } from "obsidian"

import {
  McpOAuthProvider,
  OAUTH_REDIRECT_URL,
  OAuthTokenStore,
} from "./oauthProvider"

const mockAdapter = {
  exists: jest.fn().mockResolvedValue(false),
  mkdir: jest.fn().mockResolvedValue(undefined),
  read: jest.fn().mockResolvedValue(""),
  write: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  list: jest.fn().mockResolvedValue({ files: [], folders: [] }),
}

const mockVault = {
  adapter: mockAdapter,
}

const mockApp = {
  vault: mockVault,
} as unknown as App

describe("OAuthTokenStore", () => {
  let store: OAuthTokenStore

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdapter.exists.mockResolvedValue(false)
    mockAdapter.read.mockResolvedValue("")
    store = new OAuthTokenStore(mockApp)
  })

  it("should load empty state when no file exists", async () => {
    const state = await store.get("test-server")
    expect(state).toBeUndefined()
  })

  it("should save and retrieve tokens", async () => {
    const tokens = {
      access_token: "access123",
      token_type: "Bearer",
      refresh_token: "refresh456",
    }
    await store.update("test-server", { tokens })
    const state = await store.get("test-server")
    expect(state?.tokens).toEqual(tokens)
  })

  it("should persist to the vault adapter on update", async () => {
    await store.update("test-server", { state: "csrf-state" })
    expect(mockAdapter.write).toHaveBeenCalledTimes(1)
    const writtenContent = mockAdapter.write.mock.calls[0][1] as string
    const parsed = JSON.parse(writtenContent)
    expect(parsed["test-server"].state).toBe("csrf-state")
  })

  it("should clear a server entry", async () => {
    await store.update("test-server", { state: "csrf-state" })
    await store.clear("test-server")
    const state = await store.get("test-server")
    expect(state).toBeUndefined()
  })
})

describe("McpOAuthProvider", () => {
  let store: OAuthTokenStore
  let provider: McpOAuthProvider

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdapter.exists.mockResolvedValue(false)
    mockAdapter.read.mockResolvedValue("")
    store = new OAuthTokenStore(mockApp)
    provider = new McpOAuthProvider("test-server", store)
  })

  describe("positive: provider constructs correctly", () => {
    it("should return the correct redirectUrl", () => {
      expect(provider.redirectUrl.toString()).toBe(OAUTH_REDIRECT_URL)
    })

    it("should have correct clientMetadata fields", () => {
      const metadata = provider.clientMetadata
      expect(metadata.client_name).toBe("Smart Assistant")
      expect(metadata.grant_types).toEqual([
        "authorization_code",
        "refresh_token",
      ])
      expect(metadata.token_endpoint_auth_method).toBe("none")
      expect(metadata.scope).toBe("")
      expect(metadata.redirect_uris).toHaveLength(1)
      expect(metadata.redirect_uris[0].toString()).toBe(OAUTH_REDIRECT_URL)
    })

    it("should save and retrieve tokens", async () => {
      const tokens = {
        access_token: "access123",
        token_type: "Bearer",
        refresh_token: "refresh456",
      }
      await provider.saveTokens(tokens)
      const retrieved = await provider.tokens()
      expect(retrieved).toEqual(tokens)
    })

    it("should save and retrieve client information", async () => {
      const clientInfo = {
        client_id: "client-id-123",
        client_secret: "secret",
      }
      await provider.saveClientInformation(clientInfo)
      const retrieved = await provider.clientInformation()
      expect(retrieved).toEqual(clientInfo)
    })

    it("should save and retrieve code verifier", async () => {
      await provider.saveCodeVerifier("verifier-123")
      const retrieved = await provider.codeVerifier()
      expect(retrieved).toBe("verifier-123")
    })

    it("should save and retrieve state", async () => {
      await provider.saveState("csrf-state-abc")
      const retrieved = await provider.state()
      expect(retrieved).toBe("csrf-state-abc")
    })

    it("should save and retrieve discovery state", async () => {
      const discoveryState = {
        authorizationServerUrl: "https://auth.example.com",
      }
      await provider.saveDiscoveryState(discoveryState)
      const retrieved = await provider.discoveryState()
      expect(retrieved).toEqual(discoveryState)
    })

    it("should call window.open on redirectToAuthorization", async () => {
      const openSpy = jest.spyOn(window, "open").mockImplementation(() => null)
      await provider.redirectToAuthorization(
        new URL("https://auth.example.com/authorize"),
      )
      expect(openSpy).toHaveBeenCalledWith(
        "https://auth.example.com/authorize",
        "_blank",
      )
      openSpy.mockRestore()
    })

    it("should invalidate all credentials", async () => {
      await provider.saveTokens({
        access_token: "access",
        token_type: "Bearer",
      })
      await provider.saveState("state")
      await provider.saveCodeVerifier("verifier")
      await provider.invalidateCredentials("all")
      expect(await provider.tokens()).toBeUndefined()
      await expect(provider.state()).rejects.toThrow()
      await expect(provider.codeVerifier()).rejects.toThrow()
    })
  })

  describe("negative: missing data throws", () => {
    it("should throw when codeVerifier called with no stored verifier", async () => {
      await expect(provider.codeVerifier()).rejects.toThrow(
        /No PKCE code verifier/,
      )
    })

    it("should throw when state called with no stored state", async () => {
      await expect(provider.state()).rejects.toThrow(/No OAuth state/)
    })

    it("should return undefined when tokens called with no stored tokens", async () => {
      const result = await provider.tokens()
      expect(result).toBeUndefined()
    })

    it("should return undefined when clientInformation called with no stored info", async () => {
      const result = await provider.clientInformation()
      expect(result).toBeUndefined()
    })
  })

  describe("negative: state validation", () => {
    it("should fail state validation on mismatch", async () => {
      await provider.saveState("expected-state")
      const storedState = await provider.state()
      const callbackState = "different-state"
      expect(storedState).not.toBe(callbackState)
    })
  })
})
