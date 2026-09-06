---
tags:
  - inbox
  - ai-processed
created: "2026-03-07"
updated: "2026-08-30"
---

# Brain System Guide for AI Agents

This document provides context for AI assistants working within Jason's second brain (Obsidian vault).

## System Overview

This is a personal knowledge management system organized using Obsidian, containing:
- Tax records and financial planning
- Real estate investment documentation
- Personal goals and task management
- Learning materials (Spanish lessons)
- Professional history and references
- Homelab and technical documentation
- Templates for recurring activities

## Directory Structure

```
/Brain
├── A-INBOX/              # Quick capture inbox for unprocessed notes
├── Files/
│   ├── Areas/            # Ongoing responsibilities
│   │   ├── Better Baseline/
│   │   ├── Goals/
│   │   ├── History/
│   │   ├── Homelab/
│   │   ├── Ledger/
│   │   └── Real Estate Investing/
│   ├── Resources/        # Reference materials by topic
│   └── Z-Archives/       # Completed/historical items
├── Taxes/
│   └── Newer/           # Structured tax filing system
├── Templates/           # Reusable note templates
├── TODO/               # Action items and checklists
├── Soon.md             # Master task list
└── *.md                # Root-level quick notes
```

## Key Files and Their Purpose

### Task Management
- **Soon.md**: Master list of upcoming tasks, grouped by category and timeframe
- **Files/Areas/Goals/Monthly Goals.md**: High-level monthly objectives
- **Files/Areas/Homelab/Homelab - Tasks.md**: Technical infrastructure tasks
- **Files/Areas/Ledger/Ledger - Tasks.md**: Financial/accounting tasks
- **A-INBOX/WordPress - Tasks.md**: Website development tasks

