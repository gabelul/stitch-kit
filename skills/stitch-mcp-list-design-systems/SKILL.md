---
name: stitch-mcp-list-design-systems
description: Lists all Stitch Design Systems, optionally filtered by project. Returns asset names needed for apply and update operations.
allowed-tools:
  - "stitch*:*"
---

# Stitch MCP — List Design Systems

Lists all available Stitch Design Systems. These are reusable theme configurations (colors, fonts, roundness) that can be applied to screens for visual consistency across a project.

## Critical prerequisite

**Only use this skill when the user explicitly mentions "Stitch".**

## When to use

- Before applying a design system — need to find the `assetId`
- User asks "what design systems do I have?"
- The orchestrator checks for existing design systems during project setup (Step 4b)
- Before creating a new design system — check if one already exists

## Call the MCP tool

```json
{
  "name": "list_design_systems",
  "arguments": {
    "projectId": "3780309359108792857"
  }
}
```

### `projectId` — numeric ID only, optional

```
✅ "3780309359108792857"
❌ "projects/3780309359108792857"
```

If omitted, returns all design systems across all projects.

## Output schema

Returns an array of Asset objects:

```json
{
  "assets": [
    {
      "name": "assets/15996705518239280238",
      "displayName": "SaaS Dashboard Theme",
      "designSystem": {
        "theme": {
          "colorMode": "LIGHT",
          "font": "DM_SANS",
          "roundness": "ROUND_EIGHT",
          "customColor": "#6366F1",
          "backgroundLight": "#FFFFFF",
          "backgroundDark": "#18181B"
        }
      }
    }
  ]
}
```

## After listing

Present as a readable table:

| # | Name | Font | Color | Mode | Asset ID |
|---|------|------|-------|------|----------|
| 1 | SaaS Dashboard Theme | DM Sans | #6366F1 | Light | `15996705518239280238` |

Then offer:
- "Apply one of these to a screen?" → `stitch-mcp-apply-design-system`
- "Update an existing design system?" → `stitch-mcp-update-design-system`
- "Create a new design system?" → `stitch-mcp-create-design-system`

Extract the `name` field from each asset (`assets/15996...`). It's used two different ways depending on the next call:
- `apply_design_system`'s `assetId` — strip the `assets/` prefix, pass the bare numeric id
- `update_design_system`'s `designSystem.name` — pass `name` as returned, with the prefix
