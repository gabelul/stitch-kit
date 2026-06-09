#!/usr/bin/env bash
# install-codex.sh
#
# Sets up stitch-kit for Codex CLI.
# Symlinks all skills into ~/.agents/skills/ so Codex auto-discovers them.
# Also registers the stitch-kit agent definition.
#
# Usage:
#   git clone https://github.com/gabelul/stitch-kit.git
#   cd stitch-kit && bash install-codex.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$REPO_DIR/skills"
AGENTS_SRC="$REPO_DIR/agents"
SKILLS_DEST="$HOME/.agents/skills"
AGENTS_DEST="$HOME/.agents/agents"

echo "stitch-kit — Codex CLI installer"
echo "================================"

# Create target directories if they don't exist
mkdir -p "$SKILLS_DEST"
mkdir -p "$AGENTS_DEST"

# Symlink each skill
echo ""
echo "Linking skills → $SKILLS_DEST"

linked=0
skipped=0

for skill_dir in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_dir")"
  target="$SKILLS_DEST/$skill_name"

  if [ -L "$target" ]; then
    echo "  skip (already linked): $skill_name"
    ((skipped++))
  elif [ -e "$target" ]; then
    echo "  skip (already exists, not a symlink): $skill_name"
    ((skipped++))
  else
    ln -s "$skill_dir" "$target"
    echo "  linked: $skill_name"
    ((linked++))
  fi
done

# Symlink the agent definition
echo ""
echo "Linking agent → $AGENTS_DEST"

for agent_file in "$AGENTS_SRC"/*.md; do
  agent_name="$(basename "$agent_file")"
  target="$AGENTS_DEST/$agent_name"

  if [ -L "$target" ] || [ -e "$target" ]; then
    echo "  skip (already exists): $agent_name"
  else
    ln -s "$agent_file" "$target"
    echo "  linked: $agent_name"
  fi
done

# Put the session-state helper on PATH. Codex skills can't reference a bundled
# script directly, so skills call `stitch-session` by name to persist state
# across context compactions.
echo ""
echo "Linking session helper → stitch-session"
LAUNCHER_DEST="$HOME/.local/bin"
mkdir -p "$LAUNCHER_DEST"
chmod +x "$REPO_DIR/scripts/stitch-session.mjs" 2>/dev/null || true
ln -sf "$REPO_DIR/scripts/stitch-session.mjs" "$LAUNCHER_DEST/stitch-session"
echo "  linked: $LAUNCHER_DEST/stitch-session"
case ":$PATH:" in
  *":$LAUNCHER_DEST:"*) ;;
  *) echo "  note: $LAUNCHER_DEST is not on your PATH — add: export PATH=\"\$HOME/.local/bin:\$PATH\"" ;;
esac

echo ""
echo "Done. $linked skills linked, $skipped skipped."
echo ""
echo "Next: make sure Stitch MCP is configured in ~/.codex/config.toml:"
echo "  (Get your API key at https://stitch.withgoogle.com/settings)"
echo ""
echo "  [mcp_servers.stitch]"
echo "  url = \"https://stitch.googleapis.com/mcp\""
echo ""
echo "  [mcp_servers.stitch.headers]"
echo "  X-Goog-Api-Key = \"YOUR-API-KEY\""
echo ""
echo "Then in Codex, invoke the agent with: \$stitch-kit"
echo "Or use any skill directly with: \$stitch-orchestrator"
echo ""
echo "Optional — auto re-orientation after a context compaction:"
echo "  install as a Codex plugin and trust its hooks:  codex plugin add ."
echo "  (without it, skills still self-recover via session state — see docs/compaction-resilience.md)"