### Tax & Finance
- **Taxes/Newer/**: Audit-grade tax record system
  - Each year has: `YYYY.md` (events), `YYYY Taxes - Docs.md` (document index), `YYYY Taxes - Notes.md` (context)
  - **Tax Filings Log.md**: Registry of all tax filings (append-only, authoritative)
  - **README.md**: System documentation and design philosophy
- **Files/Areas/Real Estate Investing/**: Property management documentation
  - Depreciation notes
  - Property taxes
  - Agreements with property managers
  - Property-specific timelines

### Reference Materials
- **A-INBOX/Capital Improvements.md**: Comprehensive IRS BAR test guide for repairs vs. improvements
- **A-INBOX/Accounting.md**: Fundamental accounting equations
- **Files/Areas/History/Jason - Employment History.md**: Complete work history with contacts
- **Files/Resources/Spanish - Lessons/**: Spanish learning notes

### Templates
- **Templates/Inbox.md**: Default template for inbox items
- **Templates/Template - Skiing.md**: Comprehensive packing list for ski trips
- **Templates/Leaving/Template - Household - Leaving & Arming House.md**: Security checklist

## Important Contexts

### Tax System Philosophy
The tax system prioritizes:
- **Zero duplication**: Each piece of information lives in exactly one place
- **Audit defensibility**: Can reconstruct entire tax situation without opening PDFs
- **Separation of concerns**: Facts (YYYY.md) vs. Filings (Tax Filings Log.md) vs. Documents (Docs.md)
- **Longevity over cleverness**: Intentionally boring and stable

### Financial Tracking
- Uses Beancount/Ledger for accounting (see Ledger - Tasks.md)
- Tracks two rental properties: 2943 Butterfly Palm and 206 Hoover Ave
- Manages depreciation schedules and capital improvements
- Uses safe harbor elections: Small Taxpayer and De Minimis

### Personal Context
- Location: San Francisco, CA (with property in San Antonio, TX)
- Current focus: Health goals (weight loss, exercise)
- Education: Applying to graduate school for teaching credential (math)
- Learning Spanish
- Tech background: DevOps/Cloud Engineering
- Homeowner with rental properties

## Tagging System

Common tags:
- `#inbox` - Unprocessed items in A-INBOX
- `#ai-processed` - Notes that have been reviewed/organized by AI
- `#federal` / `#california` / `#state` - Tax jurisdiction
- `#agreements` - Contracts and legal documents
- `#templates` - Reusable templates

## Working with This System

### When Adding Information
1. Check if a related file already exists before creating new ones
2. Use existing templates when available
3. Add appropriate tags and created date in frontmatter
4. Prefer updating existing files over creating new ones

### Naming Conventions
- **YYYY-MM-DD prefix**: Use for journal entries, meeting notes, and dated records
- **Timeline files**: Use `YYYY - Timeline.md` (NOT `YYYY-MM-DD - Timeline.md`). Timeline files are year-specific records that span time, not single-day events — e.g. `2023 - Timeline.md`, `2024 - Timeline.md`
- **Year-prefixed tax files**: Use `YYYY Taxes - Topic.md` — these are single-year reference files, not date-stamped documents

### When Organizing
1. A-INBOX is for quick capture - items should eventually move to proper locations
2. Use Files/Areas/ for ongoing responsibilities
3. Use Files/Resources/ for reference materials
4. Archive completed items to Files/Z-Archives/

### When Searching
- Tax info: Start with Taxes/Newer/
- Tasks: Check Soon.md, then area-specific task files
- Reference: Look in Files/Resources/
- History: Check Files/Areas/History/ or Files/Z-Archives/

## Links and Integration

### External Systems
- **Paperless**: https://paperless-v2.jasonriddle.com/ - Document management
- **Linkding**: Bookmark management (see ~/dotfiles/tools/.tools/linkding/Makefile)
- **NextCloud**: Cloud file storage
- **GitHub**: Code repositories (homelab, ansible, mcp, ledger-main, paperless-go, memory-mcp)

### Critical External References
- Property taxes: https://www.bexar.org/ (Bexar County, TX)
- Grad school: Alder Graduate School (Address: 2946 Broadway St, Suite B Redwood City, CA 94062)
- Current Airbnb: 1567 25th Avenue, San Francisco (Mar 23 - Aug 16, 2026)

### Obsidian (Flatpak) + MCP Servers

Obsidian runs as a flatpak (`md.obsidian.Obsidian`, runtime `org.freedesktop.Platform/x86_64/25.08`). The flatpak sandbox has a **restricted environment** that affects MCP server configuration in the smart-composer plugin (`.obsidian/plugins/smart-composer/data.json`, key `mcp.servers`).

**Semantic Notes Vault MCP + Tailscale (verified 2026-08-21):**
- Semantic Notes Vault MCP is the `semantic-vault-mcp` Obsidian plugin, version 0.12.6, with HTTP MCP on port 3001.
- Tailscale on Crostini runs in `--tun=userspace-networking` mode, so `100.100.10.196` is a logical Tailscale address and is not a local bindable interface address. Binding the plugin directly to it fails with `EADDRNOTAVAIL`.
- Keep the plugin bound to loopback: `bindMode: "loopback"`, `customBindHost: ""`, HTTP port `3001`.
- Normal Tailscale Serve can expose the loopback server without changing the plugin bind address:
  `sudo tailscale serve --bg --https=443 127.0.0.1:3001`
- Verified Serve configuration: `https://chromeos-penguin.greyhound-little.ts.net/` proxies to `http://127.0.0.1:3001`; the MCP endpoint is `/mcp`.
- The plugin requires `Authorization: Bearer <api-key>`. Without it, the endpoint returns HTTP 401. With the configured API key, `GET /` returns the Semantic Notes Vault health response and POST `/mcp` completes MCP initialization.
- `tailscale serve` requires elevated permission unless a Tailscale operator is configured. Use `sudo` for the command, or deliberately configure an operator with `sudo tailscale set --operator=$USER`.

**Sandbox constraints (as of 2026-08-02):**
- Default filesystem grants: `xdg-run/.obsidian-cli.sock;xdg-run/obsidian-cli:create;/run/user/1000` only — no `home`, no `/nix/store`
- `$PATH` inside the sandbox does **not** include `~/.nix-profile/bin` (where `deno`, `npx`, `docker`, `node` live via nix)
- `flatpak-spawn --host <cmd>` re-execs on the host but in a **clean D-Bus-activated environment** — also no nix PATH, no shell rc sourced
- smart-composer's `env` field in `data.json` does **NOT** get passed to the `flatpak-spawn --host` process — env vars set there are invisible to the host-spawned child. Must inline all credentials directly in `args` (e.g. `--header "Authorization:Bearer <token>"`, not `--header "Authorization:${AUTH_HEADER}"` with the value in `env`)

**Consequences for MCP servers spawned via stdio (e.g. `mcp-remote`):**
- Bare `command: "deno"` → `spawn deno ENOENT` (sandbox PATH doesn't have it)
- `flatpak-spawn --host deno …` → still `ENOENT` (host-spawned env has no nix PATH either)
- Absolute path through `flatpak-spawn --host` → **works**, and the host-spawned process has full `$HOME` access (so DENO_DIR, mcp-remote token cache, OAuth flow all function)
- Docker also works via `flatpak-spawn --host /home/jason/.nix-profile/bin/docker` (verified 2026-08-02)
- npx/node also works via `flatpak-spawn --host /home/jason/.nix-profile/bin/npx` (verified 2026-08-02)

**Required flatpak override** (applied 2026-07-30):
```bash
flatpak override --user --talk-name=org.freedesktop.Flatpak md.obsidian.Obsidian
```
This grants the sandbox permission to call the `org.freedesktop.Flatpak` D-Bus service, which is what `flatpak-spawn --host` uses to spawn host-side processes.

**Working smart-composer MCP server config (fastmail, OAuth 2.1):**
```json
{
  "id": "fastmail",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://api.fastmail.com/mcp",
      "--auth-timeout",
      "120",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

**Key rules for any future MCP server in this vault:**
1. Wrap the spawn with `flatpak-spawn` and prepend `--host`
2. Use the **absolute path** to the host binary (e.g. `/home/jason/.nix-profile/bin/<tool>`) — never rely on `$PATH`, since flatpak-spawn's host env has no nix/shell PATH augmentation
3. Prefer the stable nix-profile symlink (`/home/jason/.nix-profile/bin/...`) over the volatile `/nix/store/<hash>/bin/...` path, which rotates on every nix upgrade
4. The flatpak-spawn host process has full `$HOME` — so token caches, DENO_DIR, OAuth persistence all work normally
5. Before editing `.obsidian/plugins/smart-composer/data.json`, fully quit Obsidian (`pgrep -af /app/obsidian` should return nothing), then `cp` golden → live, then relaunch. smart-composer holds `data.json` in memory while running and writes it back at unpredictable times (settings interaction, obsidian-git auto-backup, shutdown) — if you `cp` while Obsidian is running, the plugin can clobber your sync with its stale in-memory state (this is exactly the failure mode that produced `backups/data.wiped.20260803T224407Z.json`). The plugin reads `mcp.servers` at startup, not on hot-reload, so a relaunch is required for the new config to take effect.
6. smart-composer writes **no log files**. Errors go to Obsidian DevTools console (`Ctrl+Shift+I` → Console). The `.smtcmp_*` files at vault root are chat history / vector DB, not logs.
7. **NEVER use `${VAR}` env var interpolation in args** — smart-composer's `env` field is NOT passed to the flatpak-spawn host process. Inline all credentials directly in `args` (e.g. `"Authorization:Bearer <actual-token>"`, not `"Authorization:${AUTH_HEADER}"`)
8. For Docker-based MCP servers (e.g. portainer, github), use `flatpak-spawn --host /home/jason/.nix-profile/bin/docker` and inline `-e VAR=value` args (env vars won't be passed through)
9. Keep MCP servers sorted alphabetically by `id` in the `servers` array
10. All MCP servers should use `mcp-remote@0.1.38` (not older versions)

**Common MCP error reference:**
- `spawn deno ENOENT` → command not on sandbox PATH; use absolute path via `flatpak-spawn --host`
- `-32000 connection closed` → spawn succeeded but the child process died immediately. Check DevTools console for the underlying cause. Most common: PATH issue resolved but the host binary still can't be located (e.g. used bare `deno` after `--host` instead of the absolute path), or the binary spawned but crashed during OAuth/cache init due to missing `$HOME` access.
- `Authorization:Bearer ${AUTH_HEADER}` not working → env var not expanded by flatpak-spawn; inline the actual token value in the `--header` arg
- Docker MCP server fails → used bare `docker` instead of absolute `/home/jason/.nix-profile/bin/docker`; or used `-e VAR` without inlining the value (`-e VAR=value`)
- `Invalid Scope / Unknown OAuth scope: openid, email, profile / Error code: invalid_scope` → mcp-remote@0.1.38 scope fallback bug. The server's OAuth metadata has no `scopes_supported`, so mcp-remote falls back to `"openid email profile"` which Cloudflare rejects. Fix: for `cloudflare-codemode`, use fastmcp-remote via uvx with the monkeypatch script (see the `cloudflare-codemode` gotcha). For `cloudflare` (Workers API access), use the local stdio server with API token auth (see the `cloudflare` gotcha).
- `Token exchange failed (400): {"error":"invalid_request","error_description":"Client must not use multiple authentication methods"}` → fastmcp-remote bug. DCR registers the client with `token_endpoint_auth_method: "client_secret_basic"`, and the token exchange code always puts `client_id` in the body AND adds an `Authorization: Basic` header. Fix: use the monkeypatch script that passes `additional_client_metadata={'token_endpoint_auth_method': 'none'}`. See the `cloudflare-codemode` gotcha.
- `/usr/bin/env: 'node': No such file or directory` → npx-based MCP server spawned via `flatpak-spawn --host` without a PATH wrapper. The package npx spawns has a `#!/usr/bin/env node` shebang that can't find `node` on the flatpak-spawn host PATH (no nix). Fix: use `/usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin` wrapper. See the `cloudflare` gotcha.

**MCP server auth reference (verified 2026-08-02):**

| Server | Auth Method | Notes |
|---|---|---|
| `anchor-browser` | API key (inlined) | `--header "anchor-api-key:sk-..."`; no OAuth needed |
| `android-cdp` | CDP via adb forward (manual) | `chrome-devtools-mcp@latest` under deno, `--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/`. Requires `adb forward tcp:9222 localabstract:chrome_devtools_remote` + Android Chrome running. No ADB to phone yet — disabled. See per-server gotcha |
| `android-debug-bridge` | ADB (wifi) | `android-mcp` via uvx (`uvx --python 3.13 android-mcp --wifi 100.100.10.224:<connect-port>`). Connect port rotates every session — ask user. See per-server gotcha |
| `android-ssh` | SSH key (path arg) | `ssh-mcp` via npx, `--key=/home/jason/.ssh/id_ed25519`. Connects to Termux sshd on phone (Tailscale `100.100.10.224:8022`). Verified working. See per-server gotcha |
| `aws-mcp` | OAuth 2.1 (cached) | Remote HTTP via `mcp-remote@0.1.38` + deno (same pattern as fastmail/kernel). Endpoint `https://aws-mcp.us-east-1.api.aws/mcp`. Requires `AWSMCPSignInOAuthAccessPolicy` managed IAM policy on the signing principal. Single-account only; use SigV4 Option B (`mcp-proxy-for-aws` via uvx) for multi-profile. See per-server gotcha |
| `bedrock-agentcore` | AWS profile (env-inlined) | `AWS_PROFILE=agentcore` inlined via `/usr/bin/env` wrapper; boto3 reads `~/.aws/credentials`. v0.1.1 has an upstream startup bug — see per-server gotcha |
| `browser-rendering` | CDP WebSocket + API token (inlined) | `chrome-devtools-mcp@latest` under deno (NOT mcp-remote — this is a CDP-WS server, not HTTP MCP). `--wsHeaders` carries the Cloudflare API token (same token as `cloudflare` server, `Browser Rendering - Edit` perm). See per-server gotcha |
| `cloudflare` | API token (local stdio) | Uses `@cloudflare/mcp-server-cloudflare@0.2.0` via npx (NOT the remote OAuth endpoint — mcp-remote scope bug). Requires `/usr/bin/env PATH=...` wrapper for flatpak-spawn. See per-server gotcha |
| `cloudflare-codemode` | OAuth 2.1 (workaround) | `https://mcp.cloudflare.com/mcp` via fastmcp-remote (uvx) + monkeypatch script. Avoids the mcp-remote scope bug; workaround for fastmcp-remote's "multiple auth methods" bug. See per-server gotcha |
| `cloudflare-docs` | None (public) | `https://docs.mcp.cloudflare.com/mcp` via mcp-remote. No OAuth needed — server returns tools without auth (verified 2026-08-03). Previous note about scope bug was wrong for this endpoint. See per-server gotcha |
| `containers` | OAuth 2.1 (cached) | `https://containers.mcp.cloudflare.com/mcp` via `mcp-remote@0.1.38` + deno (same pattern as fastmail/kernel). NOTE: unlike `mcp.cloudflare.com`, containers' OAuth metadata has no `scopes_supported` BUT accepts the mcp-remote fallback `openid email profile` scope — no workaround needed. See per-server gotcha |
| `fastmail` | OAuth 2.1 (cached) | Token cached in `~/.mcp-auth/`; no `--header` needed after initial OAuth |
| `filesystem` | None (local stdio) | Local deno stdio server; no auth. Exposes `/home/jason/Brain` and `/home/jason/Downloads` read/write. See per-server gotcha |
| `homelab-mcp` | Bearer token (inlined) | Server returns 404 on OAuth registration; must use `--header "Authorization:Bearer <token>"` |
| `kernel` | OAuth 2.1 (cached) | Browser OAuth flow; token cached in `~/.mcp-auth/`; no `--header` needed |
| `kitesurf` | None (public CDP-WS) | `chrome-devtools-mcp@latest` under deno against `wss://kitesurf.cloudflare.app/devtools/browser`. Stateless playground — no API token, no auth. See per-server gotcha |
| `portainer-enhanced` | API token (CLI flag) | stdio Docker container; auth via `-token` flag, not OAuth |

**Working MCP server config examples (Obsidian smart-composer `data.json`):**

OAuth 2.1 server (no header needed, token cached in `~/.mcp-auth/`):
```json
{
  "id": "fastmail",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://api.fastmail.com/mcp",
      "--auth-timeout",
      "120",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

Bearer token server (token inlined in `--header`, NOT in `env`):
```json
{
  "id": "homelab-mcp",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://homelab-mcp.onrender.com/v1/mcp",
      "--header",
      "Authorization:Bearer 25184963a8b17b31891ad370b043b63076fbc9f4276b1f55d6568f636f9fd284",
      "--auth-timeout",
      "120",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

Docker-based stdio server (absolute docker path, env vars inlined in `-e` flags):
```json
{
  "id": "portainer-enhanced",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/docker",
      "run",
      "-i",
      "--rm",
      "-e",
      "PORTAINER_SERVER=http://nas:9000",
      "-e",
      "PORTAINER_TOKEN=ptr_ibKpW98ohF7EW8N9ruRUGWPWDcCt0KvFnSS+z4BbUoc=",
      "ghcr.io/jmrplens/portainer-mcp-enhanced:v0.8.0@sha256:fb7a91f311a23762d932336880762c74101bcb5f445793e79ee7c65c5526c762",
      "-server",
      "http://nas:9000",
      "-token",
      "ptr_ibKpW98ohF7EW8N9ruRUGWPWDcCt0KvFnSS+z4BbUoc=",
      "-skip-tls-verify",
      "-disable-version-check"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

npx-based stdio server (requires `/usr/bin/env PATH=...` wrapper — see `cloudflare` gotcha for why):
```json
{
  "id": "cloudflare",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/usr/bin/env",
      "PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin",
      "/home/jason/.nix-profile/bin/npx",
      "-y",
      "@cloudflare/mcp-server-cloudflare@0.2.0",
      "run",
      "YOUR_CLOUDFLARE_ACCOUNT_ID"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

Local deno stdio server (no auth, filesystem access):
```json
{
  "id": "filesystem",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-read",
      "--allow-write",
      "--allow-env",
      "npm:@modelcontextprotocol/server-filesystem@2026.7.10",
      "/home/jason/Brain",
      "/home/jason/Downloads"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

**WRONG vs RIGHT — env var inlining for flatpak-spawn:**
```json
// WRONG — env field is NOT passed to flatpak-spawn --host process:
{
  "id": "homelab-mcp",
  "parameters": {
    "command": "flatpak-spawn",
    "args": ["--host", "/home/jason/.nix-profile/bin/deno", ..., "--header", "Authorization:${AUTH_HEADER}", ...],
    "env": { "AUTH_HEADER": "Bearer 25184..." }  // ← invisible to the host process!
  }
}

// RIGHT — inline the token directly in the --header arg:
{
  "id": "homelab-mcp",
  "parameters": {
    "command": "flatpak-spawn",
    "args": ["--host", "/home/jason/.nix-profile/bin/deno", ..., "--header", "Authorization:Bearer 25184...", ...],
    "env": {}  // ← empty, token is inlined above
  }
}
```

**WRONG vs RIGHT — Docker env vars for flatpak-spawn:**
```json
// WRONG — bare "docker", and -e VAR without value (env not passed through):
{
  "id": "portainer-enhanced",
  "parameters": {
    "command": "flatpak-spawn",
    "args": ["--host", "docker", "run", "-e", "PORTAINER_SERVER", "-e", "PORTAINER_TOKEN", ...],
    "env": { "PORTAINER_SERVER": "http://nas:9000", "PORTAINER_TOKEN": "ptr_..." }  // ← invisible!
  }
}

// RIGHT — absolute docker path, and -e VAR=value inlined:
{
  "id": "portainer-enhanced",
  "parameters": {
    "command": "flatpak-spawn",
    "args": ["--host", "/home/jason/.nix-profile/bin/docker", "run", "-e", "PORTAINER_SERVER=http://nas:9000", "-e", "PORTAINER_TOKEN=ptr_...", ...],
    "env": {}
  }
}
```

**Known mcp-remote bugs (as of 0.1.38):**
1. **Hardcoded fallback scopes**: When a server's OAuth metadata doesn't advertise `scopes_supported`, mcp-remote falls back to `"openid email profile"` (hardcoded in `chunk-65X3S4HB.js:21031`). Cloudflare rejects these scopes with `invalid_scope`. The `--static-oauth-client-metadata '{"scope":"..."}'` flag doesn't override empty/whitespace scopes due to a `.trim().length > 0` check. **Two workarounds, depending on the server:**
   - For `cloudflare` (Workers/KV/R2/D1 API access): use the local stdio server (`@cloudflare/mcp-server-cloudflare@0.2.0`) with API token auth instead — no OAuth involved. See the `cloudflare` gotcha.
   - For `cloudflare-codemode` (the remote OAuth endpoint): **use fastmcp-remote via uvx with a Python monkeypatch script** (current approach in golden — more durable than the old mcp-remote cached-file patch). The monkeypatch overrides `resolve_auth()` to pass `additional_client_metadata={'token_endpoint_auth_method': 'none'}`, avoiding fastmcp-remote's "multiple auth methods" bug at token exchange. See the `cloudflare-codemode` gotcha for the full procedure. (The previous mcp-remote patch + `--static-oauth-client-metadata` workaround is documented in the gotcha's history section but is no longer the active config — it was replaced by the fastmcp-remote approach on 2026-08-03 because the mcp-remote patch is lost on every `deno cache` reload while the fastmcp-remote monkeypatch survives cache clears.)
   - **Three alternative stdio-to-remote MCP proxy tools were tested as replacements (fastmcp-remote, chengleiyuan/mcp-oauth2-proxy, sparfenyuk/mcp-proxy) — only fastmcp-remote (with monkeypatch) works against `mcp.cloudflare.com/mcp`.** See the `cloudflare-codemode` gotcha § "Alternatives tested" for the full comparison table. Track upstream PR [#254](https://github.com/geelen/mcp-remote/pull/254) for a durable fix to mcp-remote (would eliminate the need for either workaround).
2. **OAuth in short-lived processes**: mcp-remote's OAuth flow requires the process to stay alive long enough to receive the `/oauth/callback` redirect. A bash `timeout 15` kills the process before the callback arrives → "Error: No authorization code received". This is NOT a bug — just don't test OAuth-dependent servers with short timeouts; they work fine in long-lived MCP clients (Obsidian, opencode).

**Managing mcp-remote OAuth cache (`~/.mcp-auth/`):**

mcp-remote caches OAuth tokens, client info, and code verifiers in `~/.mcp-auth/mcp-remote-<version>/`. Each server has a unique hash prefix (e.g. `6244cf5467a6f706b7b55d5e88d4e4c4`). To force re-authentication for a specific server, delete its cached files.

```bash
# List all cached OAuth entries with their server URLs
for f in ~/.mcp-auth/mcp-remote-0.1.37/*_client_info.json; do
  hash=$(basename "$f" | sed 's/_client_info.json//')
  redirect=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('redirect_uris',[''])[0])" 2>/dev/null)
  echo "$hash: $redirect"
done

# Find and delete cached auth for a specific server (e.g. cloudflare)
# Step 1: Find the hash for the server you want to clear
for f in ~/.mcp-auth/mcp-remote-0.1.37/*_client_info.json; do
  hash=$(basename "$f" | sed 's/_client_info.json//')
  redirect=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('redirect_uris',[''])[0])" 2>/dev/null)
  # Match by port number from a prior mcp-remote run (visible in its log output)
  echo "$hash: $redirect"
done
# Step 2: Delete all files for that hash
rm -f ~/.mcp-auth/mcp-remote-0.1.37/<HASH>_*

# Delete ALL cached OAuth tokens (forces re-auth for every server)
rm -rf ~/.mcp-auth/mcp-remote-0.1.37/

# Check which servers have valid tokens (tokens.json exists = authenticated)
ls ~/.mcp-auth/mcp-remote-0.1.37/*_tokens.json 2>/dev/null | while read f; do
  hash=$(basename "$f" | sed 's/_tokens.json//')
  echo "AUTHENTICATED: $hash"
done
```

**Per-server gotchas:**
### `android-cdp` — chrome-devtools-mcp over adb forward to Android Chrome (verified 2026-08-07)

The `android-cdp` MCP server drives **Chrome on the Android phone** via the
Chrome DevTools Protocol, using `chrome-devtools-mcp@latest` under deno. It
is the same package as the `kitesurf` and `browser-rendering` servers —
**the only difference is the `--wsEndpoint` target**. Exposes the same
~29 chrome-devtools-mcp tools (`navigate_page`, `take_snapshot`,
`take_screenshot`, `click`, `fill`, `evaluate_script`, `list_pages`, etc.)
— but pointed at the phone's Chrome instead of a Cloudflare-managed or
public playground browser.

**Endpoint + setup.** Per
[chrome-devtools-mcp's debugging-android docs](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/debugging-android.md):

```bash
# 1. On the phone: enable Developer Options → USB debugging (and/or
#    Wireless debugging on Android 11+).
# 2. From the host, connect ADB to the phone. For wireless:
adb connect 100.100.10.224:<wireless-debugging-port>
# (the legacy `adb tcpip 5555` method works only after a USB connect)
# 3. Forward the phone's CDP abstract socket to a local TCP port:
adb forward tcp:9222 localabstract:chrome_devtools_remote
# 4. Open Chrome on the phone (any page). Then verify from the host:
curl -s http://localhost:9222/json/version   # should return Chrome's CDP info
curl -s http://localhost:9222/json           # should list page targets
```

Once the forward is up, the MCP server's `--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/`
connects to the phone's Chrome. The trailing-slash, no-browser-id form
matches the upstream docs and works because chrome-devtools-mcp resolves
the browser target via the `/json/version` HTTP endpoint before opening
the WS.

**Status (2026-08-08): working — verified end-to-end.** Wireless ADB is
enabled on the phone (Galaxy Tab A9, SM-X210). After pairing + connecting,
`adb forward tcp:9222 localabstract:chrome_devtools_remote` brings the
phone's Chrome CDP endpoint to `ws://127.0.0.1:9222/devtools/browser/`.
The MCP server inits (chrome_devtools v1.6.0, 29 tools) and tool calls
work (`list_pages`, `navigate_page`, `evaluate_script` all confirmed
against the phone's Chrome).

**⚠️ Pairing + connect ports change every session.** Wireless debugging
shows two different ports on the phone: a **pairing port** (one-time,
used with `adb pair <ip>:<port> <code>`) and a **connect port** (used
with `adb connect <ip>:<port>`). Both rotate whenever wireless debugging
is toggled or the phone reboots. **Do not hardcode either port in golden
or in this gotcha — ask the user for the current pairing code + port
and the connect port each time you need to set up ADB.** The Tailscale
IP (`100.100.10.224` for `galaxy-tab-a9`) is stable; only the ports
change. The `--wifi` value in `android-debug-bridge`'s golden config
and any `adb connect` / `adb pair` commands must be refreshed from the
user each session.

**Existing SSH forward in `~/.ssh/config` is NOT sufficient.** The
`Host android-cdp` entry in `~/.ssh/config` does `LocalForward 9222
localhost:9222` against the Termux sshd on the phone. That forwards the
host's port 9222 to the phone's `localhost:9222` — but Termux's sshd runs
in the Termux UID namespace and **cannot see** the `chrome_devtools_remote`
abstract socket owned by the system Chrome process (different UID, plus
abstract sockets are namespace-scoped). The only path that works is
`adb forward tcp:9222 localabstract:chrome_devtools_remote` via a real
ADB connection — i.e. adbd on the phone, not Termux sshd. Keep the SSH
`Host android-cdp` entry for other uses (e.g. SOCKS / port-test) but
don't expect it to drive Android Chrome CDP.

**Why deno, not npx.** Same as `browser-rendering`/`kitesurf`: deno runs
`npm:chrome-devtools-mcp@latest` natively without a separate node spawn,
so the npx `#!/usr/bin/env node` shebang PATH gotcha doesn't apply. See
the `cloudflare` gotcha for the npx-Path-wrapper explanation.

**`toolOptions` is `{}` — auto-execution is wild-west.** Same posture as
`kitesurf`. The destructive/interactive tools (`click`, `fill`,
`fill_form`, `evaluate_script`, `take_screenshot`, `navigate_page`,
`close_page`) can mutate the phone's Chrome state. Consider populating
`toolOptions` with `allowAutoExecution: false` for the side-effect-heavy
tools when you flip `enabled` to `true` (mirror the `browser-rendering`
`toolOptions` block).

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "android-cdp",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:chrome-devtools-mcp@latest",
      "--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {
    "list_pages": {"disabled": false, "allowAutoExecution": true}
  }
}
```

**Verification commands:**
```bash
# Pair + connect (ask the user for the current pairing code+port and connect port):
adb pair 100.100.10.224:<pairing-port> <pairing-code>
adb connect 100.100.10.224:<connect-port>

# Forward + verify (Chrome must be running on the phone):
adb forward tcp:9222 localabstract:chrome_devtools_remote
curl -s http://localhost:9222/json/version | python3 -m json.tool

# Smoke-test the MCP server (init only — WS endpoint unreachable until forward is up):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=ws://127.0.0.1:9222/devtools/browser/ 2>&1 | grep -E 'protocolVersion|serverInfo'

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=ws://127.0.0.1:9222/devtools/browser/ 2>&1 | grep -E 'protocolVersion|serverInfo'

# End-to-end (after adb forward is up): navigate Chrome to example.com and read document.title:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"navigate_page","arguments":{"type":"url","url":"https://example.com"}}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"evaluate_script","arguments":{"function":"() => document.title"}}}'; sleep 25 ) \
| timeout 60 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=ws://127.0.0.1:9222/devtools/browser/ 2>/dev/null | grep '"id":3'
```

### `android-debug-bridge` — android-mcp via uvx, phone ADB over wifi (verified 2026-08-07)

The `android-debug-bridge` MCP server uses
[`android-mcp`](https://github.com/CursorTouch/Android-MCP) (the
CursorTouch package, NOT to be confused with the `android-remote-control`
server which is a separate remote-HTTP MCP) via `uvx`, spawned through
`flatpak-spawn --host` with `--python 3.13`. It exposes 14 tools for
interacting with an Android device via ADB and the Accessibility API:
`ListDevices`, `ConnectDevice`, `Device`, `Click`, `ClickBySelector`,
`Snapshot`, `LongClick`, `Swipe`, `Type`, `Drag`, `Press`,
`Notification`, `Wait`, `WaitForElement`.

**Device selection — `--wifi 100.100.10.224:<connect-port>`.** Configured to
target the phone over wifi ADB (Tailscale IP `100.100.10.224`, stable).
The ADB connect port rotates every session (see the `android-cdp` gotcha
— ask the user for the current connect port). The phone must have
wireless ADB enabled and `adb connect 100.100.10.224:<connect-port>`
must succeed from the host before any tool call
will work. Alternative flags: `--usb` (force USB-connected device) or
`--device <serial>` (explicit serial). With no flag, the server
auto-detects (prefers physical devices over emulators per the
android-mcp README). Env vars `ANDROID_MCP_DEVICE`,
`ANDROID_MCP_CONNECTION=wifi`, and `ANDROID_MCP_HOST` are also
supported but per AGENTS.md rule 7 they wouldn't reach the flatpak-spawn
host process via smart-composer's `env` field — use the CLI flags.

**Status (2026-08-08): working — verified end-to-end.** With the phone
paired + connected via wireless ADB, the server inits (Android-MCP
v3.4.5, 14 tools) and `ListDevices` returns the phone
(`100.100.10.224:<connect-port> device`) plus the ChromeOS emulator.
The device is resolved lazily, so init + tools/list succeed even
without a device — but tool calls (`Click`, `Snapshot`, etc.) require
a live ADB connection. **The `--wifi` port in golden is stale by next
session — ask the user for the current connect port and update golden
before syncing live.**

**Host `adb devices` currently shows `emulator-5554` only** — that's
the ChromeOS Android container, not the phone. Don't point this server
at the emulator by removing the `--wifi` flag; the emulator isn't a
real Android device and the user wants the phone (Galaxy X210).

**Python 3.13 pin.** `uvx --python 3.13` is required (per upstream
README — Python 3.14 currently fails to resolve a transitive `pywin32`
dependency in the MCP stack, even on Linux). The nix `uvx` binary
respects `--python 3.13` and pulls a 3.13 interpreter into the uv cache
on first run.

**Same `flatpak-spawn` pattern as `bedrock-agentcore`.** uvx is at
`/home/jason/.nix-profile/bin/uvx` (stable nix-profile symlink). No
`/usr/bin/env` wrapper needed for uvx itself (uvx resolves its own
python via the uv-managed toolchain). If env vars are needed later,
chain them through `/usr/bin/env` like the `bedrock-agentcore` gotcha
shows.

**`toolOptions` is `{}` — auto-execution is wild-west.** All 14 tools
currently auto-execute under smart-composer's global default. Several
are side-effect-heavy (`Click`, `ClickBySelector`, `Type`, `Drag`,
`Swipe`, `Press`, `Notification` — all touch the device's UI state).
When flipping `enabled` to `true`, consider populating `toolOptions`
with `allowAutoExecution: false` for the interactive tools. Read-only
tools (`ListDevices`, `Snapshot`) can stay auto-executed.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "android-debug-bridge",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/uvx",
      "--python",
      "3.13",
      "android-mcp",
      "--wifi",
      "100.100.10.224:46871"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {
    "ListDevices": {"disabled": false, "allowAutoExecution": true}
  }
}
```
**Note:** the `--wifi` port (`46871` above) is the connect port from
the 2026-08-08 session — it **rotates every session**. Ask the user for
the current connect port and update golden before syncing live.

**Verification commands:**
```bash
# Pair + connect (ask user for current pairing code+port and connect port):
adb pair 100.100.10.224:<pairing-port> <pairing-code>
adb connect 100.100.10.224:<connect-port>

# Smoke-test the server (init + tools/list — works even with no device, lazy resolution):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 10 ) \
| timeout 60 /home/jason/.nix-profile/bin/uvx --python 3.13 android-mcp 2>/dev/null | grep '"id":2' | python3 -c "import sys,json
for l in sys.stdin:
    try:d=json.loads(l)
    except:continue
    print('TOOLS:',len(d.get('result',{}).get('tools',[])))
    for t in d.get('result',{}).get('tools',[]): print(' -',t['name'])"
# Expected: TOOLS: 14 (ListDevices, ConnectDevice, Device, Click, ...)

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 10 ) \
| timeout 60 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/uvx --python 3.13 android-mcp 2>/dev/null | grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# Confirm uvx is reachable from inside the sandbox:
flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/uvx --version

# Once wireless ADB is enabled on the phone, end-to-end test
# (ask the user for the current connect port):
adb connect 100.100.10.224:<connect-port>
# Then in smart-composer, call the `ListDevices` tool — should show the phone.
```

### `android-ssh` — ssh-mcp via npx, SSH key auth to Termux sshd (verified 2026-08-07)

The `android-ssh` MCP server uses
[`ssh-mcp`](https://github.com/tufantunc/ssh-mcp) via `npx`, spawned
through `flatpak-spawn --host` with the `/usr/bin/env PATH=...` wrapper
(required for npx-based servers — see the `cloudflare` gotcha). It
exposes 2 tools: `exec` (run a shell command on the remote SSH server)
and `sudo-exec` (run with sudo elevation, requires `--sudoPassword` if
sudo isn't passwordless). Connects to the Termux sshd on the phone
(Tailscale `100.100.10.224:8022`, user `u0_a305`), authenticating with
the existing SSH key at `/home/jason/.ssh/id_ed25519` (which is already
authorized on the phone — `ssh android` works in `BatchMode=yes`).

**Verified working end-to-end (2026-08-07).** `initialize` succeeds,
`tools/list` returns `exec` + `sudo-exec`, and an actual `exec` call
returns `aarch64` from the phone — both via the direct host shell and
via the full `flatpak-spawn --host /usr/bin/env PATH=... npx ...` spawn
path that smart-composer uses. This is the only one of the three
android-* servers currently enabled in golden.

**`--` separator between npx args and package args.** The CLI form is
`npx -y ssh-mcp@latest -- --host=... --port=... --user=... --key=...`.
The bare `--` separates npx's own flags from the package's flags.
Without it, npx tries to parse `--host=...` as npx flags and fails. The
ssh-mcp package itself accepts `--host`, `--user`, `--port`, `--password`,
`--key`, `--sudoPassword`, `--suPassword`, `--timeout`, `--maxChars`.
We use `--key` (not `--password`) because the phone's Termux sshd is
key-only.

**Key path is a host path.** `--key=/home/jason/.ssh/id_ed25519` is
read by the npx-spawned ssh-mcp process, which runs on the host via
`flatpak-spawn --host` (the host process has full `$HOME` access, so
the key is readable). The key is NOT copied into the sandbox.

**`/usr/bin/env PATH=...` wrapper — why it's required.** Same as the
`cloudflare` server: `npx` is a symlink with a hardcoded
`#!/nix/store/<hash>/bin/node` shebang (works without the wrapper), but
the package npx spawns (`ssh-mcp`) is a JS file with a
`#!/usr/bin/env node` shebang. The flatpak-spawn host env has
`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`
(no nix), so `env` can't find `node` and the spawn fails with
`/usr/bin/env: 'node': No such file or directory`. The wrapper
augments PATH to include `/home/jason/.nix-profile/bin`. See the
`cloudflare` gotcha for the full explanation.

**`toolOptions` is `{}` — auto-execution is wild-west.** Both `exec`
and `sudo-exec` can run arbitrary shell commands on the phone.
Currently both auto-execute under smart-composer's global default.
Consider gating `sudo-exec` behind `allowAutoExecution: false` if you
ever set `--sudoPassword` (currently unset, so `sudo-exec` calls would
fail anyway). `exec` is the primary useful tool — leaving it
auto-executed is fine for a personal phone, but be aware the agent can
run any command as `u0_a305` (Termux user, not root — limited to
Termux-sandbox permissions).

**Existing `Host android` in `~/.ssh/config`.** The phone is already
configured as `Host android` (Tailscale `100.100.10.224`, port `8022`,
user `u0_a305`) in `~/.ssh/config`. ssh-mcp does NOT read `~/.ssh/config`
— it takes `--host`/`--port`/`--user`/`--key` explicitly. So the
config is duplicated in the golden MCP entry. If the phone's Tailscale
IP changes, update both `~/.ssh/config` and `data.golden.json`.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "android-ssh",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/usr/bin/env",
      "PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin",
      "/home/jason/.nix-profile/bin/npx",
      "-y",
      "ssh-mcp@latest",
      "--",
      "--host=100.100.10.224",
      "--port=8022",
      "--user=u0_a305",
      "--key=/home/jason/.ssh/id_ed25519"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Confirm SSH to the phone works (BatchMode = key-only, no password prompt):
ssh -o ConnectTimeout=8 -o BatchMode=yes android 'echo SSH-OK; uname -m'
# Expected: SSH-OK\naarch64

# Smoke-test ssh-mcp init + tools/list + exec (host shell):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"exec","arguments":{"command":"echo SSH-MCP-EXEC-OK; uname -m"}}}' ; sleep 10 ) \
| timeout 40 /usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin /home/jason/.nix-profile/bin/npx -y ssh-mcp@latest -- --host=100.100.10.224 --port=8022 --user=u0_a305 --key=/home/jason/.ssh/id_ed25519 2>&1 | grep -E '"id":[23]|SSH-MCP-EXEC-OK|aarch64'
# Expected: tools list with exec + sudo-exec, and exec result with "SSH-MCP-EXEC-OK\naarch64"

# Smoke-test through the Obsidian flatpak sandbox (init only — npx cold-start in sandbox is slow):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 90 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin /home/jason/.nix-profile/bin/npx -y ssh-mcp@latest -- --host=100.100.10.224 --port=8022 --user=u0_a305 --key=/home/jason/.ssh/id_ed25519 2>&1 | grep -E 'protocolVersion|serverInfo'

# Confirm the spawn fails WITHOUT the PATH wrapper (demonstrates why it's required):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 60 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/npx -y ssh-mcp@latest -- --host=100.100.10.224 --port=8022 --user=u0_a305 --key=/home/jason/.ssh/id_ed25519 2>&1 | tail -3
# Expected: /usr/bin/env: 'node': No such file or directory
```

### `aws-mcp` — OAuth 2.1 via mcp-remote (verified 2026-08-03)

The `aws-mcp` MCP server is the managed remote AWS MCP Server
(`https://aws-mcp.us-east-1.api.aws/mcp`). It uses the same `mcp-remote@0.1.38`
+ deno spawn pattern as `fastmail`/`kernel`/`parallel-search` — OAuth 2.1
with browser flow on first use, token cached in `~/.mcp-auth/`.

**Prerequisite — IAM OAuth policy.** Before first use, attach the
`AWSMCPSignInOAuthAccessPolicy` managed IAM policy to the IAM user/role that
will sign in during the OAuth flow:

```bash
aws iam attach-role-policy \
  --role-name MyRole \
  --policy-arn arn:aws:iam::aws:policy/AWSMCPSignInOAuthAccessPolicy
```

Without this policy, the OAuth flow returns a 400 error page after sign-in
(per AWS docs troubleshooting table). The required IAM permissions are
`signin:AuthorizeOAuth2Access` and `signin:CreateOAuth2Token`, both granted
by the managed policy.

**OAuth discovery works without `?oauth=initialize`.** AWS docs list several
clients (Claude Desktop, Cursor, Kiro IDE, Gemini CLI, Codex) that need
`?oauth=initialize` appended to the URL to explicitly trigger OAuth.
mcp-remote is NOT one of them — it does MCP OAuth discovery automatically.
Verified 2026-08-03 via mcp-remote@0.1.38: discovers
`https://us-east-1.oauth.signin.aws/` as the authorization server, connects
via StreamableHTTP, no `?oauth=initialize` needed. (If tool calls ever fail
with credential errors after a server-side change, try appending
`?oauth=initialize` as a fallback.)

**Regions.** Only two endpoints are supported: `us-east-1`
(`https://aws-mcp.us-east-1.api.aws/mcp`) and `eu-central-1`
(`https://aws-mcp.eu-central-1.api.aws/mcp`). Golden uses `us-east-1`.

**Tokens.** Access tokens valid 1 hour; AWS Sign-in auto-refreshes for up to
12 hours. After that, re-auth via the browser flow.

**Single-account only.** OAuth does not support multi-profile switching. For
cross-account workflows, use SigV4 (Option B in the AWS docs) via the local
`mcp-proxy-for-aws==1.6.4` stdio proxy through `uvx` (similar to the
`bedrock-agentcore` pattern, with `AWS_REGION` set via `--metadata`). Not
currently configured in golden — add only if cross-account access is needed.

**Tools.** After first successful auth, tools like
`aws___search_documentation` and `aws___retrieve_skill` appear
(per AWS docs). `toolOptions` is `{}` in golden — refine after first-use
testing once the full tool list is visible in smart-composer settings.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "aws-mcp",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://aws-mcp.us-east-1.api.aws/mcp",
      "--auth-timeout",
      "180",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Smoke-test mcp-remote against the AWS MCP endpoint (host shell, no OAuth needed for init):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 15 /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://aws-mcp.us-east-1.api.aws/mcp --transport http-only 2>&1 | grep -E 'Discovered|Connected|Proxy'

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://aws-mcp.us-east-1.api.aws/mcp --transport http-only 2>&1 | grep -E 'Discovered|Connected|Proxy'

# Confirm the IAM OAuth policy is attached to your IAM role (replace MyRole):
aws iam list-attached-role-policies --role-name MyRole --query 'AttachedPolicies[?PolicyName==`AWSMCPSignInOAuthAccessPolicy`].PolicyArn' --output text
```

### `bedrock-agentcore` — upstream startup bug + uvx monkeypatch pattern (verified 2026-08-03)

The `bedrock-agentcore` MCP server (`awslabs.amazon-bedrock-agentcore-mcp-server`
v0.1.1) is a stdio MCP server installed via `uvx` (not deno, not npx, not
docker). Two surprising things about it:

**1. Upstream startup bug — hardcoded llms.txt URL 404s.** The server's
`main()` calls `cache.ensure_ready()` (`server.py:261`) before `mcp.run()`.
`ensure_ready()` iterates `doc_config.llm_texts_url` and HTTP-GETs each URL
to build the docs search index. The default list is hardcoded in
`config.py:31` as
`['https://aws.github.io/bedrock-agentcore-starter-toolkit/llms.txt']` —
which returns **HTTP 404** (confirmed 2026-08-03 with the server's own
`agentcore-mcp-docs/1.0` user agent). The `urllib.error.HTTPError` propagates
up and the server crashes before `mcp.run()` fires. From the MCP client's
perspective this looks like "stdio server died immediately on init" —
identical signature to the `-32000 connection closed` PATH failures, but the
cause is a broken upstream URL, not a spawn problem.

There is no env var to skip docs init. The `AGENTCORE_ENABLE_TOOLS` /
`AGENTCORE_DISABLE_TOOLS` env vars only control which *primitive tool groups*
register — the docs tools (`search_agentcore_docs`, `fetch_agentcore_doc`)
are unconditional and `cache.ensure_ready()` runs regardless.

**Workaround — `uvx --from <pkg> python -c "..."` monkeypatch.** Instead of
using the package's CLI entry point, invoke Python directly and patch the
config before calling `main()`:

```python
from awslabs.amazon_bedrock_agentcore_mcp_server.config import doc_config
doc_config.llm_texts_url = []
from awslabs.amazon_bedrock_agentcore_mcp_server.server import main
main()
```

This clears the docs-index source list, so `ensure_ready()` no-ops and the
server proceeds to `mcp.run()`. Verified working through `flatpak-spawn
--host` from inside the Obsidian sandbox — `initialize` returns
`protocolVersion 2025-06-18`, server `amazon-bedrock-agentcore-mcp-server
v1.28.1`, 34 tools registered (25 browser + 9 code interpreter).

**Tradeoff:** the 2 docs tools register but return empty results (the index
is never built). Browser + code interpreter tools work fully. If AWS ever
fixes the upstream URL, revert to the simple `uvx awslabs.amazon-bedrock-
agentcore-mcp-server@latest` form.

**This monkeypatch pattern is generally useful** for any uvx/pip MCP server
whose `main()` has an unavoidable broken startup side-effect (network fetch,
hardcoded path, bad default). `uvx --from <pkg> python -c "import ...;
<patch>; from <pkg>.server import main; main()"` lets you patch the module
before re-entering the entry point. Keep it in mind when the package's own
CLI entry point can't be made to skip the bad behavior via env/flag.

**2. Multi-env-var inlining via `/usr/bin/env`.** The server needs three env
vars set (`FASTMCP_LOG_LEVEL`, `AGENTCORE_ENABLE_TOOLS`, `AWS_PROFILE`).
Per rule 7, smart-composer's `env` field is NOT passed to `flatpak-spawn
--host`. The clean pattern for multiple env vars is to chain them through
`/usr/bin/env`:

```json
"args": [
  "--host",
  "/usr/bin/env",
  "FASTMCP_LOG_LEVEL=ERROR",
  "AGENTCORE_ENABLE_TOOLS=browser,code_interpreter",
  "AWS_PROFILE=agentcore",
  "/home/jason/.nix-profile/bin/uvx",
  "--from", "awslabs.amazon-bedrock-agentcore-mcp-server@latest",
  "python", "-c", "<patch script above>"
]
```

`/usr/bin/env VAR=value <binary>` is a standard Unix pattern that sets env
vars for the spawned process without relying on a shell. It generalizes
rule 7's "inline credentials directly in args" — when you have more than
one env var, prefer the `/usr/bin/env` wrapper over trying to inline them
into the binary's own flags (which most binaries don't accept for arbitrary
vars). `/usr/bin/env` is at `/usr/bin/env` on this host (stable absolute
path, not nix-managed). Verified working from inside the Obsidian flatpak
sandbox via `flatpak run --command=flatpak-spawn md.obsidian.Obsidian
--host /usr/bin/env VAR=value /home/jason/.nix-profile/bin/uvx --version`.

**3. `uvx` is available at `/home/jason/.nix-profile/bin/uvx`.** For any
future uvx-based MCP server, use this absolute path (stable nix-profile
symlink, not the volatile `/nix/store/<hash>/bin/uvx`). Same rule 2/3
principle as deno/docker/npx.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "bedrock-agentcore",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/usr/bin/env",
      "FASTMCP_LOG_LEVEL=ERROR",
      "AGENTCORE_ENABLE_TOOLS=browser,code_interpreter",
      "AWS_PROFILE=agentcore",
      "/home/jason/.nix-profile/bin/uvx",
      "--from",
      "awslabs.amazon-bedrock-agentcore-mcp-server@latest",
      "python",
      "-c",
      "from awslabs.amazon_bedrock_agentcore_mcp_server.config import doc_config; doc_config.llm_texts_url=[]; from awslabs.amazon_bedrock_agentcore_mcp_server.server import main; main()"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {
    "search_agentcore_docs": {"disabled":false,"allowAutoExecution":true},
    "fetch_agentcore_doc": {"disabled":false,"allowAutoExecution":true},
    "start_browser_session": {"disabled":false,"allowAutoExecution":true},
    "get_browser_session": {"disabled":false,"allowAutoExecution":true},
    "stop_browser_session": {"disabled":false,"allowAutoExecution":true},
    "list_browser_sessions": {"disabled":false,"allowAutoExecution":true},
    "browser_navigate": {"disabled":false,"allowAutoExecution":true},
    "browser_navigate_back": {"disabled":false,"allowAutoExecution":false},
    "browser_navigate_forward": {"disabled":false,"allowAutoExecution":false},
    "browser_click": {"disabled":false,"allowAutoExecution":false},
    "browser_type": {"disabled":false,"allowAutoExecution":true},
    "browser_fill_form": {"disabled":false,"allowAutoExecution":false},
    "browser_select_option": {"disabled":false,"allowAutoExecution":false},
    "browser_hover": {"disabled":false,"allowAutoExecution":false},
    "browser_press_key": {"disabled":false,"allowAutoExecution":true},
    "browser_upload_file": {"disabled":false,"allowAutoExecution":false},
    "browser_handle_dialog": {"disabled":false,"allowAutoExecution":false},
    "browser_mouse_wheel": {"disabled":false,"allowAutoExecution":true},
    "browser_snapshot": {"disabled":false,"allowAutoExecution":true},
    "browser_take_screenshot": {"disabled":false,"allowAutoExecution":true},
    "browser_wait_for": {"disabled":false,"allowAutoExecution":true},
    "browser_console_messages": {"disabled":false,"allowAutoExecution":true},
    "browser_network_requests": {"disabled":false,"allowAutoExecution":true},
    "browser_evaluate": {"disabled":false,"allowAutoExecution":true},
    "browser_tabs": {"disabled":false,"allowAutoExecution":true},
    "browser_close": {"disabled":false,"allowAutoExecution":false},
    "browser_resize": {"disabled":false,"allowAutoExecution":true},
    "start_code_interpreter_session": {"disabled":false,"allowAutoExecution":true},
    "stop_code_interpreter_session": {"disabled":false,"allowAutoExecution":true},
    "get_code_interpreter_session": {"disabled":false,"allowAutoExecution":true},
    "list_code_interpreter_sessions": {"disabled":false,"allowAutoExecution":true},
    "execute_code": {"disabled":false,"allowAutoExecution":true},
    "execute_command": {"disabled":false,"allowAutoExecution":true},
    "install_packages": {"disabled":false,"allowAutoExecution":true},
    "upload_file": {"disabled":false,"allowAutoExecution":true},
    "download_file": {"disabled":false,"allowAutoExecution":true}
  }
}
```

**Verification commands:**
```bash
# Confirm the upstream llms.txt URL is still 404 (if this returns 200, the workaround can be reverted):
curl -sI -A 'agentcore-mcp-docs/1.0' -o /dev/null -w '%{http_code}\n' https://aws.github.io/bedrock-agentcore-starter-toolkit/llms.txt

# Smoke-test the server via uvx with the monkeypatch (host shell):
timeout 15 /usr/bin/env FASTMCP_LOG_LEVEL=ERROR AGENTCORE_ENABLE_TOOLS=browser,code_interpreter AWS_PROFILE=agentcore \
  /home/jason/.nix-profile/bin/uvx --from awslabs.amazon-bedrock-agentcore-mcp-server@latest python -c \
  "from awslabs.amazon_bedrock_agentcore_mcp_server.config import doc_config; doc_config.llm_texts_url=[]; from awslabs.amazon_bedrock_agentcore_mcp_server.server import main; main()" \
  < <(printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}'; sleep 4)

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
timeout 30 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /usr/bin/env \
  FASTMCP_LOG_LEVEL=ERROR AGENTCORE_ENABLE_TOOLS=browser,code_interpreter AWS_PROFILE=agentcore \
  /home/jason/.nix-profile/bin/uvx --from awslabs.amazon-bedrock-agentcore-mcp-server@latest python -c \
  "from awslabs.amazon_bedrock_agentcore_mcp_server.config import doc_config; doc_config.llm_texts_url=[]; from awslabs.amazon_bedrock_agentcore_mcp_server.server import main; main()" \
  < <(printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}'; sleep 4)

# Confirm uvx is reachable from inside the sandbox:
flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/uvx --version

# Check the installed version (for matching the workaround to the right release):
grep '__version__' /home/jason/.cache/uv/archive-v0/*/lib/python3.*/site-packages/awslabs/amazon_bedrock_agentcore_mcp_server/__init__.py
```

**Tool-scope note:** `AGENTCORE_ENABLE_TOOLS=browser,code_interpreter`
registers only those two primitives (34 tools total: 25 browser + 9 code
interpreter). The docs tools register unconditionally. Memory, runtime,
identity, gateway, and policy primitives are NOT exposed — this is
intentional to keep billable/destructive AWS resource-creation tools out of
the agent's auto-execution path. Browser + code-interpreter sessions each
spin up an isolated Firecracker microVM and incur AWS charges; their
`start_*_session` tools are in `toolOptions` with `allowAutoExecution: true`
— sessions start automatically but incur AWS bills. To expose more
primitives, add them to `AGENTCORE_ENABLE_TOOLS` (comma-separated) and
re-sync golden → live.

**Auto-execution policy:** most tools are `allowAutoExecution: true` (the
agent can call them without approval). The exceptions set to
`allowAutoExecution: false` (manual approval required) are the
side-effect-heavy navigation/interaction tools where unintended clicks or
form submissions could disrupt a page state:
`browser_navigate_back`, `browser_navigate_forward`, `browser_click`,
`browser_fill_form`, `browser_select_option`, `browser_hover`,
`browser_upload_file`, `browser_handle_dialog`, `browser_close`. All
code-interpreter tools are auto-executed (the sandbox is isolated and
ephemeral). To change a tool's policy, edit its entry in `toolOptions` in
`backups/data.golden.json` and re-sync golden → live.


### `browser-rendering` — CDP WebSocket + API token via chrome-devtools-mcp (verified 2026-08-07)

The `browser-rendering` MCP server drives Cloudflare's managed Browser
Rendering service over the Chrome DevTools Protocol (CDP). It uses the
`chrome-devtools-mcp@latest` npm package run under deno (NOT mcp-remote —
this is a CDP-WebSocket server, not a remote HTTP MCP endpoint). Exposes
~29 browser-automation tools: `navigate_page`, `take_snapshot`,
`take_screenshot`, `click`, `fill`, `evaluate_script`, `list_pages`,
`list_console_messages`, `list_network_requests`,
`performance_start_trace`, `lighthouse_audit`, etc.

**Endpoint + auth.** `--wsEndpoint` points at
`wss://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/browser-rendering/devtools/browser?keep_alive=600000`
and `--wsHeaders` carries `{"Authorization":"Bearer <API_TOKEN>"}`. The
token must have `Browser Rendering - Edit` permission. Golden reuses the
same Cloudflare API token
(`<REDACTED_CLOUDFLARE_TOKEN>8df2`) as the
`cloudflare` server — that token is active and was verified end-to-end
(init handshake + `tools/list` both succeed through the full flatpak
sandbox spawn path). If a future token lacks Browser Rendering perms, the
WS upgrade will 401 and chrome-devtools-mcp will fail to initialize; create
a dedicated token at
https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
with `Browser Rendering - Edit` scope.

