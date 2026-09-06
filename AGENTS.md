---
tags:
  - ai-processed
created: "2026-09-05"
updated: "2026-09-05"
---

# AGENTS.md — obsidian-smart-assistant

Obsidian plugin providing AI chat, MCP (Model Context Protocol) tool
integration, and agent skills.

## Build / Test / Lint Commands

```bash
npm run dev          # esbuild watch mode (development)
npm run build        # tsc typecheck + esbuild production bundle → main.js
npm run lint:check   # prettier --check + eslint
npm run lint:fix     # prettier --write + eslint --fix
npm run type:check   # tsc --noEmit
npm run test         # jest — DO NOT RUN without explicit user approval
```

> **WARNING: Running the full test suite (`npm run test` / `jest`)
> locally is BANNED.** It causes the machine to run out of memory.
> Use CI (GitHub Actions) to run the full test suite instead.
> Individual test files may be run locally with explicit user
> approval (e.g. `npx jest src/utils/common/chunk-array.test.ts`).

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
  - `manager.ts` — Provider factory (`getProviderClient`) and model
    resolver (`getChatModelClient`). The factory switch handles 14
    provider types: anthropic, openai, gemini, xai, deepseek, mistral,
    perplexity, openrouter, ollama, lm-studio, azure-openai,
    openai-compatible, aperture, unsloth.
  - Providers: OpenAI, Anthropic, Gemini, Ollama, Mistral, Perplexity,
    xAI, DeepSeek, Azure OpenAI, LM Studio, OpenRouter,
    OpenAI-Compatible, Aperture, Unsloth.
  - Message adapters for non-OpenAI-compatible providers.
  - **Provider registry:** `src/constants.ts` defines `PROVIDER_TYPES_INFO`
    (type metadata: label, defaultProviderId, requireApiKey,
    requireBaseUrl, additionalSettings) and `DEFAULT_PROVIDERS` (the
    shipped default provider instances). `DEFAULT_CHAT_MODELS` defines
    the shipped default models. All three are the single source of
    truth for provider/model defaults.

### Settings system

- **`src/settings/schema/setting.types.ts`** — Zod schema for all plugin
  settings (`smartComposerSettingsSchema`).
- **`src/settings/schema/settings.ts`** — Settings parsing and validation.
- **`src/settings/schema/migrations/`** — Versioned migration chain.
  - `index.ts` — Exports `SETTINGS_SCHEMA_VERSION` (currently 20) and the
    `SETTING_MIGRATIONS` array.
  - Each file `N_to_(N+1).ts` contains a single migration function.
- **`src/settings/SettingTab.tsx`** — Obsidian settings UI (React).

### Database

- **`src/database/json/`** — JSON-based storage for chat history. File
  context is provided via explicit @-mentions only.

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
  `auth` set, `buildAuthProvider()` selects the auth provider based on
  `auth.type` (see "MCP Auth Types" below). For OAuth-based auth types,
  if `client.connect()` throws `UnauthorizedError`, the server enters
  `McpServerStatus.AwaitingAuth` and the pending OAuth flow is tracked
  for later completion via the protocol handler.
- **Auth providers:** `src/core/mcp/`
  - `bearerAuthProvider.ts` — `BearerAuthProvider` implements the SDK's
    minimal `AuthProvider` interface for static bearer tokens.
  - `oauthProvider.ts` — `McpOAuthProvider` implements the full
    `OAuthClientProvider` interface; `McpOAuthProvider.createStatic()`
    pre-populates client information and discovery state for the
    `oauth-static` type so the SDK skips DCR. `OAuthTokenStore` persists
    per-server OAuth state (tokens, client info, PKCE verifier, CSRF
    state, discovery state) to `.smtcmp_oauth_tokens.json` in the vault.
- **Tool dispatch:** `src/utils/chat/responseGenerator.ts` — Calls
  `McpManager.callTool()` during LLM response streaming.

### MCP Auth Types

Remote MCP servers (http/sse) support three auth types, configured via
the `auth` field on `mcpHttpParamsSchema` / `mcpSseParamsSchema`
(`src/types/mcp.types.ts`). The schema is a discriminated union on
`type` over `mcpBearerAuthSchema`, `mcpOAuthStaticAuthSchema`, and
`mcpOAuthDcrAuthSchema`. `McpManager.buildAuthProvider()` branches on
the type and returns either `{ kind: "none" }`, `{ kind: "bearer",
provider: BearerAuthProvider }`, or `{ kind: "oauth", provider:
McpOAuthProvider }` (used for both `oauth-static` and `oauth`).

