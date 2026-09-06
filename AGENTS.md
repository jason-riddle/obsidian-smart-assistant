---
tags:
  - ai-processed
created: "2026-09-05"
updated: "2026-09-05"
---

# AGENTS.md — obsidian-smart-assistant

Obsidian plugin providing AI chat, MCP (Model Context Protocol) tool
integration, and agent skills. Forked from obsidian-smart-composer.

## Build / Test / Lint Commands

```bash
npm run dev          # esbuild watch mode (development)
npm run build        # tsc typecheck + esbuild production bundle → main.js
npm run lint:check   # prettier --check + eslint
npm run lint:fix     # prettier --write + eslint --fix
npm run type:check   # tsc --noEmit
npm run test         # jest
```

## Architecture Overview

### Entry point

- **`src/main.ts`** — Plugin entrypoint. Manages lifecycle (load/unload),
  settings, view registration, and initializes McpManager.

### Core systems

- **`src/core/mcp/`** — MCP server management.
  - `mcpManager.ts` — Client lifecycle, connection management, tool
    dispatch. Supports **three transports**: stdio (default), http
    (Streamable HTTP), and sse (Server-Sent Events). Uses
    `@modelcontextprotocol/client` (v2 SDK) with dynamic imports for
    `Client`, `StreamableHTTPClientTransport`, `SSEClientTransport`
    (from the main entry) and `StdioClientTransport`
    (from `@modelcontextprotocol/client/stdio`). The http transport
    attempts `StreamableHTTPClientTransport` first and falls back to
    `SSEClientTransport` on connection failure (e.g. 4xx/404/405).
  - `tool-name-utils.ts` — Tool name parsing/validation (serverName__toolName).
  - `exception.ts` — MCP-specific exceptions.

- **`src/core/llm/`** — LLM provider implementations.
  - `base.ts` — Abstract `BaseLLMProvider` class.
  - `manager.ts` — Provider factory and registration.
  - Providers: OpenAI, Anthropic, Gemini, Groq, Ollama, Mistral, Perplexity,
    xAI, DeepSeek, Azure OpenAI, LM Studio, OpenRouter, Codex, Claude Code.
  - Message adapters for non-OpenAI-compatible providers.

### Settings system

- **`src/settings/schema/setting.types.ts`** — Zod schema for all plugin
  settings (`smartComposerSettingsSchema`).
- **`src/settings/schema/settings.ts`** — Settings parsing and validation.
- **`src/settings/schema/migrations/`** — Versioned migration chain.
  - `index.ts` — Exports `SETTINGS_SCHEMA_VERSION` (currently 17) and the
    `SETTING_MIGRATIONS` array.
  - Each file `N_to_(N+1).ts` contains a single migration function.
- **`src/settings/SettingTab.tsx`** — Obsidian settings UI (React).

### Database

- **`src/database/json/`** — JSON-based storage for chat history and
  templates. File context is provided via explicit @-mentions only.

### UI components

- **`src/components/`** — React components.
  - `chat-view/` — Chat interface.
  - `apply-view/` — Apply diff view.
  - `settings/` — Settings UI components.
  - `modals/` — Modal dialogs.
  - `common/` — Shared UI components.

### Utilities

- **`src/utils/chat/`** — Chat processing utilities.
  - `promptGenerator.ts` — Prompt construction.
  - `responseGenerator.ts` — LLM response streaming, tool call dispatch.
  - `chatHistoryManager.ts` — Chat history management.
  - `apply.ts` — Diff application.
- **`src/utils/llm/`** — LLM-related utilities.
- **`src/utils/common/`** — General utilities.

### Types

- **`src/types/mcp.types.ts`** — MCP type definitions, Zod schemas for
  server config, and type re-exports from `@modelcontextprotocol/client`.
- **`src/types/`** — Shared type definitions (chat, models, providers, etc.).

## MCP System

The MCP integration uses `@modelcontextprotocol/client` (v2 SDK). Three
transport types are supported: **stdio** (default), **http**
(Streamable HTTP, with automatic fallback to SSE), and **sse**
(Server-Sent Events).

- **Import paths:**
  - `Client`, `Tool`, `CallToolResult`, `StreamableHTTPClientTransport`,
    `SSEClientTransport`, auth helpers → `@modelcontextprotocol/client`
  - `StdioClientTransport` → `@modelcontextprotocol/client/stdio`
- **Config types:** `src/types/mcp.types.ts` — Zod schemas for
  `McpServerConfig`, `McpServerParameters` (a discriminated union on
  `type` over `mcpStdioParamsSchema`, `mcpHttpParamsSchema`,
  `mcpSseParamsSchema`), and `McpServerToolOptions`.
- **Manager:** `src/core/mcp/mcpManager.ts` — Handles server lifecycle
  (connect/disconnect), tool listing, tool execution with abort support,
  and per-conversation tool permission management. `connectServer`
  branches on `serverParams.type` to select the transport; the http
  branch falls back from `StreamableHTTPClientTransport` to
  `SSEClientTransport` on connection failure. For http/sse servers with
  `auth.type === "oauth"`, an `McpOAuthProvider` is created and passed to
  the transport. If `client.connect()` throws `UnauthorizedError`, the
  server enters `McpServerStatus.AwaitingAuth` and the pending OAuth flow
  is tracked for later completion via the protocol handler.
