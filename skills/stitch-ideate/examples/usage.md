# Stitch Ideate — Usage Examples

## Example 1: Developer tool from a vague idea

**User:** "I want to build some kind of ASO tool for indie devs"

**Skill activates because:** Request is vague — no screens, no visual direction, no specific features mentioned.

**What the skill does:**

### Phase 1: Product & Purpose
Agent asks:
- "What kind of product are you designing?" -> User picks: **Web application**
- "What's the core problem this solves?" -> User picks: **Productivity / workflow**

Agent reflects: *"A desktop web app that helps indie developers optimize their app store presence more efficiently. Cool."*

### Phase 2: Audience & Context
Agent asks:
- "Who's the primary user?" -> User picks: **Technical users**
- "What existing tools does your audience love?" -> User types: "Linear, VS Code, maybe Grafana for the data density"

Agent reflects: *"Technical users who live in keyboard-driven, dense interfaces. That rules out bubbly consumer design — we're going sharp and information-rich."*

### Phase 2.5: Design Research (automatic)
Agent researches silently:
- `WebSearch`: "ASO tool UI design 2025 2026" — finds that AppTweak, Sensor Tower, and App Radar all use dense dashboards with blue/purple palettes
- `WebSearch`: "terminal-inspired developer tool UI design" — finds examples of Warp, Fig, and Railway using true black with neon accents
- `WebFetch`: Linear's marketing site — extracts their minimal approach: sharp corners, high contrast, keyboard-first

Agent presents findings:
> *"Did some research. ASO tools in the wild (AppTweak, Sensor Tower) are pretty generic — corporate blue dashboards. There's an opportunity to differentiate with a developer-native aesthetic. I noticed developer tools like Warp and Railway are going true black with neon accents. Linear keeps it sharp and minimal. Let me turn this into 3 directions..."*

### Phase 3: Design Direction
Agent presents 3 curated directions with previews, informed by research:

**A) "Obsidian Ops"** — True black, terminal-inspired, monospace, neon green accents. *Inspired by Warp + Bloomberg Terminal.*
**B) "Glass & Graphite"** — Deep dark, glassmorphism, violet AI glow, translucent layers. *Inspired by Raycast + Vercel.*
**C) "Swiss Grid"** — Light brutalist, visible grid lines, International Orange, zero radii. *Breaks from the dark tool trend. Inspired by Swiss poster design + Linear's restraint.*

User picks: **A) Obsidian Ops**

Agent locks in the palette and typography.

### Phase 4: Screen Architecture
Agent asks:
- "What screens do you need?" -> User multi-selects: Dashboard, Keyword Explorer, AI Config, Project List, Settings
- "What's the most important user flow?" -> User types: "See a ranking alert, drill into keyword data, select keywords, feed them to the AI agent"

Agent outlines the screen map and primary flow.

### Phase 5: Screen Specifications
Agent asks about the 2 most complex screens:
- "Tell me more about Keyword Explorer" -> User picks: **Dense data table**
- "What's the most important element?" -> User types: "The filter bar — it should feel like writing a search query"

Agent fills in the remaining screens with smart defaults.

### Phase 6: Review & Confirm
Agent presents the PRD summary. User says: **"Generate all screens"**

### Phase 7: Auto-generation
Agent writes the full PRD to `temp/asopro-prd.md`, creates a Stitch project, and generates the dashboard screen first.

**Output:** Full PRD document + Stitch screen generated from it.

---

## Example 2: Research-first ideation

**User:** "Analyze the top 3 e-commerce checkout flows and design a version for my sneaker store"

**Skill activates because:** User explicitly asked to analyze existing designs — research-first pattern.

**What the skill does:**

### Research Phase (runs before Phase 1)
Agent executes research immediately — the user asked for analysis:

1. `WebSearch`: "best e-commerce checkout flow UI design 2025"
2. `WebFetch` on Nike.com checkout, Shopify checkout, Apple Store checkout (3 parallel Agent calls)
3. Synthesizes findings:

> *"Researched the top 3 checkout flows:*
> - **Nike** — Single-page express checkout, address autocomplete, persistent order summary sidebar, black/white/red palette
> - **Shopify** — Multi-step wizard (3 steps), progress breadcrumb, distraction-free (no nav), trust badges prominent
> - **Apple** — Ultra-minimal, card-based sections that expand/collapse, blue accent on CTAs only, system font
>
> *Common patterns: all 3 hide main navigation during checkout, all use a persistent order summary, all have express payment (Apple Pay/Google Pay) above the fold.*
>
> *Gap I noticed: none of them do a great job with sneaker-specific details (size selection, authentication status, release exclusivity). That's your differentiator."*

### Phase 1: Product & Purpose (compressed — already known)
Agent skips questions and reflects:
*"E-commerce checkout for a sneaker store. Mobile-first (most sneaker purchases are mobile). Focus: speed, trust, sneaker-specific details."*

### Phase 2: Audience & Context
Agent asks:
- "Who's your customer — casual sneakerheads or resellers?" -> User: **Casual sneakerheads**
- Reference apps: "Nike SNKRS, StockX" (user provides)

