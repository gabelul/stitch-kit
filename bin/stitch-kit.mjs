#!/usr/bin/env node

/**
 * stitch-kit CLI installer
 *
 * Installs stitch-kit skills and agent definition for Claude Code and/or Codex CLI.
 * Detects which platforms are available and installs to the right locations.
 *
 * Usage:
 *   npx @booplex/stitch-kit              — install (default)
 *   npx @booplex/stitch-kit install      — install or update
 *   npx @booplex/stitch-kit update       — same as install (npx always fetches latest)
 *   npx @booplex/stitch-kit uninstall    — remove stitch-kit from all platforms
 *   npx @booplex/stitch-kit status       — show what's installed where
 *
 * Platforms:
 *   Claude Code — agent → ~/.claude/agents/, MCP config, plugin recommendation
 *   Codex CLI   — agent → ~/.codex/agents/, skills → ~/.codex/skills/
 */

import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, readdirSync, lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

// ── Constants ──────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = resolve(__dirname, '..');

const HOME = homedir();
const CLAUDE_DIR = join(HOME, '.claude');
const CLAUDE_AGENTS_DIR = join(CLAUDE_DIR, 'agents');
const CLAUDE_PLUGINS_FILE = join(CLAUDE_DIR, 'plugins', 'installed_plugins.json');

const CODEX_DIR = join(HOME, '.codex');
const CODEX_AGENTS_DIR = join(CODEX_DIR, 'agents');
const CODEX_SKILLS_DIR = join(CODEX_DIR, 'skills');

const SKILLS_SRC = join(PACKAGE_ROOT, 'skills');
const AGENTS_SRC = join(PACKAGE_ROOT, 'agents');

const VERSION = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')).version;

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Prints styled output — keeps it readable without dependencies */
function log(msg) { console.log(msg); }
function logOk(msg) { console.log(`  ✓ ${msg}`); }
function logSkip(msg) { console.log(`  → ${msg}`); }
function logWarn(msg) { console.log(`  ⚠ ${msg}`); }
function logErr(msg) { console.error(`  ✗ ${msg}`); }

/** Check if Claude Code is installed (has ~/.claude/) */
function hasClaudeCode() {
  return existsSync(CLAUDE_DIR);
}

/** Check if Codex CLI is installed (has ~/.codex/) */
function hasCodex() {
  return existsSync(CODEX_DIR);
}

/** Check if stitch-kit is already installed as a Claude Code plugin */
function isPluginInstalled() {
  if (!existsSync(CLAUDE_PLUGINS_FILE)) return false;
  try {
    const plugins = JSON.parse(readFileSync(CLAUDE_PLUGINS_FILE, 'utf8'));
    // installed_plugins.json is an array of plugin objects
    if (Array.isArray(plugins)) {
      return plugins.some(p =>
        (p.name && p.name.includes('stitch-kit')) ||
        (p.source && p.source.includes('stitch-kit'))
      );
    }
    // Or it could be an object with plugin entries
    return JSON.stringify(plugins).includes('stitch-kit');
  } catch {
    return false;
  }
}

/**
 * Copy a file, creating parent directories as needed.
 * Returns true if the file was written, false if skipped.
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

// ── Install ────────────────────────────────────────────────────────────────────

function installClaudeCode() {
  log('');
  log('Claude Code');
  log('───────────');

  const pluginInstalled = isPluginInstalled();

  // Always install/update the agent definition
  const agentSrc = join(AGENTS_SRC, 'stitch-kit.md');
  const agentDest = join(CLAUDE_AGENTS_DIR, 'stitch-kit.md');

  if (copyFile(agentSrc, agentDest)) {
    logOk(`Agent installed → ${agentDest}`);
  }

  // Check if Stitch MCP is configured by reading the settings file directly
  let mcpConfigured = false;
  const claudeSettingsFile = join(CLAUDE_DIR, 'settings.json');
  if (existsSync(claudeSettingsFile)) {
    try {
      const settings = JSON.parse(readFileSync(claudeSettingsFile, 'utf8'));
      mcpConfigured = settings.mcpServers && 'stitch' in settings.mcpServers;
    } catch { /* ignore parse errors */ }
  }
  // Also check project-level .mcp.json in common locations
  if (!mcpConfigured) {
    const mcpJson = join(process.cwd(), '.mcp.json');
    if (existsSync(mcpJson)) {
      try {
        const mcp = JSON.parse(readFileSync(mcpJson, 'utf8'));
        mcpConfigured = mcp.mcpServers && 'stitch' in mcp.mcpServers;
      } catch { /* ignore */ }
    }
  }

  if (!mcpConfigured) {
    log('');
    log('  Stitch MCP not detected. To add it, run in your terminal:');
    log('');
    log('    claude mcp add stitch -- npx -y @google/stitch-mcp');
    log('');
  } else {
    logOk('Stitch MCP already configured');
  }

  // Skills: plugin system is the right path for Claude Code
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
}

