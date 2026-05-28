# Follow-up: exec-plan layer for stitch-ideate

**Status:** designed, not built. Tracked from PR #15.
**Origin:** Luca @ context-coders.com pointed at OpenAI's [exec plans pattern](https://developers.openai.com/cookbook/articles/codex_exec_plans) as the right shape for the one limitation that PR left open.

## The gap this closes

Today's Layer-1 captures structured state (`state.json`) and PRD content (`prd-draft.md`, appended per phase). What it doesn't capture is the reasoning developed *within* a phase: why this direction, what surprised the model during research, what got dropped. That's what dies in a mid-phase compaction.

Exec plans freezes reasoning, not artifacts. Different job from `state.json`, different shape from `prd-draft.md`. It sits alongside both.

## Proposed file

`.stitch/session/plan.md` — single growing markdown file, host-agnostic, written by `stitch-ideate`. Five sections, per the cookbook:

| Section | What goes here |
|---|---|
| Purpose / Big Picture | The pitch + design direction in 2–3 sentences. |
| Progress | Timestamped checkbox list of phases. |
| Surprises & Discoveries | Research findings that changed the plan. |
| Decision Log | The *why* behind each non-obvious call (Decision / Rationale / Date). |
| Outcomes & Retrospective | Filled at the end. |

Revisions allowed; the cookbook's rule is that every revision keeps the plan fully self-contained.

## Where it sits

- `state.json` — structured pointers. Hooks surface it on compact. **Keep.**
- `prd-draft.md` — the actual PRD content, phase by phase. Becomes the final PRD. **Keep.**
- `plan.md` (new) — the reasoning behind the PRD. **Adds the missing layer.**

All three written via the `ss` wrapper; `scripts/stitch-session.mjs` owns the schema so there's still one canonical writer (new subcommand: `ss plan-add <section> <body>`).

## When stitch-ideate writes to it

Not at phase boundaries — at *decision points*. The skill body says: append to the Decision Log whenever a direction is picked, an option dropped, or a screen list committed; append to Surprises whenever research turns up something that shifts the plan. Prompt-level discipline, no new tool.

## How SessionStart surfaces it

`formatStatus` gains one line: when `plan.md` exists, include `Plan at .stitch/session/plan.md (last decision: <most-recent-entry>).`. The model already reads `state.json` and `prd-draft.md` on resume; adding `plan.md` to the list is mechanical.

## Why host-agnostic

Exec plans is a prompt/convention pattern, not a Codex feature. The same `plan.md` works under Claude Code, Codex, OpenCode, and Crush. It rides the `ss` wrapper that already resolves cross-host.

## Non-goals

- Not for `stitch-orchestrator`: the orchestrator is mechanical, `state.json` is enough.
- Not replacing `prd-draft.md`: prd = artifact, plan = reasoning.
- Not a tool/MCP: prompt-level discipline in the skill, no new API.

## Build sequence

1. Add `ss plan-*` subcommands to `scripts/stitch-session.mjs`.
2. Update `stitch-ideate` Session-state section with Decision Log / Surprises calls at the documented moments.
3. Update `formatStatus` to surface `plan.md` when present.
4. Test: simulate a phase with a decision + a surprise; verify SessionStart surfaces the latest decision.
5. Document in `docs/compaction-resilience.md`.

Rough estimate: 1–2 focused hours.
