# Compaction resilience

## The problem

stitch-kit flows run inside a host agent — Claude Code, Codex. When that host fills its context window, it compacts the conversation: summarises the history down to free up room, then keeps going. The host decides when this happens; a plugin of skills can't vote on it.

Most stitch-kit flows already survive a compaction by accident of how they're built. The PRD is written to disk, generated screens live in Stitch's own backend (recoverable via `list_screens` / `get_project`), and `stitch-loop` parks all its state in files. The big context windows (Opus 1M, Codex) mean compaction usually never even fires for a single idea-to-screens run.

The one genuine gap is a long **ideation session**: the research and answers gathered across phases live only in the conversation, because `stitch-ideate` historically wrote the PRD only at the final phase. Compact mid-brainstorm and that work was gone.

This feature closes that gap and turns "survives by accident" into "handles it on purpose."

## How it works — two layers

### Layer 1: skills persist state as they go

A single canonical writer, `scripts/stitch-session.mjs`, owns the on-disk schema. Skills call it; nothing else writes the state file, so the shape can't drift.

State lives under `.stitch/session/` in the user's project (gitignored):

| File | What it holds |
|------|---------------|
| `state.json` | flow, phase, active project (numeric id, name, device), generated screen ids, applied design system, pointers to artifacts |
| `prd-draft.md` | running PRD, appended after each ideation phase |
| `snapshots/` | raw transcript backups written by the PreCompact hook |
| `RESUME.md` | human/agent-readable breadcrumb refreshed on each compaction |

`stitch-ideate` calls `set-phase` + `append-prd` at the end of every phase. `stitch-orchestrator` records the project at Step 4, each screen at Step 5, and the design system at Step 7b. Both reference the helper as `${CLAUDE_SKILL_DIR}/../../scripts/stitch-session.mjs` — one copy, reached from the skill's own directory.

### Layer 2: hooks re-orient after a compaction

- `hooks/pre-compact.mjs` (PreCompact, matchers `auto` + `manual`) — copies the raw transcript into `snapshots/` as a backstop and refreshes `RESUME.md`. No-ops when there's no active Stitch session. Always exits 0, because PreCompact can block compaction with exit code 2 and we never want to wedge a session.
- `hooks/session-start.mjs` (SessionStart, matchers `compact` + `resume`) — when the host re-runs SessionStart after a compaction, this prints a one-line re-orientation to stdout (which SessionStart injects into context): which project, which phase, how many screens, where the PRD draft is, and "continue, don't restart." No-ops on a fresh start or when state is stale (older than 24h).

`hooks/hooks.json` wires both up; plugins auto-discover it at the plugin root.

## Verifying it

```bash
# Drive the session helper directly:
node scripts/stitch-session.mjs init ideate
node scripts/stitch-session.mjs set-project 3780 "Velvet Cinema" DESKTOP
node scripts/stitch-session.mjs status   # prints the re-orientation line

# Simulate the SessionStart hook firing after a compaction:
echo '{"source":"compact"}' | node hooks/session-start.mjs
```

To confirm the real path end-to-end, run a `/compact` during an active orchestrator or ideation flow and check that the next turn knows which project it was working in.

## Host support

Works on both **Claude Code** and **Codex CLI**, through each one's native plugin + hook system.

- **Claude Code:** hooks auto-register from `hooks/hooks.json`; skills reach the helper via `${CLAUDE_SKILL_DIR}`.
- **Codex CLI:** install as a Codex plugin (`.codex-plugin/plugin.json`) so the hooks register. Codex fires `SessionStart` with `source: "compact"` too, and provides `CLAUDE_PLUGIN_ROOT` as a compatibility env var, so the same `hooks.json` works unchanged. Codex skills have no `${CLAUDE_SKILL_DIR}` equivalent, so the helper is exposed as an on-PATH `stitch-session` command (npm `bin`, or symlinked by the installer); the skills call it through a wrapper that falls back to the Claude Code path.

Two Codex specifics worth knowing:
- Codex does not auto-trust plugin hooks — the user trusts them once, or the `SessionStart` re-orientation won't fire. Until trusted, state is still written to disk; it just isn't auto-resurfaced. The skills also self-check for in-progress state on activation, which covers the untrusted case.
- Codex's `PostCompact` stdout is ignored, so re-orientation rides on `SessionStart:compact` (same event as Claude Code), not `PostCompact`.

On OpenCode and Crush (skills copied, no plugin hooks), the skill calls no-op cleanly when `stitch-session` isn't on PATH — those hosts keep the architectural resilience (PRD on disk, screens in Stitch's backend) without the hook layer.

## Honest limitations

- **Mid-phase reasoning gap.** The per-phase flush captures structured state, not the model's *reasoning* within a phase (why this direction, what surprised it). The durable fix is the [exec plans pattern](https://developers.openai.com/cookbook/articles/codex_exec_plans) — a continuously-updated Decision Log + Surprises file written alongside `prd-draft.md`. Tracked as a follow-up in `docs/dev-docs/exec-plans-followup.md`; the raw-transcript backstop in `snapshots/` is the recoverable-but-ugly stopgap until that lands.
- Hooks only run when stitch-kit is installed as a Claude Code plugin (they need `CLAUDE_PLUGIN_ROOT`, which the host sets only for hook execution).
- Re-orientation depends on the host firing `SessionStart` with `source: "compact"` after an auto-compaction. The docs say it does for both auto and manual; confirm with a real `/compact` in your host.

## Why Node, not bash + jq

The session helper and both hooks are Node (`.mjs`). Node is a hard dependency of Claude Code; `jq` is not on stock macOS or Windows. Node also runs the hooks unchanged on native Windows, where bash scripts wouldn't.
