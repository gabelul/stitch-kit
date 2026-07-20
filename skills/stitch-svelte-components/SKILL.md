---
name: stitch-svelte-components
description: Converts a Stitch screen, a local HTML file, or a URL into Svelte 5 / SvelteKit components using the runes API — scoped CSS with custom properties, built-in transitions, TypeScript, dark mode, and accessible markup. Only the Stitch route needs an API key.
allowed-tools:
  - "stitch*:*"
  - "Bash"
  - "Read"
  - "Write"
---

# Stitch → Svelte 5 / SvelteKit Components

You are a Svelte 5 engineer. You convert HTML sources — Stitch screens, local files, or URLs — into idiomatic Svelte components — using the **runes API** (`$state`, `$props`, `$derived`, `$effect`), not the legacy Options API. Components use scoped CSS with custom properties for theming, built-in Svelte transitions for animation, and accessible markup by default.

> **Note:** This is the only Stitch skill that targets Svelte. The official `react-components` skill targets Vite/React. Use this skill when the project uses SvelteKit.

## When to use this skill

Use this skill when:
- The target project uses **SvelteKit** or **Svelte 5** standalone
- You see `.svelte` files, `svelte.config.js`, or `+page.svelte` conventions
- The user mentions `svelte`, `sveltekit`, `$state`, `$props`, or `runes`

## Prerequisites

An HTML source. Any one of these works:

- A **Stitch screen** — needs Stitch MCP access and a generated screen
- A **local HTML file** — no Stitch account required
- A **URL** — no Stitch account required

Also:
- Target project uses Svelte 5 (runes enabled) — check `package.json` for `"svelte": "^5"`

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

**From a screenshot:** there's no upload route — the Stitch MCP API has no image-upload tool. Either recreate the design from a text prompt via `stitch-mcp-generate-screen-from-text`, or hand-write the HTML and use the local-file route above.

> Only the Stitch route needs an API key. Converting a local file or a URL works with no Google account at all.

## Step 2: SvelteKit file conventions

SvelteKit uses file-based routing. Map Stitch screens to this structure:

```
src/
├── routes/
│   ├── +layout.svelte        ← Persistent shell (nav, footer)
│   ├── +layout.ts            ← Layout load function (optional)
│   ├── +page.svelte          ← Route page component
│   ├── [route]/
│   │   ├── +page.svelte      ← Sub-route page
│   │   └── +page.ts          ← Page load function (server-side data)
├── lib/
│   ├── components/           ← Reusable components
│   │   └── [Name].svelte
│   ├── data/
│   │   └── mockData.ts       ← Decoupled static content
│   └── types/
│       └── index.ts          ← Shared types
static/                       ← Static assets
```

**Key rules:**
- Pages live in `src/routes/` as `+page.svelte`
- Reusable components live in `src/lib/components/`
- Import `$lib/` is an alias for `src/lib/` — always use it

## Step 3: Svelte 5 runes API

**Use runes exclusively.** Never use the old `export let`, `let x = 0` reactive syntax, or `$:` labels.

### Props
```svelte
<script lang="ts">
  interface Props {
    title: string
    description?: string
    onAction?: () => void
  }

  // $props() replaces export let
  const { title, description = 'Default text', onAction }: Props = $props()
</script>
```

### Reactive state
```svelte
<script lang="ts">
  // $state() replaces let count = 0
  let count = $state(0)
  let isOpen = $state(false)

  // $derived() replaces $: doubled = count * 2
  const doubled = $derived(count * 2)

  // $effect() replaces onMount / afterUpdate for side effects
  $effect(() => {
    console.log('count changed:', count)
  })
</script>
```

### Event handling
```svelte
<!-- Direct event attributes, no createEventDispatcher -->
<button onclick={() => count++}>Increment</button>
<button onclick={onAction}>Custom action</button>
```

## Step 4: Scoped CSS with design tokens

Svelte scopes CSS to the component by default — use this aggressively. Resolve colors from the source in this order, then map them to custom properties in the `:root` (via `+layout.svelte` or `app.css`) and reference them in each component:

1. **Inline `tailwind.config`** in `<head>` (what Stitch emits) — use it directly if present.
2. **CSS custom properties** already in the source (`:root { --color-primary: ... }`) — common in hand-written and templated HTML.
3. **A linked or inline stylesheet** — parse declared colors, font-families, radii, spacing.
4. **Last resort** — derive tokens from the most frequent computed values in the markup (dominant background, text color, accent, heading/body font, border radius), and tell the user what you inferred so they can correct it.

The URL route only downloads the single HTML response — externally-linked stylesheets may not come along for the ride. If none of the above resolves a token, say so instead of inventing a palette.

