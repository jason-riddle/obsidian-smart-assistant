import { readFileSync } from "fs"
import { join } from "path"

import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

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
