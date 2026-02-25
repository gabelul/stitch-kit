#!/usr/bin/env node

/**
 * stitch-kit CLI installer
 *
 * Installs stitch-kit skills and agent definition for supported code editors/CLIs.
 * Uses a registry pattern — adding a new client = adding one config object.
 *
 * Usage:
 *   npx @booplex/stitch-kit              — install (default)
 *   npx @booplex/stitch-kit install      — install or update
 *   npx @booplex/stitch-kit update       — same as install (npx always fetches latest)
 *   npx @booplex/stitch-kit uninstall    — remove stitch-kit from all platforms
 *   npx @booplex/stitch-kit status       — show what's installed where
 *
 * Supported platforms (auto-detected):
 *   Claude Code  — agent + MCP + plugin system
 *   Codex CLI    — agent + skills + MCP (TOML)
 *   Cursor       — MCP only
 *   VS Code      — MCP only
 *   OpenCode     — agent + skills + MCP
 *   Crush        — skills + MCP
 *   Gemini CLI   — extension install (no MCP config file)
 */

import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync, lstatSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

// ── Shared Constants ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = resolve(__dirname, '..');

const HOME = homedir();
const SKILLS_SRC = join(PACKAGE_ROOT, 'skills');
const AGENTS_SRC = join(PACKAGE_ROOT, 'agents');
const STITCH_MCP_URL = 'https://stitch.googleapis.com/mcp';

const VERSION = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')).version;

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Prints styled output — keeps it readable without dependencies */
function log(msg) { console.log(msg); }
function logOk(msg) { console.log(`  ✓ ${msg}`); }
function logSkip(msg) { console.log(`  → ${msg}`); }
function logWarn(msg) { console.log(`  ⚠ ${msg}`); }
function logErr(msg) { console.error(`  ✗ ${msg}`); }

/**
 * Prompt the user for input via stdin.
 * @param {string} question - The question to display
 * @returns {Promise<string>} The user's input (trimmed)
 */
function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Copy a file, creating parent directories as needed.
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @param {boolean} overwrite - Whether to overwrite existing files
 * @returns {boolean} True if the file was written
 */
function copyFile(src, dest, overwrite = true) {
  if (!existsSync(src)) {
    logErr(`Source not found: ${src}`);
    return false;
  }
  if (existsSync(dest) && !overwrite) {
    logSkip(`Already exists: ${dest}`);
    return false;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { force: true });
  return true;
}

/**
 * Copy an entire directory recursively.
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, force: true });
}

/**
 * List skill directory names from the source.
 * @returns {string[]} Array of skill directory names
 */
function listSkills() {
  if (!existsSync(SKILLS_SRC)) return [];
  return readdirSync(SKILLS_SRC).filter(name => {
    const full = join(SKILLS_SRC, name);
    return lstatSync(full).isDirectory();
  });
}

/**
 * Check if a shell command exists on the system PATH.
 * @param {string} cmd - Command name to check
 * @returns {boolean} True if command is available
 */
function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ── Client Registry ─────────────────────────────────────────────────────────────
//
// Each client declares how to detect it, where its MCP config lives,
// the JSON structure it expects, and where agents/skills go.
// Generic functions iterate this registry — no per-platform if/else.

/**
 * @typedef {Object} McpConfig
 * @property {string} configPath - Full path to the MCP config file
 * @property {string} format - Config format: 'json' or 'toml'
 * @property {string} wrapperKey - Top-level key wrapping MCP servers (e.g. 'mcpServers', 'servers', 'mcp')
 * @property {string} urlField - Field name for the server URL
 * @property {Object} extraFields - Extra fields per MCP entry (e.g. { type: 'http' })
 * @property {Object} extraHeaders - Extra headers beyond X-Goog-Api-Key (e.g. { Accept: 'application/json' })
 * @property {string[]} fallbackPaths - Additional paths to check for existing config
 * @property {string[]} manualInstructions - Lines to show when API key is not provided
 */

