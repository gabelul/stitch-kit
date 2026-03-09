# stitch-kit Skills Index

Quick reference — all 35 skills organized by layer and stage.

**Layers:**
- **Orchestrator** — entry point that coordinates other skills
- **Brain** — design logic, spec generation, prompt engineering
- **Execution** — Stitch MCP tool wrappers
- **Conversion** — Stitch HTML → framework components
- **Quality** — design tokens, animation, accessibility
- **Meta** — skills for extending the plugin

---

## Full skills table

| Skill | Description | Layer | Stage |
|-------|-------------|-------|-------|
| `stitch-orchestrator` | End-to-end workflow: request → spec → prompt → generate → iterate → retrieve → convert → quality | Orchestrator | All |
| `stitch-ideate` | Conversational design ideation agent — adaptive questioning → rich PRD document → auto-generate screens | Brain | Ideation |
| `stitch-ui-design-spec-generator` | User request / PRD → structured Design Spec JSON (theme, color, font, device, density) | Brain | Design input |
| `stitch-ui-prompt-architect` | Two paths: Path A (vague → enhanced) or Path B (spec + request → `[Context][Layout][Components]`) | Brain | Design input |
| `stitch-ui-design-variants` | Generate 3 alternative prompt variants for A/B design exploration. Native API detection for `generate_variants` when available. | Brain | Variants |
| `stitch-ued-guide` | Visual vocabulary, layout patterns, aesthetic styles, device constraints, color structure | Brain | Reference |
| `stitch-mcp-create-project` | Create a new Stitch project → extract numeric project ID | Execution | Setup |
| `stitch-mcp-list-projects` | List Stitch projects (owned or shared) | Execution | Discovery |
| `stitch-mcp-get-project` | Get project metadata (uses `projects/ID` format) | Execution | Discovery |
| `stitch-mcp-delete-project` | Permanently delete a Stitch project (uses `projects/ID` format, requires confirmation) | Execution | Cleanup |
| `stitch-mcp-generate-screen-from-text` | Text → UI screen (core Stitch generation — numeric ID only) | Execution | Generate |
| `stitch-mcp-upload-screens-from-images` | Import screenshots/mockups as new screens (numeric ID, base64 images) | Execution | Generate |
| `stitch-mcp-edit-screens` | Edit existing screens with text prompts — the iteration tool (numeric IDs) | Execution | Iterate |
| `stitch-mcp-generate-variants` | Generate design variants with creativity/aspect controls (numeric IDs) | Execution | Iterate |
| `stitch-mcp-list-screens` | List all screens in a project (uses `projects/ID` format) | Execution | Retrieve |
| `stitch-mcp-get-screen` | Get screen HTML + screenshot + dimensions (numeric IDs for both) | Execution | Retrieve |
| `stitch-mcp-create-design-system` | Create a reusable Stitch Design System from theme tokens | Execution | Design Systems |
| `stitch-mcp-update-design-system` | Update an existing design system (requires asset `name`) | Execution | Design Systems |
| `stitch-mcp-list-design-systems` | List available design systems (optional project filter) | Execution | Design Systems |
| `stitch-mcp-apply-design-system` | Apply a design system to screens (numeric IDs + assetId) | Execution | Design Systems |
| `stitch-nextjs-components` | Stitch HTML → Next.js 15 App Router components (TypeScript, dark mode, ARIA) | Conversion | Web |
| `stitch-svelte-components` | Stitch HTML → Svelte 5 / SvelteKit (runes, scoped CSS, transitions) | Conversion | Web |
| `stitch-html-components` | Stitch HTML → platform-agnostic HTML5 + CSS (PWA, WebView, Capacitor) | Conversion | Web |
| `stitch-react-components` | Stitch HTML → Vite + React (TypeScript, no App Router, simpler than Next.js) | Conversion | Web |
| `stitch-shadcn-ui` | Add shadcn/ui components to React apps (discovery, install, customization) | Conversion | Web |
| `stitch-react-native-components` | Stitch HTML → React Native / Expo (cross-platform iOS + Android) | Conversion | Mobile |
| `stitch-swiftui-components` | Stitch HTML → SwiftUI (native iOS, Xcode 15+) | Conversion | Mobile |
| `stitch-remotion` | Stitch screenshots → walkthrough video (Remotion, transitions, overlays) | Conversion | Video |
| `stitch-loop` | Iterative multi-page building: baton (next-prompt.md) → generate → integrate → update baton | Conversion | Multi-page |
| `stitch-design-md` | Analyze Stitch project → natural-language `DESIGN.md` with color palette, typography, atmosphere, and Section 6 Stitch prompt snippets | Quality | Design docs |
| `stitch-design-system` | Extract design tokens → `design-tokens.css` (light + dark), `tailwind-theme.css`, `DESIGN.md` | Quality | Tokens |
| `stitch-animate` | Add purposeful animation (CSS keyframes, Framer Motion, Svelte transitions, reduced-motion) | Quality | Animation |
| `stitch-a11y` | WCAG 2.1 AA audit and fixes (semantic HTML, ARIA, keyboard, focus, contrast, images) | Quality | Accessibility |
| `stitch-setup` | Install Stitch MCP + stitch-kit plugin (Claude Code / Codex CLI setup guide) | Meta | Setup |
| `stitch-skill-creator` | Factory for creating new Stitch skills (SOP, naming, template generator) | Meta | Extension |

