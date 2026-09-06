# Smart Assistant

<p align="center">
  <a href="https://github.com/jason-riddle/obsidian-smart-assistant/issues">Report Bug</a>
  ·
  <a href="https://github.com/jason-riddle/obsidian-smart-assistant/discussions">Discussions</a>
</p>

![SC1_Title.gif](https://github.com/user-attachments/assets/a50a1f80-39ff-4eba-8090-e3d75e7be98c)

Smart Assistant is an Obsidian plugin that helps you write efficiently with
AI by easily referencing your vault content. Inspired by Cursor AI and
ChatGPT Canvas, it unifies your note-taking and content creation process
within Obsidian.

This is a fork of [obsidian-smart-composer](https://github.com/glowingjade/obsidian-smart-composer)
maintained by [Jason Riddle](https://github.com/jason-riddle).

## Features

### Contextual Chat

![SC2_ContextChat.gif](https://github.com/user-attachments/assets/8da4c189-399a-450a-9591-95f1c9af1bc8)

Upgrade your note-taking experience with a contextual AI assistant, inspired
by Cursor AI. Unlike typical AI plugins, Smart Assistant lets you
**precisely select the context for your conversation.**

- Type `@<fname>` to choose specific files/folders as your conversation context
- Get responses based on selected vault content

#### Multimedia Context

<img src="https://github.com/user-attachments/assets/b22175d4-80a2-4122-8555-2b9dd4987f93" alt="SC2-2_MultiContext.png" width="360"/>

Add website links and images as additional context for your queries.

- Website content is automatically extracted
- **Image support**: Add images directly to your chat through upload button,
  drag & drop, or paste from clipboard
- **YouTube link support**: YouTube transcripts are fetched and included as
  context
- **Coming soon**: Support for external files (PDF, DOCX, ...)

### Apply Edit

![SC3_ApplyEdit.gif](https://github.com/user-attachments/assets/35ee03ff-4a61-4d08-8032-ca61fb37dcf1)

Smart Assistant **suggests edits to your document.** You can apply them with
a single click.

- Offers document change recommendations
- Apply suggested changes instantly

### Model Context Protocol (MCP)

![mcp_demo](https://github.com/user-attachments/assets/4c80a1af-4cbf-4aa4-90d2-457499553357)

Connect Smart Assistant to external MCP servers. MCP lets you use powerful
third-party tools and data sources right inside your chat.

#### Remote MCP Servers

Remote MCP servers are supported via **HTTP** (Streamable HTTP, with
automatic fallback to SSE) and **SSE** (Server-Sent Events) transports.
Authentication options for remote servers:

- **Bearer token** — a static API key or personal access token
- **OAuth 2.0 static client** — user-provided client ID, authorization URL,
  and token URL (no Dynamic Client Registration)
- **OAuth 2.1 + DCR** — the SDK performs discovery (RFC 9728/8414) and Dynamic
  Client Registration (RFC 7591) automatically

OAuth state (tokens, PKCE verifiers) is persisted per-server in the vault and
survives plugin reloads. The `obsidian://` callback protocol handles the
authorization code exchange transparently.

### Skills

Skills are reusable sets of AI instructions discovered from markdown files
using the [agentskills.io](https://agentskills.io) SKILL.md format. Skills use
**progressive disclosure**: the system prompt lists each skill's name and
description, and the built-in `read_skill` tool lets the agent load a skill's
full instructions on demand.

- **Vault skills** — `<vault>/.agents/skills/<name>/SKILL.md`, scanned and
  hot-reloaded automatically
- **Bundled skills** — ship with the plugin, no filesystem access needed
- Vault skills override bundled skills with the same name
- Type `/` in the chat view for skill typeahead

A SKILL.md file contains YAML-like frontmatter (`name`, `description`,
optional `license`, `compatibility`, `metadata`, `allowed-tools`) followed by
a markdown body with instructions for the AI agent.

### Additional Features

- **Custom Model Selection**: Use your own model by setting your API Key
  (stored locally). Supported API providers:
  - OpenAI
  - Anthropic
  - Google (Gemini)
  - Groq
  - DeepSeek
  - OpenRouter
  - Azure OpenAI
  - Ollama
  - LM Studio
  - Mistral
  - Perplexity
  - xAI
  - Any other OpenAI-compatible providers
- **Local Model Support**: Run open-source LLMs locally with
  [Ollama](https://ollama.ai) for complete privacy and offline usage.
- **Custom System Prompts**: Define your own system prompts that will be
  applied to every chat conversation.

## Getting Started

> [!IMPORTANT]
> **Installer Version Requirement**
> Smart Assistant requires a recent version of the Obsidian installer. If
> you experience issues with the plugin not loading properly:
>
> 1. First, try updating Obsidian normally at `Settings > General > Check for
>    update`.
> 2. If issues persist, manually update your Obsidian installer:
>    - Download the latest installer from [Obsidian's download
>      page](https://obsidian.md/download)
>    - Close Obsidian completely
>    - Run the new installer

1. Open Obsidian Settings
2. Navigate to "Community plugins" and click "Browse"
3. Search for "Smart Assistant" and click Install
4. Enable the plugin in Community plugins
5. Add an API key in `Settings > Smart Assistant > Providers`:
   - OpenAI: [ChatGPT API Keys](https://platform.openai.com/api-keys)
   - Anthropic: [Claude API Keys](https://console.anthropic.com/settings/keys)
   - Gemini: [Gemini API Keys](https://aistudio.google.com/apikey)

> [!TIP]
> **Looking for a free option?**
> The Gemini API provides the best performance among free models. Recommended
> for users looking for a free option.
> _When using free APIs, please review the provider's privacy policy before
> sending sensitive data._

## Feedback and Support

- **Bug Reports**: Submit an issue on our
  [GitHub Issues](https://github.com/jason-riddle/obsidian-smart-assistant/issues)
  page.
- **Feature Requests**: Use
  [GitHub Discussions](https://github.com/jason-riddle/obsidian-smart-assistant/discussions)
  to share your suggestions.

## Contributing

We welcome contributions, including bug reports, bug fixes, documentation
improvements, and feature enhancements. For major feature ideas, please
create an issue first to discuss feasibility and implementation approach.

## License

This project is licensed under the [MIT License](LICENSE).
