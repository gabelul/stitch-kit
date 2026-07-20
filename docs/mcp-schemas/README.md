# Stitch MCP API Schemas

Formal JSON Schema definitions for the 15 Stitch MCP tools this repo wraps.

Each file documents the full `arguments` (input) and `outputSchema` (output) for one tool.

---

## Files

### Project management

| File | Tool | Purpose |
|------|------|---------|
| `create_project.json` | `create_project` | Create a new project. Returns `projects/{id}` in `name`. |
| `get_project.json` | `get_project` | Get full project details. Input: `projects/{id}` format. |
| `list_projects.json` | `list_projects` | List owned/shared projects. Filter: `view=owned` or `view=shared`. |
| `delete_project.json` | `delete_project` | Permanently delete a project. Input: `projects/{id}` format. Irreversible. |

### Screen operations

| File | Tool | Purpose |
|------|------|---------|
| `generate_screen_from_text.json` | `generate_screen_from_text` | Generate a screen from a prompt. Input: **numeric project ID only**. |
| `edit_screens.json` | `edit_screens` | Edit existing screens with text prompts. Input: **numeric IDs only**. |
| `generate_variants.json` | `generate_variants` | Generate design variants. Input: **numeric IDs**, variant options. |
| `list_screens.json` | `list_screens` | List screens in a project. Input: `projects/{id}` format. |
| `get_screen.json` | `get_screen` | Get screen HTML + screenshot. Input: **numeric IDs only**. |

### Design systems

| File | Tool | Purpose |
|------|------|---------|
| `create_design_system.json` | `create_design_system` | Create a reusable design system. Optional numeric `projectId`. |
| `update_design_system.json` | `update_design_system` | Update an existing design system. Requires asset `name`. |
| `list_design_systems.json` | `list_design_systems` | List available design systems. Optional numeric `projectId`. |
| `apply_design_system.json` | `apply_design_system` | Apply a design system to screens. Screen **instances** (`{id, sourceScreen}`) + bare `assetId`. |
| `upload_design_md.json` | `upload_design_md` | Upload a DESIGN.md into a project. Numeric `projectId`, base64 body. |
| `create_design_system_from_design_md.json` | `create_design_system_from_design_md` | Turn an uploaded DESIGN.md into a design system. Numeric `projectId` + screen instance. |

---

## Key insights from the schemas

### DesignTheme is two different shapes — read this before "fixing" a schema

The DesignTheme you **send** and the DesignTheme you **get back** are not the same object, and conflating them is the easiest way to break these files.

| | Input DesignTheme | Output DesignTheme |
|---|---|---|
| Used by | `create_design_system`, `update_design_system` | `get_project`, `list_projects`, `create_project` responses |
| Lives under | `arguments` | `outputSchema` |
| `saturation` | **absent** | **present** (number, e.g. `3`) |
| `font` (legacy singular) | **absent** | **present** (enum string) |
| `namedColors`, `spacingScale` | absent | present |
| `bodyFontFamily` / `headlineFontFamily` / `labelFontFamily` | absent | present — human-readable names like `"Inter"`, alongside the enum form |

So `saturation` and `font` being missing from the live `create_design_system` tool definition does **not** mean they're dead. They're read-only response fields. Removing them from the output schemas makes the docs claim less than the API actually returns, which is its own kind of wrong.

Verified 2026-07-20 against 85 real projects from `list_projects`: `font` appeared in 74, `saturation` in 57, `namedColors` in 15, the `*FontFamily` trio in 7.

**Rule of thumb:** when refreshing these schemas from a live tool definition, that definition only describes the *input*. Confirm output fields against an actual API response, not the tool schema.

### DesignTheme — 68 available fonts

All tools that return design data include a `DesignTheme` object. The `bodyFont`, `headlineFont`, and `labelFont` fields (and the deprecated single `font` field) accept these enum values:

**Sans-serif (modern):**
`INTER`, `GEIST`, `DM_SANS`, `MANROPE`, `PLUS_JAKARTA_SANS`, `WORK_SANS`,
`PUBLIC_SANS`, `SOURCE_SANS_3`, `NUNITO_SANS`, `SPACE_GROTESK`,
`BE_VIETNAM_PRO`, `LEXEND`, `EPILOGUE`, `HANKEN_GROTESK`, `SPLINE_SANS`,
`RUBIK`, `ARIMO`, `SORA`, `MONTSERRAT`, `IBM_PLEX_SANS`,
`GOOGLE_SANS`, `GOOGLE_SANS_FLEX`, `GOOGLE_SANS_TEXT`, `NOTO_SANS`, `OPEN_SANS`,
`KARLA`, `LIBRE_FRANKLIN`, `FIRA_SANS`, `CHIVO`, `QUESTRIAL`, `OUTFIT`,
`BRICOLAGE_GROTESQUE`, `COMFORTAA`, `QUICKSAND`, `RALEWAY`, `ROBOTO_FLEX`, `SYNE`,
`OSWALD`, `ANYBODY`, `ATKINSON_HYPERLEGIBLE_NEXT`

