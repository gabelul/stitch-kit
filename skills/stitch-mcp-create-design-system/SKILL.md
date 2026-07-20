---
name: stitch-mcp-create-design-system
description: Creates a reusable Stitch Design System from theme tokens — colors, fonts, roundness. Can be applied to future screens for visual consistency.
allowed-tools:
  - "stitch*:*"
---

# Stitch MCP — Create Design System

Creates a new Stitch Design System — a reusable theme configuration that can be applied to any screen. This bridges the gap between local CSS token extraction (via `stitch-design-system`) and Stitch-native design tokens that persist across generations.

## Critical prerequisite

**Only use this skill when the user explicitly mentions "Stitch".**

## When to use

- After extracting CSS tokens via `stitch-design-system` and wanting to persist them in Stitch
- User wants consistent theming across multiple screens or projects
- The orchestrator's Step 7 offers to create a Stitch Design System from extracted tokens
- User explicitly asks to create a design system in Stitch

## Call the MCP tool

```json
{
  "name": "create_design_system",
  "arguments": {
    "designSystem": {
      "displayName": "SaaS Dashboard Theme",
      "theme": {
        "colorMode": "LIGHT",
        "headlineFont": "DM_SANS",
        "bodyFont": "DM_SANS",
        "labelFont": "DM_SANS",
        "roundness": "ROUND_EIGHT",
        "customColor": "#6366F1",
        "colorVariant": "TONAL_SPOT"
      }
    },
    "projectId": "3780309359108792857"
  }
}
```

## Parameter reference

### `designSystem` — required object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | Yes | Human-readable name for the design system |
| `theme` | DesignTheme | Yes | Visual configuration — see below |

`designTokens` and `styleGuidelines` are **not** accepted — the live API has no such fields on `DesignSystemInput`. Don't send them.

### `theme` (DesignTheme) — the visual configuration

Required: `colorMode`, `headlineFont`, `bodyFont`, `roundness`, `customColor`.

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `colorMode` | enum | `LIGHT`, `DARK` | Base appearance mode |
| `headlineFont` | enum | See font list below | Typeface for headings and titles |
| `bodyFont` | enum | See font list below | Typeface for body text and paragraphs |
| `labelFont` | enum | See font list below | Optional. Typeface for labels, captions, and UI chrome |
| `roundness` | enum | `ROUND_FOUR`, `ROUND_EIGHT`, `ROUND_TWELVE`, `ROUND_FULL` (`ROUND_TWO` also exists but is deprecated/unused) | Border radius scale |
| `customColor` | string | Hex color | Primary brand color |
| `colorVariant` | enum | `MONOCHROME`, `NEUTRAL`, `TONAL_SPOT`, `VIBRANT`, `EXPRESSIVE`, `FIDELITY`, `CONTENT`, `RAINBOW`, `FRUIT_SALAD` | Optional. Palette generation strategy from `customColor` |
| `designMd` | string | — | Optional. Design system markdown document |
| `overridePrimaryColor` / `overrideSecondaryColor` / `overrideTertiaryColor` / `overrideNeutralColor` | string | Hex color | Optional. Exact color overrides, take precedence over `customColor` |
| `spacing` | object | Map of name → CSS value | Optional. e.g. `{"sm": "8px"}` |
| `typography` | object | Map of level name → Typography token | Optional. Each token: `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight` |

`font` (the deprecated singular font field), `backgroundLight`, `backgroundDark`, `preset`, and `description` are **not** accepted as input — they only ever appear in API *responses* (`get_project`, `list_projects`, etc.), never in what you send here.

### Available fonts (68 options)

**Sans-serif:** `INTER`, `DM_SANS`, `GEIST`, `SORA`, `MANROPE`, `RUBIK`, `MONTSERRAT`, `WORK_SANS`, `SPACE_GROTESK`, `PLUS_JAKARTA_SANS`, `PUBLIC_SANS`, `SOURCE_SANS_3`, `NUNITO_SANS`, `ARIMO`, `HANKEN_GROTESK`, `IBM_PLEX_SANS`, `SPLINE_SANS`, `LEXEND`, `EPILOGUE`, `BE_VIETNAM_PRO`, `GOOGLE_SANS`, `GOOGLE_SANS_FLEX`, `GOOGLE_SANS_TEXT`, `NOTO_SANS`, `OPEN_SANS`, `KARLA`, `LIBRE_FRANKLIN`, `FIRA_SANS`, `CHIVO`, `QUESTRIAL`, `OUTFIT`, `BRICOLAGE_GROTESQUE`, `COMFORTAA`, `QUICKSAND`, `RALEWAY`, `ROBOTO_FLEX`, `SYNE`, `OSWALD`, `ANYBODY`, `ATKINSON_HYPERLEGIBLE_NEXT`

**Serif:** `NOTO_SERIF`, `NEWSREADER`, `DOMINE`, `LIBRE_CASLON_TEXT`, `EB_GARAMOND`, `LITERATA`, `SOURCE_SERIF_4`, `IBM_PLEX_SERIF`, `MERRIWEATHER`, `PLAYFAIR_DISPLAY`, `BODONI_MODA`, `VOLLKORN`

**Mono / code:** `JETBRAINS_MONO`, `GOOGLE_SANS_CODE`, `GOOGLE_SANS_MONO`, `SPACE_MONO`, `COURIER_PRIME`

**Condensed / display:** `BEBAS_NEUE`, `ANTON`, `ARCHIVO_NARROW`, `BARLOW_CONDENSED`, `CLIMATE_CRISIS`, `POIRET_ONE`, `METROPHOBIC`

**Deprecated aliases (still valid, prefer the replacement):** `SOURCE_SERIF_FOUR` → `SOURCE_SERIF_4`, `SOURCE_SANS_THREE` → `SOURCE_SANS_3`, `METROPOLIS` → no direct successor

### `projectId` — optional, numeric only

```
✅ "3780309359108792857"
❌ "projects/3780309359108792857"
```

If provided, associates the design system with a specific project. If omitted, creates a global design system.

## Mapping CSS tokens to DesignTheme

When creating from extracted `design-tokens.css`:

| CSS Variable | → DesignTheme field |
|---|---|
| `--color-primary` | `customColor` |
| `--font-family` (headings) | `headlineFont` (map to closest enum value) |
| `--font-family` (body) | `bodyFont` (map to closest enum value) |
| `--radius` or `--border-radius` | `roundness` (4px→FOUR, 8px→EIGHT, 12px→TWELVE, 16px+→FULL) |

There's no input field for exact background hex values — `backgroundLight`/`backgroundDark` are response-only. Light/dark backgrounds come from `colorMode` plus the palette Stitch derives from `customColor` and `colorVariant`; use `overridePrimaryColor` etc. if you need to pin a specific palette slot instead.

## Output

Returns an Asset object with a `name` field — **store this** for future `update_design_system` and `apply_design_system` calls:

```json
{
  "name": "assets/15996705518239280238",
  "displayName": "SaaS Dashboard Theme",
  "designSystem": { ... }
}
```

## After creating

- Store the `name` value (e.g., `assets/15996705518239280238`). It's used two different ways:
  - `update_design_system`'s `designSystem.name` — pass it as-is, with the `assets/` prefix
  - `apply_design_system`'s `assetId` — strip the prefix, pass the bare numeric id
  - `generate_screen_from_text`'s `designSystem` param — pass it as-is, with the prefix
- Offer: "Apply this design system to existing screens?" → `stitch-mcp-apply-design-system`
- The orchestrator stores this for automatic application in Step 5b
