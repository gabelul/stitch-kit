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

echo ""
echo "Done. $linked skills linked, $skipped skipped."
echo ""
echo "Next: make sure Stitch MCP is configured in ~/.codex/config.toml:"
echo ""
echo "  [mcp_servers.stitch]"
echo "  command = \"npx\""
echo "  args = [\"-y\", \"@google/stitch-mcp\"]"
echo ""
echo "Then in Codex, invoke the agent with: \$stitch-kit"
echo "Or use any skill directly with: \$stitch-orchestrator"
