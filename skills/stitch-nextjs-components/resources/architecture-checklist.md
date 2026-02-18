# Next.js Components — Architecture Checklist

Run through this checklist before marking the task complete.

## Structure

- [ ] Components are in separate files — no single-file spaghetti
- [ ] Static content is in `src/data/mockData.ts`, not hardcoded in JSX
- [ ] Shared TypeScript types are in `src/types/index.ts`
- [ ] Each component file has a `Readonly<ComponentNameProps>` interface
- [ ] Custom hooks (if any) are in `src/hooks/`

## App Router correctness

- [ ] Pages are in `app/[route]/page.tsx`, not `pages/`
- [ ] Interactive components have `'use client'` at the top
- [ ] Non-interactive components do NOT have `'use client'`
- [ ] No `useState` / `useEffect` in Server Components
- [ ] `next/image` used for all images (never `<img>`)
- [ ] `next/link` used for all internal navigation (never `<a>`)

## TypeScript

- [ ] No `any` types
- [ ] All function parameters are typed
- [ ] All component props use `Readonly<>`
- [ ] No `@ts-ignore` or `@ts-expect-error` without a comment explaining why

## Styling — CSS variables

- [ ] No hardcoded hex colors in JSX or CSS
- [ ] All colors reference `var(--color-*)` tokens
- [ ] Dark mode works — toggle `.dark` class on `<html>` and verify visually
- [ ] `design-tokens.css` is imported in `globals.css`

## Responsive

- [ ] Layout works at 320px (small mobile) — no horizontal overflow
- [ ] Layout works at 768px (tablet)
- [ ] Layout works at 1280px (desktop)
- [ ] Navigation collapses appropriately on mobile
- [ ] All images have correct `sizes` attribute for responsive loading

## Accessibility baseline

- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>` where appropriate
- [ ] `<main id="main-content">` exists on every page
- [ ] Skip navigation link is first element in `app/layout.tsx`
- [ ] All interactive elements are `<button>` or `<a>`, not `<div>`
- [ ] All images have descriptive `alt` text (or `alt=""` for decorative)
- [ ] Icon-only buttons have `aria-label`
- [ ] No `outline-none` without a visible `focus-visible:ring-*` replacement

## Dark mode

- [ ] `ThemeProvider` is wrapping `{children}` in `app/layout.tsx`
- [ ] `suppressHydrationWarning` is on the `<html>` tag
- [ ] Both light and dark modes look correct (test by toggling class)
- [ ] No elements that "disappear" in dark mode (white on white, etc.)

## Performance

- [ ] No `console.log` statements left in production code
- [ ] Images use `next/image` with `width` and `height` (or `fill` + `sizes`)
- [ ] Heavy dependencies are dynamically imported if not needed on initial load
