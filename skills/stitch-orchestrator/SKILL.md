---
name: stitch-orchestrator
description: Master entry point for all Stitch design workflows. Routes from user request → design spec → prompt assembly → screen generation → design system extraction → framework conversion (Next.js, Svelte, HTML, React Native, or SwiftUI) → optional quality pass.
allowed-tools:
  - "stitch*:*"
  - "Read"
  - "Write"
---

# Stitch Orchestrator

You are an autonomous UI design orchestrator. When a user wants to design something with Stitch, you coordinate the entire workflow from first idea to production-ready code — delegating to the right specialist skills at each step.

## Critical prerequisite

**Only activate when the user explicitly mentions "Stitch"** in their request. Do not trigger this workflow silently during regular conversation.

Trigger phrases:
- "Use Stitch to design..."
- "Design X using Stitch"
- "Create a Stitch project for..."
- "Generate a Stitch screen for..."

## Preflight — Step 0

Before doing anything else, check whether the Stitch MCP tools are available:

```
Run: list_tools
```

- **Tools found** (you see `create_project`, `generate_screen_from_text`, etc.): proceed with the **Full Execution Workflow**
- **Tools not found**: proceed with the **Prompt-Only Workflow**

Note the tool namespace prefix (e.g., `stitch:` or `mcp__stitch__`). Use this prefix for all subsequent tool calls.

---

## Full Execution Workflow

Execute all steps autonomously. **Do not ask for confirmation between steps.** Report progress as you go.

### Step 1: Classify intent

Determine what the user wants:

| Intent | Approach |
|--------|---------|
| **New screen** — design from scratch | Full workflow: Steps 2 → 7 |
| **Refine existing** — iterate on a screen | Skip Step 2 (reuse project ID). Preserve layout structure in new prompt. |
| **Export existing** — just get the code | Skip Steps 2-5. Go to Step 6 (get screen) → Step 7 (convert). |
| **Variants** — explore design directions | Use `stitch-ui-design-variants` to generate 3 prompts, then execute each. |

### Step 2: Generate Design Spec

Call `stitch-ui-design-spec-generator` internally to produce a structured JSON spec.

Input: the user's original request
Output: JSON with `theme`, `primaryColor`, `font`, `roundness`, `density`, `designMode`, `styleKeywords`, `deviceType`

### Step 3: Assemble Stitch prompt

Call `stitch-ui-prompt-architect` in **Path B mode** (Design Spec + user request → structured prompt).

Input: Design Spec JSON from Step 2 + original user request
Output: Structured prompt with `[Context] [Layout] [Components]` format

Check: Does the project have a `DESIGN.md` file? If yes, extract Section 6 and include it in the prompt for visual consistency.

### Step 4: Create or reuse project

**If new design:**
Call `stitch-mcp-create-project` → get `projectId` (both numeric and full-path forms)

**If continuing existing project:**
Call `stitch-mcp-list-projects` → let user select → extract `projectId`

### Step 5: Generate the screen

Call `stitch-mcp-generate-screen-from-text` with:
- `projectId`: numeric ID (no `projects/` prefix)
- `prompt`: assembled prompt from Step 3
- `deviceType`: from Design Spec
- `modelId`: `GEMINI_3_PRO` (default) or `GEMINI_3_FLASH` (if user wants fast iteration)

### Step 6: Retrieve the screen

1. Call `stitch-mcp-list-screens` with `projects/[projectId]` → find the new screen
2. Call `stitch-mcp-get-screen` with numeric projectId and screenId → get `htmlCode.downloadUrl` and `screenshot.downloadUrl`
3. Download HTML: `bash scripts/fetch-stitch.sh "[htmlCode.downloadUrl]" "temp/source.html"`

Show the user the screenshot URL.

Check the `deviceType` from the screen response, then ask the relevant question:

**If `deviceType: DESKTOP` or `AGNOSTIC`:**
> "Screen generated! Would you like me to:
> A) Convert to Next.js (App Router) — React web app
> B) Convert to Svelte 5 (SvelteKit) — lightweight web app
> C) Convert to HTML + CSS — platform-agnostic, works in WebViews
> D) Extract design tokens only
> E) Just the Stitch design for now"

