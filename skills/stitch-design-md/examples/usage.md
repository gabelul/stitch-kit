# stitch-design-md — Usage Examples

## Example 1: Extract design system from an existing Stitch screen

**User:** "I've designed the homepage in Stitch. Generate a DESIGN.md so I can keep new screens consistent."

**Skill activates because:** User explicitly mentions "Stitch" and wants design documentation.

**What the skill does:**
1. Calls `list_projects` → finds the project
2. Calls `list_screens` → identifies the homepage screen
3. Calls `get_screen` → gets HTML and screenshot download URLs
4. Downloads HTML via `scripts/fetch-stitch.sh`
5. Calls `get_project` → gets `designTheme` (font, roundness, colorMode)
6. Analyzes HTML for color values, Tailwind classes, typography scale
7. Writes `DESIGN.md` with atmosphere, palette, typography, components, layout, and Section 6 prompt snippets

**Output:** `DESIGN.md` with complete design system + copy-paste Section 6

---

## Example 2: Multi-page site setup

**User:** "Use Stitch to build a 5-page SaaS site. Generate the homepage first, then set up DESIGN.md for the rest."

**What the skill does:**
1. After homepage generation, user calls `stitch-design-md`
2. Extracts design system from the homepage
3. Creates `DESIGN.md` with Section 6 ready to paste
4. User then runs `stitch-loop`, including Section 6 in every `next-prompt.md`
5. Result: all 5 pages share the same colors, fonts, shapes, and spacing

---

## Example 3: From a Stitch URL

**User:** "Here's my Stitch design: https://stitch.withgoogle.com/projects/3492931393329678076?node-id=375b1aadc9cb45209bee8ad4f69af450 — write a DESIGN.md for it."

**What the skill does:**
1. Parses URL → extracts `projectId: 3492931393329678076`, `screenId: 375b1aadc9cb45209bee8ad4f69af450`
2. Calls `get_screen` directly (no need for list operations)
3. Downloads HTML, analyzes, writes DESIGN.md

---

## How DESIGN.md Section 6 gets used downstream

```
# In next-prompt.md (for stitch-loop):

---
page: pricing
---
A clear pricing page for a SaaS project management tool.

**DESIGN SYSTEM:**
[Paste Section 6 from DESIGN.md here verbatim]

**Page Structure:**
1. Pricing hero with tagline
2. Three pricing tiers (Free, Pro, Enterprise)
3. Feature comparison table
4. FAQ accordion
5. CTA footer
```

The Section 6 block locks in the visual identity — Stitch uses it to stay consistent with your existing screens.
