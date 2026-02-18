---
name: stitch-mcp-generate-screen-from-text
description: Generates a high-fidelity UI screen or wireframe from a text prompt using Stitch. This is the core text-to-UI generation tool — the heart of the Stitch workflow.
allowed-tools:
  - "stitch*:*"
---

# Stitch MCP — Generate Screen from Text

Generates a UI design screen from a structured text prompt. This is the central action in any Stitch workflow — everything before it (spec generation, prompt assembly) is preparation, and everything after it (screen retrieval, code conversion) is follow-through.

## Critical prerequisite

**Only use this skill when the user explicitly mentions "Stitch".**

You must have a `projectId` before calling this. If you don't have one:
- Create a new project via `stitch-mcp-create-project`
- Or find an existing project via `stitch-mcp-list-projects`

## When to use

- User asks to "design", "generate", "create", or "make" a screen using Stitch
- The orchestrator has assembled a prompt via `stitch-ui-prompt-architect`
- User provides specific visual requirements and wants a Stitch-generated result

## Call the MCP tool

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "[Full structured prompt — see below]",
    "deviceType": "MOBILE",
    "modelId": "GEMINI_3_PRO"
  }
}
```

## Parameter reference

### `projectId` — numeric ID only, no `projects/` prefix
```
✅ "3780309359108792857"
❌ "projects/3780309359108792857"
```

### `prompt` — use the `[Context] [Layout] [Components]` structure
```
[Context & Style]
[Device] [Mode] [screen type] for [product]. [aesthetic]. [theme]. [colors]. [font].

[Layout]
[Describe the structural arrangement]

[Components]
[Specific named UI components with details]
```

For best results, use the `stitch-ui-prompt-architect` skill to assemble the prompt before calling this tool.

### `deviceType`
| Value | Use when |
|-------|---------|
| `MOBILE` | Mobile app, phone-sized UI (default if uncertain) |
| `DESKTOP` | Web dashboard, landing page, SaaS UI |
| `TABLET` | Tablet-specific layout |
| `SMART_WATCH` | Wearable, compact screen |

### `modelId`
| Value | Use when |
|-------|---------|
| `GEMINI_3_PRO` | **Recommended** — high-fidelity, complex layouts, production quality |
| `GEMINI_3_FLASH` | Wireframes, rapid iteration, when speed matters more than quality |

## After generating

This tool returns session info but **not the actual screenshot/HTML**. To retrieve the design:
1. Call `stitch-mcp-list-screens` with `projects/[projectId]` to find the new screen
2. Call `stitch-mcp-get-screen` with the `projectId` and `screenId` to get the screenshot and HTML

## Prompt quality checklist

Before calling this tool, verify the prompt:
- [ ] Specifies device type consistently with `deviceType` parameter
- [ ] Names specific components (not "some buttons" — "primary 'Sign In' button")
- [ ] Includes colors (hex codes or clear color names)
- [ ] Uses realistic content (not Lorem Ipsum)
- [ ] Specifies light or dark mode explicitly

## References

- `examples/desktop.md` — Desktop dashboard prompts (SaaS analytics, admin panel)
- `examples/mobile.md` — Mobile app prompts (login, social feed, e-commerce)