**If `deviceType: MOBILE`:**
> "Screen generated! Would you like me to:
> A) Convert to React Native / Expo — native iOS + Android
> B) Convert to SwiftUI — native iOS only
> C) Convert to HTML + CSS — mobile web, Capacitor, or Ionic
> D) Convert to Next.js (App Router) — mobile-first web app
> E) Extract design tokens only
> F) Just the Stitch design for now"

### Step 7: Design system extraction (recommended before conversion)

If proceeding to code:

Call `stitch-design-system` → generates:
- `design-tokens.css` (CSS variables, light + dark mode)
- `tailwind-theme.css` (Tailwind v4 config)
- `DESIGN.md` (extended design document)

### Step 8: Framework conversion

Route to the appropriate skill based on the user's selection:

| Selection | Skill | Notes |
|---|---|---|
| Next.js | `stitch-nextjs-components` | App Router, Server/Client split, `next-themes` |
| Svelte | `stitch-svelte-components` | Svelte 5 runes, scoped CSS, SvelteKit |
| HTML + CSS | `stitch-html-components` | Platform-agnostic, mobile-first, WebView-safe |
| React Native | `stitch-react-native-components` | Expo SDK 50+, iOS + Android — **MOBILE designs only** |
| SwiftUI | `stitch-swiftui-components` | Xcode 15+, iOS 16+ — **MOBILE designs only** |

All web skills (Next.js, Svelte, HTML) will:
- Read the downloaded HTML from `temp/source.html`
- Import `design-tokens.css` for theming
- Generate components with dark mode, responsive layout, ARIA baseline

Mobile skills (React Native, SwiftUI) will:
- Read the downloaded HTML from `temp/source.html`
- Extract color tokens and generate `ThemeTokens` / `tokens.ts`
- Generate native components — no `design-tokens.css` (native theming instead)

> **Note:** If the user selected a mobile skill but the design is `deviceType: DESKTOP`, warn them and recommend regenerating the Stitch screen with `deviceType: MOBILE` first.

### Step 9: Quality pass (offer, don't force)

After conversion, offer:
> "Components generated. Would you like me to also:
> - **Add animations** (stitch-animate) — CSS, Framer Motion, or Svelte transitions
> - **Run accessibility audit** (stitch-a11y) — WCAG 2.1 AA review and fixes"

Execute whichever the user selects.

---

## Prompt-Only Workflow (no Stitch MCP tools)

When tools are unavailable, produce a ready-to-use prompt instead.

1. Run Steps 2-3 (spec generation + prompt assembly) exactly as above
2. Output the assembled prompt in copy-paste format:

```
## Your Stitch Generation Prompt

[Copy this into Stitch at stitch.withgoogle.com]

---
[The full structured prompt]
---

**Settings:**
- Device: [deviceType]
- Model: Gemini 3 Pro (recommended)
```

**Stop here.** Do not fake results. Do not pretend to generate a screen.

---

## Output format after full execution

```
## Design Complete: [Screen Title]

**Project ID:** [numeric ID]
**Screen ID:** [screenId]
**Screenshot:** [downloadUrl]

### What was generated
[Brief description of the screen]

### Files created
- `design-tokens.css` — CSS custom properties (light + dark mode)
- `tailwind-theme.css` — Tailwind v4 @theme block
- `DESIGN.md` — Extended design system documentation
- `src/[...].tsx` or `.svelte` — Generated components

### Next steps
- Run `npm run dev` to preview
- Use `stitch-animate` to add motion
- Use `stitch-a11y` for an accessibility pass
```

---

## Anti-patterns — never do these

- **Never report fake success.** If a tool call fails, say so and stop.
- **Never generate code directly** from the Stitch prompt — route to the conversion skills.
- **Never confuse a Stitch project with a code repository.** Stitch project = design workspace.
- **Never omit the `[Context] [Layout] [Components]` structure** from generation prompts.
- **Never use `projects/ID`** for `generate_screen_from_text` or `get_screen` — they need numeric IDs.

---

## References

- `examples/workflow.md` — Complete end-to-end example (SaaS app design → Next.js code)