**Serif (editorial):**
`NOTO_SERIF`, `NEWSREADER`, `DOMINE`, `LIBRE_CASLON_TEXT`, `EB_GARAMOND`,
`LITERATA`, `SOURCE_SERIF_4`, `IBM_PLEX_SERIF`, `MERRIWEATHER`, `PLAYFAIR_DISPLAY`,
`BODONI_MODA`, `VOLLKORN`

**Mono / code:**
`JETBRAINS_MONO`, `GOOGLE_SANS_CODE`, `GOOGLE_SANS_MONO`, `SPACE_MONO`, `COURIER_PRIME`

**Condensed / display / impact:**
`BEBAS_NEUE`, `ANTON`, `ARCHIVO_NARROW`, `BARLOW_CONDENSED`, `CLIMATE_CRISIS`, `POIRET_ONE`, `METROPHOBIC`

**Deprecated aliases (still valid, prefer the replacement):**
`SOURCE_SERIF_FOUR` → use `SOURCE_SERIF_4` · `SOURCE_SANS_THREE` → use `SOURCE_SANS_3` · `METROPOLIS` → no direct successor

### DesignTheme — roundness values

| Enum | Meaning | Use for |
|------|---------|---------|
| `ROUND_FOUR` | `border-radius: 4px` | Sharp / enterprise |
| `ROUND_EIGHT` | `border-radius: 8px` | Modern / balanced |
| `ROUND_TWELVE` | `border-radius: 12px` | Friendly / consumer |
| `ROUND_FULL` | `border-radius: 9999px` | Pill buttons |
| `ROUND_TWO` | — | **Deprecated / unused** |

### DesignTheme — other fields

`labelFont` (captions/UI chrome typeface), `overridePrimaryColor` / `overrideSecondaryColor` / `overrideTertiaryColor` / `overrideNeutralColor` (exact hex overrides), `spacing` (map of spacing token name → CSS value), and `typography` (map of level name, e.g. `h1`/`body`, → a Typography token with `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`) round out the object. There is no `saturation` field on the live API.

### outputComponents pattern

Multiple tools (`generate_screen_from_text`, `edit_screens`, `generate_variants`) return `outputComponents[]`. Each item has one of:
- `text` — agent text response, return to user
- `suggestion` — follow-up prompt suggestion, present to user; if accepted, use as next prompt
- `design` — the generated design object containing `screens[]` with `theme`, `deviceType`

### generate_variants — variantOptions

| Field | Type | Values |
|-------|------|--------|
| `variantCount` | int | 1–5 |
| `creativeRange` | enum | `REFINE`, `EXPLORE`, `REIMAGINE` |
| `aspects` | array | `LAYOUT`, `COLOR_SCHEME`, `IMAGES`, `TEXT_FONT`, `TEXT_CONTENT` |

### Model selection

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

| Tool | projectId format | screenId format | Other IDs |
|------|-----------------|----------------|-----------|
| `create_project` | — (returns `projects/NUMERIC`) | — | — |
| `get_project` | `projects/NUMERIC` | — | — |
| `list_projects` | — | — | — |
| `delete_project` | `projects/NUMERIC` | — | — |
| `generate_screen_from_text` | **NUMERIC only** | — | — |
| `edit_screens` | **NUMERIC only** | **NUMERIC array** | — |
| `generate_variants` | **NUMERIC only** | **NUMERIC array** | — |
| `list_screens` | `projects/NUMERIC` | — | — |
| `get_screen` | **NUMERIC only** | **NUMERIC only** | — |
| `create_design_system` | **NUMERIC** (optional) | — | Returns Asset `name` |
| `update_design_system` | — | — | Asset `name` (prefixed) required |
| `list_design_systems` | **NUMERIC** (optional) | — | Returns Asset names |
| `apply_design_system` | **NUMERIC only** | Screen **instances** (`{id, sourceScreen}`) | `assetId` bare numeric, no prefix |
| `upload_design_md` | **NUMERIC only** | — | Body is base64 |
| `create_design_system_from_design_md` | **NUMERIC only** | Screen **instance** (`{id, sourceScreen}`) | — |

See `../mcp-naming-convention.md` for the full breakdown.
