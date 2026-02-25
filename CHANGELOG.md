# Changelog

## [1.4.0] - 2026-02-25

### Added
- Prompt Quality Standard checklist in `stitch-ui-prompt-architect` — requires explicit hex colors, px font sizes, component styles before generation
- Verification gate in orchestrator before screen generation
- Project reuse logic — orchestrator checks existing projects before creating new ones
- Generation timing guidance (60–180s is normal, no spam retries)
- CHANGELOG.md for tracking releases

### Changed
- README install section: clarified agent discovery behavior
- Orchestrator Step 4: asks before creating new projects
- Orchestrator Step 5: generation timing + retry rules
- `stitch-mcp-generate-screen-from-text`: added timing section
- Strengthened anti-patterns in orchestrator (no silent project creation, no retry spam)

## [1.3.0] - 2026-02-19

### Added
- 26 skills covering full design-to-code pipeline
- Agent definition (`agents/stitch-kit.md`) for Claude Code + Codex
- MCP wrapper skills handling Stitch ID format inconsistencies
- Framework targets: Next.js, Svelte, React, HTML, React Native, SwiftUI
- Post-gen quality: design tokens, a11y audit, animations
- Multi-page consistency via stitch-loop + DESIGN.md
- Codex CLI support via install-codex.sh
- GitHub Actions CI validation
- release-please automated versioning

### Architecture
- Brain layer: spec-generator, prompt-architect, design-variants, ued-guide
- Hands layer: 6 MCP wrapper skills
- Quality layer: design-system, a11y, animate
- Loop layer: stitch-loop + design-md
