# Stitch MCP API Schemas

Formal JSON Schema definitions for all 6 Stitch MCP tools.

Each file documents the full `arguments` (input) and `outputSchema` (output) for one tool.

---

## Files

| File | Tool | Purpose |
|------|------|---------|
| `create_project.json` | `create_project` | Create a new project. Returns `projects/{id}` in `name`. |
| `get_project.json` | `get_project` | Get full project details. Input: `projects/{id}` format. |
| `list_projects.json` | `list_projects` | List owned/shared projects. Filter: `view=owned` or `view=shared`. |
| `list_screens.json` | `list_screens` | List screens in a project. Input: `projects/{id}` format. |
| `get_screen.json` | `get_screen` | Get screen HTML + screenshot. Input: **numeric IDs only**. |
| `generate_screen_from_text.json` | `generate_screen_from_text` | Generate a screen from a prompt. Input: **numeric project ID only**. |

---

## Key insights from the schemas

### DesignTheme — 28 available fonts

All tools that return design data include a `DesignTheme` object. The `font` field accepts these enum values:

**Sans-serif (modern):**
`INTER`, `GEIST`, `DM_SANS`, `MANROPE`, `PLUS_JAKARTA_SANS`, `WORK_SANS`,
`PUBLIC_SANS`, `SOURCE_SANS_THREE`, `NUNITO_SANS`, `SPACE_GROTESK`,
`BE_VIETNAM_PRO`, `LEXEND`, `EPILOGUE`, `HANKEN_GROTESK`, `SPLINE_SANS`,
`RUBIK`, `ARIMO`, `SORA`, `METROPOLIS`, `MONTSERRAT`, `IBM_PLEX_SANS`

**Serif:**
`NOTO_SERIF`, `NEWSREADER`, `DOMINE`, `LIBRE_CASLON_TEXT`, `EB_GARAMOND`,
`LITERATA`, `SOURCE_SERIF_FOUR`

### DesignTheme — roundness values

| Enum | Meaning | Use for |
|------|---------|---------|
| `ROUND_FOUR` | `border-radius: 4px` | Sharp / enterprise |
| `ROUND_EIGHT` | `border-radius: 8px` | Modern / balanced |
| `ROUND_TWELVE` | `border-radius: 12px` | Friendly / consumer |
| `ROUND_FULL` | `border-radius: 9999px` | Pill buttons |
| `ROUND_TWO` | — | **Deprecated / unused** |

### DesignTheme — saturation

Integer 1–4. Higher = more vivid colors. Default (unset) is neutral.

### generate_screen_from_text — outputComponents

The response includes `outputComponents[]`. Each item has one of:
- `text` — agent text response, return to user
- `suggestion` — follow-up prompt suggestion, present to user; if accepted, use as next prompt
- `design` — the generated design object containing `screens[]` with `theme`, `deviceType`

### generate_screen_from_text — model selection

| modelId | Description |
|---------|-------------|
| `GEMINI_3_FLASH` | Default. Faster. |
| `GEMINI_3_PRO` | Thinking model. Higher quality. Slower. |

### ScreenMetadata — agentType

`GEMINI_3_AGENT` = the Gemini 3.0 Thinking model (maps to `GEMINI_3_PRO` model selection).

### componentRegions

`generate_screen_from_text` responses include `componentRegions[]` in `screenMetadata`.
Each region has:
- `type` — `COMPONENT_TYPE_IMAGE | TEXT | BUTTON | INPUT | CONTAINER`
- `boundingBox` — `{x, y, width, height}` in pixels relative to screen dimensions
- `xpath` — XPath to locate the element in the HTML
- `description` — human-readable label

Useful for: targeted HTML extraction, component-level conversion, design audits.

---

## ID format reference (the #1 source of bugs)

| Tool | projectId format | screenId format |
|------|-----------------|----------------|
| `create_project` | — (returns `projects/NUMERIC`) | — |
| `get_project` | `projects/NUMERIC` | — |
| `list_projects` | — | — |
| `list_screens` | `projects/NUMERIC` | — |
| `get_screen` | **NUMERIC only** | **NUMERIC only** |
| `generate_screen_from_text` | **NUMERIC only** | — |

See `../mcp-naming-convention.md` for the full breakdown.