**`keep_alive` semantics.** The query param (ms) controls how long the
remote browser session stays alive. Golden default is `600000` (10 min).
The session is created when the MCP server starts and reused for all tool
calls until restart — there is no per-call session spin-up. Long-running
agent sessions may hit the keep_alive boundary and need a server restart.

**Why deno, not npx.** The Cloudflare docs show
`npx -y chrome-devtools-mcp@latest ...`, but under flatpak-spawn that needs
the `/usr/bin/env PATH=...` wrapper (see the `cloudflare` gotcha for why).
Deno runs npm packages natively (`npm:chrome-devtools-mcp@latest`)
without a separate node spawn, so the PATH-wrapper gotcha doesn't apply —
`flatpak-spawn --host /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest ...`
works cleanly. This mirrors the `filesystem` server's deno pattern.

**`--wsHeaders` JSON escaping.** The header value is a JSON object
literal passed as a single arg. In golden it's stored as
`"--wsHeaders={\"Authorization\":\"Bearer <token>\"}"` (the outer JSON
quotes escape the inner ones). When the smart-composer plugin reads golden
and spawns the process, the child receives
`--wsHeaders={"Authorization":"Bearer <token>"}` — chrome-devtools-mcp
parses it with `JSON.parse`.

**`toolOptions` is `{}` — auto-execution is wild-west.** All ~29 tools
run under smart-composer's global default. The destructive/interactive
tools (`click`, `fill`, `fill_form`, `evaluate_script`,
`take_screenshot`, `navigate_page`, `close_page`) can mutate remote
browser state and incur Cloudflare Browser Rendering charges (per-session
billing). Consider populating `toolOptions` with
`allowAutoExecution: false` for the side-effect-heavy tools; the
read-only ones (`list_pages`, `list_console_messages`,
`list_network_requests`, `take_snapshot`, `performance_analyze_insight`)
are safe to auto-execute.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "browser-rendering",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:chrome-devtools-mcp@latest",
      "--wsEndpoint=wss://api.cloudflare.com/client/v4/accounts/7880ee87feea1839fb5a815cc479b080/browser-rendering/devtools/browser?keep_alive=600000",
      "--wsHeaders={\"Authorization\":\"Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2\"}"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Smoke-test init + tools/list via deno (host shell):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 8 ) \
