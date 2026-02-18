# Output Patterns

Consistency templates for newly created Stitch skills.

---

## Domain prompt architect output (STRICT)

A `stitch-ui-[domain]-architect` skill must return exactly one code block and no extra prose.

Required structure:

```text
[Context]
...

[Layout]
...

[Components]
...
```

Hard requirements:
- Do not call any MCP tool — prompt assembly only, no execution
- Do not output multiple alternatives unless the user explicitly asks for variants
- Preserve the section labels exactly: `[Context]`, `[Layout]`, `[Components]`

---

## Skill creator output (recommended)

When `stitch-skill-creator` scaffolds a new skill, report artifacts concisely:

```markdown
# Stitch Skill Created

## Path
- skills/stitch-[name]

## Files
- SKILL.md
- examples/usage.md
- resources/architecture-checklist.md  (if framework conversion)
- scripts/fetch-stitch.sh              (if needs HTML download)

## Next steps
1. Fill domain-specific details in SKILL.md (step-by-step workflow, routing table, troubleshooting).
2. Replace placeholder examples in `examples/usage.md` with real input/output pairs.
3. Add to `.claude-plugin/marketplace.json` in the appropriate plugin group.
4. Add row to `docs/skills-index.md`.
5. Add row to `README.md` in the appropriate layer table.
```

---

## MCP wrapper skill output

`stitch-mcp-*` skills report the tool call result directly. No reformatting needed — just surface the relevant IDs and URLs clearly so downstream skills can use them.

Minimum output:

```markdown
## [Tool Name] complete

- **Project ID:** [numeric]  ← use this for generate_screen_from_text and get_screen
- **Project path:** projects/[numeric]  ← use this for get_project and list_screens
- **Screen ID:** [hex]  ← use this for get_screen
- **HTML:** [downloadUrl]
- **Screenshot:** [downloadUrl]
```
