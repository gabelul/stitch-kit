# HTML Components — Architecture Checklist

Run through this checklist before marking the task complete.

## Structure

- [ ] Components are in `src/components/` — one HTML partial per component (or standalone `.html` files)
- [ ] Static content is in a data layer (`src/data/` or inline JSON) — not hardcoded in markup
- [ ] CSS custom properties are defined in `src/styles/tokens.css` (or `globals.css`)
- [ ] Component styles are co-located: `ComponentName.html` + `ComponentName.css`

## Semantic HTML

- [ ] Page structure uses `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`
- [ ] Heading hierarchy is correct: one `<h1>` per page, `<h2>` for sections, `<h3>` for subsections
- [ ] Interactive elements are `<button>` or `<a>` — not `<div onclick>` or `<span>`
- [ ] Lists use `<ul>` / `<ol>` / `<dl>` — not `<div>` wrappers
- [ ] Forms have `<label for="id">` on all inputs, with matching `id` attributes

## CSS custom properties (tokens)

- [ ] No hardcoded hex colors in CSS — all colors use `var(--color-*)`
- [ ] Light mode tokens defined in `:root {}`
- [ ] Dark mode tokens defined in `@media (prefers-color-scheme: dark) {}` or `[data-theme="dark"] {}`
- [ ] Both light and dark mode tested visually
- [ ] Token names are semantic: `--color-surface`, `--color-primary` (not `--color-blue-500`)

## Mobile-first and responsive

- [ ] Layout starts mobile-first — base styles are for 320px, `@media (min-width: ...)` adds desktop
- [ ] No fixed pixel widths that cause horizontal overflow on small screens
- [ ] Touch targets are at least 44×44px (`min-height: 44px; min-width: 44px`)
- [ ] Text is readable at 16px without zooming (no `font-size < 16px` on body text)
- [ ] Tested at 320px, 375px, 768px, and 1280px viewport widths

## Safe area (mobile WebView)

- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` in `<head>`
- [ ] Fixed bottom elements use `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Fixed top elements use `padding-top: env(safe-area-inset-top)`
- [ ] No content hidden behind notch or home indicator

## Images

- [ ] All `<img>` have `alt=""` (descriptive text for content images, empty string for decorative)
- [ ] Images have explicit `width` and `height` attributes to prevent layout shift
- [ ] Remote images are loaded with `loading="lazy"` (except above-the-fold)
- [ ] SVG icons are accessible: `aria-hidden="true"` on decorative SVGs

## Accessibility

- [ ] `<html lang="en">` (or correct language) is set
- [ ] Skip-to-content link: `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>`
- [ ] All interactive elements are keyboard reachable (Tab key)
- [ ] Focus styles are visible — no `outline: none` without a replacement
- [ ] Color contrast meets WCAG AA: 4.5:1 for body text, 3:1 for large text
- [ ] Icon-only buttons have `aria-label` or `title`
- [ ] `<dialog>` or `role="dialog"` elements trap focus when open

## Performance

- [ ] No inline `<style>` for anything that belongs in a stylesheet
- [ ] No `console.log` in production code
- [ ] CSS is minified for production (or bundler handles it)
- [ ] Images are compressed and served at appropriate sizes
- [ ] External resources (fonts, icons) are loaded asynchronously

## WebView / Capacitor compatibility (if applicable)

- [ ] No `window.open()` — use Capacitor's Browser plugin for external links
- [ ] `localStorage` used for simple persistence (Capacitor has access)
- [ ] File paths are relative — no `http://localhost:*` hardcoded
- [ ] `-webkit-overflow-scrolling: touch` on scrollable containers (iOS WebView)
- [ ] Camera / GPS APIs routed through Capacitor plugins, not direct browser APIs
