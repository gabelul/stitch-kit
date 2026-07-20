---
name: stitch-mcp-apply-design-system
description: Applies a Stitch Design System to existing screens — updates their colors, fonts, and roundness to match the design system's theme. Requires an assetId from list or create operations.
allowed-tools:
  - "stitch*:*"
---

# Stitch MCP — Apply Design System

Applies a previously created Stitch Design System to one or more screens. This updates the screen's visual theme (colors, font, roundness) to match the design system, ensuring visual consistency across a project.

## Critical prerequisite

**Only use this skill when the user explicitly mentions "Stitch".**

You must have:
1. A `projectId` (numeric)
2. One or more `screenId` values (numeric)
3. An `assetId` from a design system (from `list_design_systems` or `create_design_system`)

## When to use

- After creating a design system and wanting to apply it to screens
- User says "make all screens match this theme" or "apply the design system"
- The orchestrator's Step 5b stores an assetId and offers to apply it
- Ensuring visual consistency across a multi-screen project

## Call the MCP tool

```json
{
  "name": "apply_design_system",
  "arguments": {
    "projectId": "3780309359108792857",
    "selectedScreenInstances": [
      {
        "id": "a1b2c3d4e5f6",
        "sourceScreen": "projects/3780309359108792857/screens/98b50e2ddc9943efb387052637738f61"
      }
    ],
    "assetId": "15996705518239280238"
  }
}
```

## Parameter reference

### `projectId` — numeric ID only, no prefix

```
✅ "3780309359108792857"
❌ "projects/3780309359108792857"
```

### `selectedScreenInstances` — array of objects, not screen IDs

This is the one that catches people. It takes screen **instances**, each a `{id, sourceScreen}` pair — not a list of screen ids.

```
✅ [{ "id": "a1b2c3d4e5f6",
      "sourceScreen": "projects/3780.../screens/98b5..." }]

❌ ["88805abc123def456"]                    ← bare screen ids
❌ [{ "id": "98b50e2ddc99...", ... }]        ← source screen id in the id slot
```

Get both values from `get_project` → `screenInstances`. The `id` is the **instance** id; `sourceScreen` is the full `projects/{p}/screens/{s}` path of the screen behind it. They are different values, and swapping them fails.

Same shape as `create_design_system_from_design_md`, which takes a single instance rather than an array.

### `assetId` — bare numeric, no prefix

```
✅ "15996705518239280238"
❌ "assets/15996705518239280238"
```

Get it from:
- `stitch-mcp-list-design-systems` → take the `name` field (`assets/15996...`) and **strip the `assets/` prefix**
- `stitch-mcp-create-design-system` → same, strip the prefix from the returned `name`

> `apply_design_system` wants it bare, but `generate_screen_from_text`'s `designSystem` param wants it **prefixed** (`assets/15996...`). Same identifier, two formats, depending on the tool.

## Output

Returns updated screen data reflecting the applied design system.

## After applying

1. Re-fetch affected screens: `stitch-mcp-get-screen` for each screenId
2. Show updated screenshots to the user
3. Offer:
   - "Edit the updated screens?" → `stitch-mcp-edit-screens`
   - "Convert to code?" → framework conversion
   - "Apply to more screens?" → another `apply_design_system` call
