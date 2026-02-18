# stitch-kit Skill Specification

The rules that all skills in this repo follow. If you're building a new skill — whether a framework conversion, an MCP wrapper, or a quality tool — this is the contract.

---

## Directory structure

Every skill lives in `skills/` and follows this layout:

```text
skills/[skill-name]/
├── SKILL.md          required — name, description, instructions
├── examples/         recommended — real examples the agent copies
├── references/       optional — contracts, style guides, checklists
└── scripts/          optional — validation scripts, fetch helpers
```

Only `SKILL.md` is required. The rest depends on what the skill needs.

---

## SKILL.md format

Every `SKILL.md` starts with YAML frontmatter, then Markdown instructions.

```yaml
---
name: stitch-your-skill-name
description: One or two sentences. What this skill does and when to reach for it. This is what Claude reads to decide whether to invoke this skill.
allowed-tools:
  - "Bash"
  - "Read"
  - "Write"
---

# Skill Title

Instructions here...
```

### Frontmatter fields

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Must match the directory name exactly (kebab-case) |
| `description` | Yes | Used by the agent for skill discovery — make it specific and actionable |
| `allowed-tools` | Optional | Restricts which tools the agent can use while this skill is active. Omit to allow all. |

### The description field matters

The `description` is how the orchestrator and Claude decide when to invoke a skill. Vague descriptions mean the skill gets skipped or invoked at the wrong time. Be specific:

- **Bad:** "Converts UI designs"
- **Good:** "Converts Stitch HTML output to Next.js 15 App Router components with TypeScript, dark mode via next-themes, and WCAG 2.1 AA compliance"

---

## Naming conventions

| Skill type | Pattern | Example |
|------------|---------|---------|
| Orchestrator | `stitch-orchestrator` | — (only one) |
| MCP wrapper | `stitch-mcp-[tool-name]` | `stitch-mcp-get-screen` |
| Brain / design logic | `stitch-ui-[purpose]` | `stitch-ui-prompt-architect` |
| Framework conversion | `stitch-[framework]-components` | `stitch-nextjs-components` |
| Quality tool | `stitch-[capability]` | `stitch-a11y`, `stitch-animate` |
| Meta / utility | `stitch-[name]` | `stitch-setup`, `stitch-skill-creator` |

Rules:
- Always kebab-case
- Always prefixed with `stitch-`
- MCP wrappers: one skill per MCP tool, name derived from tool name (`get_screen` → `stitch-mcp-get-screen`)

---

## The four layers — where does your skill fit?

```
Brain    (stitch-ui-*)      — design logic, prompt engineering, no API calls
Hands    (stitch-mcp-*)     — one skill per Stitch MCP tool
Quality  (stitch-design-*, stitch-animate, stitch-a11y)
Meta     (stitch-setup, stitch-skill-creator, new utility skills)
```

Most new contributions will be one of:
- A new **framework conversion** skill (pattern: copy `stitch-react-components` structure)
- A new **MCP wrapper** if Google adds a new tool (pattern: copy `stitch-mcp-get-screen`)
- A new **quality tool** (pattern: copy `stitch-a11y`)

Use `stitch-skill-creator` to bootstrap the directory and SKILL.md from a template.

---

## examples/ directory

Put real, working examples here — not documentation about what the skill does, but actual samples the agent can copy. A framework conversion skill should have a gold-standard component example. A prompt architect skill should have example inputs and outputs.

Agents learn from examples. A good `examples/` folder is the biggest quality multiplier for any skill.

---

## references/ directory

Design contracts, official docs excerpts, checklists. Load on demand via `allowed-tools: Read` — don't inline massive reference docs into SKILL.md or you'll burn context on every invocation.

---

## scripts/ directory

Executable scripts the skill needs. Common cases:
- `fetch-stitch.sh` — downloads Stitch HTML before the GCS URL expires
- `validate.js` / `validate.py` — checks output syntax before completing
- `init_*.py` — scaffolding scripts (like in `stitch-skill-creator`)

Scripts should be self-contained and document their usage at the top.

---

## marketplace.json registration

New skills need to be added to `.claude-plugin/marketplace.json` to be installable via the plugin system. Add your skill to the relevant plugin group (`stitch-frameworks`, `stitch-quality`, etc.) and to `full`.

The `name` field in your `SKILL.md` frontmatter must match the path in `marketplace.json`. The CI workflow validates this.

---

## Validation

The GitHub Actions workflow at `.github/workflows/validate.yml` checks every PR:

1. Every `skills/*/` directory has a `SKILL.md`
2. Every `SKILL.md` has valid YAML frontmatter with `name` and `description`
3. The `name` in frontmatter matches the directory name
4. Directory names follow `stitch-*` convention
5. Every skill path referenced in `marketplace.json` exists on disk

Run locally before opening a PR:

```bash
python3 .github/scripts/validate_skills.py
```