| timeout 40 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest \
  --wsEndpoint='wss://api.cloudflare.com/client/v4/accounts/7880ee87feea1839fb5a815cc479b080/browser-rendering/devtools/browser?keep_alive=600000' \
  --wsHeaders='{"Authorization":"Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2"}' \
  2>/dev/null | grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 12 ) \
| timeout 40 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest \
  --wsEndpoint='wss://api.cloudflare.com/client/v4/accounts/7880ee87feea1839fb5a815cc479b080/browser-rendering/devtools/browser?keep_alive=600000' \
  '--wsHeaders={"Authorization":"Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2"}' \
  2>/dev/null | grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# End-to-end: navigate to example.com and read document.title:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"navigate_page","arguments":{"type":"url","url":"https://example.com"}}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"evaluate_script","arguments":{"function":"() => document.title"}}}'; sleep 30 ) \
| timeout 60 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest \
  --wsEndpoint='wss://api.cloudflare.com/client/v4/accounts/7880ee87feea1839fb5a815cc479b080/browser-rendering/devtools/browser?keep_alive=600000' \
  --wsHeaders='{"Authorization":"Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2"}' \
  2>/dev/null | grep '"id":3'

# Verify the token is active (and reuse the same token as the `cloudflare` server):
curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2" \
  -H "Content-Type: application/json" | python3 -m json.tool | head -5
```

**Security — same token as `cloudflare` server, same exposure.** The
Browser Rendering endpoint reuses the Cloudflare API token already
inlined in the `cloudflare` server's args. No new credential was added to
golden. On `git push codeberg` the token goes public (see
`backups/AGENTS.md` § "Security note"). Rotation procedure is shared with
the `cloudflare` server — update both configs together.

### `cloudflare` — local stdio via npx, PATH wrapper required (verified 2026-08-03)

The `cloudflare` MCP server uses `@cloudflare/mcp-server-cloudflare@0.2.0`
invoked through `npx`, spawned via `flatpak-spawn --host` from inside the
Obsidian sandbox. It exposes ~89 tools covering Workers, KV, R2, D1, Durable
Objects, Queues, AI (Workers AI inference/embeddings/text/image), Workflows,
templates, custom domains (Workers for Platforms dispatch namespaces),
service bindings, env vars, routes, crons, zones, secrets, versions, and
wrangler config.

**Two surprises:**

**1. The deprecated config's `env` field was broken — token never reached the server.** The 2026-08-02 snapshot in `data.deprecated.json` configured this server with `CLOUDFLARE_API_TOKEN` in the smart-composer `env` field. Per rule 7, smart-composer's `env` field is NOT passed to the `flatpak-spawn --host` child process. With that config, `npx` would have spawned the server, but the server reads `CLOUDFLARE_API_TOKEN` from its own process environment — which would have been empty. The server would initialize (it doesn't validate the token at startup), but every actual API call would 401. **The current golden inlines the token via the `/usr/bin/env PATH=...` wrapper instead** (see #2), keeping the token out of the `env` field entirely.

   Wait — actually the package's CLI entry (`mcp-server-cloudflare`) accepts the API token via the `CLOUDFLARE_API_TOKEN` env var only; it has no `--api-token` flag. So the token MUST reach the spawned process's env. The `/usr/bin/env VAR=value <binary>` pattern (per the bedrock-agentcore gotcha) is the correct way to set env vars for a flatpak-spawn host process: `flatpak-spawn --host /usr/bin/env CLOUDFLARE_API_TOKEN=<token> PATH=... npx ...`. When real credentials are added to golden, replace `YOUR_CLOUDFLARE_API_TOKEN` in the args with the actual token (still inline, still in args — never in the smart-composer `env` field).

**2. npx-via-flatpak-spawn needs a `PATH` wrapper, not just an absolute binary path.** Unlike deno/docker/uvx (which work with bare `flatpak-spawn --host /home/jason/.nix-profile/bin/<binary>`), `npx` is special because the package it spawns (`@cloudflare/mcp-server-cloudflare`) is itself a Node.js script with a `#!/usr/bin/env node` shebang. When `npx` runs that script, the kernel calls `/usr/bin/env node` to find `node` on `$PATH`. The flatpak-spawn host env has `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin` (no nix), so `env` cannot find `node` and the spawn fails with `/usr/bin/env: 'node': No such file or directory`.

   The fix is the `/usr/bin/env` wrapper with `PATH` augmented to include nix-profile bin, identical in shape to the bedrock-agentcore `/usr/bin/env` pattern but with `PATH` instead of (or alongside) custom env vars:

   ```json
   "args": [
     "--host",
     "/usr/bin/env",
     "PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin",
     "/home/jason/.nix-profile/bin/npx",
     "-y",
     "@cloudflare/mcp-server-cloudflare@0.2.0",
     "run",
     "YOUR_CLOUDFLARE_ACCOUNT_ID"
   ]
   ```

   `/usr/bin/env` is at `/usr/bin/env` on this host (stable absolute path, not nix-managed — same as the bedrock-agentcore gotcha). Verified working from inside the Obsidian flatpak sandbox via `flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /usr/bin/env PATH=... npx ...` — the server responds to `initialize` with `protocolVersion 2024-11-05`, `serverInfo: {"name":"cloudflare","version":"1.0.0"}`.

   **This `PATH` wrapper pattern is generally required for any npx-based MCP server** spawned through `flatpak-spawn --host` — not just cloudflare. The npx CLI itself works without the wrapper (nix's npx is a symlink with a hardcoded `#!/nix/store/<hash>/bin/node` shebang, so it doesn't depend on `$PATH`), but the *package* npx spawns will almost always be a JS file with a `#!/usr/bin/env node` shebang. Whenever you add a new npx-based MCP server to golden, default to the `/usr/bin/env PATH=...` wrapper form. Bare `flatpak-spawn --host /home/jason/.nix-profile/bin/npx ...` works only if the spawned package's entry happens to be a binary (rare) or if npx itself handles the `node` lookup internally (uncommon).

**3. Protocol version is `2024-11-05`, not `2025-06-18`.** The cloudflare server still speaks the older MCP protocol version. mcp-remote/clients handle this transparently, but if you ever debug a protocol-version mismatch error, this is why. Not actionable — just don't be surprised.

