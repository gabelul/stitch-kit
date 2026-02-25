# Changelog

## [1.1.0](https://github.com/gabelul/stitch-kit/compare/v1.0.0...v1.1.0) (2026-02-25)


### Features

* add npx installer for cross-platform setup ([1afa5ee](https://github.com/gabelul/stitch-kit/commit/1afa5ee09a74ba3abf40b1e7f51791e9363ec1af))
* auto-configure Stitch MCP with optional API key prompt ([c03ba72](https://github.com/gabelul/stitch-kit/commit/c03ba7221f74d651c846b21321cfcef4c1047c76))


### Bug Fixes

* use remote HTTP server for Stitch MCP, not nonexistent npm package ([6c040cb](https://github.com/gabelul/stitch-kit/commit/6c040cb15a72e80e6e249fe747e9283ee2a01ca2))
* use scoped package name and add automated npm publishing ([3810f81](https://github.com/gabelul/stitch-kit/commit/3810f81e422d4aaafcbaa0800ca080a69692b966))

## 1.0.0 (2026-02-25)


### Features

* add 8 MCP wrappers, orchestrator iteration loop, native variants, design systems ([a77405a](https://github.com/gabelul/stitch-kit/commit/a77405a6248c22327a355124150a663c4364319f))
* add prompt quality standard, project reuse, generation timing ([b525398](https://github.com/gabelul/stitch-kit/commit/b525398a07d422c8df6bb1192b76458daa420b9a))
* initial release — stitch-kit v1.3.0 ([6ec1494](https://github.com/gabelul/stitch-kit/commit/6ec1494b578f8ea344fdbb11ebd9cebd96021a7f))
* register agents directory in plugin manifest and marketplace ([181a7cf](https://github.com/gabelul/stitch-kit/commit/181a7cfe33d036ac581a934e0a0f9700465b7a9e))


### Bug Fixes

* add tools and color fields to agent frontmatter to match Claude Code agent format ([40edcf5](https://github.com/gabelul/stitch-kit/commit/40edcf55a859ba332e0572aa3f14132e6f4d6a9f))
* remove agents field from marketplace plugins array (invalid schema) ([1ad69b7](https://github.com/gabelul/stitch-kit/commit/1ad69b7137be55d999989e34b15add7aeac043ad))
* remove unverified agents field from plugin.json ([b0b1e7b](https://github.com/gabelul/stitch-kit/commit/b0b1e7b65ccf62a5c27be73347af2f1e126ee6a8))
* rename plugin group to stitch-kit for agent auto-discovery ([e1cd72f](https://github.com/gabelul/stitch-kit/commit/e1cd72f79b2fe19bbd810eb4525ba14a29d4ed7b))
* strip agent frontmatter to minimal format for plugin discovery ([69ec523](https://github.com/gabelul/stitch-kit/commit/69ec5235e9b50bfe37625afd99472bdbafb3843d))

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
