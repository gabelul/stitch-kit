# AGENTS.md

Guidance for Claude Code, Cursor, Copilot, Codex CLI, and other AI agents working with this plugin.

## What this repo is

A collection of Claude Code **skills** — packaged instructions and scripts that extend AI agents with Stitch-specific capabilities: text-to-UI generation, design system extraction, and multi-framework conversion. Think of it as a Stitch co-pilot that knows all the footguns so you don't have to learn them the hard way.

## Skill structure

Each skill directory follows the Agent Skills standard:

```
skills/{skill-name}/
├── SKILL.md              ← Required: activation instructions and workflow
├── examples/             ← Required: worked examples (gold-standard reference)
├── resources/            ← Optional: templates, checklists, mapping tables
├── scripts/              ← Optional: bash scripts (fetch-stitch.sh, etc.)
└── references/           ← Optional: style guides, contracts
```

- **SKILL.md**: YAML frontmatter (`name`, `description`, `allowed-tools`) + markdown instructions
- **examples/**: Load for few-shot context when needed
- **resources/**, **scripts/**: Progressive disclosure — reference only when relevant

## Installing (Claude Code)

```bash
/plugin marketplace add https://github.com/gabelul/stitch-kit.git
/plugin install stitch-kit@stitch-kit
```

## Installing (Codex CLI)

```bash
git clone https://github.com/gabelul/stitch-kit.git
cd stitch-kit && bash install-codex.sh
```

Symlinks all skills into `~/.agents/skills/` and the agent definition into `~/.agents/agents/`. Then add Stitch MCP to `~/.codex/config.toml`:

```toml
[mcp_servers.stitch]
command = "npx"
args = ["-y", "@google/stitch-mcp"]
```

Use `$stitch-kit` to invoke the agent or `$stitch-orchestrator` to run a skill directly.

## Agent definition

`agents/stitch-kit.md` defines the stitch-kit specialist agent. Works in both Claude Code and Codex. It knows the full skill set, handles Stitch URL parsing, and routes to the right skill automatically — useful as an entry point when you don't want to invoke skills manually.

## Recommended entry point

For Stitch-based UI generation, load **`stitch-orchestrator`** or invoke the **`stitch-kit` agent** — both coordinate the full workflow end-to-end. Start here unless you have a specific reason to go manual.

## MCP prerequisite

Skills marked `allowed-tools: ["stitch*:*"]` require the **Stitch MCP Server** configured in your client. Without it, the generation steps won't work.

Setup guide: https://stitch.withgoogle.com/docs/mcp/guide/

Required tools: `create_project`, `generate_screen_from_text`, `get_screen`, `list_screens`, `list_projects`

Without MCP: the orchestrator falls back to prompt-only mode (generates ready-to-copy Stitch prompts instead of running the full workflow — still useful, just slower).

## Key skills reference

| Skill | When to invoke |
|-------|----------------|
| `stitch-orchestrator` | "Use Stitch to design X" — handles everything |
| `stitch-ui-design-spec-generator` | User request → structured JSON design spec |
| `stitch-ui-prompt-architect` | Design spec → structured Stitch prompt |
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
- `color-prompt-guide.md` — 8 ready-to-use color palette prompts for Stitch
- `tailwind-reference.md` — Tailwind utility class reference for conversions
- `mcp-naming-convention.md` — MCP tool name → skill name mapping
- `prd-to-stitch-workflow.md` — PRD-driven design workflow guide

## Context efficiency

Skills load on demand — only the relevant `SKILL.md` gets loaded per request. Resources and examples are loaded progressively when the skill needs them. Keep `SKILL.md` focused (under 500 lines) and use `references/` for detail.
