---
name: stitch-mcp-update-design-system
description: Updates an existing Stitch Design System's theme, tokens, or guidelines. Requires the asset name from create or list operations.
allowed-tools:
  - "stitch*:*"
---

# Stitch MCP — Update Design System

Updates an existing Stitch Design System. Use this to modify theme properties, design tokens, or style guidelines without creating a new design system.

## Critical prerequisite

**Only use this skill when the user explicitly mentions "Stitch".**

You must have the design system's asset `name` before calling this. If you don't have one:
- List existing design systems via `stitch-mcp-list-design-systems`
- Or use the `name` returned from `stitch-mcp-create-design-system`

## When to use

- User wants to modify colors, fonts, or roundness of an existing design system
- After reviewing a design system and wanting to adjust specific properties
- Updating design tokens after a brand refresh

## Call the MCP tool

```json
{
  "name": "update_design_system",
  "arguments": {
    "name": "assets/15996705518239280238",
    "projectId": "3780309359108792857",
    "designSystem": {
      "displayName": "SaaS Dashboard Theme v2",
      "theme": {
        "colorMode": "DARK",
        "headlineFont": "GEIST",
        "bodyFont": "GEIST",
        "labelFont": "GEIST",
        "roundness": "ROUND_TWELVE",
        "customColor": "#818CF8"
      }
    }
  }
}
```

## Parameter reference

Three **sibling** top-level arguments — `name` is not nested inside `designSystem`:

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | **Yes** | Asset identifier **with** the `assets/` prefix, e.g. `assets/15996705518239280238`. Top-level, not inside `designSystem`. |
| `projectId` | string | **Yes** | Bare numeric project id, no `projects/` prefix |
| `designSystem` | object | **Yes** | `{displayName, theme}` — see below |

### `designSystem` — `{displayName, theme}` only

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `displayName` | string | **Yes** | Human-readable name |
| `theme` | DesignTheme | **Yes** | Visual configuration (see `stitch-mcp-create-design-system` for the full field reference) |

> `update_design_system` takes the asset id **prefixed** (`assets/159967...`), while `apply_design_system` takes the same id **bare**. Two tools, same identifier, different formats.

`designTokens` and `styleGuidelines` are **not** accepted — the live API has no such fields on `DesignSystem`. Don't send them.

**Note:** This is a full replacement, not a merge. Include all theme fields you want to keep, not just the ones you're changing.

## Output

Returns the updated Asset object:

```json
{
  "name": "assets/15996705518239280238",
  "displayName": "SaaS Dashboard Theme v2",
  "designSystem": { ... }
}
```

## After updating

- Offer: "Re-apply this updated design system to existing screens?" → `stitch-mcp-apply-design-system`
- Screens generated before the update won't automatically reflect changes — they need to be re-applied
