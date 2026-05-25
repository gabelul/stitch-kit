#!/usr/bin/env node
/**
 * pre-compact.mjs — PreCompact hook (matchers: auto, manual)
 *
 * Fires right before the host compacts the conversation. By this point the
 * skills have already been writing state to .stitch/session as they go, so the
 * important stuff is on disk. This hook is the backstop on top of that:
 *
 *   1. Copies the raw transcript into snapshots/ (owner-only perms) so nothing
 *      is ever truly lost. Best-effort and isolated — if the copy fails, the
 *      breadcrumb below still gets written.
 *   2. Refreshes RESUME.md with a human/agent-readable breadcrumb.
 *
 * Two hard rules:
 *   - No active Stitch session → do nothing, exit 0.
 *   - ALWAYS exit 0. PreCompact can block compaction with exit code 2, and the
 *     last thing we want is to wedge someone's session because a copy failed.
 */

import {
  readFileSync,
  copyFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";
import { loadState, formatStatus, sessionDir, snapshotsDir, resumeFile } from "../scripts/stitch-session.mjs";

/** Keep at most this many transcript snapshots so the backstop can't bloat the project. */
const MAX_SNAPSHOTS = 5;

/** Delete the oldest snapshots beyond MAX_SNAPSHOTS (lexical sort works — names are timestamped). */
function pruneSnapshots(dir) {
  try {
    const files = readdirSync(dir)
      .filter((f) => f.startsWith("transcript-") && f.endsWith(".jsonl"))
      .sort();
    for (const stale of files.slice(0, Math.max(0, files.length - MAX_SNAPSHOTS))) {
      rmSync(join(dir, stale), { force: true });
    }
  } catch {
    // pruning is housekeeping — failing it must not affect compaction
  }
}

try {
  // Parse the hook input (JSON on stdin) FIRST, so we can resolve the project
  // root from input.cwd before touching any state. session_id, transcript_path,
  // trigger, cwd are the fields we use.
  let sessionId = "session";
  let transcriptPath = "";
  let trigger = "auto";
  try {
    const raw = readFileSync(0, "utf8");
    if (raw) {
      const input = JSON.parse(raw);
      if (input.cwd && !process.env.CLAUDE_PROJECT_DIR) process.env.CLAUDE_PROJECT_DIR = input.cwd;
      sessionId = (input.session_id || "session").toString().replace(/[^\w.-]/g, "_");
      transcriptPath = (input.transcript_path || "").toString();
      trigger = (input.trigger || "auto").toString();
    }
  } catch {
    // missing/garbled input — proceed with defaults, still write the breadcrumb
  }

  // Only do anything if there's an active Stitch session to protect.
  const state = loadState();
  if (state) {
    mkdirSync(sessionDir(), { recursive: true });

    // 1. Raw transcript backstop. Isolated in its own try so a copy failure
    //    (transcript gone, perms, long filename) can't skip the breadcrumb.
    try {
      if (transcriptPath && existsSync(transcriptPath)) {
        mkdirSync(snapshotsDir(), { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const dest = join(snapshotsDir(), `transcript-${sessionId}-${stamp}.jsonl`);
        copyFileSync(transcriptPath, dest);
        chmodSync(dest, 0o600); // snapshots can hold conversation content — owner-only
        pruneSnapshots(snapshotsDir());
      }
    } catch {
      // best-effort — fall through to the breadcrumb
    }

    // 2. Human/agent-readable breadcrumb — always attempted, even if (1) failed.
    writeFileSync(
      resumeFile(),
      `# Stitch session — resume breadcrumb\n\n` +
        `_Compaction (${trigger}) at ${new Date().toISOString()}._\n\n` +
        `${formatStatus(state)}\n`
    );
  }
} catch {
  // Swallow everything — see the "ALWAYS exit 0" rule above.
}

process.exit(0);