### Phase 3-7: Continue normally with research-informed directions

**Key difference:** Research happened first because the user asked for analysis. The findings directly shape the design directions and screen specs.

---

## Example 3: Mood-based color research

**User:** "Find a color palette that conveys 'luxury' and 'eco-friendly' for my new skincare brand"

**Skill activates because:** User asked for color palette research — specific research pattern.

**What the skill does:**

### Research Phase
1. `WebSearch`: "luxury eco-friendly color palette UI design"
2. `WebSearch`: "sustainable luxury brand visual identity 2025 2026"
3. `WebFetch` on 2-3 palette resources (Coolors, Realtime Colors)

Agent presents 3 curated palettes:

> *"Researched luxury + eco-friendly color language. Here's what works:*
>
> **A) "Forest Gold"** — Deep forest green (#1B4332) with warm gold accents (#D4A373). Rich soil tones for surfaces. Says "heritage luxury, grounded in nature."
>
> **B) "Ivory Earth"** — Warm ivory (#FFFBF0) with sage (#8FAE7E) and charcoal (#2D3436). Airy, light, botanical. Says "clean beauty, transparent, premium."
>
> **C) "Midnight Botanical"** — Near-black (#0D1117) with muted emerald (#2D6A4F) and champagne (#F5E6CC). Dark mode luxury. Says "exclusive night garden, rare ingredients."
>
> *All three work because they pair luxury signals (gold, champagne, high contrast) with eco signals (greens, earth tones, natural warmth). Based on brands like Aesop, Tata Harper, and Le Labo."*

Then transitions into the normal ideation flow with the selected palette locked in.

---

## Example 4: Fast ideation for a mobile app

**User:** "Quick ideation — fitness tracking app"

**Skill activates because:** User said "quick ideation" — triggers fast mode (3 phases, no research).

**What the skill does:**

### Phase 1: Purpose (compressed)
Agent asks one combined question:
- "Fitness tracking for who — gym-goers, runners, or general wellness?" -> User picks: **Gym-goers**

Agent reflects: *"Mobile fitness app for serious gym-goers. Think workout logging, progress tracking, maybe exercise library."*

### Phase 2: Direction (compressed, no research)
Agent presents 3 directions based on training knowledge (no WebSearch — fast mode):
**A) "Iron Dark"** — Dark mode, neon accents, bold typography, high energy
**B) "Clean Rep"** — Light, minimal, lots of whitespace, Apple Health vibes
**C) "Neon Grind"** — Dark with gradient accents, card-heavy, gamification feel

User picks: **A) Iron Dark**

### Phase 3: Screens (compressed)
Agent asks: "Essential screens — pick your top 3"
- Workout logger (active session)
- Progress dashboard (stats, charts)
- Exercise library (browse movements)
- Profile / settings

User picks 3. Agent fills in defaults for the rest.

Agent presents quick summary, user confirms, PRD is generated and sent to Stitch.

**Output:** Compressed PRD + Stitch screen in ~2 minutes of interaction.

---

## Example 5: Problem-solving ideation

**User:** "This landing page for my shoe brand isn't converting well. Suggest 3 improvements to the hero section."

**Skill activates because:** User brought a specific UI problem to solve — research + suggestions pattern.

**What the skill does:**

### Research Phase
1. Agent asks: "Can you share the URL or a screenshot of the current page?"
2. If URL provided: `WebFetch` to analyze the current design
3. `WebSearch`: "high converting hero section e-commerce 2025"
4. `WebSearch`: "shoe brand landing page best practices conversion"

Agent presents findings and 3 improvement directions:

> *"Analyzed your hero section and researched what converts:*
>
> **Issue 1: CTA is below the fold.** Top shoe brands (Nike, Allbirds) keep the primary CTA within the first 400px. Move 'Shop Now' above the product image.
>
> **Issue 2: No social proof.** Highest-converting hero sections include a trust signal (star rating, customer count, press logos). Add '4.8 stars from 2,400 reviews' near the CTA.
>
> **Issue 3: Product image doesn't show the shoe being worn.** Research shows lifestyle shots convert 23% better than product-only shots for footwear. Add a lifestyle hero with the product shot as secondary.
>
> *Want me to generate all 3 as Stitch screens so you can compare?*"

If user says yes: generates 3 Stitch screens, each implementing one improvement direction.

---

## Example 6: Orchestrator-triggered ideation

**User:** "Use Stitch to make something for project management"

**Orchestrator detects:** Request is under 20 words, no specific screens or visual direction mentioned.

**Orchestrator routes to stitch-ideate** instead of going directly to spec generation.

Agent says: *"That's a big space — let me help you narrow it down before we generate anything. A few quick questions..."*

Proceeds through the full 5-7 phase flow with research. After the PRD is assembled and the user confirms, the orchestrator picks up at Step 4 (project creation) and continues the normal pipeline.

**Key difference:** The orchestrator skips Steps 2-3 (spec generator + prompt architect) entirely — the PRD from ideation replaces both.
