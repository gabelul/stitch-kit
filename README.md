# stitch-kit — Give your coding agent design superpowers

Coding agents are incredible at building software. But ask Claude Code or Codex to *design* a UI and you get gray boxes with blue buttons. Meanwhile, Google's [Stitch](https://stitch.withgoogle.com) generates stunning, pixel-perfect screens from text — but it's just a raw MCP tool. No coding agent knows how to use it well.

stitch-kit bridges the gap. It's a skill set that teaches AI coding agents how to think about design, use Stitch's full power, and turn the results into production code. Ideation, visual research, prompt engineering, multi-screen generation, design systems, iteration — and then conversion to real framework components when you're ready to ship.

**The result:** You describe what you want. Your agent researches trends, proposes design directions, generates a full PRD, creates all the screens in Stitch (up to 10 per batch), iterates until it's right, and converts to production Next.js, Svelte, React, React Native, SwiftUI, or HTML. The whole pipeline, from "I have a vague idea" to shippable code.

35 skills. Works in Claude Code, Codex CLI, and any agent that supports MCP.

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

The NPX installer sets up the agent and MCP. For the full skill set (ideation, prompt engineering, design systems, iteration, framework conversion), also install the plugin inside Claude Code:

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

**The problem:** Stitch MCP is powerful but raw. Agents send it bad prompts, mess up ID formats, generate one screen at a time, and have no design taste. The output is HTML with no framework structure, no dark mode, no accessibility.

**What stitch-kit does:**

1. **Think** — `stitch-ideate` researches trends, analyzes competitors, and proposes 3 design directions with color palettes, typography, and mood. It does the design thinking your coding agent can't.
2. **Generate** — `stitch-orchestrator` turns the design direction into a structured prompt, sends the full PRD to Stitch, and batch-generates up to 10 screens in one call. Handles all the MCP quirks (ID formats, timeouts, continuation loops) automatically.
3. **Iterate** — Edit screens with text prompts, generate variants, apply design systems for consistency across screens. The agent knows when to use each tool.
4. **Ship** — Convert to production components with dark mode, TypeScript, design tokens, and ARIA. Not a code dump — structured framework components you'd actually commit.

There's an agent definition (`agents/stitch-kit.md`) for both Claude Code and Codex — a Stitch-aware agent that knows the full skill set, routes to the right tool, and doesn't hallucinate MCP names.

---

## Architecture

Five layers. Each one solves a real problem agents have with Stitch.

| Layer | Skills | What problem it solves |
|-------|--------|----------------------|
| **Orchestrator** | `stitch-orchestrator` | Agents don't know when to ideate vs. generate vs. iterate. The orchestrator scores request specificity and routes automatically. |
| **Brain** (`stitch-ideate`, `stitch-ui-*`) | 5 skills | Agents write terrible Stitch prompts. The brain layer does design research, builds structured specs, and engineers prompts that produce quality output. |
| **MCP Wrappers** (`stitch-mcp-*`) | 14 skills | Stitch uses inconsistent ID formats across tools (numeric vs `projects/ID`). Agents get this wrong constantly. Wrappers bake the rules in. |
| **Conversion** | 9 skills | Stitch outputs raw HTML. These skills convert to production Next.js, Svelte, React, React Native, SwiftUI, or HTML with dark mode, tokens, and TypeScript. |
| **Quality** | 4 skills | Generated UIs lack accessibility, animation, and design consistency. Quality skills add WCAG compliance, motion, and cross-screen visual coherence. |

**Why do the MCP wrappers matter?** Because `generate_screen_from_text` wants `"3780309359108792857"` while `list_screens` wants `"projects/3780309359108792857"` — and every agent gets this wrong. It's a small thing that ruins a lot of runs.

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

The [official repo](https://github.com/google-labs-code/stitch-skills) gives agents basic Stitch capabilities — enhance a prompt, convert to React, make a video. stitch-kit gives agents the full design-to-ship pipeline: ideation, research, multi-screen generation, iteration, design systems, and conversion to 7 frameworks. 6 skills vs. 35.

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
- `stitch-ideate` (conversational design agent — researches trends, proposes directions, produces PRDs, batch-generates screens)
- `stitch-orchestrator` (end-to-end coordinator with ideation gate + post-generation iteration loop)
- `stitch-ui-design-spec-generator` (structured spec first, then prompt — better output than pure prompt enhancement)
- Mobile: `stitch-react-native-components` + `stitch-swiftui-components`
- `stitch-design-system` (token extraction → CSS custom properties)
- `stitch-a11y` (WCAG audit + auto-fixes)
- `stitch-animate` (motion with `prefers-reduced-motion` handled)
- `stitch-skill-creator` (if you want to extend it)

---

## Ship to any framework

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
