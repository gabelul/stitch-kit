# AGENTS.md

Guidance for Claude Code, Cursor, Copilot, Codex CLI, and other AI agents working with this plugin.

## What this repo is

A collection of Claude Code **skills** — 36 packaged instructions and scripts that extend AI agents with Stitch-specific capabilities: text-to-UI generation, design iteration (edit, variants, design systems), design token extraction, and multi-framework conversion. Think of it as a Stitch co-pilot that wraps all 15 Stitch MCP tools and knows the footguns so you don't have to learn them the hard way.

## Skill structure

Each skill directory follows the Agent Skills standard:

```
skills/{skill-name}/
├── SKILL.md              ← Required: activation instructions and workflow
├── examples/             ← Required: worked examples (gold-standard reference)
├── resources/            ← Optional: templates, checklists, mapping tables
├── scripts/              ← Optional: bash scripts (fetch-stitch.sh, init_stitch_skill.py, etc.)
└── references/           ← Optional: style guides, contracts
```

- **SKILL.md**: YAML frontmatter (`name`, `description`, `allowed-tools`) + markdown instructions
- **examples/**: Load for few-shot context when needed
- **resources/**, **scripts/**: Progressive disclosure — reference only when relevant

## Quick install (both platforms)

```bash
npx @booplex/stitch-kit
```

Auto-detects Claude Code and/or Codex CLI and installs to the right places. Also tells you if Stitch MCP needs configuring.

To update later: `npx @booplex/stitch-kit update` (npx always fetches the latest version).
To check what's installed: `npx @booplex/stitch-kit status`.

## Installing (Claude Code)

Stitch MCP first (remote HTTP server — needs an API key from [stitch.withgoogle.com/settings](https://stitch.withgoogle.com/settings)):

```bash
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
  --header "X-Goog-Api-Key: YOUR-API-KEY" -s user
```

Then the plugin:

```bash
/plugin marketplace add https://github.com/gabelul/stitch-kit.git
/plugin install stitch-kit@stitch-kit
```

## Installing (Codex CLI)

```bash
npx @booplex/stitch-kit
```

Or clone and run the installer manually:

```bash
git clone https://github.com/gabelul/stitch-kit.git
cd stitch-kit && bash install-codex.sh
```

Then wire up Stitch MCP in `~/.codex/config.toml`:

```toml
[mcp_servers.stitch]
url = "https://stitch.googleapis.com/mcp"

[mcp_servers.stitch.headers]
X-Goog-Api-Key = "YOUR-API-KEY"
```

Use `$stitch-kit` to invoke the agent or `$stitch-orchestrator` to run a skill directly.

## Agent definition

`agents/stitch-kit.md` defines the stitch-kit specialist agent. Works in both Claude Code and Codex. It knows the full skill set (including edit-screens, generate-variants, design systems), handles Stitch URL parsing, and routes to the right skill automatically.

## Recommended entry point

For Stitch-based UI generation, load **`stitch-orchestrator`** or invoke the **`stitch-kit` agent** — both coordinate the full workflow end-to-end. Start here unless you have a specific reason to go manual.

## Architecture (4 layers)

| Layer | Count | Purpose |
|-------|-------|---------|
| **Brain** (`stitch-ui-*`, `stitch-ideate`) | 5 | Design intelligence — ideation agent, specs, prompts, variants, UED guide |
| **Hands** (`stitch-mcp-*`) | 15 | MCP wrappers — one per Stitch API tool, handles ID format rules |
| **Conversion** | 7+ | Stitch HTML → framework components (Next.js, Svelte, React, HTML, RN, SwiftUI, shadcn) |
| **Quality** | 3 | Design tokens, accessibility audit, animations |

## MCP prerequisite

Skills marked `allowed-tools: ["stitch*:*"]` require the **Stitch MCP Server** configured in your client. Without it, the generation steps won't work.

Setup guide: https://stitch.withgoogle.com/docs/mcp/setup

All 15 Stitch MCP tools wrapped: `create_project`, `get_project`, `delete_project`, `list_projects`, `generate_screen_from_text`, `edit_screens`, `generate_variants`, `list_screens`, `get_screen`, `create_design_system`, `update_design_system`, `list_design_systems`, `apply_design_system`, `upload_design_md`, `create_design_system_from_design_md`

Without MCP: the orchestrator falls back to prompt-only mode (generates ready-to-copy Stitch prompts instead of running the full workflow — still useful, just slower).

## Key skills reference

| Skill | When to invoke |
|-------|----------------|
| `stitch-orchestrator` | "Use Stitch to design X" — handles everything |
| `stitch-ideate` | "Help me brainstorm", "ideate a UI", vague requests → conversational design agent → PRD → batch generation |
| `stitch-ui-design-spec-generator` | User request → structured JSON design spec |
| `stitch-ui-prompt-architect` | Design spec → structured Stitch prompt |
| `stitch-mcp-edit-screens` | Edit existing screens with text prompts (iteration) |
| `stitch-mcp-generate-variants` | Generate design alternatives with creativity controls |
| `stitch-mcp-create-design-system` | Create reusable Stitch Design Systems |
| `stitch-mcp-upload-design-md` | Upload a DESIGN.md into a project (pairs with the next row) |
| `stitch-mcp-create-design-system-from-design-md` | Turn an uploaded DESIGN.md into a design system |
| `stitch-mcp-apply-design-system` | Apply design systems to screens |
| `stitch-mcp-get-screen` | Retrieve screen HTML + screenshot by ID |
| `stitch-design-system` | Extract design tokens → CSS + Tailwind files |
| `stitch-nextjs-components` | Convert to Next.js 15 App Router |
| `stitch-svelte-components` | Convert to Svelte 5 / SvelteKit |
| `stitch-html-components` | Convert to HTML5 + CSS (WebView / Capacitor) |
| `stitch-react-native-components` | Convert to React Native / Expo |
| `stitch-swiftui-components` | Convert to SwiftUI (iOS) |
| `stitch-loop` | Iterative multi-page site building |
| `stitch-shadcn-ui` | Add shadcn/ui components to React output |
| `stitch-animate` | Add animations to generated components |
| `stitch-a11y` | WCAG 2.1 AA accessibility audit and fixes |
| `stitch-setup` | Install Stitch MCP + this plugin |

## Full docs reference

See [`docs/`](docs/) for:
- `skills-index.md` — complete skills table with descriptions and layers
- `mcp-schemas/` — JSON Schema for all 15 Stitch MCP tools
- `color-prompt-guide.md` — 8 ready-to-use color palette prompts for Stitch
- `tailwind-reference.md` — Tailwind utility class reference for conversions
- `mcp-naming-convention.md` — MCP tool name → skill name mapping
- `prd-to-stitch-workflow.md` — PRD-driven design workflow guide

## Context efficiency

Skills load on demand — only the relevant `SKILL.md` gets loaded per request. Resources and examples are loaded progressively when the skill needs them. Keep `SKILL.md` focused (under 500 lines) and use `references/` for detail.