1. **Bearer token** (`auth.type === "bearer"`) — User provides a static
   token (API key, personal access token). `BearerAuthProvider`
   (`src/core/mcp/bearerAuthProvider.ts`) implements the SDK's minimal
   `AuthProvider` interface. The transport calls `token()` before every
   request. No DCR, no discovery, no browser flow.

2. **OAuth 2.0 static client** (`auth.type === "oauth-static"`) — User
   provides `clientId`, `clientSecret` (optional for public clients),
   `authorizationUrl`, `tokenUrl`, and optional `scopes`. No DCR — the
   client is pre-registered. `McpOAuthProvider.createStatic()` pre
   populates `clientInformation` (so the SDK skips DCR) and a static
   `discoveryState` (so the user-provided endpoints override network
   discovery). Still uses PKCE + the `obsidian://` callback + token
   storage. Awaiting-auth handling and the callback flow are identical
   to the DCR case.

3. **OAuth 2.1 + DCR** (`auth.type === "oauth"`) — No user-provided
   client info; the SDK performs discovery (RFC 9728/8414) and Dynamic
   Client Registration (RFC 7591). Uses PKCE + the `obsidian://` callback
   + token storage. This is the existing Phase 2 flow, unchanged.

### MCP OAuth flow (oauth-static and oauth)

The OAuth flow for both `oauth-static` and `oauth` is:

1. **Connect:** `McpManager.connectServer()` creates an `McpOAuthProvider`
   (DCR) or `McpOAuthProvider.createStatic()` (static) and passes it to
   the transport via `authProvider`. The SDK performs discovery (skipped
   for static via pre-populated discovery state), DCR (skipped for
   static via pre-populated client info), and PKCE setup, then calls
   `redirectToAuthorization()` which opens the browser via
   `window.open()`.
2. **Awaiting auth:** `client.connect()` throws `UnauthorizedError`.
   The transport is saved in `pendingOAuthFlows` keyed by the OAuth
   state. The server status is set to `McpServerStatus.AwaitingAuth`.
3. **Callback:** The `obsidian://smart-assistant/oauth/callback` protocol
   handler (registered in `src/main.ts`) receives the authorization
   code. It calls `McpManager.completeOAuthFlow(state, params)` which:
   - Looks up the pending flow by state
   - Calls `transport.finishAuth(params)` to exchange the code for
     tokens (saved by the provider)
   - Reconnects the server (new transport with the same provider, which
     now has cached tokens)
4. **Token refresh:** The SDK handles automatic token refresh on 401
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
2. Add a branch in `McpManager.buildAuthProvider()` in
   `src/core/mcp/mcpManager.ts` to create the appropriate provider.
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
chain. The current schema version is `SETTINGS_SCHEMA_VERSION` (20).

### Adding a new settings migration

1. Create `src/settings/schema/migrations/N_to_(N+1).ts` with a function
   `migrateFromNToNPlus1(settings)`.
2. Create a corresponding test file `N_to_(N+1).test.ts`.
3. Add the migration to the `SETTING_MIGRATIONS` array in
   `src/settings/schema/migrations/index.ts`.
4. Bump `SETTINGS_SCHEMA_VERSION` in the same file.
5. Update the Zod schema in `src/settings/schema/setting.types.ts` if
   new fields are added.

## Skills System

Skills replace the former Prompt Templates. A skill is a reusable set
of AI instructions discovered from markdown files using the
agentskills.io SKILL.md format. Skills use **progressive disclosure**:
the system prompt lists each skill's name and description (level 1), and
the `read_skill` built-in tool lets the agent load a skill's full
instructions on demand (level 2).

### Skill discovery

`src/core/skills/skillManager.ts` (`SkillManager`) discovers skills
from two sources:

1. **Vault skills** — `<vault>/.agents/skills/<name>/SKILL.md`. Scanned
   via `app.vault.adapter`. The manager watches `create`/`modify`/
   `delete` vault events (debounced 500ms) for paths under
   `.agents/skills/` and reloads automatically.
2. **Bundled skills** — hardcoded in
   `src/core/skills/bundledSkills.ts`. Ship with the plugin, no
   filesystem access needed.

Vault skills **override** bundled skills with the same `name`.

### SKILL.md format

```
<skill-name>/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional
├── references/       # Optional
└── assets/           # Optional
```

**Frontmatter** (parsed with a simple key-value parser, no YAML
dependency):

