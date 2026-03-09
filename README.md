# stitch-kit — AI UI design to production code, for Claude Code and Codex

The Claude Code plugin for AI UI design — generate screens with Stitch MCP and convert them to something you can actually ship.

I built this because Stitch MCP generates beautiful screens, and then... you're on your own. The raw output is HTML. Getting it into Next.js with dark mode, proper TypeScript, design tokens, and accessibility? That's the part nobody talks about. So I built the pipeline that handles it.

35 skills. One entry point. Covers the full trip from "describe a UI" to production-ready components in Next.js, Svelte, React, React Native, SwiftUI, or plain HTML. Works in Claude Code and Codex CLI.

---

## Install

### Quick install (recommended)

```bash
npx @booplex/stitch-kit
```

This single command handles everything:
- Auto-detects Claude Code and/or Codex CLI
- Installs the agent definition and skills
- **Configures Stitch MCP automatically** (the Google generation API)
- Checks for the Claude Code plugin and tells you how to add it

To update:  (npx always fetches the latest).
```bash
npx @booplex/stitch-kit update
```

To check status: 
```bash
npx @booplex/stitch-kit status.
```

After installing, sign in at [stitch.withgoogle.com](https://stitch.withgoogle.com) to complete Google auth.

### Claude Code plugin (optional, adds skills)

The NPX installer sets up the agent and MCP. For full skill support (prompt engineering, design tokens, framework conversion), also install the plugin inside Claude Code:

```bash
/plugin marketplace add https://github.com/gabelul/stitch-kit.git
/plugin install stitch-kit@stitch-kit
```

The agent works standalone with MCP tools, but skills add structured workflows for better output quality.

### Manual setup (if you prefer)

<details>
<summary>Claude Code — manual steps</summary>

```bash
# 1. Add Stitch MCP (remote HTTP server — needs API key from stitch.withgoogle.com/settings)
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
  --header "X-Goog-Api-Key: YOUR-API-KEY" -s user

# 2. Install the plugin (inside Claude Code)
/plugin marketplace add https://github.com/gabelul/stitch-kit.git
/plugin install stitch-kit@stitch-kit
```
</details>

<details>
<summary>Codex CLI — manual steps</summary>

```bash
git clone https://github.com/gabelul/stitch-kit.git
cd stitch-kit && bash install-codex.sh
```

Then add Stitch MCP to `~/.codex/config.toml`:

```toml
[mcp_servers.stitch]
url = "https://stitch.googleapis.com/mcp"

[mcp_servers.stitch.headers]
X-Goog-Api-Key = "YOUR-API-KEY"
```

Get your API key at [stitch.withgoogle.com/settings](https://stitch.withgoogle.com/settings).

Use `$stitch-kit` to activate the agent or `$stitch-orchestrator` for the full pipeline.
</details>

---

## How it works

1. You describe what you want to build (or let `stitch-ideate` help you figure it out through conversation)
2. `stitch-orchestrator` handles: ideate → spec → prompt → generate → retrieve → tokens → convert
3. You get TypeScript components with dark mode, responsive layout, and ARIA — not vibes

There's an agent definition (`agents/stitch-kit.md`) for both Claude Code and Codex — a Stitch-aware agent that knows the ID format quirks, routes to the right skill, and doesn't hallucinate MCP tool names.

---

## Architecture

Four layers. Each one exists for a reason.

| Layer | What it is | What it does |
|-------|------------|-------------|
| **Brain** (`stitch-ui-*`, `stitch-ideate`) | Design intelligence | Ideation agent, spec generation, prompt engineering, design variants. No API calls, no cost. |
| **Hands** (`stitch-mcp-*`) | MCP wrappers | One skill per Stitch API tool (all 14). Handles the ID format mess so the orchestrator doesn't have to. |
| **Quality** | Post-gen polish | Design tokens → CSS vars, WCAG 2.1 AA audit, animations with reduced-motion. |
| **Loop** | Multi-page builds | `DESIGN.md` carries visual state between screens so your 5th screen looks like your 1st. |

**Why do the MCP wrappers exist?** Because `generate_screen_from_text` and `get_screen` want numeric IDs, while `get_project` and `list_screens` want `projects/ID` — and agents get this wrong constantly. The wrappers bake the rules in so you don't have to think about it. (It's a small thing that ruins a lot of runs.)

Details → [docs/architecture.md](docs/architecture.md)

---

## What's in each skill

```
skills/[skill-name]/
├── SKILL.md        — what it is, when to use it, how to run it
├── examples/       — real examples the agent can copy instead of guess
├── references/     — design contracts, checklists (loaded on demand)
└── scripts/        — fetch helpers, validators, code generators
```

Every skill tells the agent what it does and when to reach for it. The examples folder is why output quality is consistent — agents copy real patterns instead of hallucinating boilerplate. The scripts handle the stuff that needs to actually run (like downloading Stitch HTML before the GCS URL expires).

---

## vs. the official Google Stitch Skills

The [official repo](https://github.com/google-labs-code/stitch-skills) has 6 skills. stitch-kit has 34. Every official skill has a local equivalent that's stronger:

| Official | stitch-kit | What's different |
|----------|-----------|-----------------|
| `design-md` | `stitch-design-md` | Adds Section 6 — design system notes that feed back into Stitch prompts for consistent multi-screen output |
| `enhance-prompt` | `stitch-ui-prompt-architect` | Two modes: (A) vague → enhanced, same as official; (B) Design Spec + request → structured `[Context][Layout][Components]` prompt. Mode B produces significantly better results. |
| `stitch-loop` | `stitch-loop` | Visual verification step, explicit MCP naming throughout, DESIGN.md integration |
| `react-components` | `stitch-react-components` | MCP-native retrieval, optional DESIGN.md alignment |
| `remotion` | `stitch-remotion` | Common patterns (slideshow, feature highlight, user flow), voiceover, dynamic text |
| `shadcn-ui` | `stitch-shadcn-ui` | Init styles support, custom registries, validation checklist |

**What's entirely new in stitch-kit:**
- `stitch-mcp-*` wrappers — all 14 Stitch API tools wrapped with ID format safety
- `stitch-mcp-edit-screens` — iterate on designs with text prompts without regenerating
- `stitch-mcp-generate-variants` — native variant generation with creativity controls
- `stitch-mcp-upload-screens-from-images` — import screenshots for redesign workflows
- `stitch-mcp-create/update/list/apply-design-system` — full Stitch Design System lifecycle
- `stitch-mcp-delete-project` — project cleanup with confirmation gate
- `stitch-orchestrator` (end-to-end coordinator with post-generation iteration loop)
- `stitch-ui-design-spec-generator` (structured spec first, then prompt — better output than pure prompt enhancement)
- Mobile: `stitch-react-native-components` + `stitch-swiftui-components`
- `stitch-design-system` (token extraction → CSS custom properties)
- `stitch-a11y` (WCAG audit + auto-fixes)
- `stitch-animate` (motion with `prefers-reduced-motion` handled)
- `stitch-skill-creator` (if you want to extend it)

---

## Output targets

| Target | Skill | Notes |
|--------|-------|-------|
| Next.js 15 App Router | `stitch-nextjs-components` | Server/Client split, `next-themes`, TypeScript strict |
| Svelte 5 / SvelteKit | `stitch-svelte-components` | Runes API, scoped CSS, built-in transitions |
| Vite + React | `stitch-react-components` | `useTheme()` hook, Tailwind, no App Router |
| HTML5 + CSS | `stitch-html-components` | No build step — PWA, WebView, Capacitor ready |
| shadcn/ui | `stitch-shadcn-ui` | Radix primitives, token alignment with Stitch |
| React Native / Expo | `stitch-react-native-components` | iOS + Android, `useColorScheme`, safe areas |
| SwiftUI | `stitch-swiftui-components` | iOS 16+, `@Environment(\.colorScheme)`, 44pt targets |

---

## Full skill reference

All 35 skills with descriptions, layers, and the ID format table → [docs/skills-index.md](docs/skills-index.md)

MCP API schemas (JSON Schema for all 14 Stitch tools) → [docs/mcp-schemas/](docs/mcp-schemas/)

---

## Prerequisites

- Stitch MCP — [setup guide](https://stitch.withgoogle.com/docs/mcp/setup) (Google account + API key required)
- Node.js for web framework conversions
- Xcode 15+ for SwiftUI, Expo CLI for React Native

---

Built with AI by Gabi @ [Booplex.com](https://booplex.com) — Apache 2.0
