# PRD Template for Stitch Ideate

This template matches the format produced by Stitch's own Ideate agent on the web. Stitch can consume this format directly as a generation prompt — no need to restructure it.

Fill every section. Use the `[PLACEHOLDER]` markers as guides. Remove all placeholder markers and instructions from the final output.

---

## Template

```markdown
# [Design Direction Name]: [Product Name]

## Product Overview

**The Pitch:** [One compelling sentence describing the product and its value proposition. Not a tagline — a genuine explanation of what it does and why it matters.]

**For:** [Target audience in one sentence. Be specific about their behavior, not just their title.]

**Device:** [desktop | mobile | tablet]

**Design Direction:** "[Direction Name]" — [One sentence capturing the visual mood, material metaphor, and emotional tone. Example: "A stark, terminal-inspired interface. True black backgrounds, high-contrast borders, and zero decorative gradients."]

**Inspired by:** [2-4 reference products that capture the feel. Example: "Linear, VS Code, Grafana, Terminal.app"]

---

## Screens

[Bullet list of all screens with one-line descriptions. Minimum 5 app screens + 1 style guide. Format:]
- **[Screen Name]:** [Purpose in one sentence. Include the primary interaction pattern.]
- ...
- **Component Style Guide:** Visual reference page showing every UI component in all states — buttons, inputs, cards, badges, typography scale, color swatches, and spacing system.

---

## Key Flows

[1-2 primary user journeys. Each flow has a name and numbered steps that reference specific screens.]

**[Flow Name]:**
1. User is on **[Screen Name]** -> [what they see or do].
2. User [action] -> [system response].
3. [Continue until the flow reaches its goal.]

---

<details>
<summary>Design System</summary>

## Color Palette

[List every color with its role. Include hex values and a brief description of where it's used.]

- **Background:** `#[HEX]` - [Description]
- **Surface:** `#[HEX]` - [Description]
- **Border:** `#[HEX]` - [Description]
- **Text Primary:** `#[HEX]` - [Description]
- **Text Muted:** `#[HEX]` - [Description]
- **Primary Accent:** `#[HEX]` - [Description]
- **Success:** `#[HEX]` - [Description]
- **Warning:** `#[HEX]` - [Description]
- **Error:** `#[HEX]` - [Description]

## Typography

[Font families with weights, sizes, and usage context.]

- **Headings:** [Font], [weight], [size range] ([style notes])
- **UI Labels:** [Font], [weight], [size]
- **Data/Code:** [Font], [weight], [size] ([usage notes])

**Style notes:** [Border radius, shadow style, hover behavior, focus ring style. Be specific about what's NOT used too — "no shadows", "zero radii", etc.]

## Design Tokens

```css
:root {
  --bg-app: #[HEX];
  --bg-panel: #[HEX];
  --bg-hover: #[HEX];
  --border-subtle: #[HEX];
  --border-active: #[HEX];
  --text-main: #[HEX];
  --text-dim: #[HEX];
  --color-primary: #[HEX];
  --color-success: #[HEX];
  --color-error: #[HEX];
  --font-ui: '[Font]', sans-serif;
  --font-mono: '[Font]', monospace;
  --radius: [value];
}
```

</details>

---

<details>
<summary>Screen Specifications</summary>

[Repeat this block for each screen. Include all subsections.]

### [N]. [Screen Name]

**Purpose:** [One sentence — what decision does the user make on this screen?]

**Layout:**
[Describe the spatial structure: columns, sidebar width, header height, main content arrangement.]

**Key Elements:**
[Bullet list of every visible element with specific details:]
- **[Element Name]:**
  - [Visual description: size, font, color, alignment]
  - [Content: realistic sample data, never Lorem Ipsum]
  - [Behavior: what happens on hover, click, focus]

**States:**
[Loading, empty, error, selected — describe how each looks.]

**Interactions:**
[Hover effects, keyboard shortcuts, click targets, transitions.]

### [Last]. Component Style Guide

**Purpose:** Visual reference showing every UI component used across all screens, in every state.

**Layout:**
Full-width single-column page with sections for each component category. Generous spacing between sections.

**Key Elements:**
- **Color Swatches:**
  - All palette colors displayed as labeled rectangles with hex values
  - Background, Surface, Border, Text, Accent, Success, Warning, Error
- **Typography Scale:**
  - Every heading level (H1-H6), body text, captions, labels, monospace
  - Show font name, weight, size, and line-height
- **Buttons:**
  - Primary, Secondary, Ghost, Destructive — each in Default, Hover, Active, Disabled states
  - Small, Medium, Large sizes
- **Form Controls:**
  - Text input, Textarea, Select, Checkbox, Radio, Toggle, Slider
  - Each in Default, Focus, Error, Disabled states
- **Cards & Containers:**
  - Content card, Modal, Dropdown, Tooltip, Toast notification
  - With and without shadows/borders as defined in design system
- **Data Display:**
  - Badge, Tag, Avatar, Progress bar, Status indicator
  - Table row (if tables are used in the app)
- **Navigation:**
  - Sidebar item, Tab, Breadcrumb, Pagination
  - Active, Hover, Inactive states
- **Spacing & Grid:**
  - Visual spacing scale (4px, 8px, 12px, 16px, 24px, 32px, 48px)
  - Grid column examples

**States:** N/A — this screen shows all states of all components.

**Interactions:** None — this is a static reference page.

</details>

---

<details>
<summary>Build Guide</summary>

**Stack:** HTML + Tailwind CSS v3

**Build Order:**
[Numbered list prioritizing the most complex/foundational screen first. Style guide is always last.]
1. **[Screen Name]:** [Why build this first — what does it establish?]
2. **[Screen Name]:** [What it reuses from #1, what new patterns it introduces.]
3. **[Remaining screens]:** [How they derive from earlier work.]
4. **Component Style Guide:** [Generated last — references all components from above screens. Use this as the source of truth for design token extraction.]

[Optional: Tailwind config notes, custom utility needs, font loading strategy.]

</details>
```

---

## Tips for filling the template

### Product Overview
- The pitch should explain what the product does, not just what it looks like
- "Inspired by" matters — it tells Stitch about density, interaction patterns, and visual hierarchy expectations
- Design Direction name should be evocative (2-3 words): "Obsidian Ops", "Glass & Graphite", "Swiss Grid", "Velvet Console", "Arctic Minimal"

### Color Palette
- Always include at least: background, surface, border, text primary, text muted, primary accent, success, error
- For dark themes: background should be the darkest, surface slightly lighter, borders visible but subtle
- For light themes: background off-white (never pure white #FFFFFF for large areas), surface pure white for cards

### Typography
- Always specify a monospace font for data-heavy screens (JetBrains Mono, Fira Code, IBM Plex Mono)
- Heading sizes should be smaller than you think for dense UIs (14-16px, not 24-32px)
- Include tracking (letter-spacing) notes for uppercase labels

### Screen Specifications
- Every element needs: visual description + realistic content + interaction behavior
- Use real-sounding data: "$24.99" not "$XX.XX", "Sarah Chen" not "User Name"
- Describe what happens on hover, not just what it looks like at rest
- Include keyboard shortcuts if targeting technical users
- Minimum 5 app screens + 1 Component Style Guide = 6 screens total
- The style guide screen is always last and shows every component used across all other screens

### Build Guide
- Always recommend building the most complex screen first — it establishes the pattern library
- Note which screens share components (reduces build time)
- Component Style Guide is always built last — it references all components from other screens
- Include Tailwind config extensions needed for custom colors/fonts
