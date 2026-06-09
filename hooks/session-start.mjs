#!/usr/bin/env node
/**
 * session-start.mjs — SessionStart hook (matchers: compact, resume)
 *
 * Fires when a session begins or resumes. After a compaction the host re-runs
 * SessionStart with source "compact", which is our one chance to tell the
 * freshly-summarised model where its work actually lives. We emit the
 * re-orientation as `hookSpecificOutput.additionalContext` JSON — that's the
 * form both Claude Code and Codex inject as model-visible context (Codex treats
 * bare stdout as weaker "developer context", so JSON is the portable choice).
 *
 * Hard rule: this hook runs on EVERY session start for everyone who installs
 * stitch-kit. If there's no active Stitch session, it must print nothing and
 * get out of the way. And it must never throw — a crashing SessionStart hook is
 * a great way to ruin someone's day. So everything is wrapped and we always
 * exit 0.
 */

import { readFileSync } from "node:fs";
import { loadState, isRecent, formatStatus } from "../scripts/stitch-session.mjs";

/** Sources where resurfacing state is useful. "startup"/"clear" are fresh starts — stay quiet there. */
const RESURFACE_ON = new Set(["compact", "resume"]);

try {
  // Hook input arrives as JSON on stdin. Parse source + cwd; if we can't read or
  // parse it, treat source as unknown and bail quietly rather than guessing.
  let source = "";
  try {
    const raw = readFileSync(0, "utf8");
    if (raw) {
      const input = JSON.parse(raw);
      if (input.cwd && !process.env.CLAUDE_PROJECT_DIR) process.env.CLAUDE_PROJECT_DIR = input.cwd;
      source = (input.source || "").toString();
    }
  } catch {
    source = "";
  }

  if (RESURFACE_ON.has(source)) {
    const state = loadState();
    if (state && isRecent(state)) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "SessionStart",
            additionalContext: formatStatus(state),
          },
        }) + "\n"
      );
    }
  }
} catch {
  // Never let a hook failure surface to the user or block the session.
}

process.exit(0);