**4. Real credentials are now inlined and `enabled: true` (verified 2026-08-03).** Golden currently has the real Cloudflare account ID in `args` and the real `CLOUDFLARE_API_TOKEN` inlined via the `/usr/bin/env` wrapper. The server was verified end-to-end: `worker_list` returned the `website` worker both via the host shell (`npx` directly) and via the full flatpak-spawn path from inside the Obsidian sandbox (same path smart-composer uses). Token verified active against `https://api.cloudflare.com/client/v4/user/tokens/verify`, account ID matches "Jason Riddle", and the token has account-scoped Workers read perms.

   The placeholder form (for reference, if you ever need to start fresh):
   ```bash
   # Replace placeholder account ID in golden:
   sed -i 's/YOUR_CLOUDFLARE_ACCOUNT_ID/<real-account-id>/' ~/Brain/backups/data.golden.json

   # Add the API token via the /usr/bin/env wrapper. Edit the args array to
   # insert "CLOUDFLARE_API_TOKEN=<real-token>" between "PATH=..." and the npx path:
   #   "args": [
   #     "--host",
   #     "/usr/bin/env",
   #     "PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin",
   #     "CLOUDFLARE_API_TOKEN=<real-token>",   ← add this line
   #     "/home/jason/.nix-profile/bin/npx",
   #     ...
   #   ]

   # Validate + sync (with Obsidian fully quit first):
   python3 -c "import json; json.load(open('~/Brain/backups/data.golden.json'))"
   pgrep -af /app/obsidian  # should return nothing
   cp ~/Brain/backups/data.golden.json ~/Brain/.obsidian/plugins/smart-composer/data.json
   # Relaunch Obsidian.
   ```

   **Security — the token is committed to git and the vault has a public `codeberg` remote.** This is the same posture as the pre-existing OpenRouter and opencode-go keys in `data.golden.json` (see `backups/AGENTS.md` § "Security note"). On `git push codeberg`, the Cloudflare token goes public. If you haven't pushed to codeberg since adding the token, the token is still private (NAS-only) until that push — but treat it as compromised-on-push. To rotate: generate a new token at https://dash.cloudflare.com/profile/api-tokens, update `args` in golden, revoke the old token. The Cloudflare account ID is not secret (it appears in the dashboard URL and is safe to commit).

   **opencode (`~/dotfiles/dotconfig/.config/opencode/opencode.jsonc`) has the same creds inlined.** The dotfiles repo has only NAS remotes (no public `codeberg` remote), so pushing dotfiles is safe. The `environment` field in opencode IS passed to the child (no flatpak-spawn), so the token lives in `environment` there, not in `args` — this is the one structural difference between the two configs.

**5. `toolOptions` is `{}` — all 89 tools auto-execute under smart-composer's global default.** This is currently the wild-west posture: 89 tools, many of which are write/destructive (`worker_delete`, `r2_delete_bucket`, `d1_delete_database`, `do_delete_namespace`, `do_delete_object`, `queue_delete`, `worker_deploy`, `secret_put`, `secret_delete`, `version_rollback`, `workflow_create`/`delete`/`update`/`execute`, `cron_create`/`delete`/`update`, `route_create`/`delete`/`update`, `env_var_set`/`delete`/`bulk_set`, `r2_put_object`, `kv_put`, `kv_delete`, `d1_query` — note `d1_query` can execute DDL/DML, not just SELECT). **TODO: populate `toolOptions` with conservative defaults** — read-only tools (`*_list`, `*_get`, `*_list_*`, `analytics_get`, `workers_analytics_search`, `ai_list_models`, `ai_get_model`, `domain_list`, `template_list`, `template_get`) → `allowAutoExecution: true`; everything else → `allowAutoExecution: false`; the most destructive (`*_delete`, `*_deploy`, `version_rollback`, `d1_query`, `secret_put`/`delete`) → consider `disabled: true` to keep them out of the auto-execution surface entirely. This mirrors the aws-mcp pattern. Until `toolOptions` is populated, the agent can call any of the 89 tools without approval — review the smart-composer settings panel after enabling and gate the dangerous ones.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "cloudflare",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/usr/bin/env",
      "PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin",
      "CLOUDFLARE_API_TOKEN=<REDACTED_CLOUDFLARE_TOKEN>8df2",
      "/home/jason/.nix-profile/bin/npx",
      "-y",
      "@cloudflare/mcp-server-cloudflare@0.2.0",
      "run",
      "7880ee87feea1839fb5a815cc479b080"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Smoke-test the server via npx with PATH wrapper (host shell):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 60 /usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin CLOUDFLARE_API_TOKEN=<REDACTED_CLOUDFLARE_TOKEN>8df2 /home/jason/.nix-profile/bin/npx -y @cloudflare/mcp-server-cloudflare@0.2.0 run 7880ee87feea1839fb5a815cc479b080 2>&1 | tail -5

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 90 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin CLOUDFLARE_API_TOKEN=<REDACTED_CLOUDFLARE_TOKEN>8df2 /home/jason/.nix-profile/bin/npx -y @cloudflare/mcp-server-cloudflare@0.2.0 run 7880ee87feea1839fb5a815cc479b080 2>&1 | tail -5

# Confirm the spawn fails WITHOUT the PATH wrapper (demonstrates why it's required):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 90 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/npx -y @cloudflare/mcp-server-cloudflare@0.2.0 run 7880ee87feea1839fb5a815cc479b080 2>&1 | tail -3
# Expected: /usr/bin/env: 'node': No such file or directory

# List all 89 tools the server exposes:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 6 ) | timeout 30 /usr/bin/env PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin CLOUDFLARE_API_TOKEN=<REDACTED_CLOUDFLARE_TOKEN>8df2 /home/jason/.nix-profile/bin/npx -y @cloudflare/mcp-server-cloudflare@0.2.0 run 7880ee87feea1839fb5a815cc479b080 2>/dev/null | python3 -c "import sys,json
for line in sys.stdin:
    try: d=json.loads(line)
    except: continue
    if d.get('id')==2: print('\n'.join(t['name'] for t in d['result']['tools']))"

# End-to-end test: actually call worker_list (returns the 'website' worker):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"worker_list","arguments":{}}}' ; sleep 8 ) \
| timeout 60 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /usr/bin/env \
  PATH=/home/jason/.nix-profile/bin:/usr/bin:/bin \
  CLOUDFLARE_API_TOKEN=<REDACTED_CLOUDFLARE_TOKEN>8df2 \
  /home/jason/.nix-profile/bin/npx -y @cloudflare/mcp-server-cloudflare@0.2.0 \
  run 7880ee87feea1839fb5a815cc479b080 2>&1 | grep -E '"id":2|"website"|isError' | head -5

# Verify the token is active against the Cloudflare REST API:
curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer <REDACTED_CLOUDFLARE_TOKEN>8df2" \
   -H "Content-Type: application/json" | python3 -m json.tool | head -10
```


### `cloudflare-codemode` — OAuth 2.1 (workaround) (verified 2026-08-03)

The `cloudflare-codemode` MCP server is the remote OAuth endpoint at
`https://mcp.cloudflare.com/mcp`, accessed via `fastmcp-remote` (Python stdio
bridge) through `uvx` (same spawn pattern as `bedrock-agentcore`). It is the
server-side Cloudflare MCP endpoint — **different from** both the public
`cloudflare-docs` endpoint (no OAuth) and the local stdio `cloudflare`
server (API token auth). It exposes 3 tools:

- `docs` — Cloudflare docs search (same as `cloudflare-docs` but via the
  OAuth endpoint)
- `search` — Cloudflare OpenAPI spec search (156 products, all `$refs`
  pre-resolved)
- `execute` — runs JS code against the Cloudflare API via a `cloudflare.request()`
  function; **pre-loads your account ID** (`7880ee87feea1839fb5a815cc479b080`
  for Jason Riddle) so you don't have to pass it per-call

**The mcp-remote scope bug.** Cloudflare's `/.well-known/oauth-authorization-server`
metadata has **no `scopes_supported` field** (verified 2026-08-03 — see
verification commands). When a server advertises OAuth without
`scopes_supported`, mcp-remote@0.1.38's `getEffectiveScope()` falls back
to hardcoded `"openid email profile"` scopes
(`chunk-65X3S4HB.js:21031`). Cloudflare rejects these scopes with:

```
Invalid Scope
Unknown OAuth scope: openid, email, profile
Error code: invalid_scope
```

The OAuth redirect URL contains `scope=openid+email+profile` and the flow
dies. This is the same bug that made the original `cloudflare` remote
config (in `data.deprecated.json`) unworkable — the local stdio server
was the workaround for that. For `cloudflare-codemode`, the workaround is
different.

**Workaround — mcp-remote source patch + `--static-oauth-client-metadata`.**
Two parts, both required:

1. **Patch mcp-remote's `getEffectiveScope()`.** The upstream code at
   `chunk-65X3S4HB.js:21002` checks
   `this.staticOAuthClientMetadata?.scope && this.staticOAuthClientMetadata.scope.trim().length > 0`
   before using a static scope. The `.trim().length > 0` check rejects a
   whitespace-only scope (`" "`), which is exactly what we need to send
   (Cloudflare accepts `scope=+` — an empty scope — but rejects
   `scope=openid+email+profile`). The patch changes `.trim().length > 0`
   to `.length > 0` so `" "` passes the check:

   ```bash
   # Apply the patch:
   sed -i 's/this.staticOAuthClientMetadata?.scope && this.staticOAuthClientMetadata.scope.trim().length > 0/this.staticOAuthClientMetadata?.scope \&\& this.staticOAuthClientMetadata.scope.length > 0/' \
     ~/.cache/deno/npm/registry.npmjs.org/mcp-remote/0.1.38/dist/chunk-65X3S4HB.js

   # Verify:
   grep -n 'staticOAuthClientMetadata?.scope' ~/.cache/deno/npm/registry.npmjs.org/mcp-remote/0.1.38/dist/chunk-65X3S4HB.js | head -1
   # Expected: line 21002 with `.scope.length > 0` (no `.trim()`)
   ```

   **⚠️ WARNING: this patch is lost on every `deno cache` reload of
   mcp-remote.** Any deno upgrade, cache clear, or mcp-remote re-download
   will restore the unpatched file. Re-apply the sed after any of those.
   There is no durable fix until upstream mcp-remote either (a) accepts
   whitespace-only scopes, (b) adds a `--scope` flag separate from
   `--static-oauth-client-metadata`, or (c) Cloudflare adds
   `scopes_supported` to its OAuth metadata. Track upstream at
   https://github.com/geelen/mcp-remote.

2. **Pass `--static-oauth-client-metadata '{"scope":" "}'`.** This sets
   `staticOAuthClientMetadata.scope` to `" "` (a single space), which the
   patched `getEffectiveScope()` now accepts. mcp-remote sends
   `scope=+` (URL-encoded empty scope) in the authorize URL. Cloudflare
   accepts this and the OAuth flow completes normally. After the first
   browser-based authorization, the token is cached in `~/.mcp-auth/`
   like other mcp-remote servers — no re-auth needed for subsequent
   launches (until the token expires).

   The JSON string `{"scope":" "}` must be passed as a single arg. In
   the Obsidian golden JSON config, escape the inner quotes:
   `"{\"scope\":\" \"}"`.

**Why disabled by default.** Even with the workaround working, this
server is `enabled: false` in golden because (a) the mcp-remote patch is
fragile (lost on cache clear), (b) the local stdio `cloudflare` server is
a more capable alternative (89 tools vs 3, no OAuth required, no fragile
patch), and (c) the `execute` tool's JS-against-API surface is powerful
but dangerous in an auto-execution context. Enable `cloudflare-codemode`
only when you specifically want the `execute` tool's JS sandbox surface
(or when the local stdio server is unavailable for some reason).

**Note on `cloudflare-docs` vs `cloudflare-codemode`'s `docs` tool.**
Both expose a Cloudflare docs search tool, but via different endpoints:
`cloudflare-docs` hits the public `https://docs.mcp.cloudflare.com/mcp`
(no auth), `cloudflare-codemode` hits `https://mcp.cloudflare.com/mcp`
(OAuth). They return similar results. Prefer `cloudflare-docs` for
docs-only queries (no auth overhead); enable `cloudflare-codemode` for
the `search` + `execute` API tools.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "cloudflare-codemode",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/uvx",
      "--from",
      "fastmcp-remote",
      "python",
      "/home/jason/dotfiles/dotconfig/.config/fastmcp-remote-cloudflare.py",
      "https://mcp.cloudflare.com/mcp"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

The monkeypatch script lives at `~/dotfiles/dotconfig/.config/fastmcp-remote-cloudflare.py` (see the "fastmcp-remote monkeypatch — full procedure" block above for its contents). The same script is used by both the Obsidian golden config (via `flatpak-spawn --host /home/jason/.nix-profile/bin/uvx ... python <script>`) and the opencode config (direct `uvx ... python <script>`, no flatpak-spawn needed since opencode runs on the host).

**Verification commands:**
```bash
# Confirm Cloudflare's OAuth metadata has NO scopes_supported (root cause):
curl -s https://mcp.cloudflare.com/.well-known/oauth-authorization-server | python3 -m json.tool | grep -i scope
# Expected: no output (scopes_supported field absent)

# Confirm the unpatched mcp-remote sends the bad scope (scope=openid+email+profile):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 15 deno --allow-all npm:mcp-remote@0.1.38 https://mcp.cloudflare.com/mcp --transport http-only 2>&1 | grep -oE 'scope=[^&]+'
# Expected (broken): scope=openid+email+profile

# Confirm fastmcp-remote (without monkeypatch) fails at token exchange with "multiple auth methods":
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 /home/jason/.nix-profile/bin/uvx fastmcp-remote https://mcp.cloudflare.com/mcp 2>&1 | grep -iE 'multiple authentication methods|Token exchange'
# Expected (broken): Token exchange failed (400): {"error":"invalid_request","error_description":"Client must not use multiple authentication methods"}

# Smoke-test fastmcp-remote WITH monkeypatch (host shell, returns 3 tools):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 20 ) | timeout 90 /home/jason/.nix-profile/bin/uvx --from 'fastmcp-remote' python /home/jason/dotfiles/dotconfig/.config/fastmcp-remote-cloudflare.py https://mcp.cloudflare.com/mcp 2>&1 | grep '"id":2' | python3 -c "import sys,json
for line in sys.stdin:
    try: d=json.loads(line)
    except: continue
    if d.get('id')==2: print('\n'.join(t['name'] for t in d['result']['tools']))"
# Expected: docs\nsearch\nexecute

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 20 ) | timeout 90 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/uvx --from 'fastmcp-remote' python /home/jason/dotfiles/dotconfig/.config/fastmcp-remote-cloudflare.py https://mcp.cloudflare.com/mcp 2>&1 | grep '"id":2' | python3 -c "import sys,json
for line in sys.stdin:
    try: d=json.loads(line)
    except: continue
    if d.get('id')==2: print('\n'.join(t['name'] for t in d['result']['tools']))"
# Expected: docs\nsearch\nexecute
```


**Alternatives tested (2026-08-03) — one works without modifying cached files:**

The mcp-remote patch above is fragile (lost on cache clear), so three alternative
stdio-to-remote MCP proxy tools were tested as drop-in replacements for
`cloudflare-codemode`. One (fastmcp-remote with a uvx monkeypatch) works and is
**more durable** than the mcp-remote patch; the other two each have their own
blocking bugs. Details:

| Tool | Lang/Transport | Result | Bug / Notes |
|---|---|---|---|
| **mcp-remote** (geelen) — current | Node/npx via deno | ✅ works with patch + `--static-oauth-client-metadata` | Hardcoded `"openid email profile"` scope fallback when `scopes_supported` omitted. Patch: `.trim().length > 0` → `.length > 0` at `chunk-65X3S4HB.js:21002`. **Patch is lost on every deno cache reload.** |
| **fastmcp-remote** (PrefectHQ) — **recommended alternative** | Python/uvx | ✅ works with a uvx monkeypatch (no cached-file modification) | Avoids the scope bug (sends `scope=+` correctly via `get_client_metadata_scopes()` from `modelcontextprotocol/python-sdk`). BUT DCR registers with `token_endpoint_auth_method: "client_secret_basic"`, and the token exchange code at `mcp/client/auth/oauth2.py:394` always puts `client_id` in the body AND adds an `Authorization: Basic` header → Cloudflare rejects with `"Client must not use multiple authentication methods"`. **Workaround:** use `uvx --from fastmcp-remote python -c "..."` to monkeypatch `resolve_auth()` to pass `additional_client_metadata={'token_endpoint_auth_method': 'none'}` — same pattern as the `bedrock-agentcore` gotcha. The patch is in the command string, not a cached file, so it survives cache clears. Token cache: `~/.fastmcp/remote/`. See full procedure below. |
| **chengleiyuan/mcp-oauth2-proxy** | TypeScript/npx | ❌ upstream rejects token | No Dynamic Client Registration — requires pre-registered `OAUTH2_CLIENT_ID` (can manually POST to `https://mcp.cloudflare.com/register` first to get one). With manual client + `OAUTH2_SCOPE=' '` + `OAUTH2_EXTRA_PARAMS='{"resource":"https://mcp.cloudflare.com/mcp"}'`, the OAuth flow completes and a token is acquired, but the upstream MCP call returns `401 invalid_token: Missing or invalid access token`. The token has no permissions — likely because chengleiyuan doesn't send the `resource` param in the token exchange (only in the authorize URL), so Cloudflare issues a token with no audience. Token cache: `~/.config/mcp-oauth2-proxy/` (AES-256-GCM encrypted). |
| **sparfenyuk/mcp-proxy** | Python/uvx | ❌ unsuitable | Only supports `client_credentials` grant (`--client-id`, `--client-secret`, `--token-url`) — no browser OAuth flow, no DCR. Cloudflare's MCP requires the browser authorization_code flow, so this tool cannot connect at all. |

