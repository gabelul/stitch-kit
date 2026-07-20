---
name: stitch-nextjs-components
description: Converts a Stitch screen, a local HTML file, or a URL into production-ready Next.js 15 App Router components — Server vs Client split, dark mode via CSS variables, TypeScript strict, ARIA, and responsive mobile-first layout. Only the Stitch route needs an API key.
allowed-tools:
  - "stitch*:*"
  - "Bash"
  - "Read"
  - "Write"
---

# Stitch → Next.js 15 App Router Components

You are a senior Next.js engineer. You convert Stitch design screens into clean, production-ready components that follow modern App Router conventions — not the Pages Router, not a Vite SPA. Every component ships with dark mode, responsive layout, and basic accessibility out of the box.

## When to use this skill

Use this skill (not `react-components`) when:
- The target project uses **Next.js 13+** with the **App Router** (`app/` directory)
- The user mentions `next.js`, `app router`, `server components`, `server actions`, or `next-themes`
- You see `app/layout.tsx`, `app/page.tsx`, or a `next.config.*` file in the project

## Prerequisites

An HTML source. Any one of these works:

- A **Stitch screen** — needs Stitch MCP access and a generated screen
- A **local HTML file** — no Stitch account required
- A **URL** — no Stitch account required

Also:
- Target project has `next-themes` installed for dark mode (or user approves adding it)

## Step 1: Resolve the source

Everything downstream reads one file: `temp/source.html`. Get the HTML there by whichever route matches what the user gave you, then continue at Step 2 — the rest of this skill is identical regardless of where the markup came from.

**From a Stitch screen:**

1. **Namespace discovery** — `list_tools` to find the Stitch MCP prefix
2. **Fetch metadata** — `[prefix]:get_screen` for the design JSON
3. **Download HTML** — GCS URLs need the reliable downloader:
   ```bash
   bash scripts/fetch-stitch.sh "[htmlCode.downloadUrl]" "temp/source.html"
   ```
4. **Visual audit** — check `screenshot.downloadUrl` before rewriting. Append `=s0` to that URL for full resolution; the bare URL serves a 512px thumbnail regardless of the `width`/`height` the API reports.

**From a local HTML file:**

```bash
mkdir -p temp && cp "path/to/design.html" temp/source.html
```

**From a URL:**

```bash
bash scripts/fetch-stitch.sh "https://example.com/page" "temp/source.html"
```

Despite the name, that script is a generic hardened downloader — follows redirects, retries transient failures, handles gzip, and fails loudly on an empty result. It does not care whether the URL points at Stitch.

**From a screenshot:** there's no direct route. Run `stitch-mcp-upload-screens-from-images` to turn the image into a Stitch screen first, then take the Stitch path above.

> Only the Stitch route needs an API key. Converting a local file or a URL works with no Google account at all.

## Step 2: Decide Server Component vs Client Component

Apply this decision tree **per component**, not per file:

| Has... | Use |
|--------|-----|
| `onClick`, `onChange`, `useState`, `useEffect`, animations | `'use client'` |
| Only renders data, no interactivity | Server Component (no directive needed) |
| Wraps a Client Component library | `'use client'` |
| Form with Server Action | Server Component + `<form action={serverAction}>` |

**Default to Server Components.** Only add `'use client'` when required. This is the single most impactful App Router pattern.

## Step 3: Component architecture

### File structure

```
app/
├── [route]/
│   ├── page.tsx              ← Server Component (route entry)
│   └── components/
│       ├── [Name].tsx        ← Logic-heavy Client Component
│       ├── [Name].module.css ← Scoped styles (optional)
│       └── index.ts          ← Re-exports
src/
├── components/
│   └── ui/                   ← Reusable primitives
├── data/
│   └── mockData.ts           ← Static content decoupled from components
└── types/
    └── index.ts              ← Shared TypeScript types
```

### Rules

- **Props contract**: Every component has a `Readonly<ComponentNameProps>` interface at the top of the file.
- **Data decoupling**: All static text, image URLs, and list data goes in `src/data/mockData.ts`. Components receive data via props.
- **No hardcoded colors**: Use CSS custom property classes (`bg-[var(--color-primary)]`) or semantic Tailwind tokens. Never use arbitrary hex in JSX.
- **No inline styles**: Exceptions only for truly dynamic values (e.g., width from JS calculation).

