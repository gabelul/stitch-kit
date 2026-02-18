# PRD → Stitch Workflow

How to go from a Product Requirements Document (or a rough idea) to production-ready components using this plugin.

---

## Input formats

The plugin accepts three levels of input richness:

| Input | Best path |
|-------|-----------|
| Full PRD document (feature overview, page list, key interactions) | PRD-driven workflow (all steps) |
| Rough description ("a SaaS dashboard with analytics") | Spec-first workflow (Steps 1–2, then generate) |
| Existing Stitch design (you already have project/screen IDs) | Export-only (skip to Step 4) |

---

## PRD structure that works best with Stitch

You don't need a perfect PRD — but these sections improve output quality:

| PRD section | How it's used |
|-------------|---------------|
| **Feature overview / domain** | Informs theme, color, and style (e.g. "healthcare" → clean + trustworthy, "creative tool" → bold + colorful) |
| **Page / screen list** | Determines how many Stitch screens to generate and in what order |
| **Key interactions** | Drives navigation type (tab bar vs. stack), form complexity, state handling (loading, error) |
| **Visual / brand preferences** | Feeds directly into `stitch-ui-design-spec-generator` and `stitch-ui-prompt-architect` |

---

## Full PRD-driven workflow

### Step 1 — Design Spec (`stitch-ui-design-spec-generator`)

**Input:** PRD or user request
**Output:** JSON design spec

```json
{
  "theme": "LIGHT",
  "primaryColor": "#6366F1",
  "font": "modern sans-serif",
  "roundness": "medium",
  "density": "comfortable",
  "designMode": "HIGH_FIDELITY",
  "deviceType": "DESKTOP",
  "styleKeywords": ["clean", "professional", "data-rich"]
}
```

### Step 2 — Stitch Prompt (`stitch-ui-prompt-architect`)

**Input:** Design Spec JSON + specific page/screen request
**Output:** Structured `[Context] [Layout] [Components]` prompt

For a PRD with multiple screens, run this step once per screen.

### Step 3 — Create Project (`stitch-mcp-create-project`)

Create a single Stitch project for all screens from this PRD. One project = one design system.

### Step 4 — Generate Screens (`stitch-mcp-generate-screen-from-text`)

Generate each screen defined in the PRD's page list. Do them sequentially to avoid race conditions.

For design consistency across screens: after generating the first screen, run `stitch-design-system` to extract tokens, then include the token summary in every subsequent prompt.

### Step 5 — Retrieve Assets (`stitch-mcp-get-screen`)

For each screen: get `htmlCode.downloadUrl` + `screenshot.downloadUrl`. Download via:

```bash
bash scripts/fetch-stitch.sh "[htmlCode.downloadUrl]" "temp/screen-name.html"
```

### Step 6 — Extract Design Tokens (`stitch-design-system`)

Run once after the first screen is downloaded. Generates:
- `design-tokens.css` — CSS variables for light + dark mode
- `tailwind-theme.css` — Tailwind v4 `@theme` block
- `DESIGN.md` — extended design system documentation

Use the `DESIGN.md` Section 6 in all subsequent Stitch prompts to maintain consistency.

### Step 7 — Convert to Code

Choose your output target:

**Web:**
- `stitch-nextjs-components` — Next.js 15 App Router
- `stitch-svelte-components` — Svelte 5 / SvelteKit
- `stitch-react-components` — Vite + React (simpler, no App Router)
- `stitch-html-components` — HTML5 + CSS (PWA, WebView, Capacitor)

**Mobile:**
- `stitch-react-native-components` — Expo, iOS + Android
- `stitch-swiftui-components` — SwiftUI, iOS only

**Enrich with:**
- `stitch-shadcn-ui` — add shadcn/ui components to React output
- `stitch-animate` — animations and transitions
- `stitch-a11y` — WCAG 2.1 AA audit and fixes

### Step 8 (Multi-page) — Iterate with `stitch-loop`

For sites with 5+ screens, use the baton-passing loop instead of manual repetition:

```
DESIGN.md → next-prompt.md → stitch-loop → integrate → update next-prompt.md → repeat
```

---

## Quick reference: which skill for which task

| Task | Skill |
|------|-------|
| "Turn this PRD into a design" | `stitch-orchestrator` → handles all steps |
| "I need a color palette" | `docs/color-prompt-guide.md` → pick a palette |
| "Make 3 design directions" | `stitch-ui-design-variants` |
| "Keep all screens consistent" | `stitch-design-system` first, then include `DESIGN.md` in every prompt |
| "Build 10+ pages" | `stitch-loop` |
| "Add forms and dialogs" | `stitch-shadcn-ui` (React) |
| "Check accessibility" | `stitch-a11y` |
| "Make a walkthrough video" | `stitch-remotion` |

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Generating all screens before extracting tokens | Run `stitch-design-system` after screen 1; use DESIGN.md in all subsequent prompts |
| Different visual styles across screens | Include DESIGN.md Section 6 in every Stitch prompt |
| Using `projects/ID` format with `generate_screen_from_text` | Use numeric ID only — see `mcp-naming-convention.md` |
| Converting a DESKTOP design to React Native | Always check `deviceType` from `get_screen` response; regenerate with MOBILE if needed |