**Conclusion:** As of 2026-08-03, there are **two working solutions** for `cloudflare-codemode`:
1. **mcp-remote (patched) + `--static-oauth-client-metadata`** — fragile (patch lost on deno cache clear)
2. **fastmcp-remote (monkeypatched via uvx)** — **more durable** (no cached-file modification; patch is in the command string). This is the same `uvx --from <pkg> python -c "..."` pattern already used for `bedrock-agentcore` in golden. See full procedure below.

Re-test the alternatives if:
- upstream mcp-remote PR [#254](https://github.com/geelen/mcp-remote/pull/254) merges (would fix the scope bug without a patch) — track at https://github.com/geelen/mcp-remote/pull/254
- fastmcp-remote adds a `--client-id` or `--additional-client-metadata` CLI flag (would allow static client with `token_endpoint_auth_method: "none"`, avoiding the monkeypatch) — track at https://github.com/PrefectHQ/fastmcp
- chengleiyuan adds `resource` param support to the token exchange (not just the authorize URL) — track at https://github.com/ChengleiYuan/mcp-oauth2-proxy

**fastmcp-remote monkeypatch — full procedure (verified 2026-08-03):**

The `fastmcp-remote` CLI (`fastmcp_remote/cli.py:resolve_auth()`) constructs `OAuth()` with only 4 params (token_storage, callback_port, callback_host, callback_timeout) — it doesn't expose `additional_client_metadata`, `client_id`, or `client_secret` as CLI flags. The underlying `OAuth()` class supports all of these. The monkeypatch overrides `resolve_auth()` to pass `additional_client_metadata={'token_endpoint_auth_method': 'none'}`, which forces DCR to register with `token_endpoint_auth_method: "none"` — avoiding the "multiple authentication methods" bug at token exchange time.

```bash
# The monkeypatch script (save as e.g. /home/jason/Brain/.config/fastmcp-remote-cloudflare.py):
cat > /tmp/fmcp-cf.py <<'PYEOF'
import fastmcp_remote.cli as cli
orig_resolve = cli.resolve_auth
def patched_resolve(config):
    from fastmcp.client.auth import OAuth
    authorization_header = any(name.lower() == 'authorization' for name in config.headers)
    auth_mode = config.auth
    if auth_mode is None and authorization_header:
        auth_mode = 'none'
    elif auth_mode is None:
        auth_mode = 'oauth'
    if auth_mode == 'none':
        return None
    return OAuth(
        token_storage=cli.build_token_storage(config.storage_dir),
        callback_port=config.callback_port,
        callback_host=config.callback_host,
        callback_timeout=config.callback_timeout,
        additional_client_metadata={'token_endpoint_auth_method': 'none'},
    )
cli.resolve_auth = patched_resolve
import sys
cli.main(sys.argv[1:])
PYEOF

# Smoke-test (host shell):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 60 /home/jason/.nix-profile/bin/uvx --from 'fastmcp-remote' python /tmp/fmcp-cf.py https://mcp.cloudflare.com/mcp 2>&1 | tail -5

# Full handshake + tools/list (returns docs, search, execute):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 20 ) | timeout 90 /home/jason/.nix-profile/bin/uvx --from 'fastmcp-remote' python /tmp/fmcp-cf.py https://mcp.cloudflare.com/mcp 2>&1 | grep '"id":2' | python3 -c "import sys,json
for line in sys.stdin:
    try: d=json.loads(line)
    except: continue
    if d.get('id')==2: print('\n'.join(t['name'] for t in d['result']['tools']))"
# Expected: docs\nsearch\nexecute

# Smoke-test through the Obsidian flatpak sandbox:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 20 ) | timeout 90 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/uvx --from 'fastmcp-remote' python /tmp/fmcp-cf.py https://mcp.cloudflare.com/mcp 2>&1 | grep -E '"id":(1|2)|protocolVersion|serverInfo'
```

For the Obsidian golden config, the monkeypatch script must be stored at a path accessible from inside the flatpak sandbox (e.g. `/home/jason/Brain/.config/fastmcp-remote-cloudflare.py` or `~/Brain/backups/`). The `flatpak-spawn --host` process has full `$HOME` access, so any path under `/home/jason/` works. The `uvx` binary is at `/home/jason/.nix-profile/bin/uvx` (stable nix-profile symlink, not the volatile `/nix/store/<hash>/bin/uvx` — same rule 2/3 as deno/docker/npx). Token cache lives at `~/.fastmcp/remote/` (separate from mcp-remote's `~/.mcp-auth/` cache — the two tools can coexist without token conflicts).

**Upstream tracking for the mcp-remote scope bug:**
- Issue [#216](https://github.com/geelen/mcp-remote/issues/216) (closed, Jan 24 2026, 0 comments) — "Empty scopes_supported array not respected - falls back to invalid default scopes". Closed with no linked PR; unclear why.
- PR [#254](https://github.com/geelen/mcp-remote/pull/254) (open, May 11 2026, Shivox) — handles both empty-array AND omitted-field cases. **Would fix Cloudflare.** Not merged as of 0.1.38 (Feb 2026, 6 months stale).
- PR [#240](https://github.com/geelen/mcp-remote/pull/240) (open, Jun 15 2026, woveren-gl) — handles empty-array only, explicitly preserves OIDC fallback for omitted field. **Would NOT fix Cloudflare.**
- Issue [#204](https://github.com/geelen/mcp-remote/issues/204) (closed, Dec 17 2025) — server had `scopes_supported: ["read","write"]` but mcp-remote ignored it. Workaround: `--static-oauth-client-metadata '{"scope":"read write"}'` (the non-empty scope case where the flag works without a patch).

**The scope bug is ecosystem-wide** — the same `"openid email profile"` fallback in mcp-remote@0.1.27+ breaks against Cloudflare, GitLab (GitLab issue #566965), Datadog (PRs #240, #254), Coralogix (issue #216), and Plane (issue #204).

**Does `@cloudflare/mcp-server-cloudflare` support an `MCP_ENDPOINT` env var to proxy to a custom MCP endpoint? No.** (Tested 2026-08-03.) The package only reads three env vars: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `NODE_ENV` (verified by grepping `process.env.*` in `dist/index.js`). `MCP_ENDPOINT` is silently ignored. The package is a local stdio server that calls `https://api.cloudflare.com/client/v4` (the Cloudflare REST API) directly — it is not a proxy to any MCP endpoint, and cannot be repointed at `https://mcp.cloudflare.com/mcp` or `https://mcp.jasonriddle.com/mcp` via env vars. A config like `{"command": "npx", "args": ["-y", "@cloudflare/mcp-server-cloudflare"], "env": {"CLOUDFLARE_API_TOKEN": "...", "MCP_ENDPOINT": "https://mcp.jasonriddle.com/mcp"}}` will silently ignore `MCP_ENDPOINT` and just run the same local stdio server as the `cloudflare` server (talking to `api.cloudflare.com` directly). The `initialize` handshake succeeds, but that's the local stdio server responding — it never contacts the custom MCP endpoint. **This approach is a dead end for proxying to a remote OAuth-protected MCP endpoint.**

**`mcp.jasonriddle.com/mcp` (the user's own Cloudflare Worker MCP endpoint) has the same scope bug + a session bug.** (Tested 2026-08-03.) Its OAuth metadata at `https://mcp.jasonriddle.com/.well-known/oauth-authorization-server` has the same shape as `mcp.cloudflare.com` — no `scopes_supported` field — so mcp-remote (unpatched) sends `scope=openid+email+profile` and is rejected. The patched mcp-remote + `--static-oauth-client-metadata '{"scope":" "}'` workaround works for `initialize` (returns `serverInfo: cloudflare-mcp-portal v1.0.0`), but `tools/list` then fails with `Error: Streamable HTTP error: ... "Bad Request: Session expired or does not exist. Please reconnect."` (HTTP 404). This is a session management bug in the user's own Worker, not in mcp-remote — the `initialize` succeeds but the session isn't maintained for subsequent requests. This endpoint cannot be used as a `cloudflare-codemode` replacement until the session bug is fixed on the Worker side.


### `cloudflare-docs` — public, no OAuth needed (verified 2026-08-03)

The `cloudflare-docs` MCP server is the public Cloudflare docs search endpoint
at `https://docs.mcp.cloudflare.com/mcp`, accessed via `mcp-remote@0.1.38`
through deno (same spawn pattern as `aws-mcp`/`fastmail`/`kernel`).

**The previous note about a scope bug here was wrong.** The 2026-08-02 note
in this file said "Same mcp-remote scope bug as cloudflare; may need local
alternative." That was incorrect — the docs endpoint is a *public* MCP
server that requires **no authentication at all**, so the mcp-remote OAuth
scope fallback (which only fires when a server demands OAuth) never
activates. Verified 2026-08-03:

- `GET https://docs.mcp.cloudflare.com/.well-known/oauth-authorization-server` → `404 Not Found` (no OAuth metadata advertised)
- `GET https://docs.mcp.cloudflare.com/.well-known/oauth-protected-resource` → `404 Not Found`
- mcp-remote `initialize` → succeeds with `protocolVersion 2025-06-18`, `serverInfo: {"name":"docs-ai-search","version":"0.4.10"}`
- mcp-remote `tools/list` → succeeds, returns 2 tools (`search_cloudflare_documentation`, `migrate_pages_to_workers_guide`), both with `readOnlyHint: true`

No `--header` needed, no OAuth flow, no token cache. The server just talks.

**Why cloudflare-docs works but cloudflare (remote) doesn't.** The
*remote* `cloudflare` MCP endpoint (different from this docs endpoint)
requires OAuth and advertises scopes_supported in a way that triggers the
mcp-remote hardcoded `"openid email profile"` fallback scope, which
Cloudflare rejects with `invalid_scope`. That's why `cloudflare` uses the
local stdio server (`@cloudflare/mcp-server-cloudflare`) with an API
token instead — see the `cloudflare` gotcha above. The docs endpoint has
no such problem because it has no OAuth at all. The remote OAuth endpoint
is available separately as `cloudflare-codemode` (with a patch-based
workaround for the scope bug) — see the `cloudflare-codemode` gotcha.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "cloudflare-docs",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://docs.mcp.cloudflare.com/mcp",
      "--auth-timeout",
      "120",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Confirm no OAuth metadata is advertised (both should 404):
curl -sI https://docs.mcp.cloudflare.com/.well-known/oauth-authorization-server | head -1
curl -sI https://docs.mcp.cloudflare.com/.well-known/oauth-protected-resource | head -1

# Smoke-test mcp-remote against the docs endpoint (host shell):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://docs.mcp.cloudflare.com/mcp --transport http-only 2>&1 | grep -E 'Connected|Proxy|protocolVersion|serverInfo'

# Smoke-test through the Obsidian flatpak sandbox:
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 60 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://docs.mcp.cloudflare.com/mcp --transport http-only 2>&1 | grep -E 'Connected|Proxy'

# List the 2 tools the server exposes:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' ; sleep 10 ) | timeout 30 /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://docs.mcp.cloudflare.com/mcp --transport http-only 2>&1 | grep '"id":2' | python3 -c "import sys,json
for line in sys.stdin:
    try: d=json.loads(line)
    except: continue
    if d.get('id')==2: print('\n'.join(t['name'] for t in d['result']['tools']))"
```

**Tool-scope note:** the 2 tools (`search_cloudflare_documentation`,
`migrate_pages_to_workers_guide`) are both read-only with
`readOnlyHint: true`. Safe to set `allowAutoExecution: true` for both when
you enable the server. `toolOptions` is `{}` initially; populate it when
flipping `enabled` to `true`.

**No `--auth-timeout` actually needed.** Since no OAuth flow runs, the
`--auth-timeout 120` flag is harmless but unnecessary. Kept in the config
for consistency with the other mcp-remote servers; remove if you want to
clean up.


### `containers` — OAuth 2.1 via mcp-remote, scope accepted (verified 2026-08-07)

The `containers` MCP server is the remote Cloudflare Containers MCP
endpoint at `https://containers.mcp.cloudflare.com/mcp`, accessed via
`mcp-remote@0.1.38` + deno (same spawn pattern as `fastmail`/`kernel`/
`parallel-search`). OAuth 2.1 with browser flow on first use; token cached
in `~/.mcp-auth/`. Exposes 7 tools: `container_initialize`,
`container_ping`, `container_exec`, `container_file_delete`,
`container_file_write`, `container_files_list`, `container_file_read`.

**No scope workaround needed (unlike `cloudflare-codemode`).** The
containers endpoint's OAuth metadata at
`https://containers.mcp.cloudflare.com/.well-known/oauth-authorization-server`
has **no `scopes_supported` field** — same shape as `mcp.cloudflare.com`.
mcp-remote@0.1.38 therefore falls back to its hardcoded
`"openid email profile"` scope (verified — the authorize URL contains
`scope=openid+email+profile`). **But unlike `mcp.cloudflare.com`,
containers ACCEPTS those scopes** — the OAuth flow completes, the token
exchange succeeds, and `tools/list` returns 7 tools. No mcp-remote patch,
no fastmcp-remote monkeypatch, no `--static-oauth-client-metadata` needed.
Standard deno + mcp-remote works out of the box.

This makes `containers` the simplest of the Cloudflare remote MCP endpoints
to configure. (Why `mcp.cloudflare.com` rejects `openid email profile`
while `containers.mcp.cloudflare.com` accepts them isn't documented — both
are Cloudflare-hosted OAuth. Track upstream mcp-remote PR
[#254](https://github.com/geelen/mcp-remote/pull/254) for a durable fix to
the scope-fallback behavior generally.)

**First-use auth.** On the first `tools/list` (or any call) after the
token cache is empty, mcp-remote opens a browser to
`https://containers.mcp.cloudflare.com/oauth/authorize?...` and waits up
to `--auth-timeout` seconds (180 in golden) for the callback. After the
user authorizes, the token is cached in
`~/.mcp-auth/mcp-remote-0.1.38/` and subsequent launches skip the browser
flow. The flatpak-spawn host process has full `$HOME`, so the token cache
persists across Obsidian restarts and is shared with the host-shell
mcp-remote runs.

**Tool-scope + billing.** `container_initialize` spins up an isolated
container (Cloudflare Containers — billable). `container_exec` runs a
command inside it; `container_file_*` read/write/delete files. All 7
tools currently auto-execute under smart-composer's global default
(`toolOptions` is `{}`). Consider gating `container_file_delete` and
`container_exec` behind `allowAutoExecution: false` — the former destroys
files, the latter can run arbitrary commands in the container.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "containers",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:mcp-remote@0.1.38",
      "https://containers.mcp.cloudflare.com/mcp",
      "--auth-timeout",
      "180",
      "--transport",
      "http-only"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Confirm containers' OAuth metadata has no scopes_supported (same shape as mcp.cloudflare.com):
curl -s https://containers.mcp.cloudflare.com/.well-known/oauth-authorization-server | python3 -c "import sys,json; d=json.load(sys.stdin); print('scopes_supported:', d.get('scopes_supported','<ABSENT — mcp-remote will fall back to openid email profile>'))"

# Smoke-test init + tools/list via deno (host shell). First run opens a browser for OAuth; subsequent runs use the cached token:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 30 ) \
| timeout 90 /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://containers.mcp.cloudflare.com/mcp --transport http-only --auth-timeout 30 2>/dev/null \
| grep '"id":2' | python3 -c "import sys,json
for l in sys.stdin:
    try:d=json.loads(l)
    except:continue
    print('TOOLS:',len(d.get('result',{}).get('tools',[])))
    for t in d.get('result',{}).get('tools',[]): print(' -',t['name'])"

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses — token cache is shared via ~/.mcp-auth):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 15 ) \
| timeout 70 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://containers.mcp.cloudflare.com/mcp --transport http-only --auth-timeout 30 2>/dev/null \
| grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# End-to-end: initialize a container then ping it:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"container_initialize","arguments":{}}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"container_ping","arguments":{}}}'; sleep 35 ) \
| timeout 70 /home/jason/.nix-profile/bin/deno --allow-all npm:mcp-remote@0.1.38 https://containers.mcp.cloudflare.com/mcp --transport http-only --auth-timeout 30 2>/dev/null | grep '"id":[23]'
```

### `filesystem` — local stdio, no auth (verified 2026-08-03)

The `filesystem` MCP server uses
`@modelcontextprotocol/server-filesystem@2026.7.10` via deno, spawned through
`flatpak-spawn --host` with `--allow-read --allow-write --allow-env`. It
exposes two host directories to the smart-composer agent:
`/home/jason/Brain` (the vault itself) and `/home/jason/Downloads`. No
authentication is required — this is a local stdio server, not a remote
HTTP/OAuth server.

**Write access is a tradeoff.** The server is configured with
`--allow-write`, so the agent can create, modify, and delete files inside
both exposed directories — including the vault's markdown notes and
anything in `~/Downloads`. This is powerful (the agent can edit notes
directly) but also a footgun: an agent with auto-execution enabled on
filesystem tools could silently rewrite notes. Mitigations:

1. The server is `enabled: false` in golden by default — flip to `true` in
   golden (then `cp` golden → live + restart Obsidian) only when you
   actively want filesystem access.
2. `toolOptions` is `{}` — once the server is enabled, the per-tool
   auto-execution policy is whatever smart-composer's global default is.
   If you want explicit control, populate `toolOptions` for
   `write_file`, `edit_file`, `create_directory`, `move_file`,
   `delete_file`, `search_files` etc. with `allowAutoExecution: false` so
   writes require manual approval. The read-only tools (`read_file`,
   `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`)
   can stay auto-executed.
3. Do NOT widen the exposed paths. `/home/jason/Brain` and
   `/home/jason/Downloads` are the only directories the server should ever
   see — adding `/home/jason` (the whole home) would expose `~/.ssh`,
   `~/.aws`, `~/.mcp-auth`, and other secret-bearing dirs to the agent's
   read/write surface. If you need a new path, add it as a specific
   subdirectory, never a parent.
4. The flatpak sandbox's default filesystem grants do NOT include `home`
   — that's why `flatpak-spawn --host` with the absolute deno path is
   required (same as every other nix-managed binary). The
   `flatpak override --user --talk-name=org.freedesktop.Flatpak
   md.obsidian.Obsidian` grant (applied 2026-07-30) is the prerequisite.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "filesystem",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-read",
      "--allow-write",
      "--allow-env",
      "npm:@modelcontextprotocol/server-filesystem@2026.7.10",
      "/home/jason/Brain",
      "/home/jason/Downloads"
    ],
    "env": {}
  },
  "enabled": false,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Smoke-test the server via deno (host shell) — should print initialize result:
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 15 /home/jason/.nix-profile/bin/deno --allow-read --allow-write --allow-env npm:@modelcontextprotocol/server-filesystem@2026.7.10 /home/jason/Brain /home/jason/Downloads 2>&1 | head -20

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' | timeout 30 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-read --allow-write --allow-env npm:@modelcontextprotocol/server-filesystem@2026.7.10 /home/jason/Brain /home/jason/Downloads 2>&1 | head -20

# Confirm the deno binary is reachable from inside the sandbox:
flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --version

# List the tools the server exposes (after a real initialize handshake):
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | timeout 15 /home/jason/.nix-profile/bin/deno --allow-read --allow-write --allow-env npm:@modelcontextprotocol/server-filesystem@2026.7.10 /home/jason/Brain /home/jason/Downloads 2>&1 | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(t['name'] for t in d.get('result',{}).get('tools',[])))"
```

**Security note — secrets exposure.** Because the server exposes
`/home/jason/Brain` read/write and the vault is a git repo pushed to a
public remote (codeberg), anything the agent writes into a vault note can
land in a public commit via obsidian-git auto-backup. Do not have the
agent write secrets (API keys, tokens, passwords) into vault notes via
the filesystem server. If a secret needs to live in a note, it should go
through the existing secret-management flow (1Password link, sops, etc.)
and never be auto-committed.

### `kitesurf` — public CDP WebSocket, no auth (verified 2026-08-07)

The `kitesurf` MCP server drives Cloudflare's public Kitesurf playground
(`https://kitesurf.cloudflare.app/`) over the Chrome DevTools Protocol. It
uses `chrome-devtools-mcp@latest` under deno — identical spawn shape to
the `browser-rendering` server, but against a **stateless, tokenless,
public** endpoint. Exposes the same ~29 chrome-devtools-mcp tools.

**Endpoint + auth.**
`--wsEndpoint=wss://kitesurf.cloudflare.app/devtools/browser`. No
`--wsHeaders`, no API token, no OAuth. Kitesurf is a stateless playground
running entirely on Cloudflare Workers — each session is ephemeral and
shared (no per-user auth, no persistent state). Per the Kitesurf docs:
"Point chrome-devtools-mcp at the playground's CDP endpoint and your
agent gets a real browser — no Chrome install, no API token."

**Use cases + limits.** Good for: quick page-fetching, JS evaluation,
screenshotting, testing chrome-devtools-mcp itself, or any task where you
don't want to spend Browser Rendering quota. Bad for: anything needing
authentication (no cookies persist reliably across the shared playground),
anything sensitive (the playground is public), or anything needing a
specific browser config / geolocation / persistent storage. For real
browser sessions with auth and persistence, use the `browser-rendering`
server instead.

**Same deno-not-npx reasoning as `browser-rendering`.** Deno runs
`npm:chrome-devtools-mcp@latest` natively; no `/usr/bin/env PATH=...`
wrapper needed (unlike the npx-based `cloudflare` server). See the
`browser-rendering` gotcha for the full rationale.

**`toolOptions` is `{}` — auto-execution is wild-west.** Same posture as
`browser-rendering`: all ~29 tools auto-execute. Since Kitesurf is
stateless and free (no billing), the risk of auto-execution is lower than
`browser-rendering` — worst case the agent navigates a public page or
takes a screenshot. Still, consider gating `evaluate_script` (arbitrary
JS execution in the browser) behind `allowAutoExecution: false` if you
want a guardrail.

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "kitesurf",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "--allow-all",
      "npm:chrome-devtools-mcp@latest",
      "--wsEndpoint=wss://kitesurf.cloudflare.app/devtools/browser"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {}
}
```

**Verification commands:**
```bash
# Smoke-test init + tools/list via deno (host shell):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 6 ) \
| timeout 30 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=wss://kitesurf.cloudflare.app/devtools/browser 2>/dev/null \
| grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# Smoke-test through the Obsidian flatpak sandbox (same spawn path smart-composer uses):
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 12 ) \
| timeout 40 flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=wss://kitesurf.cloudflare.app/devtools/browser 2>/dev/null \
| grep -oE '"protocolVersion":"[^"]*"|"id":2' | head -2

# End-to-end: navigate to example.com and read document.title:
( printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"navigate_page","arguments":{"type":"url","url":"https://example.com"}}}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"evaluate_script","arguments":{"function":"() => document.title"}}}'; sleep 25 ) \
| timeout 50 /home/jason/.nix-profile/bin/deno --allow-all npm:chrome-devtools-mcp@latest --wsEndpoint=wss://kitesurf.cloudflare.app/devtools/browser 2>/dev/null | grep '"id":3'
```

### `paperless-postgres` — port and hostname (verified 2026-08-03)

The `paperless-postgres` MCP server uses
`@modelcontextprotocol/server-postgres` to query the Paperless-ngx PostgreSQL
database directly (read-only). Two things have to be right or the server
appears to "not work" in Obsidian with no visible error — it just fails to
initialize and the `query` tool never appears.

**Port — must be `32768`, not `32769`.** The NAS publishes both ports via
Tailscale, but they go to different containers:

| Port  | Container                       | Internal | Protocol             |
|-------|---------------------------------|----------|----------------------|
| 32768 | `paperless-v2-postgresdb-1`     | 5432     | PostgreSQL wire     |
| 32769 | `paperless_v2` (web/gunicorn)  | 5555     | HTTP, not PostgreSQL |

Pointing the server at `32769` is the failure mode: the TCP connection
succeeds (so `pg_isready` and the MCP server's transport layer think
everything is fine), but the remote end never speaks the PostgreSQL wire
protocol, so the startup handshake hangs until the MCP client's init timeout
fires and the server is marked failed. `pg_isready -h <host> -p 32769`
returns `no response` for the same reason — it sends a startup message and
gets nothing back.

**Hostname — use `nas.greyhound-little.ts.net` (MagicDNS FQDN), not bare
`nas`.** The bare name `nas` does NOT resolve from the host shell
(`/etc/resolv.conf` points at the LXD-managed resolver `100.115.92.193`,
which only knows `*.lxd` names), and it does NOT resolve from inside the
Obsidian flatpak sandbox either. The MagicDNS FQDN
`nas.greyhound-little.ts.net` resolves correctly from both the host shell
and inside the flatpak sandbox (verified 2026-08-03 with `flatpak run
--command=getent md.obsidian.Obsidian hosts nas.greyhound-little.ts.net` →
`100.100.10.28`). The Tailscale IP `100.100.10.28` also works and is
robust against DNS config drift, but shifts if the NAS ever gets a new
Tailscale lease — prefer the FQDN for stability.

**No flatpak override is needed** for the FQDN to resolve from inside the
sandbox. The sandbox shares the host network namespace and inherits the
host's resolver configuration, so MagicDNS works as long as the host can
reach `100.100.100.100` (Tailscale's MagicDNS resolver) — which it can,
because Tailscale is up on this host (`chromeos-penguin`).

**Working config (in `backups/data.golden.json`):**
```json
{
  "id": "paperless-postgres",
  "parameters": {
    "command": "flatpak-spawn",
    "args": [
      "--host",
      "/home/jason/.nix-profile/bin/deno",
      "run",
      "--allow-env",
      "--allow-net",
      "npm:@modelcontextprotocol/server-postgres@0.6.2",
      "postgresql://paperless:paperless@nas.greyhound-little.ts.net:32768/paperless"
    ],
    "env": {}
  },
  "enabled": true,
  "toolOptions": {
    "query": {
      "disabled": false,
      "allowAutoExecution": true
    }
  }
}
```

**Verification commands:**
```bash
# Confirm the right port speaks PostgreSQL (should print a version string):
PGCONNECT_TIMEOUT=5 psql "postgresql://paperless:paperless@nas.greyhound-little.ts.net:32768/paperless" -c "SELECT version();"

# Confirm the wrong port does NOT (will hang until timeout — Ctrl+C):
PGCONNECT_TIMEOUT=5 psql "postgresql://paperless:paperless@nas.greyhound-little.ts.net:32769/paperless" -c "SELECT 1;"

# Confirm the flatpak sandbox can resolve + reach the FQDN:
flatpak run --command=getent md.obsidian.Obsidian hosts nas.greyhound-little.ts.net
flatpak run --command=bash md.obsidian.Obsidian -c 'timeout 5 bash -c "exec 3<>/dev/tcp/nas.greyhound-little.ts.net/32768" && echo TCP-OK'

# Confirm which container owns each port (run on the NAS via SSH):
ssh nas '/var/packages/ContainerManager/target/usr/bin/docker ps --format "{{.Names}}|{{.Ports}}" | grep -E "32768|32769"'
```
### `aperture` — Tailscale Aperture AI Gateway (CORS + MCP timeout, disabled 2026-08-30)

The `aperture` smart-composer entry covers two separate things: an
**OpenAI-compatible LLM provider** (for AI chat) and an **MCP server**
(for aperture's aggregated MCP connector tools). Both were tested and
both fail for different reasons. The aperture machine itself
(`aperture-ai-gateway.greyhound-little.ts.net`, `100.100.10.103`) is
healthy — both HTTP and HTTPS (via Tailscale Serve, Let's Encrypt cert)
respond correctly for `/v1/models`, `/v1/chat/completions`, and
`/v1/mcp`. The failures are client-side compatibility issues, not
aperture downtime.

**1. AI chat — CORS blocking (no fix available).** Smart-composer's
`openai-compatible` provider type uses the OpenAI SDK with
`dangerouslyAllowBrowser: true`, which means all LLM requests go through
the browser's `fetch()` API. Browser `fetch()` to a cross-origin endpoint
requires the server to return `Access-Control-Allow-Origin` in its
response headers. Aperture does NOT send any CORS headers — its
`Content-Security-Policy` header has `connect-src 'self'` and no
`Access-Control-Allow-Origin` appears in any response (verified
2026-08-30 via `curl -X OPTIONS` preflight and `curl -X POST` with
`Origin: app://obsidian.md`). The Cloudflare AI Gateway, by contrast,
sends `access-control-allow-origin: *` — which is why the OpenRouter
provider pointing at the CF AI Gateway works but the aperture provider
doesn't. Aperture has no CORS configuration option (confirmed: the
Tailscale Aperture configuration reference at
https://tailscale.com/docs/aperture/configuration has no CORS-related
fields). There is no SSH access to the aperture host (`ssh` → connection
refused on port 22), so no server-side reverse proxy fix is available
either. **Conclusion: aperture cannot be used as a smart-composer LLM
provider. Use the OpenRouter provider with the CF AI Gateway base URL
instead — aperture's upstream IS the CF AI Gateway anyway (see
`aperture-ai-gateway.hujson` line 723), so you get the same models with
CORS support by pointing at the gateway directly.**

