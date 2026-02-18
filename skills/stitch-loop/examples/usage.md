# stitch-loop — Usage Examples

## When to use

- User wants to **iteratively build a multi-page site** with Stitch (e.g. marketing site, product pages).
- You have or will create a `DESIGN.md` (via `stitch-design-md`) and a `SITE.md`.

---

## First-time setup

1. Create or identify a Stitch project; save project ID to `stitch.json`.
2. Generate `DESIGN.md` from an existing screen using `stitch-design-md`.
3. Create `SITE.md` with vision, sitemap, roadmap, creative freedom (see `examples/SITE.md`).
4. Create initial `next-prompt.md` with `page` frontmatter and full prompt including DESIGN SYSTEM block (see `examples/next-prompt.md`).

---

## Each iteration

1. Read `next-prompt.md` → generate page with Stitch MCP → save to `queue/`.
2. Move `queue/{page}.html` to `site/public/`; fix links and nav.
3. Update `SITE.md` (sitemap, roadmap, creative freedom).
4. Write next `next-prompt.md` so the next run continues the loop.

---

## Example 1: Furniture e-commerce site

**User:** "Use Stitch to build my Oakwood Furniture site. I have DESIGN.md and SITE.md — run the loop until the roadmap is done."

**Skill activates because:** User explicitly mentions "Stitch" and wants multi-page iterative building.

**What the skill does:**
1. Reads `SITE.md` → identifies next page in roadmap (`contact.html`)
2. Reads `next-prompt.md` → uses it as the Stitch generation prompt
3. Calls `stitch-mcp-generate-screen-from-text` with the assembled prompt
4. Downloads HTML to `queue/contact.html` via `scripts/fetch-stitch.sh`
5. Validates nav consistency, moves to `site/public/contact.html`
6. Updates `SITE.md` — marks `contact.html` as `[x]`
7. Writes next `next-prompt.md` for the next page in roadmap

**Output:**
```
## Loop iteration complete: contact.html

**Stitch Screen:** projects/13534454087919359824/screens/abc123
**File:** site/public/contact.html

### What was built
Contact page with form, showroom info, and consistent nav.

### SITE.md updated
contact.html → [x] complete

### Next iteration
next-prompt.md → Product Detail Page
Run stitch-loop again to continue.
```

---

## Example 2: SaaS landing site (starting fresh)

**User:** "Use Stitch to design and build a 5-page SaaS landing site for my project management tool."

**What the skill does:**
1. Creates a new Stitch project
2. Generates the homepage design
3. Calls `stitch-design-md` → extracts `DESIGN.md` with the visual system
4. Creates `SITE.md` with 5-page roadmap
5. Runs loop iterations for each page, maintaining visual consistency via `DESIGN.md` Section 6 in every prompt

**Tips:**
- Always include the full DESIGN SYSTEM block from `DESIGN.md` Section 6 in every `next-prompt.md`
- The `page:` frontmatter is used for file naming (e.g., `page: pricing` → `pricing.html`)
- `stitch.json` persists the project ID between sessions so you don't lose track
