#!/usr/bin/env node
/**
 * stitch-session.mjs
 *
 * The one place that reads and writes Stitch session state. Skills call it as a
 * CLI ("node stitch-session.mjs set-project 3780 'Velvet Cinema' DESKTOP"); the
 * compaction hooks import its helpers. Keeping every mutation behind this one
 * module means the on-disk schema can't drift into two slightly different shapes
 * over time — there's exactly one writer, one reader, one truth.
 *
 * Why it exists: when the host (Claude Code) compacts the conversation mid-flow,
 * anything that lived only in the chat is gone. So we park the parts that
 * actually matter — which project, which screens, where the PRD draft sits — on
 * disk as we go. The SessionStart hook then points the model back at them after
 * a compaction instead of letting it restart the whole flow.
 *
 * Node, not bash+jq, on purpose: Node ships with Claude Code, jq doesn't, and
 * this runs unchanged on macOS, Linux, and native Windows.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  rmSync,
  appendFileSync,
  realpathSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Current schema version. Bump only with a migration path. */
const SCHEMA_VERSION = 1;

/** How long state stays "worth resurfacing" after the last write. Stale state is just noise. */
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Allowed clock skew for a "future" updatedAt before we treat it as bogus (and therefore stale). */
const FUTURE_SKEW_MS = 5 * 60 * 1000;

/** Device enum, used to disambiguate a trailing device arg from the project name. */
const DEVICE_RE = /^(DESKTOP|MOBILE|AGNOSTIC)$/i;

/** Artifact keys formatStatus knows how to surface. A typo'd key would silently never show up. */
const ARTIFACT_KEYS = new Set(["prdDraft", "prdFinal", "designMd"]);

/** Cap on any free-text value we inject back into the model's context after a compaction. */
const MAX_INJECTED_LEN = 120;

/**
 * The project the user is working in. Hooks receive CLAUDE_PROJECT_DIR (they set
 * it from the hook input before importing us); a hand-run CLI uses cwd, which is
 * the project root.
 * @returns {string} Absolute path to the user's project root.
 */
export function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

export function sessionDir() {
  return join(projectDir(), ".stitch", "session");
}
export function stateFile() {
  return join(sessionDir(), "state.json");
}
export function prdDraftFile() {
  return join(sessionDir(), "prd-draft.md");
}
export function snapshotsDir() {
  return join(sessionDir(), "snapshots");
}
export function resumeFile() {
  return join(sessionDir(), "RESUME.md");
}

/** Path the model should be told to re-read — relative to project root, so it's portable. */
const PRD_DRAFT_REL = ".stitch/session/prd-draft.md";

/**
 * Read state.json, or null if there's no active session.
 * Never throws — a missing or corrupt state file just means "no session",
 * because a hook that crashes on bad JSON is worse than one that does nothing.
 * @returns {object|null}
 */
export function loadState() {
  try {
    if (!existsSync(stateFile())) return null;
    return JSON.parse(readFileSync(stateFile(), "utf8"));
  } catch {
    return null;
  }
}

/**
 * Write state atomically (temp file + rename), stamping version + updatedAt.
 * The rename keeps a half-written state.json from ever being read, and means
 * the last writer wins cleanly if two subcommands race.
 * @param {object} state - The state object to persist.
 * @returns {object} The same state, with version/updatedAt set.
 */
export function saveState(state) {
  mkdirSync(sessionDir(), { recursive: true });
  state.version = SCHEMA_VERSION;
  state.updatedAt = new Date().toISOString();
  const tmp = join(sessionDir(), `.state.${process.pid}.tmp`);
  writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
  renameSync(tmp, stateFile());
  return state;
}

/**
 * Load existing state, or start a fresh skeleton for the given flow.
 * Also normalises shape so a stale/older/hand-edited file can't make a later
 * write throw (e.g. generatedScreens arriving as null).
 * @param {string} [flow] - "ideate" | "orchestrator" | "loop" (only used when creating fresh).
 * @returns {object}
 */