**2. MCP server — tools/list timeout (30-40s).** The aperture MCP
endpoint at `https://aperture-ai-gateway.greyhound-little.ts.net/v1/mcp`
speaks legacy HTTP+SSE (not Streamable HTTP). The SSE transport was
figured out: `npx` + `--transport sse-only` works (deno's SSE client has
a `Symbol(header list)` bug in mcp-remote@0.1.38 and 0.2.4). However,
`tools/list` takes 30-40 seconds to return because aperture has 12+
connectors (Google Workspace ×8, Zapier, n8n, Fastmail, TailnetSSH,
Tailnet, jasonriddle) that populate lazily — each connector must be
queried before the full tool list is assembled. Smart-composer's MCP
init timeout is shorter than this, so the server appears to fail on
startup. The raw SSE protocol was verified working: `initialize`
returns `serverInfo: llm-proxy v1.0.0` immediately, and `tools/list`
does eventually return `TailnetSSH_list_machines` and
`TailnetSSH_run_command` (after ~30s). But the delay is too long for
smart-composer's client. **Conclusion: aperture MCP cannot be used with
smart-composer until either (a) smart-composer's MCP init timeout is
increased, or (b) aperture's connector loading is made non-lazy. The
aperture MCP server should be `enabled: false` in golden.**

**Working config that replaced aperture (in `backups/data.golden.json`):**
- **Provider**: `openrouter` type with
  `baseUrl: "https://gateway.ai.cloudflare.com/v1/7880ee87feea1839fb5a815cc479b080/ai-jasonriddle-com/openrouter/v1"`
  and `apiKey: "sk-or-v1-..."` (the CF AI Gateway sends CORS headers,
  so browser fetch works)
- **Models**: `~deepseek/deepseek-v4-flash-latest` and
  `~openai/gpt-mini-latest` (both `enable: true`, `promptLevel: 1`) —
  same models aperture exposes, routed through the same upstream CF AI
  Gateway, but with CORS support
- **MCP**: `aperture` server `enabled: false`

**Verification of the CORS root cause:**
```bash
# Aperture: no CORS headers (browser blocks response)
curl -sS -X OPTIONS "https://aperture-ai-gateway.greyhound-little.ts.net/v1/chat/completions" \
  -H "Origin: app://obsidian.md" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  -D - -o /dev/null 2>&1 | grep -i "access-control"
# Expected: no output (no Access-Control-Allow-Origin header)

# CF AI Gateway: CORS headers present (browser allows response)
curl -sS -X POST "https://gateway.ai.cloudflare.com/v1/7880ee87feea1839fb5a815cc479b080/ai-jasonriddle-com/openrouter/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-or-v1-..." \
  -H "Origin: app://obsidian.md" \
  -d '{"model":"~openai/gpt-mini-latest","messages":[{"role":"user","content":"hi"}],"max_tokens":5}' \
  -D - -o /dev/null 2>&1 | grep -i "access-control"
# Expected: access-control-allow-origin: *
```

