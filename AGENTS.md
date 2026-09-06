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
  settings, view registration, and initializes McpManager, DatabaseManager,
  and RAGEngine.

### Core systems

- **`src/core/mcp/`** — MCP server management.
  - `mcpManager.ts` — Client lifecycle, connection management, tool
    dispatch. Currently supports **stdio transport only**. Uses
    `@modelcontextprotocol/client` (v2 SDK) with dynamic imports for
    `Client` and `StdioClientTransport`.
  - `tool-name-utils.ts` — Tool name parsing/validation (serverName__toolName).
  - `exception.ts` — MCP-specific exceptions.

- **`src/core/llm/`** — LLM provider implementations.
  - `base.ts` — Abstract `BaseLLMProvider` class.
  - `manager.ts` — Provider factory and registration.
  - Providers: OpenAI, Anthropic, Gemini, Groq, Ollama, Mistral, Perplexity,
    xAI, DeepSeek, Azure OpenAI, LM Studio, OpenRouter, Codex, Claude Code.
  - Message adapters for non-OpenAI-compatible providers.

- **`src/core/rag/`** — RAG (Retrieval-Augmented Generation) engine.
  - **DEPRECATED** — slated for removal in Phase 3 of the refactor.
  - `ragEngine.ts` — Embedding-based document retrieval.
  - `embedding.ts` — Embedding model integration.

### Settings system

- **`src/settings/schema/setting.types.ts`** — Zod schema for all plugin
  settings (`smartComposerSettingsSchema`).
- **`src/settings/schema/settings.ts`** — Settings parsing and validation.
- **`src/settings/schema/migrations/`** — Versioned migration chain.
  - `index.ts` — Exports `SETTINGS_SCHEMA_VERSION` (currently 16) and the
    `SETTING_MIGRATIONS` array.
  - Each file `N_to_(N+1).ts` contains a single migration function.
- **`src/settings/SettingTab.tsx`** — Obsidian settings UI (React).

### Database

- **`src/database/`** — JSON-based storage (PGlite is being removed).
  - `DatabaseManager.ts` — Database lifecycle.
  - `json/` — JSON storage implementation (chat history, templates).

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

The MCP integration uses `@modelcontextprotocol/client` (v2 SDK).

- **Import paths:**
  - `Client`, `Tool`, `CallToolResult`, `StreamableHTTPClientTransport`,
    `SSEClientTransport`, auth helpers → `@modelcontextprotocol/client`
  - `StdioClientTransport` → `@modelcontextprotocol/client/stdio`
- **Config types:** `src/types/mcp.types.ts` — Zod schemas for
  `McpServerConfig`, `McpServerParameters`, `McpServerToolOptions`.
- **Manager:** `src/core/mcp/mcpManager.ts` — Handles server lifecycle
  (connect/disconnect), tool listing, tool execution with abort support,
  and per-conversation tool permission management.
- **Tool dispatch:** `src/utils/chat/responseGenerator.ts` — Calls
  `McpManager.callTool()` during LLM response streaming.

### Adding a new MCP transport (Phase 1)

Currently only stdio transport is supported. To add a new transport (e.g.,
StreamableHTTP or SSE):

1. Add transport config fields to the Zod schema in
   `src/types/mcp.types.ts` (e.g., `mcpServerParametersSchema` or a new
   schema variant).
2. Update `McpManager.connectServer()` in `src/core/mcp/mcpManager.ts`
   to select the appropriate transport based on config.
3. Import the transport from `@modelcontextprotocol/client` (for
   `StreamableHTTPClientTransport` / `SSEClientTransport`).
4. Add a settings migration if the config schema changed (see below).

## Settings System

Settings are defined with Zod schemas and migrated through a versioned
chain. The current schema version is `SETTINGS_SCHEMA_VERSION` (16).

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
