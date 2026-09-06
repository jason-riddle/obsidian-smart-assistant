import { readFileSync } from "fs"
import { join } from "path"

import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

import {
  mcpServerParametersSchema,
} from "../../types/mcp.types"

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "..", "package.json"), "utf-8"),
) as {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const lockfile = JSON.parse(
  readFileSync(join(__dirname, "..", "..", "..", "package-lock.json"), "utf-8"),
) as { packages?: Record<string, unknown> }

describe("MCP SDK v2 import migration", () => {
  describe("positive: new import paths resolve", () => {
    it("should import Client from @modelcontextprotocol/client", () => {
      expect(Client).toBeDefined()
      expect(typeof Client).toBe("function")
    })

    it("should import StdioClientTransport from @modelcontextprotocol/client/stdio", () => {
      expect(StdioClientTransport).toBeDefined()
      expect(typeof StdioClientTransport).toBe("function")
    })

    it("should be able to construct a Client instance", () => {
      const client = new Client({ name: "test", version: "1.0.0" })
      expect(client).toBeInstanceOf(Client)
    })
  })

  describe("negative: old v1 package is removed", () => {
    it("should not have @modelcontextprotocol/sdk in dependencies", () => {
      const deps = packageJson.dependencies ?? {}
      expect(deps).not.toHaveProperty("@modelcontextprotocol/sdk")
    })

    it("should not have @modelcontextprotocol/sdk in devDependencies", () => {
      const devDeps = packageJson.devDependencies ?? {}
      expect(devDeps).not.toHaveProperty("@modelcontextprotocol/sdk")
    })

    it("should not have @modelcontextprotocol/sdk in package-lock.json top-level packages", () => {
      const packages = lockfile.packages ?? {}
      expect(packages).not.toHaveProperty(
        "node_modules/@modelcontextprotocol/sdk",
      )
    })
  })

  describe("positive: v2 client package is declared", () => {
    it("should have @modelcontextprotocol/client in dependencies", () => {
      const deps = packageJson.dependencies ?? {}
      expect(deps).toHaveProperty("@modelcontextprotocol/client")
    })

    it("should have @modelcontextprotocol/client in package-lock.json", () => {
      const packages = lockfile.packages ?? {}
      expect(packages).toHaveProperty(
        "node_modules/@modelcontextprotocol/client",
      )
    })
  })
})

describe("MCP transport config schema", () => {
  describe("positive: valid params validate correctly", () => {
    it("should validate stdio params with type 'stdio'", () => {
      const params = {
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "tok" },
      }
      const result = mcpServerParametersSchema.parse(params)
      expect(result.type).toBe("stdio")
    })

    it("should validate http params with type 'http' and a valid URL", () => {
      const params = {
        type: "http",
        url: "https://example.com/mcp",
      }
      const result = mcpServerParametersSchema.parse(params)
      expect(result.type).toBe("http")
    })

    it("should validate sse params with type 'sse' and a valid URL", () => {
      const params = {
        type: "sse",
        url: "https://example.com/sse",
      }
      const result = mcpServerParametersSchema.parse(params)
      expect(result.type).toBe("sse")
    })

    it("should validate http params with headers", () => {
      const params = {
        type: "http",
        url: "https://example.com/mcp",
        headers: { Authorization: "Bearer token" },
      }
      const result = mcpServerParametersSchema.parse(params)
      expect(result.type).toBe("http")
    })

    it("should validate sse params with headers", () => {
      const params = {
        type: "sse",
        url: "https://example.com/sse",
        headers: { Authorization: "Bearer token" },
      }
      const result = mcpServerParametersSchema.parse(params)
      expect(result.type).toBe("sse")
    })
  })

  describe("negative: invalid params fail validation", () => {
    it("should fail validation for http params with an invalid URL", () => {
      const params = {
        type: "http",
        url: "not-a-url",
      }
      expect(() => mcpServerParametersSchema.parse(params)).toThrow()
    })

    it("should fail validation for params without a type field", () => {
      const params = {
        command: "npx",
        args: ["-y", "server"],
      }
      expect(() => mcpServerParametersSchema.parse(params)).toThrow()
    })

    it("should fail validation for stdio params without a command", () => {
      const params = {
        type: "stdio",
      }
      expect(() => mcpServerParametersSchema.parse(params)).toThrow()
    })

    it("should fail validation for http params without a url", () => {
      const params = {
        type: "http",
      }
      expect(() => mcpServerParametersSchema.parse(params)).toThrow()
    })
  })
})