/**
 * @typedef {Object} Client
 * @property {string} id - Unique identifier
 * @property {string} name - Human-readable name
 * @property {Function} detect - Returns true if client is installed
 * @property {McpConfig|null} mcp - MCP configuration (null for extension-based installs)
 * @property {string|null} agentDir - Where to copy agent .md files (null = not supported)
 * @property {string|null} skillsDir - Where to copy skill directories (null = not supported)
 * @property {Function|null} postInstall - Optional hook called after install
 * @property {string|null} installUrl - URL where user can install this client
 * @property {boolean} isExtensionBased - True if MCP is installed via extension (e.g. Gemini CLI)
 * @property {string[]} extensionInstructions - Lines to show for extension-based installs
 */

const CLAUDE_DIR = join(HOME, '.claude');
const CLAUDE_PLUGINS_FILE = join(CLAUDE_DIR, 'plugins', 'installed_plugins.json');

/**
 * Check if stitch-kit is already installed as a Claude Code plugin.
 * @returns {boolean}
 */
function isPluginInstalled() {
  if (!existsSync(CLAUDE_PLUGINS_FILE)) return false;
  try {
    const plugins = JSON.parse(readFileSync(CLAUDE_PLUGINS_FILE, 'utf8'));
    if (Array.isArray(plugins)) {
      return plugins.some(p =>
        (p.name && p.name.includes('stitch-kit')) ||
        (p.source && p.source.includes('stitch-kit'))
      );
    }
    return JSON.stringify(plugins).includes('stitch-kit');
  } catch {
    return false;
  }
}