## Step 4: Dark mode with CSS variables

This project uses a CSS variable approach that works with `next-themes`. Extract colors from the Stitch design and map them to semantic tokens.

In `app/globals.css`:
```css
:root {
  --color-background: #ffffff;
  --color-surface: #f4f4f5;
  --color-primary: /* dominant action color from Stitch design */;
  --color-primary-foreground: #ffffff;
  --color-text: #09090b;
  --color-text-muted: #71717a;
  --color-border: #e4e4e7;
}

.dark {
  --color-background: #09090b;
  --color-surface: #18181b;
  --color-primary: /* same hue, lighter shade for dark bg */;
  --color-primary-foreground: #09090b;
  --color-text: #fafafa;
  --color-text-muted: #a1a1aa;
  --color-border: #27272a;
}
```

In `app/layout.tsx`, wrap with `ThemeProvider` from `next-themes`:
```tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Step 5: Responsive layout

All components must work at `sm` (640px), `md` (768px), `lg` (1024px), and `xl` (1280px) breakpoints.

Apply these patterns from the Stitch design:
- **Navigation**: `hidden md:flex` for desktop nav, `flex md:hidden` for mobile hamburger
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — start single column
- **Typography**: `text-2xl md:text-4xl` — scale up on larger screens
- **Padding**: `px-4 md:px-8 lg:px-16` — breathe more at wider widths
- **Images**: Always use `next/image` with `sizes` attribute to avoid CLS

## Step 6: Accessibility baseline

Every component must include these without being asked:

- **Semantic HTML**: `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>` — never a `<div>` when a semantic element fits.
- **Interactive elements**: Buttons use `<button>`, not `<div onClick>`. Links use `<a>` or `next/link`.
- **Images**: `<Image>` always has a descriptive `alt` attribute. Decorative images get `alt=""`.
- **ARIA labels**: Icon-only buttons get `aria-label`. Landmark regions get `aria-label` when there are multiples.
- **Focus ring**: Never `outline-none` without a custom `focus-visible:ring-*` replacement.
- **Color contrast**: Don't use muted text on muted backgrounds — check the ratio mentally.

If the design has complex interactivity (modals, dropdowns, tabs), use the `stitch-a11y` skill for a full audit.

## Step 7: Execution steps

1. **Environment check** — If `node_modules` is missing, run `npm install`.
2. **Data layer** — Create `src/data/mockData.ts` from design content.
3. **Component drafting** — Use `resources/component-template.tsx` as the starting point. Replace all instances of `StitchComponent` with the actual component name.
4. **Dark mode tokens** — Add CSS variable declarations to `app/globals.css`. If using the `stitch-design-system` skill, import the generated `design-tokens.css` instead.
5. **Application wiring** — Update `app/page.tsx` or the relevant route page to import and render the new components.
6. **Quality check** — Run through `resources/architecture-checklist.md` before declaring done.
7. **Dev verification** — Run `npm run dev` and check both light and dark modes.

## Step 8: Animation (optional)

If the Stitch design contains clear motion intent (hover states, transitions, reveals), use the `stitch-animate` skill after components are built. Don't add animation ad hoc — let that skill handle it properly with `prefers-reduced-motion` compliance.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `fetch` fails on GCS URL | Always quote the URL in bash: `bash scripts/fetch-stitch.sh "$URL" out.html` |
| Hydration mismatch on dark mode | Add `suppressHydrationWarning` to `<html>` tag |
| `next-themes` not found | `npm install next-themes` |
| Server Component using hooks | Move component to its own file with `'use client'` directive |
| CSS variable not applying in dark | Ensure `.dark` class is on `<html>`, not `<body>` |

## Integration with other skills

- **stitch-design-system** — Run first to generate `design-tokens.css`. Import in `globals.css`.
- **stitch-animate** — Run after to add motion to the generated components.
- **stitch-a11y** — Run after if design has modals, dropdowns, or complex interactions.

## References

- `resources/component-template.tsx` — Production-ready component boilerplate
- `resources/architecture-checklist.md` — Pre-ship quality checklist
- `scripts/fetch-stitch.sh` — Reliable GCS HTML downloader
