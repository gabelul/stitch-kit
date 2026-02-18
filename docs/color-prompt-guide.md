# Color Prompt Guide for Stitch

8 ready-to-use color palettes. Copy any block directly into the **Context & Style** section of your Stitch prompt.

These are structured as: app type + background / primary / accent colors (hex) + design system / style + mood.

---

## How to use

Paste one of these blocks into your Stitch prompt's **[Context]** section, or combine with `[Layout]` and `[Components]` for a full prompt:

```
[Context]
<paste color block here>

[Layout]
...

[Components]
...
```

For more prompt structure guidance see `stitch-ui-prompt-architect` and `stitch-ued-guide`.

---

## 1. Dark productivity (developer / SaaS tools)

Deep blue, high contrast, fluorescent blue accent. Works for dev tools, dashboards, and productivity apps.

```
Modern productivity app dark theme, charcoal grey background #1a1a1a, primary blue #4A90E2, secondary teal #26D0CE, neutral greys #2d2d2d to #f5f5f5, accent orange #FF6B35 for CTAs, Material Design 3 inspired, high contrast for readability, professional and focused atmosphere
```

---

## 2. Enterprise blue-gray (collaboration / workspace)

Slate, indigo, and emerald — professional and balanced. Suits B2B, collaboration, and admin UIs.

```
Enterprise collaboration suite colors, slate grey base #1E293B, primary indigo #6366F1, secondary emerald #10B981, neutral palette #475569 to #F8FAFC, amber accent #F59E0B, Fluent Design System inspired, balanced professional appearance, suitable for team productivity
```

---

## 3. Clean light (project management / task tracking)

Soft blue, purple, and green — calm and organized. Works for project tools, calendars, and kanban apps.

```
Project management app bright theme, clean white background #FFFFFF, primary royal blue #2563EB, secondary purple #7C3AED, soft grey cards #F9FAFB, green success #22C55E, red alerts #DC2626, yellow warnings #F59E0B, minimal design with subtle shadows, organized and efficient visual hierarchy
```

---

## 4. Airy sky (cloud services / storage)

Light blue gradient background, azure primary, teal accents. Open and trustworthy. Works for cloud apps, file storage, and SaaS.

```
Cloud storage desktop client colors, sky blue gradient #E0F2FE to #DBEAFE, primary azure #0EA5E9, secondary slate #64748B, white panels #FFFFFF with soft shadows, teal accents #14B8A6, folder yellow #FCD34D, modern airy interface, trustworthy and spacious feeling
```

---

## 5. Classic business (email / communication)

Neutral grays and navy — familiar and safe. Works for email clients, messaging apps, and corporate tools.

```
Email client professional palette, light grey background #F7F8FA, primary navy #1E40AF, secondary grey blue #64748B, white message cards #FFFFFF, unread indicator blue #3B82F6, important flag red #EF4444, archive green #10B981, classic business communication aesthetic
```

---

## 6. Creative gradient (design / creative tools)

Deep purple to electric blue, neon pink accents, dark background. Glassmorphism-ready. Works for design tools, creative apps, and portfolios.

```
Creative software gradient color palette, deep purple #6B46C1 to electric blue #2563EB, dark background #0F0F0F, neon pink accent #FF0080, lime green highlights #84CC16, glassmorphism elements with transparency, futuristic and inspiring mood, suitable for digital artists and designers
```

---

## 7. Cinema / broadcast (video editing / media)

True black background, amber and red accents, blue timeline tracks. Professional broadcast aesthetic. Works for video tools, media apps, and production software.

```
Video editing suite cinema theme, true black background #000000, primary amber #F59E0B, secondary red #DC2626, timeline tracks in gradient blues #1E40AF to #3B82F6, playback controls silver #E5E7EB, render progress green #10B981, professional broadcast studio inspired design
```

---

## 8. Industrial precision (3D / engineering tools)

Dark gray viewport, orange primary, steel blue secondary. Technical and focused. Works for 3D modeling, engineering, and high-frequency professional tools.

```
3D modeling app industrial colors, dark grey viewport #1F1F1F, primary orange #F97316, secondary steel blue #475569, grid lines subtle grey #374151, selection yellow #FDE047, tool panels charcoal #262626, metallic accents #94A3B8, technical precision focused interface
```

---

## Mobile-specific notes

When using these palettes for `deviceType: MOBILE` designs:
- Increase contrast — small screens in bright sunlight need higher ratios
- Avoid small accent colors for primary actions; use them for status only
- Test dark mode specifically — pure `#000000` backgrounds can feel harsh on OLED; prefer `#0F0F0F` or `#18181B`

## Dark mode token mapping

After generation, use `stitch-design-system` to extract the exact hex values from the Stitch HTML and generate:
- `design-tokens.css` — CSS custom properties with light + dark variants
- `tailwind-theme.css` — Tailwind v4 `@theme` block