---

## By output target

### Web apps
Next.js, Svelte, HTML, Vite+React, shadcn/ui

### Mobile apps
React Native (iOS + Android), SwiftUI (iOS only)

### Multi-page sites
`stitch-loop` — iterative baton-passing pattern

### Video
`stitch-remotion` — walkthrough from screenshots

---

## ID format quick reference

This is the most common source of bugs when calling Stitch MCP tools directly:

| Tool | projectId format | screenId format | Other IDs |
|------|-----------------|----------------|-----------|
| `create_project` | Returns `projects/NUMERIC_ID` | — | — |
| `list_projects` | — | — | — |
| `get_project` | `projects/NUMERIC_ID` | — | — |
| `delete_project` | `projects/NUMERIC_ID` | — | — |
| `generate_screen_from_text` | **Numeric only** | — | — |
| `upload_screens_from_images` | **Numeric only** | — | — |
| `edit_screens` | **Numeric only** | **Numeric array** | — |
| `generate_variants` | **Numeric only** | **Numeric array** | — |
| `list_screens` | `projects/NUMERIC_ID` | — | — |
| `get_screen` | **Numeric only** | **Numeric only** | — |
| `create_design_system` | **Numeric only** (optional) | — | Returns Asset `name` |
| `update_design_system` | — | — | Asset `name` required |
| `list_design_systems` | **Numeric only** (optional) | — | Returns Asset names |
| `apply_design_system` | **Numeric only** | **Numeric array** | `assetId` required |

**Rules of thumb:**
- **Read operations** (`get_project`, `list_screens`, `delete_project`) → `projects/ID` full path
- **Generation/mutation** (`generate_screen_from_text`, `edit_screens`, `generate_variants`, `upload_screens_from_images`, `apply_design_system`) → numeric only
- **Design system operations** → numeric `projectId` (optional), asset `name` for identity

See `mcp-naming-convention.md` for full details.

---

## References

- `mcp-naming-convention.md` — ID format rules
- `mcp-schemas/` — Formal JSON Schema definitions for all 14 Stitch MCP tools (fonts, roundness, componentRegions, outputComponents, variantOptions, designSystems)
- `color-prompt-guide.md` — 8 ready-to-use color palettes for Stitch prompts
- `tailwind-reference.md` — Tailwind utility class reference for conversions
- `prd-to-stitch-workflow.md` — PRD-driven design workflow
