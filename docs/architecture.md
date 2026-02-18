# stitch-kit Architecture

How the skills are organized and why. The short version: there are 4 layers, each with a specific job, and the MCP wrappers exist because the Stitch API has inconsistent ID format requirements that break agent runs.

---

## The four layers

```
stitch-kit
├── Brain    (stitch-ui-*)      — design logic, no API calls
├── Hands    (stitch-mcp-*)     — MCP execution, one skill per tool
├── Quality  (stitch-design-*, stitch-animate, stitch-a11y)
└── Loop     (stitch-loop, stitch-design-md)
```

---

### Brain (`stitch-ui-*`)

Pure design intelligence. These skills handle spec generation and prompt engineering without making any Stitch API calls — so they're free to run and fast to iterate on.

| Skill | What it does |
|-------|-------------|
| `stitch-ui-design-spec-generator` | Turns a vague request or PRD into a structured Design Spec JSON (theme, color, font, device, density). This spec is the contract that feeds the prompt architect. |
| `stitch-ui-prompt-architect` | **Two modes:** (A) vague idea → enhanced Stitch prompt; (B) Design Spec + request → structured `[Context][Layout][Components]` prompt. Mode B is what you want for reliable results — it gives Stitch much more to work with. |
| `stitch-ui-design-variants` | Generates 3 alternative prompt variants for A/B exploration. Useful when you want to explore before committing to one direction. |
| `stitch-ued-guide` | Visual vocabulary reference — layout patterns, aesthetic styles, device constraints, color structure. Loaded by other skills on demand to save context. |

---

### Hands (`stitch-mcp-*`)

One skill per Stitch MCP tool. The wrappers exist because the raw Stitch API is inconsistent about ID formats and agents get this wrong constantly.

**The ID format problem:**

| Tool | projectId format | screenId format |
|------|-----------------|----------------|
| `create_project` | Returns `projects/NUMERIC_ID` | — |
| `list_projects` | — | — |
| `get_project` | `projects/NUMERIC_ID` | — |
| `generate_screen_from_text` | **Numeric only** | — |
| `list_screens` | `projects/NUMERIC_ID` | — |
| `get_screen` | **Numeric only** | **Numeric only** |

`generate_screen_from_text` and `get_screen` need bare numbers. `get_project` and `list_screens` need the `projects/` prefix. There's no obvious reason for the inconsistency — you just have to know. The wrappers bake this in so the orchestrator doesn't have to handle it inline.

Naming convention: MCP tool name with underscores replaced by hyphens, prefixed with `stitch-mcp-`. So `get_screen` → `stitch-mcp-get-screen`. Full mapping in [mcp-naming-convention.md](mcp-naming-convention.md).

---

### Quality

Skills that run after generation, before you ship anything.

| Skill | What it does |
|-------|-------------|
| `stitch-design-system` | Extracts design tokens from Stitch output → `design-tokens.css` with CSS custom properties for light + dark mode. Also outputs `tailwind-theme.css`. |
| `stitch-design-md` | Analyzes a Stitch project → `DESIGN.md` with color palette, typography, atmosphere, and Section 6 (Stitch prompt snippets so the next screen matches the first). |
| `stitch-animate` | Adds purposeful animation — CSS keyframes, Framer Motion, or Svelte transitions. Handles `prefers-reduced-motion` automatically. |
| `stitch-a11y` | WCAG 2.1 AA audit and auto-fixes: semantic HTML, ARIA labels, keyboard navigation, focus indicators, color contrast, image alt text. |

---

### Loop

For multi-page sites where visual consistency matters. The core problem: each Stitch generation is independent, so screen 5 can look nothing like screen 1 unless you explicitly carry design state forward.

The pattern:
1. Generate a screen
2. `stitch-design-md` analyzes it → produces `DESIGN.md`
3. `DESIGN.md` feeds back into the next Stitch prompt via the prompt architect
4. Repeat — every subsequent screen inherits the visual system

`stitch-loop` automates this with `next-prompt.md` (carries context from the previous screen) and `SITE.md` (tracks the overall site map).

---

## The orchestrator

`stitch-orchestrator` is the single entry point. Describe what you want to build — it coordinates the full pipeline:

```
request → spec (Brain) → prompt (Brain) → generate (Hands) → retrieve (Hands) → tokens (Quality) → convert → [animate / a11y]
```

`agents/stitch-kit.md` wraps this into a persistent agent definition for Claude Code and Codex — a Stitch specialist that routes to the right skill, knows the ID format rules, and handles Stitch URL parsing.

---

## Skill directory structure

Each skill has the same layout:

```text
skills/[skill-name]/
├── SKILL.md        — name, description, when to use it, instructions
├── examples/       — real examples the agent copies instead of guessing
├── references/     — design contracts, checklists, style guides (on-demand)
└── scripts/        — fetch helpers, validators, code generators
```

**Why this matters:**

`SKILL.md` is what the agent reads. The YAML frontmatter declares the skill's name, description (used for discovery), and optionally `allowed-tools` to restrict which tools it can invoke while active.

`examples/` is the quality multiplier. Agents copy concrete patterns instead of generating boilerplate from scratch — this is why the framework conversion output is consistent instead of creative. `fetch-stitch.sh` in `scripts/` downloads Stitch HTML before the GCS URL expires (TTL is short, and the agent can't know in advance when it'll expire).

`references/` is loaded on demand. Design contracts, official docs, checklists that are only needed at specific pipeline stages don't eat context window by default.

---

## Why stitch-kit instead of just the official skills

The [official Google Stitch Skills repo](https://github.com/google-labs-code/stitch-skills) has 6 skills. They're solid but they don't coordinate, don't handle ID formats, and don't cover the full pipeline from spec to production component. stitch-kit wraps every official skill (and improves each one), adds the orchestration layer, adds the MCP wrappers that actually make the API reliable to call, and adds the quality layer that gets you from raw Stitch output to shippable code.

See [README.md](../README.md#vs-the-official-google-stitch-skills) for the full comparison table.