function ensureState(flow) {
  const state = loadState() || {
    version: SCHEMA_VERSION,
    flow: flow || "unknown",
    phase: null,
    activeProject: null,
    generatedScreens: [],
    appliedDesignSystem: null,
    artifacts: { prdDraft: null, prdFinal: null, designMd: null },
  };
  if (!Array.isArray(state.generatedScreens)) state.generatedScreens = [];
  if (!state.artifacts || typeof state.artifacts !== "object") state.artifacts = {};
  return state;
}

/**
 * Is the state fresh enough to bother resurfacing after a compaction?
 * Rejects missing, unparseable, and implausibly-future timestamps (clock skew or
 * a hand-edited file shouldn't keep stale state alive forever).
 * @param {object|null} state
 * @param {number} [maxAgeMs]
 * @returns {boolean}
 */
export function isRecent(state, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  if (!state || !state.updatedAt) return false;
  const ts = Date.parse(state.updatedAt);
  if (!Number.isFinite(ts)) return false;
  const age = Date.now() - ts;
  if (age < -FUTURE_SKEW_MS) return false; // dated in the future beyond tolerable skew
  return age < maxAgeMs;
}

/** Screen ids come in two shapes (numeric, or a `projects/.../files/123` path). Dedupe on the tail. */
function canonicalScreenId(id) {
  if (!id) return "";
  const str = String(id);
  const slash = str.lastIndexOf("/");
  return slash >= 0 ? str.slice(slash + 1) : str;
}

/** Make an externally-influenced value safe to inject into the model's context: one line, length-capped. */
function sanitizeForInjection(value) {
  if (value == null) return "";
  // eslint-disable-next-line no-control-regex
  let s = String(value).replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
  if (s.length > MAX_INJECTED_LEN) s = s.slice(0, MAX_INJECTED_LEN - 1) + "…";
  return s;
}

/**
 * One-line summary the SessionStart hook injects after a compaction.
 * This is the whole point: it tells the freshly-compacted model where its work
 * lives so it picks the flow back up instead of starting over. Project and
 * design-system names are treated as untrusted data — cleaned and capped — since
 * they flow into the model's context.
 * @param {object|null} state
 * @returns {string}
 */
export function formatStatus(state) {
  if (!state) return "";
  const phase = sanitizeForInjection(state.phase);
  const bits = [`Stitch flow in progress (flow: ${sanitizeForInjection(state.flow)}${phase ? `, phase: ${phase}` : ""}).`];
  if (state.activeProject && state.activeProject.id) {
    const name = state.activeProject.name ? ` "${sanitizeForInjection(state.activeProject.name)}"` : "";
    bits.push(`Active project ${sanitizeForInjection(state.activeProject.id)}${name}.`);
  }
  if (Array.isArray(state.generatedScreens) && state.generatedScreens.length) {
    bits.push(`${state.generatedScreens.length} screen(s) generated.`);
  }
  if (state.appliedDesignSystem && state.appliedDesignSystem.name) {
    bits.push(`Design system "${sanitizeForInjection(state.appliedDesignSystem.name)}" applied.`);
  }
  if (state.artifacts && state.artifacts.prdDraft) {
    bits.push(`PRD draft at ${sanitizeForInjection(state.artifacts.prdDraft)}.`);
  }
  bits.push(
    "Re-read .stitch/session/state.json and the PRD draft before continuing. Continue the flow, do not restart it."
  );
  return bits.join(" ");
}

/**
 * Read whatever was piped on stdin, falling back to the joined args.
 * Used by append-prd so callers can either pipe a heredoc or pass text inline.
 * @param {string[]} args
 * @returns {string}
 */
function readStdinOrArgs(args) {
  let chunk = "";
  try {
    if (!process.stdin.isTTY) chunk = readFileSync(0, "utf8");
  } catch {
    // no readable stdin — fall through to args
  }
  if (!chunk) chunk = args.join(" ");
  return chunk;
}

/**
 * CLI dispatch. Each subcommand mutates state through saveState so updatedAt
 * and version are always stamped consistently.
 * @param {string[]} argv - Arguments after the script name.
 */