**In `src/app.css` (global):**
```css
:root {
  --color-background: #ffffff;
  --color-surface: #f4f4f5;
  --color-primary: /* dominant color from the source */;
  --color-primary-foreground: #ffffff;
  --color-text: #09090b;
  --color-text-muted: #71717a;
  --color-border: #e4e4e7;
}

[data-theme='dark'] {
  --color-background: #09090b;
  --color-surface: #18181b;
  --color-primary: /* same hue, adjusted for dark bg */;
  --color-primary-foreground: #09090b;
  --color-text: #fafafa;
  --color-text-muted: #a1a1aa;
  --color-border: #27272a;
}
```

**In each component (scoped):**
```svelte
<style>
  .card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .card:hover {
    /* Scoped — won't leak to parent or children */
    border-color: var(--color-primary);
  }
</style>
```

**Dark mode toggle** — Add a `$state` in `+layout.svelte`:
```svelte
<script lang="ts">
  let theme = $state<'light' | 'dark'>('light')

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
  }
</script>

<svelte:element this="div" data-theme={theme}>
  {@render children()}
</svelte:element>
```

## Step 5: Built-in transitions and animations

Svelte has first-class transition support. Apply these from the source design's motion intent:

```svelte
<script lang="ts">
  import { fade, fly, slide, scale } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'

  let show = $state(false)
</script>

<!-- Page entry fade -->
<div transition:fade={{ duration: 200 }}>
  Content that fades in
</div>

<!-- Slide panel -->
{#if isOpen}
  <aside transition:fly={{ x: -300, duration: 300, easing: cubicOut }}>
    Sidebar content
  </aside>
{/if}

<!-- Collapsible section -->
{#if expanded}
  <div transition:slide={{ duration: 200 }}>
    Expandable content
  </div>
{/if}
```

**Always respect reduced motion:**
```svelte
<script lang="ts">
  // Check user preference once
  const prefersReducedMotion = $state(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  // Conditionally disable transitions
  const transitionOptions = $derived(
    prefersReducedMotion ? {} : { duration: 200 }
  )
</script>

<div transition:fade={transitionOptions}>...</div>
```

## Step 6: Accessibility in Svelte

Svelte's compiler warns about missing accessibility attributes — treat all compiler warnings as errors.

- **`role` and ARIA**: Add `role` when using non-semantic elements. Always pair with `aria-label` or `aria-labelledby`.
- **`bind:this`**: Use for programmatic focus management (e.g., focus trap in modals).
- **Keyboard handlers**: Any `onclick` handler on a non-interactive element needs `onkeydown`/`onkeyup` too, or use a `<button>`.
- **Screen reader text**: Use `class="sr-only"` (define in app.css) for visually hidden labels.

```svelte
<!-- Good: button with accessible label -->
<button
  onclick={closeModal}
  aria-label="Close dialog"
  class="icon-btn"
>
  <CloseIcon />
</button>

<!-- Good: Svelte dialog with focus trap -->
<dialog
  bind:this={dialogEl}
  aria-labelledby="dialog-title"
  aria-modal="true"
>
  <h2 id="dialog-title">{title}</h2>
</dialog>
```

## Step 7: Execution steps

1. **Environment check** — If `node_modules` missing, run `npm install`.
2. **Data layer** — Create `src/lib/data/mockData.ts` from design content.
3. **Component drafting** — Use `resources/component-template.svelte` as base. Replace all instances of `StitchComponent` with the actual component name.
4. **CSS tokens** — Add color tokens to `src/app.css`. If using `stitch-design-system`, import its generated `design-tokens.css` instead.
5. **Wiring** — Update `src/routes/+page.svelte` to import and use the new components. Import from `$lib/components/`.
6. **Quality check** — Run through `resources/architecture-checklist.md`.
7. **Dev verification** — Run `npm run dev`. Toggle dark mode. Test keyboard navigation.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Runes syntax error | Confirm `svelte: ^5` in `package.json`. Old syntax is invalid in Svelte 5. |
| `$props()` type error | Add `lang="ts"` to `<script>` tag |
| CSS not scoped | Ensure styles are inside `<style>` block, not in a `.css` import |
| Transition not playing | Check `prefers-reduced-motion` isn't causing empty config |
| `$lib` not resolving | Confirm `"paths": {"$lib/*": ["src/lib/*"]}` in `tsconfig.json` |
| Dark mode flicker on load | Read theme from `localStorage` in a synchronous `<svelte:head>` script |

## Integration with other skills

- **stitch-design-system** — Run first to generate `design-tokens.css` for the CSS variable foundation.
- **stitch-animate** — Run after for Svelte-specific transition patterns beyond the basics above.
- **stitch-a11y** — Run after for a full accessibility audit when the design has complex UI patterns.

## References

- `resources/component-template.svelte` — Production-ready Svelte 5 component boilerplate
- `resources/architecture-checklist.md` — Pre-ship quality checklist
- `scripts/fetch-stitch.sh` — Reliable GCS HTML downloader
