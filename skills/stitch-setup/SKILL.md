---
name: stitch-setup
description: Step-by-step installer for the stitch-kit plugin and Stitch MCP server. Use this when setting up the plugin for the first time, diagnosing connection issues, or helping a new user get Stitch running in Claude Code or Codex CLI.
allowed-tools:
  - "Bash"
  - "Read"
  - "Write"
---

# stitch-kit Setup Guide

Walks users through two setup tasks:
1. **Stitch MCP Server** — connect Claude to Google Stitch's generation tools
2. **stitch-kit Plugin** — install the skills that orchestrate the Stitch workflow

---

## When to use this skill

- User says "how do I set this up", "it's not working", "Stitch isn't available"
- Agent can't find Stitch MCP tools after running `list_tools`
- First-time setup in a new environment

---

## Step 1: Verify what's already installed

Run `list_tools` (or check the tool list). Look for any of:
- `create_project`
- `generate_screen_from_text`
- `get_screen`

**If found:** Stitch MCP is working. Skip to Step 4 (plugin install).
**If not found:** Continue with MCP setup below.

---

## Step 2: Install Stitch MCP Server

### Claude Code

Add to `~/.claude/config.json` (or via `/mcp add` command):

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@google/stitch-mcp"],
      "env": {}
    }
  }
}
```

Or using the Claude Code CLI:

```bash
claude mcp add stitch npx @google/stitch-mcp
```

### Codex CLI (OpenAI)

Add to your Codex configuration file:

```json
{
  "tools": [
    {
      "type": "mcp",
      "server": {
        "command": "npx",
        "args": ["-y", "@google/stitch-mcp"]
      }
    }
  ]
}
```

### VS Code / Cursor / Windsurf

Check your AI extension's settings for "MCP Servers" and add:
- **Command:** `npx`
- **Args:** `["-y", "@google/stitch-mcp"]`

### Manual verification

After adding, restart the client and run `list_tools`. You should see tools prefixed with `stitch:` or similar.

---

## Step 3: Authenticate with Google

Stitch MCP requires a Google account with access to Stitch. On first run:

1. The MCP server will open a browser for Google OAuth
2. Sign in with a Google account
3. Authorize Stitch access
4. Return to the terminal — authentication is saved

If you see "authentication required" errors, run:

```bash
npx @google/stitch-mcp auth
```

Or visit: https://stitch.withgoogle.com and sign in to pre-authorize.

---

## Step 4: Install stitch-kit plugin (Claude Code)

```bash
/plugin marketplace add https://github.com/gabelul/stitch-kit.git
/plugin install full@stitch-kit
```

All 26 skills in one command.

---

## Step 4b: Install the stitch-kit agent (Claude Code)

The plugin installs skills automatically, but the agent definition needs one extra step. Run this in your terminal to copy the agent to where Claude Code reads it from:

```bash
find ~/.claude/plugins/cache/stitch-kit -name "stitch-kit.md" -path "*/agents/*" | head -1 | xargs -I{} cp {} ~/.claude/agents/stitch-kit.md
```

Then restart Claude Code. The `stitch-kit` agent will appear in `/agents` and Claude will route Stitch tasks to it automatically.

---

## Step 5: Verify the full setup

Run the orchestrator to confirm everything works:

```
"Use Stitch to design a simple login screen"
```

Expected behavior:
1. `stitch-orchestrator` activates
2. It runs `list_tools` and finds Stitch MCP tools
3. It generates a Design Spec
4. It creates a project via `create_project`
5. It generates a screen via `generate_screen_from_text`
6. It retrieves the screen via `get_screen`
7. It asks you which framework to convert to

If this completes, you're fully set up.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `list_tools` doesn't show Stitch tools | MCP not installed or not started | Redo Step 2; restart your client |
| "Authentication failed" | OAuth not completed | Run `npx @google/stitch-mcp auth` |
| `create_project` fails with 403 | Account doesn't have Stitch access | Visit stitch.withgoogle.com and request access |
| `generate_screen_from_text` returns empty | Bad prompt or project ID format | Use `stitch-mcp-generate-screen-from-text` skill — it includes ID format rules |
| `get_screen` returns 404 | Wrong ID format | **projectId and screenId must be numeric only** — no `projects/` prefix |
| Generated HTML won't download | GCS URL expired or requires redirects | Use `bash scripts/fetch-stitch.sh "[url]" "temp/output.html"` |
| Plugin not activating | Wrong install command or repo URL | Verify you used `@stitch-kit` — not `@stitch-pro` or `@stitch-skills` |

---

## Network requirements

Stitch MCP makes outbound requests to:
- `stitch.withgoogle.com` — API
- `storage.googleapis.com` — file downloads (HTML, screenshots)
- `accounts.google.com` — OAuth

If you're behind a corporate proxy or VPN, ensure these domains are allowed.

---

## Offline / no-MCP mode

If you cannot install Stitch MCP, the orchestrator still works in **prompt-only mode**:
- Steps 1–3 run normally (spec generation, prompt assembly)
- Instead of generating the screen, it outputs a ready-to-copy Stitch prompt
- You paste that prompt at stitch.withgoogle.com manually
- Then you can still use the conversion skills on the downloaded HTML

---

## References

- Official Stitch MCP guide: https://stitch.withgoogle.com/docs/mcp/guide/
- Plugin repo: https://github.com/gabelul/stitch-kit
- Skills index: `docs/skills-index.md`
- MCP tool reference: `docs/mcp-naming-convention.md`