**Verification of the MCP timeout root cause:**
```bash
# Raw SSE protocol: initialize returns immediately, tools/list takes 30-40s
# Start SSE stream in background, extract session endpoint, POST requests:
( timeout 40 curl -sS -N "https://aperture-ai-gateway.greyhound-little.ts.net/v1/mcp" > /tmp/sse.txt ) &
sleep 2
ENDPOINT=$(grep '^data:' /tmp/sse.txt | head -1 | sed 's/^data: //')
curl -sS -X POST "https://aperture-ai-gateway.greyhound-little.ts.net${ENDPOINT}" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"1.0"}}}'
curl -sS -X POST "https://aperture-ai-gateway.greyhound-little.ts.net${ENDPOINT}" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'
curl -sS -X POST "https://aperture-ai-gateway.greyhound-little.ts.net${ENDPOINT}" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
sleep 30
cat /tmp/sse.txt  # tools/list response appears after ~30s
```

**Useful commands for debugging MCP servers:**

```bash
# Test an mcp-remote HTTP server from the command line (stdio init handshake)
# Replace <URL> with the MCP server URL. Use timeout 15 for quick tests;
# use timeout 120+ for OAuth-dependent servers that need browser interaction.
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | timeout 15 deno --allow-all npm:mcp-remote@0.1.38 <URL> --transport http-only

# Test a stdio MCP server (e.g. Docker-based, local npm package)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | timeout 15 docker run -i --rm <image> <args>

# Inspect a server's OAuth metadata (does it advertise scopes_supported?)
curl -s https://<server>/.well-known/oauth-authorization-server | python3 -m json.tool

# Inspect a server's protected resource metadata
curl -s https://<server>/.well-known/oauth-protected-resource | python3 -m json.tool

# Register a test OAuth client (to see if the server accepts dynamic registration)
curl -s -X POST https://<server>/register -H "Content-Type: application/json" \
  -d '{"client_name":"test","redirect_uris":["http://localhost:3000/callback"],"grant_types":["authorization_code"],"response_types":["code"],"token_endpoint_auth_method":"none"}' | python3 -m json.tool

# Check if a host binary is accessible from inside the Obsidian flatpak sandbox
flatpak run --command=flatpak-spawn md.obsidian.Obsidian --host /home/jason/.nix-profile/bin/<binary> --version

# Check the Obsidian flatpak override permissions
flatpak override --user --show md.obsidian.Obsidian

# Find which port mcp-remote used for its OAuth callback (from the log output)
# Look for "Using existing client port:" or "Using automatically selected callback port:"
# The callback server runs at http://127.0.0.1:<port>/oauth/callback

# Check if any mcp-remote OAuth callback servers are still running
ss -tlnp | grep -E 'node|deno'

# Search mcp-remote source for specific behavior (e.g. scope handling)
grep -n "getEffectiveScope\|scopes_supported\|openid email" ~/.cache/deno/npm/registry.npmjs.org/mcp-remote/0.1.38/dist/chunk-65X3S4HB.js
```

## Obsidian Plugin Management

### Smart-composer golden file system

The smart-composer plugin has a recurring failure mode: it corrupts
`.obsidian/plugins/smart-composer/data.json` in memory, then writes a
wiped-default state to disk. obsidian-git's auto-backup then commits the
wipe, losing all API keys, MCP servers, custom models, and the system prompt.

**Protection:** `backups/data.golden.json` is the single source of truth.
Enforcement is **manual** — run `backups/enforce-golden.sh` to reconcile
`data.json` against golden (saves a forensic copy of any wiped state to
`backups/data.wiped.<ISO8601>.json` before restoring). The
`enforce-smart-composer-golden` pre-commit hook in `devenv.nix` is **disabled**;
with it off, obsidian-git auto-backup can land wipes in HEAD again, so run the
script when you suspect corruption.

**Three-step workflow when editing the live `data.json`:** always (1) sync
live → golden first to capture any UI drift, (2) apply your new changes to
golden, (3) sync golden → live. Skipping step 1 silently discards legitimate
UI edits the user made since the last sync (e.g. a model they toggled off, a
`maxAutoIterations` bump). Fully quit Obsidian before any `cp` in either
direction — the plugin holds `data.json` in memory while running and will
clobber your sync with stale in-memory state (this is exactly the failure
mode that produced `backups/data.wiped.20260803T224407Z.json`). See
`backups/AGENTS.md` § "Intentional config edit" for the full procedure.

**Reverse direction (live → golden):** when live state has legitimately
drifted from golden (e.g. via UI edits) and you want to promote it to the new
source of truth, save a forensic backup of the previous golden to
`backups/data.golden.<ISO8601>.json` before overwriting golden with the live
file. This mirrors the `data.wiped.<ISO8601>.json` convention but captures
the **golden** side of an intentional overwrite, not the **live** side of an
enforcement restore. See `backups/AGENTS.md` § "Promote live state to golden".

**See `backups/AGENTS.md`** for the full system documentation — file roles,
how to change config, running the script, diagnosing issues, hook
interactions, and testing.

**Key rules for AI agents:**
1. Never edit `.obsidian/plugins/smart-composer/data.json` directly — edit
   `backups/data.golden.json` instead, then `cp` it to the live location.
2. Never edit `backups/data.default.json` — it's the corruption baseline.
3. `backups/data.golden.json` and `backups/data.deprecated.json` contain API keys
   (OpenRouter, opencode-go) committed to git. Do not push to the codeberg
   remote without addressing gitignore + key rotation first.
4. The enforcement hook is **disabled** — reconciliation only happens when
   someone runs `backups/enforce-golden.sh`. A UI-driven change to
   `data.json` will persist until the script is run (golden wins on conflict).
   Re-enable the hook in `devenv.nix` only if auto-protection is wanted again.

### Plugin pinning via BRAT

`obsidian42-brat` (BRAT) is installed at `.obsidian/plugins/obsidian42-brat/`
for pinning plugins to specific versions. Currently pinned:

| Plugin | Pinned version | Reason |
|---|---|---|
| `omnisearch` | 1.29.3 | 1.30.1 was slow and crashed Obsidian (2026-08-02) |

**Note (2026-08-03):** BRAT itself is now **disabled** in
`community-plugins.json`, so the pin above is inactive. To re-enable BRAT,
add `obsidian42-brat` back to `.obsidian/community-plugins.json` and restart
Obsidian.

BRAT's config lives at `.obsidian/plugins/obsidian42-brat/data.json` with the
frozen-plugin list under `pluginSubListFrozenVersion`. BRAT's
`updateAtStartup` is set to `false` — update BRAT-managed plugins manually
via the command palette (`BRAT: Check for updates...`).

**To pin another plugin:** run `BRAT: Add a beta plugin with frozen version
based on a release tag` in Obsidian, or edit
`.obsidian/plugins/obsidian42-brat/data.json` directly and add the repo to
both `pluginList` and `pluginSubListFrozenVersion`.

### Plugin reverts and disabled plugins (as of 2026-08-02, updated 2026-08-03)

The following plugins were reverted from versions that caused issues and/or
are currently **disabled** in `community-plugins.json` for debugging.

**Active community plugins (11):** `auto-note-mover`, `auto-template-trigger`,
`code-styler`, `colored-tags`, `explorer-hider`, `text-extractor`,
`obsidian-vault-statistics-plugin`, `obsidian-trim-whitespace`,
`obsidian-git`, `remember-cursor-position`, `smart-composer`.

**Disabled plugins (10) — present on disk but absent from `community-plugins.json`:**

| Plugin | Current version | Reverted from | Status |
|---|---|---|---|
| `omnisearch` | 1.29.3 | 1.30.1 (crashed Obsidian) | disabled + pinned via BRAT |
| `obsidian-hider` | 1.6.2 | 1.7.0 | disabled |
| `obsidian42-brat` | 2.2.0 | (newly installed) | disabled (BRAT pinning no longer active) |
| `duckdb-motherduck` | — | — | disabled 2026-08-03 |
| `better-export-pdf` | — | — | disabled |
| `homepage` | — | — | disabled |
| `obsidian-kanban` | — | — | disabled |
| `obsidian-local-rest-api` | — | — | disabled |
| `recent-files-obsidian` | — | — | disabled |
| `smart-composer` | (config protected by golden script) | — | enabled; 7 MCP servers configured: `android-cdp`, `android-debug-bridge`, `android-ssh`, `android-remote-control` enabled; `fastmail`, `parallel-search`, `postgres-for-paperless` disabled (see below) |

**Note on `smart-composer`:** the plugin itself is enabled. As of
2026-08-08, golden configures **7 MCP servers** (down from 12 — the
`bedrock-agentcore`, `containers`, `kitesurf`, `browser-rendering`,
`kernel` servers were removed from golden; their gotchas remain below
as reference). `android-cdp`, `android-debug-bridge`, `android-ssh`,
and `android-remote-control` are `enabled: true`. `fastmail`,
`parallel-search`, and `postgres-for-paperless` are `enabled: false`.

**Verified status (2026-08-30):**
- `android-ssh` — **working** (init + `exec` → `aarch64` from phone).
- `android-cdp` — **working** with ADB forward up (init + `list_pages` +
  `navigate_page` + `evaluate_script`). Requires
  `adb forward tcp:9222 localabstract:chrome_devtools_remote`; ADB
  pairing/connect ports change every session — ask the user.
- `android-debug-bridge` — **working** with ADB connected (init +
  `ListDevices` returns phone). `--wifi` connect port changes every
  session — ask the user and update golden before syncing.
- `android-remote-control` — **init OK but tool calls broken.** Remote
  HTTP MCP at `https://arc.jasonriddle.com/mcp` (CF-Access gated).
  `initialize` succeeds (v1.9.0) but `tools/list` and all subsequent
  requests return `Bad Request: Server not initialized` (HTTP 400).
  Server-side session bug in the Worker — same bug class as
  `mcp.jasonriddle.com/mcp` (session not persisted after init). Needs
  Worker-side debugging.
- `aperture` — **disabled.** AI chat blocked by CORS (aperture sends no
  `Access-Control-Allow-Origin`; smart-composer uses browser fetch with
  `dangerouslyAllowBrowser: true`). MCP blocked by `tools/list` timeout
  (30-40s with 12+ lazy-loading connectors; exceeds smart-composer init
  timeout). See the `aperture` gotcha above for full details. Replaced
  by the `openrouter` provider pointing at the CF AI Gateway directly
  (same upstream, CORS headers present).
- `fastmail`, `parallel-search`, `postgres-for-paperless` — disabled
  (not tested this session).

The auth-reference table and gotchas above also document several servers
(`cloudflare`, `cloudflare-codemode`, `cloudflare-docs`, `filesystem`,
`aws-mcp`, `homelab-mcp`, `portainer-enhanced`, `anchor-browser`,
`bedrock-agentcore`, `browser-rendering`, `containers`, `kitesurf`)
that are **not** currently in golden — they're kept as reference for
servers that were configured historically or could be re-added. To
re-enable or add a server, set its `enabled` field to `true` in golden,
then `cp backups/data.golden.json .obsidian/plugins/smart-composer/data.json`
and fully restart Obsidian.

**To re-enable a disabled plugin:** add the plugin id back to
`.obsidian/community-plugins.json` and restart Obsidian.

**Warning: while obsidian-git is disabled, auto-backups do not run.** With the
golden enforcement hook also disabled in `devenv.nix`, the only way to
reconcile `data.json` against golden is to run `backups/enforce-golden.sh`
manually. obsidian-git is currently **enabled** (as of 2026-08-03), so
auto-backups are running — but **wipes can still land in HEAD** because the
golden hook is off. Re-enable the hook in `devenv.nix` if you want
auto-protection back.

### Reverting a plugin update

Plugin code files (`main.js`, `manifest.json`, `styles.css`) are tracked in
git. To revert a plugin to a pre-update version:

```bash
# Find the commit that bumped the version
git log --oneline -- .obsidian/plugins/<plugin-id>/manifest.json | head -5

# Verify the pre-update version
git show <parent-commit>:.obsidian/plugins/<plugin-id>/manifest.json | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])"

# Revert the code files (settings in data.json are left untouched)
git checkout <parent-commit> -- \
  .obsidian/plugins/<plugin-id>/main.js \
  .obsidian/plugins/<plugin-id>/manifest.json \
  .obsidian/plugins/<plugin-id>/styles.css

# Fully quit and relaunch Obsidian to pick up the reverted main.js
```

## Notes for AI Assistants

1. **Respect the structure**: Don't create new organizational patterns without asking
2. **Avoid duplication**: Check existing files before suggesting new ones
3. **Maintain separation**: Keep facts, actions, and documents in their designated places
4. **Use established patterns**: Follow existing naming conventions and frontmatter
5. **Ask before reorganizing**: The current structure is intentional, even if it seems messy
6. **Frontmatter requirements**:
   - When creating a new markdown file: Always add `created: "YYYY-MM-DD"` field
   - When updating an existing file: Always update the `updated: "YYYY-MM-DD"` field
   - When creating OR updating any markdown file: Always add `ai-processed` to the tags list
   - Use format: `created: "YYYY-MM-DD"` and `tags: [list]`
   - Example:
     ```yaml
     ---
     tags:
       - inbox
       - ai-processed
      created: "2026-03-25"
      updated: "2026-06-18"
      ---
      ```
7. **CRITICAL: Never delete files in .trash/**: The .trash/ directory is managed by Obsidian. AI agents must NEVER delete, modify, or clean up files in this directory. This is permanently banned.
8. **Pre-flight check**: Before making any changes, always run `maid clean --noop --rules ~/.maid/rules.brain.rb` first to understand the current state of the vault. Do not take any actions without user approval — present findings and ask before editing, moving, renaming, or creating any files.

## Searching for Tags

The vault uses YAML frontmatter with tags in list format. Use these commands to search for tags:

### Search for files with a single tag

```bash
# Count files with tag "inbox"
find . -name "*.md" -type f -exec grep -l "^  - inbox$" {} \; | wc -l

# List files with tag "inbox"
find . -name "*.md" -type f -exec grep -l "^  - inbox$" {} \;

# Generic: Replace "inbox" with any tag name
find . -name "*.md" -type f -exec grep -l "^  - TAG_NAME$" {} \;
```

### Search for files with ALL of multiple tags (AND logic)

```bash
# Files with BOTH "inbox" AND "ai-processed" tags
comm -12 \
  <(find . -name "*.md" -type f -exec grep -l "^  - inbox$" {} \; | sort) \
  <(find . -name "*.md" -type f -exec grep -l "^  - ai-processed$" {} \; | sort)

# Generic: For N tags, nest comm commands or use this pattern:
# Step 1: Get files with first tag
find . -name "*.md" -type f -exec grep -l "^  - TAG1$" {} \; | sort > /tmp/tag1.txt
# Step 2: Get files with second tag  
find . -name "*.md" -type f -exec grep -l "^  - TAG2$" {} \; | sort > /tmp/tag2.txt
# Step 3: Find intersection
comm -12 /tmp/tag1.txt /tmp/tag2.txt
# Step 4: For 3+ tags, keep using comm -12 with next tag file
```

### Search for files with ANY of multiple tags (OR logic)

```bash
# Files with "inbox" OR "ai-processed" (or both)
grep -rEl "(^  - inbox$|^  - ai-processed$)" --include="*.md" .

# Generic: For N tags, add more patterns separated by |
grep -rEl "(^  - TAG1$|^  - TAG2$|^  - TAG3$)" --include="*.md" .

# Count results
grep -rEl "(^  - inbox$|^  - ai-processed$)" --include="*.md" . | wc -l
```

### Important Notes

1. **Tag format**: Tags are in YAML list format with 2-space indent: `  - tagname`
2. **Pattern matching**: Use `^  - TAG$` to match exact tag (starts with 2 spaces, ends at line)
3. **File paths with spaces**: Use `find -exec` instead of piping to `xargs` (handles spaces correctly)
4. **Exclude .trash**: Add `! -path "./.trash/*"` to find command if needed
5. **Case sensitivity**: Tag matching is case-sensitive by default

### Examples

```bash
# Count files in A-INBOX with inbox tag
find ./A-INBOX -name "*.md" -type f -exec grep -l "^  - inbox$" {} \; | wc -l

# Find files tagged with "taxes" but NOT in .trash
find . -name "*.md" -type f ! -path "./.trash/*" -exec grep -l "^  - taxes$" {} \;

# Files with "real-estate" AND "taxes" tags (for tax planning)
comm -12 \
  <(find . -name "*.md" -type f -exec grep -l "^  - real-estate$" {} \; | sort) \
  <(find . -name "*.md" -type f -exec grep -l "^  - taxes$" {} \; | sort)

# Files with any teaching-related tag
grep -rEl "(^  - teaching$|^  - education$|^  - alder$)" --include="*.md" .
```

## Current Status (as of 2026-03-25)

- 2024 taxes: Filed (amended in Feb 2026)
- 2025 taxes: Extension filed (due May 30, 2026)
- 2026 taxes: In planning phase
- Graduate school: Interview scheduled, preparing math lesson
- Health goal: Lose 5 pounds, workout 4x/week
- Living situation: Temporary Airbnb until Aug 16, 2026
- Active projects: Homelab infrastructure, WordPress development, Ledger accounting