function installCodex() {
  log('');
  log('Codex CLI');
  log('─────────');

  // Install agent
  const agentSrc = join(AGENTS_SRC, 'stitch-kit.md');
  const agentDest = join(CODEX_AGENTS_DIR, 'stitch-kit.md');
  mkdirSync(CODEX_AGENTS_DIR, { recursive: true });

  if (copyFile(agentSrc, agentDest)) {
    logOk(`Agent installed → ${agentDest}`);
  }

  // Install skills — copy each skill directory
  mkdirSync(CODEX_SKILLS_DIR, { recursive: true });
  const skills = listSkills();
  let installed = 0;
  let updated = 0;

  for (const skillName of skills) {
    const src = join(SKILLS_SRC, skillName);
    const dest = join(CODEX_SKILLS_DIR, skillName);

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

  // Check Stitch MCP in codex config
  const codexConfig = join(CODEX_DIR, 'config.toml');
  let mcpConfigured = false;
  if (existsSync(codexConfig)) {
    try {
      const content = readFileSync(codexConfig, 'utf8');
      mcpConfigured = content.includes('stitch');
    } catch { /* ignore */ }
  }

  if (!mcpConfigured) {
    log('');
    log('  Add Stitch MCP to ~/.codex/config.toml:');
    log('');
    log('    [mcp_servers.stitch]');
    log('    command = "npx"');
    log('    args = ["-y", "@google/stitch-mcp"]');
  } else {
    logOk('Stitch MCP already in config.toml');
  }

  log('');
  log('  Use $stitch-kit to invoke the agent');
  log('  Use $stitch-orchestrator for the full pipeline');
}

function install() {
  log(`stitch-kit v${VERSION} — installer`);
  log('════════════════════════════════');

  const claude = hasClaudeCode();
  const codex = hasCodex();

  if (!claude && !codex) {
    log('');
    logErr('Neither Claude Code (~/.claude/) nor Codex CLI (~/.codex/) found.');
    log('');
    log('  Install Claude Code: https://claude.ai/code');
    log('  Install Codex CLI:   https://github.com/openai/codex');
    log('');
    process.exit(1);
  }

  if (claude) installClaudeCode();
  if (codex) installCodex();

  log('');
  log('════════════════════════════════');
  log('Done.');
  if (claude && codex) {
    log('Installed for both Claude Code and Codex CLI.');
  } else if (claude) {
    log('Installed for Claude Code.');
  } else {
    log('Installed for Codex CLI.');
  }
  log('');
}

// ── Uninstall ──────────────────────────────────────────────────────────────────

function uninstall() {
  log(`stitch-kit v${VERSION} — uninstaller`);
  log('══════════════════════════════════');

  // Claude Code — remove agent only (plugin managed separately)
  const claudeAgent = join(CLAUDE_AGENTS_DIR, 'stitch-kit.md');
  if (existsSync(claudeAgent)) {
    rmSync(claudeAgent);
    logOk('Removed Claude Code agent');
  }

  if (isPluginInstalled()) {
    logWarn('stitch-kit plugin is still installed in Claude Code.');
    log('  To remove it, run inside Claude Code: /plugin uninstall stitch-kit');
  }

  // Codex — remove agent + all stitch skills
  const codexAgent = join(CODEX_AGENTS_DIR, 'stitch-kit.md');
  if (existsSync(codexAgent)) {
    rmSync(codexAgent);
    logOk('Removed Codex agent');
  }

  const skills = listSkills();
  let removed = 0;
  for (const skillName of skills) {
    const dest = join(CODEX_SKILLS_DIR, skillName);
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
    logOk(`Removed ${removed} Codex skills`);
  }

  log('');
  log('Done. Stitch MCP server config was left in place — remove manually if needed.');
  log('');
}

// ── Status ─────────────────────────────────────────────────────────────────────

function status() {
  log(`stitch-kit v${VERSION} — status`);
  log('══════════════════════════════');

  log('');
  log('Claude Code');
  log('───────────');
  if (!hasClaudeCode()) {
    logWarn('Not installed (~/.claude/ not found)');
  } else {
    const agentExists = existsSync(join(CLAUDE_AGENTS_DIR, 'stitch-kit.md'));
    const pluginExists = isPluginInstalled();

    if (agentExists) logOk('Agent: installed');
    else logWarn('Agent: not installed');

    if (pluginExists) logOk('Plugin: installed (skills delivered via plugin)');
    else logWarn('Plugin: not installed (skills not available — run /plugin install)');
  }

  log('');
  log('Codex CLI');
  log('─────────');
  if (!hasCodex()) {
    logWarn('Not installed (~/.codex/ not found)');
  } else {
    const agentExists = existsSync(join(CODEX_AGENTS_DIR, 'stitch-kit.md'));
    if (agentExists) logOk('Agent: installed');
    else logWarn('Agent: not installed');

    // Count installed skills
    const skills = listSkills();
    let installedCount = 0;
    for (const s of skills) {
      if (existsSync(join(CODEX_SKILLS_DIR, s))) installedCount++;
    }
    if (installedCount === skills.length) {
      logOk(`Skills: ${installedCount}/${skills.length} installed`);
    } else if (installedCount > 0) {
      logWarn(`Skills: ${installedCount}/${skills.length} installed (outdated — run npx @booplex/stitch-kit update)`);
    } else {
      logWarn('Skills: none installed');
    }
  }

  log('');
}

// ── CLI entry point ────────────────────────────────────────────────────────────

const command = process.argv[2] || 'install';

switch (command) {
  case 'install':
  case 'update':
    install();
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
    log('Platforms detected automatically:');
    log('  Claude Code  ~/.claude/agents/ + plugin system');
    log('  Codex CLI    ~/.codex/agents/ + ~/.codex/skills/');
    log('');
    break;
  default:
    logErr(`Unknown command: ${command}`);
    log('Run: npx @booplex/stitch-kit --help');
    process.exit(1);
}
