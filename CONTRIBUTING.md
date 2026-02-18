# Contributing to stitch-kit

Want to add a new framework conversion? A new quality tool? An MCP wrapper for a new Stitch API tool? Here's how.

---

## Before you start

Read [spec/stitch-kit-spec.md](spec/stitch-kit-spec.md) — it covers directory structure, naming conventions, and the four layers. Figure out where your skill fits before writing anything.

Also check [docs/skills-index.md](docs/skills-index.md) to make sure what you're building doesn't already exist in a different form.

---

## Adding a new skill

**Step 1: Use stitch-skill-creator**

The fastest way to get started. In Claude Code or Codex:

```
Use stitch-skill-creator to bootstrap a new skill called stitch-[your-name]
```

It generates the directory, `SKILL.md` template, and examples structure following the spec. Then you fill it in.

**Step 2: Build the skill**

- `SKILL.md` — name, description, instructions. The description is how Claude decides when to invoke it, so make it specific.
- `examples/` — real examples the agent can copy. This is what separates consistent output from hallucinated output.
- `references/` — optional, for contracts and checklists loaded on demand
- `scripts/` — optional, for validation or fetch helpers

**Step 3: Register it**

Add your skill to `.claude-plugin/marketplace.json`:
- The relevant plugin group (`stitch-frameworks`, `stitch-quality`, etc.)
- The `full` group

**Step 4: PR checklist**

- [ ] `SKILL.md` has `name` and `description` in frontmatter
- [ ] `name` matches the directory name exactly
- [ ] Directory is named `stitch-*` (kebab-case)
- [ ] At least one example in `examples/`
- [ ] Skill is registered in `marketplace.json`
- [ ] CI passes (validates structure and marketplace refs)

---

## Adding an MCP wrapper

If Google adds a new Stitch MCP tool, the wrapper pattern is:

- Name: `stitch-mcp-[tool-name]` (underscores → hyphens, e.g. `edit_screen` → `stitch-mcp-edit-screen`)
- One skill per MCP tool — no combining
- Document the ID format requirements in the SKILL.md (this is where agents get it wrong)
- Reference [docs/mcp-naming-convention.md](docs/mcp-naming-convention.md)

---

## Adding a framework conversion skill

Copy the structure from `stitch-nextjs-components` or `stitch-react-components` — they have the fetch pattern, the validation approach, and the DESIGN.md integration already worked out. You're mostly adapting the framework-specific parts.

Framework conversion skills should reference `stitch-mcp-get-screen` for retrieval and optionally `stitch-design-md` for token alignment.

---

## Commit style

This repo uses conventional commits:

```
feat: add stitch-astro-components skill
fix: correct ID format in stitch-mcp-get-screen
docs: update architecture section in README
```

---

## Opening a PR

Fork → branch (`skill/your-skill-name` or `fix/what-you-fixed`) → PR against `main`.

Keep PRs focused — one skill or one fix per PR. Easier to review, faster to merge.

---

## Questions

Open an issue. If something in the spec is unclear or the validator is rejecting something that seems valid, that's worth documenting.