function main(argv) {
  const [cmd, ...args] = argv;

  switch (cmd) {
    case "init": {
      saveState(ensureState(args[0] || "unknown"));
      break;
    }

    case "set-project": {
      const state = ensureState();
      const id = args[0];
      let name;
      let device = null;
      // Only sniff a trailing device when there's BOTH a name and a trailing
      // token (3+ args). That way "set-project 99 Mobile" keeps "Mobile" as the
      // project name instead of mistaking it for the device.
      if (args.length > 2 && DEVICE_RE.test(args[args.length - 1])) {
        device = args[args.length - 1].toUpperCase();
        name = args.slice(1, -1).join(" ");
      } else {
        name = args.slice(1).join(" ");
      }
      state.activeProject = { id, name: name || null, deviceType: device };
      saveState(state);
      break;
    }

    case "add-screen": {
      const state = ensureState();
      const id = canonicalScreenId(args[0]);
      const name = args.slice(1).join(" ") || null;
      if (id) {
        const existing = state.generatedScreens.find((s) => canonicalScreenId(s.id) === id);
        if (existing) {
          if (name) existing.name = name; // upsert a better/corrected name
        } else {
          state.generatedScreens.push({ id, name });
        }
      }
      saveState(state);
      break;
    }

    case "set-phase": {
      const state = ensureState();
      state.phase = args.join(" ") || null;
      saveState(state);
      break;
    }

    case "set-design-system": {
      const state = ensureState();
      state.appliedDesignSystem = {
        assetId: args[0] || null,
        name: args.slice(1).join(" ") || null,
      };
      saveState(state);
      break;
    }

    case "set-artifact": {
      const state = ensureState();
      const key = args[0];
      if (!ARTIFACT_KEYS.has(key)) {
        process.stderr.write(
          `stitch-session: unknown artifact key '${key}'. Known: ${[...ARTIFACT_KEYS].join(", ")}\n`
        );
        process.exit(1);
      }
      state.artifacts[key] = args[1] || null;
      saveState(state);
      break;
    }

    case "append-prd": {
      const chunk = readStdinOrArgs(args);
      if (!chunk) {
        process.stderr.write("stitch-session: append-prd received no content, nothing written\n");
        break;
      }
      mkdirSync(sessionDir(), { recursive: true });
      appendFileSync(prdDraftFile(), chunk.endsWith("\n") ? chunk : chunk + "\n");
      const state = ensureState();
      state.artifacts.prdDraft = PRD_DRAFT_REL;
      saveState(state);
      break;
    }

    case "status": {
      const state = loadState();
      if (state) process.stdout.write(formatStatus(state) + "\n");
      break;
    }

    case "read": {
      const state = loadState();
      process.stdout.write(state ? JSON.stringify(state, null, 2) + "\n" : "");
      break;
    }

    case "clear": {
      // "Flow done" — drop the live state, but KEEP snapshots/ as the recovery
      // backstop in case the flow wasn't really done. snapshots/ self-prunes.
      for (const f of [stateFile(), prdDraftFile(), resumeFile()]) {
        if (existsSync(f)) rmSync(f, { force: true });
      }
      break;
    }

    default:
      process.stderr.write(
        "stitch-session: unknown command '" +
          (cmd || "") +
          "'. Use one of: init, set-project, add-screen, set-phase, " +
          "set-design-system, set-artifact, append-prd, status, read, clear\n"
      );
      process.exit(1);
  }
}

/**
 * True when this file was run directly (CLI), false when imported by the hooks.
 * realpath both sides so a symlinked launcher still counts as direct: npm's
 * `bin` and the installer's ~/.local/bin entry are symlinks, and Node reports
 * the real path for import.meta.url while argv[1] stays the symlink — a plain
 * === would wrongly treat a `stitch-session` launcher call as an import and
 * silently do nothing.
 */
function invokedDirectly() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return fileURLToPath(import.meta.url) === process.argv[1];
  }
}

if (invokedDirectly()) {
  main(process.argv.slice(2));
}