/** The registry of all supported CLI clients */
const CLIENTS = [
  // ── Claude Code ─────────────────────────────────────────────────────────────
  {
    id: 'claude-code',
    name: 'Claude Code',
    detect: () => existsSync(CLAUDE_DIR),
    mcp: {
      configPath: join(CLAUDE_DIR, 'settings.json'),
      format: 'json',
      wrapperKey: 'mcpServers',
      urlField: 'url',
      extraFields: { type: 'http' },
      extraHeaders: {},
      fallbackPaths: [join(process.cwd(), '.mcp.json')],
      manualInstructions: [
        '  Add it manually:',
        '    claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \\',
        '      --header "X-Goog-Api-Key: YOUR-API-KEY" -s user',
      ],
    },
    agentDir: join(CLAUDE_DIR, 'agents'),
    skillsDir: null,  // Skills delivered via plugin system
    postInstall: () => {
      // Claude Code-specific: recommend plugin for skills
      const pluginInstalled = isPluginInstalled();
      if (pluginInstalled) {
        logOk('Plugin already installed — skills delivered via plugin system');
        log('');
        log('  To update the plugin to the latest version:');
        log('    /plugin install stitch-kit@stitch-kit');
      } else {
        log('');
        log('  For full skill support in Claude Code, install the plugin:');
        log('');
        log('    /plugin marketplace add https://github.com/gabelul/stitch-kit.git');
        log('    /plugin install stitch-kit@stitch-kit');
        log('');
        log('  The agent works standalone with MCP tools, but skills add');
        log('  prompt engineering, design tokens, and framework conversion.');
      }
    },
    installUrl: 'https://claude.ai/code',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── Codex CLI ───────────────────────────────────────────────────────────────
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    detect: () => existsSync(join(HOME, '.codex')),
    mcp: {
      configPath: join(HOME, '.codex', 'config.toml'),
      format: 'toml',
      wrapperKey: 'mcp_servers',  // TOML section key
      urlField: 'url',
      extraFields: {},
      extraHeaders: {},
      fallbackPaths: [],
      manualInstructions: [
        '  Add it manually to ~/.codex/config.toml:',
        '',
        '    [mcp_servers.stitch]',
        '    url = "https://stitch.googleapis.com/mcp"',
        '',
        '    [mcp_servers.stitch.headers]',
        '    X-Goog-Api-Key = "YOUR-API-KEY"',
      ],
    },
    agentDir: join(HOME, '.codex', 'agents'),
    skillsDir: join(HOME, '.codex', 'skills'),
    postInstall: () => {
      log('');
      log('  Use $stitch-kit to invoke the agent');
      log('  Use $stitch-orchestrator for the full pipeline');
    },
    installUrl: 'https://github.com/openai/codex',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── Cursor ──────────────────────────────────────────────────────────────────
  {
    id: 'cursor',
    name: 'Cursor',
    detect: () => existsSync(join(HOME, '.cursor')),
    mcp: {
      configPath: join(HOME, '.cursor', 'mcp.json'),
      format: 'json',
      wrapperKey: 'mcpServers',
      urlField: 'url',
      extraFields: {},
      extraHeaders: {},
      fallbackPaths: [],
      manualInstructions: [
        '  Add it manually to ~/.cursor/mcp.json:',
        '',
        '    { "mcpServers": { "stitch": {',
        '      "url": "https://stitch.googleapis.com/mcp",',
        '      "headers": { "X-Goog-Api-Key": "YOUR-API-KEY" }',
        '    } } }',
      ],
    },
    agentDir: null,
    skillsDir: null,
    postInstall: null,
    installUrl: 'https://cursor.sh',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── VS Code ─────────────────────────────────────────────────────────────────
  // VS Code uses 'servers' (not 'mcpServers') and requires type: 'http' + Accept header
  {
    id: 'vscode',
    name: 'VS Code',
    detect: () => existsSync(join(HOME, '.vscode')),
    mcp: {
      configPath: join(HOME, '.vscode', 'mcp.json'),
      format: 'json',
      wrapperKey: 'servers',
      urlField: 'url',
      extraFields: { type: 'http' },
      extraHeaders: { Accept: 'application/json' },
      fallbackPaths: [],
      manualInstructions: [
        '  Add it manually to .vscode/mcp.json:',
        '',
        '    { "servers": { "stitch": {',
        '      "url": "https://stitch.googleapis.com/mcp",',
        '      "type": "http",',
        '      "headers": { "Accept": "application/json", "X-Goog-Api-Key": "YOUR-API-KEY" }',
        '    } } }',
      ],
    },
    agentDir: null,
    skillsDir: null,
    postInstall: null,
    installUrl: 'https://code.visualstudio.com',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── OpenCode ────────────────────────────────────────────────────────────────
  // OpenCode uses 'mcp' wrapper key with type: 'remote' and an 'enabled' flag
  {
    id: 'opencode',
    name: 'OpenCode',
    detect: () => existsSync(join(HOME, '.config', 'opencode')),
    mcp: {
      configPath: join(HOME, '.config', 'opencode', 'opencode.json'),
      format: 'json',
      wrapperKey: 'mcp',
      urlField: 'url',
      extraFields: { type: 'remote', enabled: true },
      extraHeaders: {},
      fallbackPaths: [],
      manualInstructions: [
        '  Add it manually to ~/.config/opencode/opencode.json:',
        '',
        '    { "mcp": { "stitch": {',
        '      "type": "remote",',
        '      "url": "https://stitch.googleapis.com/mcp",',
        '      "enabled": true,',
        '      "headers": { "X-Goog-Api-Key": "YOUR-API-KEY" }',
        '    } } }',
      ],
    },
    agentDir: join(HOME, '.config', 'opencode', 'agents'),
    skillsDir: join(HOME, '.config', 'opencode', 'skills'),
    postInstall: null,
    installUrl: 'https://github.com/opencode-ai/opencode',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── Crush ───────────────────────────────────────────────────────────────────
  // Crush uses 'mcp' wrapper key with type: 'http' (no agent dir, skills only)
  {
    id: 'crush',
    name: 'Crush',
    detect: () => existsSync(join(HOME, '.config', 'crush')),
    mcp: {
      configPath: join(HOME, '.config', 'crush', 'crush.json'),
      format: 'json',
      wrapperKey: 'mcp',
      urlField: 'url',
      extraFields: { type: 'http' },
      extraHeaders: {},
      fallbackPaths: [],
      manualInstructions: [
        '  Add it manually to ~/.config/crush/crush.json:',
        '',
        '    { "mcp": { "stitch": {',
        '      "type": "http",',
        '      "url": "https://stitch.googleapis.com/mcp",',
        '      "headers": { "X-Goog-Api-Key": "YOUR-API-KEY" }',
        '    } } }',
      ],
    },
    agentDir: null,
    skillsDir: join(HOME, '.config', 'crush', 'skills'),
    postInstall: null,
    installUrl: 'https://github.com/charmbracelet/crush',
    isExtensionBased: false,
    extensionInstructions: [],
  },

  // ── Gemini CLI ──────────────────────────────────────────────────────────────
  // Gemini CLI uses extension install, not MCP config files
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    detect: () => commandExists('gemini'),
    mcp: null,  // No MCP config file — uses extension system
    agentDir: null,
    skillsDir: null,
    postInstall: null,
    installUrl: 'https://github.com/google-gemini/gemini-cli',
    isExtensionBased: true,
    extensionInstructions: [
      '  Install the Stitch extension for Gemini CLI:',
      '',
      '    gemini extensions install https://github.com/gemini-cli-extensions/stitch',
    ],
  },
];

// ── Generic MCP Operations ──────────────────────────────────────────────────────

/**
 * Check if Stitch MCP is already configured for a client.
 * Handles both JSON and TOML formats, plus fallback paths.
 * @param {Client} client - Client to check
 * @returns {boolean} True if stitch MCP entry exists
 */
function isMcpConfigured(client) {
  if (!client.mcp) return false;
  const { configPath, format, wrapperKey, fallbackPaths } = client.mcp;

  // Check the primary config path
  if (existsSync(configPath)) {
    try {
      if (format === 'toml') {
        // TOML: simple string search for the section header
        const content = readFileSync(configPath, 'utf8');
        if (content.includes(`[${wrapperKey}.stitch]`)) return true;
      } else {
        // JSON: parse and check for stitch key under the wrapper
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        if (config[wrapperKey] && 'stitch' in config[wrapperKey]) return true;
      }
    } catch { /* ignore parse errors, treat as not configured */ }
  }

  // Check fallback paths (e.g. project-level .mcp.json for Claude Code)
  for (const fallback of (fallbackPaths || [])) {
    if (existsSync(fallback)) {
      try {
        const config = JSON.parse(readFileSync(fallback, 'utf8'));
        if (config[wrapperKey] && 'stitch' in config[wrapperKey]) return true;
      } catch { /* ignore */ }
    }
  }

  return false;
}

/**
 * Build the Stitch MCP entry object for a client.
 * Each client has different JSON structure requirements (url field, extra fields, headers).
 * @param {Client} client - Client to build entry for
 * @param {string} apiKey - The Stitch API key
 * @returns {Object} The MCP entry to write
 */
function buildMcpEntry(client, apiKey) {
  const { urlField, extraFields, extraHeaders } = client.mcp;

  // Base entry: URL + any extra fields (type, enabled, etc.)
  const entry = {
    [urlField]: STITCH_MCP_URL,
    ...extraFields,
  };

  // Headers: always include API key, plus any client-specific extras
  entry.headers = {
    ...extraHeaders,
    'X-Goog-Api-Key': apiKey,
  };

  return entry;
}

/**
 * Install Stitch MCP configuration for a client.
 * Handles JSON (read-merge-write) and TOML (append) formats.
 * @param {Client} client - Client to configure
 * @param {string} apiKey - The Stitch API key
 * @returns {'already' | 'installed' | 'skipped' | 'failed'} Result
 */
function installMcp(client, apiKey) {
  if (!client.mcp) return 'skipped';

  // Already configured? Don't touch it.
  if (isMcpConfigured(client)) return 'already';

  // No API key? Can't configure a remote MCP server without one.
  if (!apiKey) return 'skipped';

  const { configPath, format, wrapperKey } = client.mcp;

  try {
    if (format === 'toml') {
      // ── TOML: append the stitch MCP block ──────────────────────────────
      // Codex CLI is currently the only TOML client. We append rather than
      // parse TOML (no dependency needed) since the format is simple.
      const stitchBlock = [
        '',
        `[${wrapperKey}.stitch]`,
        `url = "${STITCH_MCP_URL}"`,
        '',
        `[${wrapperKey}.stitch.headers]`,
        `X-Goog-Api-Key = "${apiKey}"`,
        '',
      ].join('\n');

      if (existsSync(configPath)) {
        const content = readFileSync(configPath, 'utf8');
        writeFileSync(configPath, content + stitchBlock);
      } else {
        mkdirSync(dirname(configPath), { recursive: true });
        writeFileSync(configPath, stitchBlock.trimStart());
      }
    } else {
      // ── JSON: read → merge → write ─────────────────────────────────────
      // Safe merge: read existing config, add stitch entry under the wrapper key.
      let config = {};
      if (existsSync(configPath)) {
        config = JSON.parse(readFileSync(configPath, 'utf8'));
      } else {
        mkdirSync(dirname(configPath), { recursive: true });
      }

      if (!config[wrapperKey]) config[wrapperKey] = {};
      config[wrapperKey].stitch = buildMcpEntry(client, apiKey);

      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    }

    return 'installed';
  } catch {
    return 'failed';
  }
}

// ── Generic Install / Uninstall / Status ────────────────────────────────────────

/**
 * Install stitch-kit for a single client: agent → skills → MCP → postInstall.
 * @param {Client} client - Client to install for
 * @param {string} apiKey - Optional Stitch API key for MCP config
 */
function installClient(client, apiKey) {
  log('');
  log(client.name);
  log('─'.repeat(client.name.length));

  // ── Agent (if supported) ─────────────────────────────────────────────────
  if (client.agentDir) {
    const agentSrc = join(AGENTS_SRC, 'stitch-kit.md');
    const agentDest = join(client.agentDir, 'stitch-kit.md');
    mkdirSync(client.agentDir, { recursive: true });

    if (copyFile(agentSrc, agentDest)) {
      logOk(`Agent installed → ${agentDest}`);
    }
  }

  // ── Skills (if supported) ────────────────────────────────────────────────
  if (client.skillsDir) {
    mkdirSync(client.skillsDir, { recursive: true });
    const skills = listSkills();
    let installed = 0;
    let updated = 0;

    for (const skillName of skills) {
      const src = join(SKILLS_SRC, skillName);
      const dest = join(client.skillsDir, skillName);
      const existed = existsSync(dest);

      // Remove old symlinks or dirs before copying fresh
      if (existed) {
        if (lstatSync(dest).isSymbolicLink()) {
          unlinkSync(dest);
        } else {
          rmSync(dest, { recursive: true, force: true });
        }
        updated++;
      } else {
        installed++;
      }

      copyDir(src, dest);
    }

    logOk(`${installed} skills installed, ${updated} updated (${skills.length} total)`);
  }

  // ── MCP configuration ────────────────────────────────────────────────────
  if (client.mcp) {
    const mcpStatus = installMcp(client, apiKey);

    if (mcpStatus === 'installed') {
      logOk(`Stitch MCP configured with API key`);
    } else if (mcpStatus === 'already') {
      logOk('Stitch MCP already configured');
    } else {
      logWarn('Stitch MCP not configured (no API key provided)');
      log('');
      for (const line of client.mcp.manualInstructions) {
        log(line);
      }
      log('');
    }
  }

  // ── Extension-based install (Gemini CLI) ─────────────────────────────────
  if (client.isExtensionBased) {
    log('');
    for (const line of client.extensionInstructions) {
      log(line);
    }
  }

  // ── Post-install hook (Claude Code plugin recommendation, etc.) ──────────
  if (client.postInstall) {
    client.postInstall();
  }
}

/**
 * Uninstall stitch-kit from a single client: remove agent + skills.
 * MCP config is left in place (user may want to keep it).
 * @param {Client} client - Client to uninstall from
 */
function uninstallClient(client) {
  let didSomething = false;

  // ── Remove agent ─────────────────────────────────────────────────────────
  if (client.agentDir) {
    const agentPath = join(client.agentDir, 'stitch-kit.md');
    if (existsSync(agentPath)) {
      rmSync(agentPath);
      logOk(`Removed ${client.name} agent`);
      didSomething = true;
    }
  }

  // ── Remove skills ────────────────────────────────────────────────────────
  if (client.skillsDir) {
    const skills = listSkills();
    let removed = 0;
    for (const skillName of skills) {
      const dest = join(client.skillsDir, skillName);
      if (existsSync(dest)) {
        if (lstatSync(dest).isSymbolicLink()) {
          unlinkSync(dest);
        } else {
          rmSync(dest, { recursive: true, force: true });
        }
        removed++;
      }
    }
    if (removed > 0) {
      logOk(`Removed ${removed} ${client.name} skills`);
      didSomething = true;
    }
  }

  // ── Claude Code specific: warn about plugin ──────────────────────────────
  if (client.id === 'claude-code' && isPluginInstalled()) {
    logWarn('stitch-kit plugin is still installed in Claude Code.');
    log('  To remove it, run inside Claude Code: /plugin uninstall stitch-kit');
    didSomething = true;
  }

  if (!didSomething) {
    logSkip(`Nothing to remove for ${client.name}`);
  }
}

/**
 * Show installation status for a single client.
 * Reports agent, skills, MCP, and plugin status as applicable.
 * @param {Client} client - Client to report on
 */
function statusClient(client) {
  log('');
  log(client.name);
  log('─'.repeat(client.name.length));

  if (!client.detect()) {
    logWarn(`Not detected`);
    return;
  }

  // ── Agent status ─────────────────────────────────────────────────────────
  if (client.agentDir) {
    const agentExists = existsSync(join(client.agentDir, 'stitch-kit.md'));
    if (agentExists) logOk('Agent: installed');
    else logWarn('Agent: not installed');
  }

  // ── Skills status ────────────────────────────────────────────────────────
  if (client.skillsDir) {
    const skills = listSkills();
    let installedCount = 0;
    for (const s of skills) {
      if (existsSync(join(client.skillsDir, s))) installedCount++;
    }
    if (installedCount === skills.length) {
      logOk(`Skills: ${installedCount}/${skills.length} installed`);
    } else if (installedCount > 0) {
      logWarn(`Skills: ${installedCount}/${skills.length} installed (outdated — run npx @booplex/stitch-kit update)`);
    } else {
      logWarn('Skills: none installed');
    }
  }

  // ── Plugin status (Claude Code only) ─────────────────────────────────────
  if (client.id === 'claude-code') {
    const pluginExists = isPluginInstalled();
    if (pluginExists) logOk('Plugin: installed (skills delivered via plugin)');
    else logWarn('Plugin: not installed (skills not available — run /plugin install)');
  }

  // ── MCP status ───────────────────────────────────────────────────────────
  if (client.mcp) {
    if (isMcpConfigured(client)) logOk('Stitch MCP: configured');
    else logWarn('Stitch MCP: not configured — run npx @booplex/stitch-kit to add it');
  }

  // ── Extension-based status (Gemini CLI) ──────────────────────────────────
  if (client.isExtensionBased) {
    logSkip('Extension-based — run "gemini extensions list" to check');
  }
}

// ── Main Commands ───────────────────────────────────────────────────────────────

/**
 * Main install flow:
 * 1. Detect all clients
 * 2. Prompt for API key once (shared across all platforms)
 * 3. Install for each detected client
 */
async function install() {
  log(`stitch-kit v${VERSION} — installer`);
  log('════════════════════════════════');

  // Detect which clients are present
  const detected = CLIENTS.filter(c => c.detect());

  if (detected.length === 0) {
    log('');
    logErr('No supported platforms detected.');
    log('');
    log('  Supported platforms:');
    for (const c of CLIENTS) {
      log(`    ${c.name.padEnd(14)} ${c.installUrl}`);
    }
    log('');
    process.exit(1);
  }

  // Check if any detected client needs MCP configured
  // (has MCP config support and isn't already set up)
  const needsMcp = detected.some(c => c.mcp && !isMcpConfigured(c));

  // Prompt for API key once, shared across all platforms
  let apiKey = '';
  if (needsMcp) {
    log('');
    log('Stitch MCP needs to be configured.');
    log('Stitch is a remote MCP server — it needs an API key to authenticate.');
    log('');
    log('  1. Go to https://stitch.withgoogle.com/settings');
    log('  2. Scroll to "API Keys" and click "Create API Key"');
    log('  3. Copy and paste it below');
    log('');
    apiKey = await prompt('  Stitch API key (press Enter to skip): ');
    if (apiKey) {
      logOk('API key provided — will configure for all platforms');
    } else {
      logSkip('Skipped — you can configure Stitch MCP manually later');
      log('  See: https://stitch.withgoogle.com/docs/mcp/setup');
    }
  }

  // Install for each detected client
  for (const client of detected) {
    installClient(client, apiKey);
  }

  // Summary
  log('');
  log('════════════════════════════════');
  log('Done.');
  const names = detected.map(c => c.name).join(', ');
  log(`Installed for: ${names}`);
  log('');
}

/**
 * Uninstall stitch-kit from all detected platforms.
 * Removes agents and skills. Leaves MCP config in place.
 */
function uninstall() {
  log(`stitch-kit v${VERSION} — uninstaller`);
  log('══════════════════════════════════');

  for (const client of CLIENTS) {
    if (client.detect()) {
      uninstallClient(client);
    }
  }

  log('');
  log('Done. Stitch MCP server config was left in place — remove manually if needed.');
  log('');
}

/**
 * Show installation status for all platforms.
 * Shows both detected and undetected platforms.
 */
function status() {
  log(`stitch-kit v${VERSION} — status`);
  log('══════════════════════════════');

  for (const client of CLIENTS) {
    statusClient(client);
  }

  log('');
}

// ── CLI entry point ─────────────────────────────────────────────────────────────

const command = process.argv[2] || 'install';

switch (command) {
  case 'install':
  case 'update':
    await install();
    break;
  case 'uninstall':
  case 'remove':
    uninstall();
    break;
  case 'status':
    status();
    break;
  case '--version':
  case '-v':
    log(VERSION);
    break;
  case '--help':
  case '-h':
    log(`stitch-kit v${VERSION}`);
    log('');
    log('Usage: npx @booplex/stitch-kit [command]');
    log('');
    log('Commands:');
    log('  install   Install or update stitch-kit (default)');
    log('  update    Same as install — npx always fetches latest');
    log('  uninstall Remove stitch-kit from all platforms');
    log('  status    Show what is installed where');
    log('');
    log('Supported platforms (auto-detected):');
    for (const c of CLIENTS) {
      const features = [];
      if (c.agentDir) features.push('agent');
      if (c.skillsDir) features.push('skills');
      if (c.mcp) features.push('MCP');
      if (c.isExtensionBased) features.push('extension');
      if (c.id === 'claude-code') features.push('plugin');
      log(`  ${c.name.padEnd(14)} ${features.join(' + ')}`);
    }
    log('');
    break;
  default:
    logErr(`Unknown command: ${command}`);
    log('Run: npx @booplex/stitch-kit --help');
    process.exit(1);
}
