# Troubleshooting log

A "we stepped on this landmine so you don't have to" reference for stitch-kit. Not a changelog — non-obvious gotchas, framework quirks, and root causes worth remembering. Check here before debugging something that feels familiar.

---

## `${CLAUDE_PLUGIN_ROOT}` is empty in skill-issued Bash commands

**Symptom:** A skill instructs the model to run `node "${CLAUDE_PLUGIN_ROOT}/scripts/foo.mjs"`, and the command runs against a path that's just `/scripts/foo.mjs` — the variable expanded to nothing.

**Root cause:** `CLAUDE_PLUGIN_ROOT` is only injected into the environment for **hook execution**. It is NOT set in the general Bash tool environment that a skill's commands run in. `CLAUDE_PROJECT_DIR` is the same story — unset in normal Bash (cwd is the project root instead).

**Fix:** Skills reference bundled scripts via `${CLAUDE_SKILL_DIR}`, which the harness substitutes for the skill's own directory. To reach a script at the plugin root from a skill, climb out: `${CLAUDE_SKILL_DIR}/../../scripts/stitch-session.mjs` (skill → skills → plugin root). Hooks, which DO get `CLAUDE_PLUGIN_ROOT`, reference the same canonical file via a relative import (`../scripts/...`).

**Files:** `skills/stitch-ideate/SKILL.md`, `skills/stitch-orchestrator/SKILL.md`, `hooks/*.mjs`

**Lesson:** `${CLAUDE_PLUGIN_ROOT}` is a hooks-and-hooks.json placeholder. For skill bodies, `${CLAUDE_SKILL_DIR}` is the documented one. Don't assume they're interchangeable.

---

## PreCompact hook must always exit 0

**Symptom:** A failing PreCompact hook could silently block context compaction.

**Root cause:** Per the hooks docs, `PreCompact` can block compaction with **exit code 2**. A script that hits an unhandled error and exits non-zero (or a `set -e` that trips) can therefore wedge the host's compaction.

**Fix:** `hooks/pre-compact.mjs` wraps all work in try/catch and unconditionally `process.exit(0)`. Snapshotting and breadcrumb-writing are best-effort; their failure must never affect the session.

**Files:** `hooks/pre-compact.mjs`

**Lesson:** Treat PreCompact as fire-and-forget. The compaction matters more than the snapshot.

---

## SessionStart fires again after a compaction

**Confirmed behaviour:** After an auto OR manual compaction, the host re-runs `SessionStart` with `source: "compact"`. That's the injection point for restoring context — not `PostCompact`, whose output goes to the user (stderr), not the model.

**Implication:** `hooks/session-start.mjs` matches `compact` (and `resume`) and prints the re-orientation line to stdout, which SessionStart injects into context. It must no-op on `startup`/`clear` and on stale state, because it runs on every single session start for everyone who installs the plugin.

**Files:** `hooks/session-start.mjs`, `hooks/hooks.json`

**Lesson:** SessionStart is the post-compaction hook in practice. Verify with a real `/compact` per host, since the firing is the one thing docs can't prove.

---

## Node, not bash + jq

**Decision:** The session helper and hooks are Node (`.mjs`), not bash + `jq`.

**Why:** `jq` isn't on stock macOS or Windows, but Node is a hard dependency of Claude Code. Node hooks also run unchanged on native Windows, where bash scripts wouldn't.

**Lesson:** For anything a plugin ships to other people's machines, lean on what the host already guarantees (Node) instead of a tool the user might not have (`jq`).

---

## Skill changes ship to every host, not just Claude Code

**Symptom:** A skill edit that adds a `node "${CLAUDE_SKILL_DIR}/../../scripts/..."` call works in Claude Code but misfires under Codex / OpenCode / Crush.

**Root cause:** `bin/stitch-kit.mjs` and `install-codex.sh` install the same `skills/` into Codex (`~/.codex/skills`), OpenCode, and Crush — but they copy **only** `skills/`, not `scripts/` or `hooks/`. And `${CLAUDE_SKILL_DIR}` is a Claude Code substitution that those hosts don't expand. So a skill instruction that calls a plugin-root script resolves to nothing on three of the four hosts.

**Fix:** Guard host-specific calls so they no-op cleanly elsewhere: `H="${CLAUDE_SKILL_DIR}/../../scripts/x.mjs"; [ -f "$H" ] && node "$H" ... || true`. Under non-Claude-Code hosts the var stays literal, `-f` is false, the call is skipped silently. Document the feature as Claude Code-only and keep the other hosts on the architectural resilience (files + Stitch backend).

**Files:** `skills/stitch-ideate/SKILL.md`, `skills/stitch-orchestrator/SKILL.md`, `bin/stitch-kit.mjs`, `install-codex.sh`

**Lesson:** Skills are the shared surface across all install targets. A Claude-Code-only mechanism added to a SKILL.md needs a guard, or it becomes a bug on every other host. Check `bin/stitch-kit.mjs` before assuming "plugin" means "Claude Code."

---

## A symlinked CLI silently does nothing (the `import.meta.url === argv[1]` trap)

**Symptom:** `stitch-session` works when run as `node scripts/stitch-session.mjs ...` but does nothing — no output, no state — when run as the `stitch-session` command (npm `bin` or a `~/.local/bin` symlink). Exit code is 0, so it looks like success.

**Root cause:** The "am I the main module?" guard compared `fileURLToPath(import.meta.url) === process.argv[1]`. Node resolves symlinks for `import.meta.url` (→ the real `scripts/stitch-session.mjs`) but leaves `process.argv[1]` as the symlink path (`~/.local/bin/stitch-session`). They don't match, so `main()` never runs. npm `bin` entries are symlinks, so this breaks every launcher-based call — exactly the path the Codex on-PATH launcher depends on.

**Fix:** `realpathSync` both sides before comparing (with a non-realpath fallback in a catch). See `invokedDirectly()` in `scripts/stitch-session.mjs`.

**Files:** `scripts/stitch-session.mjs`

**Lesson:** If a script is meant to be run via a symlinked launcher, the main-module check must resolve symlinks on both sides. A bare `===` is a quiet footgun the moment you put the script on PATH.

---

## Codex doesn't auto-trust plugin hooks

**Symptom:** stitch-kit is installed as a Codex plugin, state is being written to `.stitch/session/`, but after a `/compact` the model doesn't get the re-orientation line.

**Root cause:** Codex skips plugin-bundled hooks until the user reviews and trusts them. An enabled plugin is not a trusted plugin. So `SessionStart:compact` never fires until trust is granted.

**Fix:** Tell the user to trust the plugin's hooks once. As a belt-and-suspenders, the skills self-check for recent `.stitch/session/state.json` on activation, so resumption still works without trusted hooks. Also note: Codex's `PostCompact` stdout is ignored — `SessionStart:compact` is the only event that injects model-visible context after compaction.

**Files:** `hooks/hooks.json`, `.codex-plugin/plugin.json`, `skills/stitch-ideate/SKILL.md`, `skills/stitch-orchestrator/SKILL.md`

**Lesson:** On Codex, a hook existing isn't a hook running. Design the feature to degrade to a skill-level self-check when hooks aren't trusted.
