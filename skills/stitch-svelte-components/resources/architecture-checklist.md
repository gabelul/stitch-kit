# Svelte Components — Architecture Checklist

Run through this before marking the task complete.

## Structure

- [ ] Components are in `src/lib/components/` — imported via `$lib/components/`
- [ ] Static/mock data is in `src/lib/data/mockData.ts`, not hardcoded in `.svelte` files
- [ ] Shared types are in `src/lib/types/index.ts`
- [ ] Pages are in `src/routes/` using `+page.svelte` convention

## Svelte 5 runes

- [ ] Props use `$props()`, NOT `export let`
- [ ] Reactive state uses `$state()`, NOT `let x = 0` with `$:` elsewhere
- [ ] Computed values use `$derived()`, NOT `$: computed = ...`
- [ ] Side effects use `$effect()`, NOT `onMount` / `afterUpdate` (unless lifecycle-specific)
- [ ] Event callbacks passed via props — no `createEventDispatcher`
- [ ] Snippets use `{@render children()}` syntax, NOT `<slot>`

## TypeScript

- [ ] `<script lang="ts">` on every component
- [ ] `Props` interface defined in the script block
- [ ] No `any` types
- [ ] `$lib` imports work (check `tsconfig.json` paths if not)

## Styling — scoped CSS + CSS variables

- [ ] All styles are in the component's `<style>` block (scoped by default)
- [ ] No hardcoded hex colors — all use `var(--color-*)` tokens
- [ ] Dark mode works — test with `[data-theme="dark"]` on `<html>`
- [ ] `design-tokens.css` imported in `src/app.css`
- [ ] `@media (prefers-reduced-motion: reduce)` overrides exist for any transitions

## Responsive

- [ ] Layout works at 320px (small mobile) — no horizontal overflow
- [ ] Layout works at 768px (tablet)
- [ ] Layout works at 1280px (desktop)
- [ ] `@media` breakpoints are inside the `<style>` block, not inline styles

## Accessibility baseline

- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>` where appropriate
- [ ] All interactive elements are `<button>` or `<a>`, not `<div>` with `onclick`
- [ ] `<button>` elements have accessible labels (text or `aria-label`)
- [ ] Images have descriptive `alt` text (or `alt=""` + `aria-hidden="true"` for decorative)
- [ ] Svelte compiler a11y warnings treated as errors (not ignored)
- [ ] No `outline: none` without a `:focus-visible` replacement

## Transitions

- [ ] Svelte transitions are imported from `svelte/transition`
- [ ] `prefers-reduced-motion` is checked before applying IntersectionObserver animations
- [ ] Transitions don't cause layout shifts (use `opacity` + `transform`, not `height`/`width`)

## SvelteKit specifics

- [ ] `+page.svelte` imports from `$lib/`, not relative `../../`
- [ ] Data loading uses `+page.ts` load function, not `onMount` for initial data
- [ ] No hardcoded `window.*` calls at module level (SSR will break) — wrap in `$effect` or check `typeof window !== 'undefined'`
