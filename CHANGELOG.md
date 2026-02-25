# Changelog

## [1.5.0] - 2026-02-25

### Added
- 8 new MCP wrapper skills covering all remaining Stitch API tools (14 total):
  - `stitch-mcp-edit-screens` — iterate on designs with text prompts (the iteration tool)
  - `stitch-mcp-generate-variants` — native variant generation with creativity/aspect controls
  - `stitch-mcp-upload-screens-from-images` — import screenshots for redesign workflows
  - `stitch-mcp-delete-project` — project cleanup with mandatory confirmation gate
  - `stitch-mcp-create-design-system` — create reusable Stitch Design Systems from tokens
  - `stitch-mcp-update-design-system` — modify existing design systems
  - `stitch-mcp-list-design-systems` — discover available design systems
  - `stitch-mcp-apply-design-system` — apply design systems to screens for visual consistency
- `encode-image.sh` helper script for base64 image encoding (macOS + Linux)
- Post-generation iteration loop in orchestrator (Step 5b) — edit, variant, or apply design system before code conversion
- Design system bridge (Step 7b) — maps extracted CSS tokens to Stitch Design System format
- Design system check (Step 4b) — detects existing design systems when selecting a project
- Native API detection in `stitch-ui-design-variants` — uses `generate_variants` tool when available (1 call vs 3)
- Consolidated ID format table for all 14 MCP tools in orchestrator
- 8 new JSON schema files in `docs/mcp-schemas/`

### Changed
- Orchestrator intent classification expanded from 4 to 7 (added: Edit existing, Upload screenshot, Delete project)
- Orchestrator Step 6 menus expanded with edit, variant, and design system options
- `stitch-mcp-generate-screen-from-text` deviceType enum: replaced `SMART_WATCH` with `AGNOSTIC`
- Skill count: 26 → 34
- MCP wrapper count: 6 → 14
- Anti-patterns expanded from 7 to 11

### Fixed
- `deviceType` enum now matches official Stitch API (`AGNOSTIC` instead of non-existent `SMART_WATCH`)

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