- `name` (required): max 64 chars, lowercase `[a-z0-9-]` only, **must
  match the parent directory name**.
- `description` (required): max 1024 chars — describe what the skill
  does AND when to use it.
- `license` (optional)
- `compatibility` (optional): max 500 chars
- `metadata` (optional): string→string map
- `allowed-tools` (optional): space-separated pre-approved tools

**Body:** Markdown after the `---` closing delimiter — instructions for
the AI agent.

### Adding a new bundled skill

1. Add an entry to `BUNDLED_SKILLS` in
   `src/core/skills/bundledSkills.ts` with `name`, `description`,
   `frontmatter`, `body`, `source: "bundled"`, and `path`/`dir`.

### Adding a new vault skill

Create `<vault>/.agents/skills/<skill-name>/SKILL.md` with valid
frontmatter and a markdown body. The manager picks it up automatically.

### The `read_skill` tool

`src/core/skills/skillTool.ts` defines a built-in tool `read_skill`
(not an MCP tool). It takes `{ name: string }` and returns the skill's
body text. The `ResponseGenerator` (`src/utils/chat/responseGenerator.ts`)
registers it alongside MCP tools and dispatches it inline
(`executeBuiltinTool`) — built-in tools skip the MCP approval flow and
always run immediately.

### Context and providers

- **`src/contexts/skills-context.tsx`** — `SkillsProvider` creates a
  `SkillManager`, loads skills, subscribes to changes, and exposes
  `{ skills, refreshSkills, getSkillManager }` via `useSkills()`.
- **`src/ChatView.tsx`** mounts `SkillsProvider` in the provider tree.
- **`src/components/chat-view/Chat.tsx`** passes `skills` to the
  `PromptGenerator` (for system prompt injection) and the stream
  manager (for the `read_skill` tool).
- **`src/components/settings/sections/SkillsSection.tsx`** — settings
  UI listing discovered skills (read-only; no CRUD). Opened in a modal
  from the chat toolbar and the settings tab.

## Code Conventions

- Follow **Google TypeScript Style Guide**.
- Aim for **Google standard library quality level** of code.
- Code must be **easy to read, easy to debug, and easy to follow**.
- Prefer **simple, straightforward** implementations over clever or
  obscure ones.
- Code should be **well scoped**, with **low coupling** and **high
  cohesion**.
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

## Logging

Structured logging is provided by the singleton logger in
`src/utils/logger.ts`. Import it wherever needed:

```ts
import { logger } from "../../utils/logger";

logger.info("ModuleName", "functionName", "message");
logger.warn("ModuleName", "functionName", "message", optionalError);
logger.error("ModuleName", "functionName", "message", error);
logger.debug("ModuleName", "functionName", "verbose detail");
```

### Format

Every log line is formatted as:

```
[2026-09-05T12:34:56.789Z] [INFO] [ModuleName.functionName] message
```

- **Timestamp:** ISO8601, UTC.
- **Level:** `DEBUG` / `INFO` / `WARN` / `ERROR` (uppercased).
- **Module.function:** the caller's module and function name, passed
  explicitly (no stack-trace capture, to keep it lightweight).
- **Message:** the log message. Extra args (e.g. an `Error` object) are
  forwarded to the underlying `console` method.

### Log levels