- **OAuth provider:** `src/core/mcp/oauthProvider.ts` — Implements the
  SDK's `OAuthClientProvider` interface. `OAuthTokenStore` persists
  per-server OAuth state (tokens, client info, PKCE verifier, CSRF state,
  discovery state) to `.smtcmp_oauth_tokens.json` in the vault.
  `McpOAuthProvider` wraps the store for a single server. The SDK
  handles discovery (RFC 9728/8414), DCR (RFC 7591), PKCE (S256),
  RFC 8707 `resource` parameter, RFC 9207 `iss` validation, token
  exchange, refresh, and step-up authorization.
- **Tool dispatch:** `src/utils/chat/responseGenerator.ts` — Calls
  `McpManager.callTool()` during LLM response streaming.

### MCP OAuth 2.1 + DCR Support

Remote MCP servers (http/sse) can use OAuth 2.1 with Dynamic Client
Registration. The flow is:

1. **Config:** Set `auth: { type: "oauth" }` in the http/sse server
   parameters (`src/types/mcp.types.ts`).
2. **Connect:** `McpManager.connectServer()` creates an `McpOAuthProvider`
   and passes it to the transport via `authProvider`. The SDK performs
   discovery, DCR, and PKCE setup, then calls
   `redirectToAuthorization()` which opens the browser via
   `window.open()`.
3. **Awaiting auth:** `client.connect()` throws `UnauthorizedError`.
   The transport is saved in `pendingOAuthFlows` keyed by the OAuth
   state. The server status is set to `McpServerStatus.AwaitingAuth`.
4. **Callback:** The `obsidian://smart-assistant/oauth/callback` protocol
   handler (registered in `src/main.ts`) receives the authorization
   code. It calls `McpManager.completeOAuthFlow(state, params)` which:
   - Looks up the pending flow by state
   - Calls `transport.finishAuth(params)` to exchange the code for
     tokens (saved by the provider)
   - Reconnects the server (new transport with the same provider, which
     now has cached tokens)
5. **Token refresh:** The SDK handles automatic token refresh on 401
   responses — the provider's `tokens()` returns cached tokens and the
   transport refreshes transparently.

**Token storage:** OAuth state is persisted to
`.smtcmp_oauth_tokens.json` in the vault via `OAuthTokenStore`. Each
server's state is keyed by server name. Tokens survive across plugin
reloads.

### Adding a new auth type

To add a new authentication type for http/sse transports:

1. Add a new literal to the `mcpAuthSchema` discriminated union in
   `src/types/mcp.types.ts` (or create a new schema).
2. Add a branch in `McpManager.createHttpClient()` / `createSseClient()`
   in `src/core/mcp/mcpManager.ts` to create the appropriate provider.
3. Implement the `OAuthClientProvider` interface (or `AuthProvider`) in
   a new file under `src/core/mcp/`.
4. If the auth flow uses a callback, register a new protocol handler in
   `src/main.ts` and add a completion method to `McpManager`.

### Adding a new MCP transport

Three transports are already supported (stdio, http, sse). To add a new
transport:

1. Add transport config fields to a new Zod schema in
   `src/types/mcp.types.ts` and append it to the `mcpServerParametersSchema`
   discriminated union.
2. Add a `createXxxClient` branch in `McpManager.connectServer()` /
   `createClientForTransport()` in `src/core/mcp/mcpManager.ts`.
3. Import the transport from `@modelcontextprotocol/client` (or the
   appropriate subpath).
4. Add a settings migration if the config schema changed (see below).

## Settings System

Settings are defined with Zod schemas and migrated through a versioned
chain. The current schema version is `SETTINGS_SCHEMA_VERSION` (17).

### Adding a new settings migration

1. Create `src/settings/schema/migrations/N_to_(N+1).ts` with a function
   `migrateFromNToNPlus1(settings)`.
2. Create a corresponding test file `N_to_(N+1).test.ts`.
3. Add the migration to the `SETTING_MIGRATIONS` array in
   `src/settings/schema/migrations/index.ts`.
4. Bump `SETTINGS_SCHEMA_VERSION` in the same file.
5. Update the Zod schema in `src/settings/schema/setting.types.ts` if
   new fields are added.

## Code Conventions

- Follow Google TypeScript Style Guide.
- Use **Zod** for all schema validation.
- **No comments** in code unless explicitly requested.
- Prefer editing existing files over creating new ones.
- 2-space indentation.
- Double quotes for strings.
- Semicolons required.
- Use `import type` for type-only imports.
- Dynamic imports for MCP SDK (avoids bundling the SDK when MCP is
  disabled on mobile).

## Build System

- **esbuild** bundles to `main.js` (CJS format, target ES2020).
- **tsc** is used for type checking only (`--noEmit`).
- `moduleResolution: "node"` in tsconfig.json — the v2 MCP package uses
  `exports` in package.json; esbuild handles this natively.
- Obsidian, Electron, and CodeMirror packages are external (not bundled).
- Node builtins are external.

## Testing

- **Jest** with **ts-jest** transformer.
- Test files: `*.test.ts` colocated with source files.
- Mock for `obsidian` module is in `__mocks__/obsidian.ts`.
- Test environment: `node`.
