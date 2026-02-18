# UI/UX Keywords Reference

Progressive disclosure reference for common UI terminology and adjective palettes.
Use when enhancing vague prompts (Path A in SKILL.md).

## Component Keywords

### Navigation
- navigation bar, nav menu, header
- breadcrumbs, tabs, sidebar, drawer
- hamburger menu, mobile menu, overlay nav
- back button, close button, escape affordance
- sticky header, fixed footer, floating nav

### Content containers
- hero section, hero banner, above the fold
- card, card grid, tile, bento grid
- modal, dialog, drawer, sheet, bottom sheet
- accordion, collapsible section, disclosure
- carousel, slider, gallery, lightbox
- tooltip, popover, hover card
- divider, separator, spacer

### Forms
- input field, text input, text area
- dropdown, select menu, combobox
- checkbox, radio button, toggle switch
- date picker, time picker, range slider
- search bar, search input, autosuggest
- file upload, drag and drop zone
- form group, field label, helper text, error state
- submit button, form actions, inline form

### Calls to action
- primary button, secondary button, ghost button
- text link, anchor link, underline link
- floating action button (FAB), extended FAB
- icon button, icon-only button
- pill button, rounded CTA, full-width button
- sticky CTA, bottom action bar

### Feedback & status
- toast notification, snackbar, banner alert
- inline alert, inline error, inline success
- loading spinner, skeleton loader, shimmer
- progress bar, progress ring, step indicator
- empty state, zero state, placeholder

### Data display
- data table, sortable table, data grid
- chart: line, bar, pie, donut, area, scatter
- KPI card, metric card, stat widget
- badge, tag, chip, label, pill
- avatar, avatar group, user list
- list item, item row, feed item
- timeline, activity feed, changelog

### Layout primitives
- grid layout, 2-column, 3-column, masonry
- flexbox row, horizontal stack
- sidebar layout, split view, panel
- sticky header, fixed footer, page shell
- full-width, contained width, max-width container
- centered content, asymmetric layout

---

## Adjective Palettes

### Minimal / clean
- minimal, clean, uncluttered, focused
- generous whitespace, breathing room
- subtle, understated, refined
- simple, distraction-free, content-first

### Professional / corporate
- sophisticated, polished, trustworthy
- corporate, business-like, enterprise
- structured, organized, hierarchical
- data-dense, information-rich

### Playful / friendly
- vibrant, colorful, energetic
- rounded corners, soft edges, pillow-like
- bold, expressive, dynamic
- friendly, approachable, warm, inviting

### Premium / luxury
- elegant, luxurious, high-end, exclusive
- dramatic, bold contrast, editorial
- sleek, modern, refined, boutique
- restrained palette, generous space

### Dark mode
- dark theme, night mode, dark background
- high-contrast accents, neon highlights
- soft glows, subtle illumination
- deep backgrounds (#18181b), muted surfaces

### Organic / natural
- earthy tones, warm neutrals
- textured, tactile, handcrafted feel
- flowing, organic shapes, biomorphic
- warm, cozy, grounded

### Developer / technical
- monospace, terminal aesthetic, code-like
- dark canvas, syntax highlighted
- grid-heavy, information-dense
- utilitarian, functional, no decoration

---

## Color Role Terminology

### Backgrounds
- page background, canvas, base layer
- surface color, card background, elevated surface
- overlay, scrim, backdrop

### Text
- primary text, heading color, display text
- secondary text, body copy, paragraph text
- muted text, caption, placeholder, hint
- inverse text (on dark backgrounds)

### Accents
- primary accent, brand color, action color
- secondary accent, highlight, tint
- success green, error red, warning amber, info blue
- hover state, active state, pressed state, focus ring

---

## Shape → Natural Language

| Tailwind class | Natural language description |
|----------------|------------------------------|
| `rounded-none` | sharp, squared-off edges |
| `rounded-sm`   | slightly softened corners |
| `rounded-md`   | gently rounded corners |
| `rounded-lg`   | generously rounded corners |
| `rounded-xl`   | very rounded, pillow-like |
| `rounded-2xl`  | heavily rounded, balloon-like |
| `rounded-full` | pill-shaped, circular |

---

## Stitch Generation Vocabulary

Phrases that produce better results in Stitch generation prompts:

**Layout precision:**
- "Left sidebar (240px) + right main area"
- "2-column grid with 24px gap"
- "Sticky top navigation bar (64px height)"
- "Full-width hero section (100vh, centered content)"
- "Bottom navigation bar with 5 icon tabs"

**Visual quality signals:**
- "High-fidelity, production-ready UI"
- "Pixel-perfect details and micro-interactions visible"
- "Rich shadows and depth indicating elevation"
- "Carefully typeset content with visual hierarchy"

**Color precision:**
- "Primary indigo (#6366F1) for all CTA buttons"
- "Stone-50 (#FAFAF9) canvas background"
- "Zinc-900 (#18181B) for headings"
- "Subtle slate-200 (#E2E8F0) borders"