The logger has a configurable minimum level (`debug` < `info` < `warn` <
`error`). Messages below the minimum are not emitted. The default is
`debug` in development builds and `info` in production builds (driven by
esbuild's `process.env.NODE_ENV` define). Set the level at runtime:

```ts
logger.setLevel("warn"); // suppress debug and info
logger.getLevel();        // -> "warn"
```

### Conventions

- Use the file's module name (derived from the filename) as the
  `module` argument and the enclosing function name as the `fn`
  argument, so logs are grep-able and traceable.
- Prefer `info` for lifecycle events (plugin load/unload, server
  connect/disconnect, skill load, response generation start/complete).
- Use `warn` for recoverable failures (failed tool calls, failed
  fetches, invalid settings falling back to defaults).
- Use `error` for unexpected failures and error-handling branches.
- Use `debug` for verbose detail (per-request tracing, cache state,
  file reads) — these are off by default in production.
- Do not use raw `console.log` / `console.error` / `console.warn` — go
  through the logger so output is consistently formatted and
  filterable. The only `console.*` calls in the codebase live inside
  `src/utils/logger.ts`.
- Don't over-log: focus on lifecycle events, errors, and key decision
  points. Debug level is for verbose detail.

## Releases

### Creating a GitHub release

Brat (and the Obsidian community plugin updater) require release
assets to be attached to the GitHub release, not just a tag. A
release with only a tag and release notes will fail with "missing
manifest json file" in Brat.

After `npm run build` (which produces `main.js`), attach these three
files to the release:

```bash
gh release upload 2.1.0 main.js manifest.json styles.css --clobber
```

The required assets are:
- `main.js` — the bundled plugin code (esbuild output)
- `manifest.json` — plugin metadata (id, name, version, minAppVersion)
- `styles.css` — plugin styles

### Release checklist

1. Verify `manifest.json` and `package.json` versions match
2. Run `npm run build` — must pass (produces `main.js`)
3. `git push origin main`
4. **Wait for CI to pass** — after pushing to `main`, the CI workflow
   (`.github/workflows/ci.yml`) runs typecheck, lint, and tests. Before
   tagging a release, confirm CI is running and wait for it to pass:

   ```bash
   # Confirm CI is running (should show "in_progress" or "queued")
   gh run list --workflow=ci.yml --branch=main --limit=1

   # Wait for the latest CI run on main to complete (blocks until done)
   gh run watch --exit-status $(gh run list --workflow=ci.yml --branch=main --limit=1 --json databaseId --jq '.[0].databaseId')
   ```

   If CI fails, fix the issue and re-push before tagging. Do NOT tag a
   release while CI is failing.
5. `git tag -a X.Y.Z -m "X.Y.Z — summary"`
6. `git push origin X.Y.Z`
7. `gh release create X.Y.Z --title "X.Y.Z" --notes "..."`
8. `gh release upload X.Y.Z main.js manifest.json styles.css --clobber`
9. Verify: `gh release view X.Y.Z --json assets --jq '.assets[].name'`
   should list all three files

> **Tag format:** Use `X.Y.Z` (e.g. `2.1.1`), NOT `vX.Y.Z` (e.g.
> `v2.1.1`). Tags and release titles must not have a `v` prefix.

> **Version bumping:** Prefer patch bumps (`X.Y.Z` → `X.Y.Z+1`) for
> bug fixes and small changes. Use minor bumps (`X.Y.Z` → `X.Y+1.0`)
> for new features. Avoid major bumps unless there is a breaking
> change.

> **After every `git push`:** Always create a git tag and a GitHub
> release with the required assets uploaded. A push without a
> corresponding release means Brat users cannot install the update.

## Notes & Quirks

Discovered during development. Append here as new quirks are found.

- **Commented-out code requires context** — When temporarily disabling
  code by commenting it out, include a brief explanation immediately near
  the commented code. State what behavior is being investigated, why the
  code is disabled, and what remains active or how it should be restored.
- **CI workflow triggers** — The CI workflow
  (`.github/workflows/ci.yml`) runs on `push` to `main`,
  `pull_request` to `main`, and `workflow_dispatch`. Push-triggered
  runs may take several seconds to appear in `gh run list` after a
  push. If a push-triggered run does not appear, trigger manually:
  `gh workflow run ci.yml --ref main`.
- **Jest test environment is `node`, not `jsdom`** — Tests that
  reference browser globals (`window`, `document`, etc.) must mock
  them explicitly. For example, `oauthProvider.test.ts` sets
  `global.window = { open: mockOpen }` before testing
  `redirectToAuthorization` and cleans up afterwards.
- **Skill frontmatter parser strips surrounding quotes** —
  `parseFrontmatter` in `skillManager.ts` strips surrounding single or
  double quotes from frontmatter values. SKILL.md frontmatter like
  `name: "my-skill"` is parsed as `my-skill` (no quotes).
- **`metadata` field accepts string or record** — The
  `skillFrontmatterSchema` `metadata` field is a Zod union of
  `z.record(z.string(), z.string())` and `z.string()`, because the
  simple frontmatter parser produces strings, not nested objects.
- **`disabledSkills` in settings test** — The settings test
  (`settings.test.ts`) must include `disabledSkills: []` in the
  expected output of `parseSmartAssistantSettings({})` (added in
  schema v20).
- **MCP enabled toggles use persisted settings** — The MCP server list
  renders the enabled toggle from the current settings context instead
  of async connection state. `McpManager.handleSettingsUpdate` serializes
  settings updates so an older connection result cannot overwrite a newer
  enabled/disabled choice.
- **MCP settings updates are race-sensitive** — A settings change can
  start an asynchronous connect or disconnect while a later toggle is
  already persisted. Never publish a completed connection result without
  preserving the latest configuration. Keep settings reconciliation
  serialized, and treat persisted settings as the source of truth for
  controls. This is a stale-result race, not an MCP server-specific
  toggle behavior.
- **Async state race references** — The relevant implementation is
  `src/core/mcp/mcpManager.ts` (`handleSettingsUpdate`,
  `applySettingsUpdate`, and `updateServers`) together with
  `src/components/settings/sections/McpSection.tsx`. When changing this
  flow, test rapid enabled/disabled updates and delayed connection
  completion, and prefer latest-update-wins behavior.
- **Skills settings are temporarily hidden for race isolation** — The
  Skills section in `SettingsTabRoot.tsx` is commented out, not deleted,
  while investigating the MCP enabled-toggle regression. The observed bug
  is the toggle switching back and forth after a settings change; the
  confirmed MCP risk is stale asynchronous connection state, while skills
  involvement is only a hypothesis because `SkillsProvider` shares the
  settings context and persists `disabledSkills`. Runtime skill discovery,
  prompt filtering, the `read_skill` tool, and the chat skills modal remain
  active. Restore the commented provider/section after the race is isolated.
- **Recent CI test failures and fixes** — The first CI run failed six tests
  in three suites: `skillManager.test.ts` failed on quoted frontmatter and
  string metadata, `settings.test.ts` omitted `disabledSkills: []`, and
  `oauthProvider.test.ts` used `window` under Jest's `node` environment.
  These were fixed by stripping frontmatter quotes, accepting string or
  record metadata, adding the expected disabled-skills default, and mocking
  `global.window`. Do not treat those historical failures as proof that the
  current MCP toggle regression is caused by skills.

- **"Etc" section renamed to "Miscellaneous"** — the settings section
  header at the bottom of the settings tab was labeled "Etc". Renamed
  to "Miscellaneous" (file renamed `EtcSection.tsx` →
  `MiscSection.tsx`, component renamed `EtcSection` → `MiscSection`).
- **Custom model editing exists via `EditChatModelModal`** — a pencil
  icon on each model row opens `src/components/settings/modals/EditChatModelModal.tsx`,
  which edits `id`, `providerId`, `model`, and `promptLevel`. If the
  edited model is the selected chat/apply model, the selection follows
  the new id. The gear icon (`ChatModelSettingsModal`) still only
  exposes provider-specific options (reasoning, thinking, web_search).
- **System prompt file input has autocomplete** — the
  `systemPromptFile` setting uses a `FileSuggestInput` component
  (`src/components/common/FileSuggest.tsx`) that wraps
  Obsidian's `AbstractInputSuggest<TFile>` to show a fuzzy-filtered
  dropdown of markdown files in the vault as the user types.
- **Skills support enable/disable** — a `disabledSkills` string array
  in settings (schema v20) persists disabled skill names. The
  `SkillsProvider` exposes `toggleSkillEnabled`/`isSkillEnabled`;
  `Chat.tsx` and `useChatStreamManager.ts` filter disabled skills out
  of both the system prompt and the `read_skill` tool.
- **Default providers trimmed to lm-studio, ollama, openai, openrouter,
  unsloth** — `aperture` and `openai-compatible` remain selectable
  types but have `defaultProviderId: null` (they require a base URL,
  so no default instance is shipped). Migration 18→19 removes unused
  default providers (kept if the user set an API key) and their models.
- **Default models are OpenAI-only GPT-5.6/GPT-6 family** —
  `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-6-astra`.
  Default chat model `gpt-5.6-sol`, default apply model `gpt-5.6-luna`.
  Pricing lives in `OPENAI_PRICES` (only OpenAI prices remain —
  other provider price tables were removed).
- **New providers: aperture and unsloth** — `aperture`
  (Tailscale AI gateway; OpenAI-compatible, requires base URL, no API
  key — Tailscale identity handles auth; routes by model name) and
  `unsloth` (local LLM server; OpenAI-compatible, requires API key
  `sk-unsloth-…`, default base URL `http://127.0.0.1:8000`). Both
  live in `src/core/llm/apertureProvider.ts` and
  `src/core/llm/unslothProvider.ts`.
- **OpenAI GPT-5.6 family** — launched July 9, 2026. Three tiers:
  Sol ($5/$30), Terra ($2.50/$15), Luna ($1/$6). API model IDs:
  `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`.
- **OpenAI GPT-6 Astra** — launched September 3, 2026. API model ID:
  `gpt-6-astra`. Pricing $10/$50 per 1M tokens.
