# React (Vite) Components — Architecture Checklist

Run through this before marking the conversion complete.

## Structure
- [ ] Each component is in its own file under `src/components/`
- [ ] Custom hooks extracted to `src/hooks/`
- [ ] Static content (labels, mock data, lists) in `src/data/mockData.ts`
- [ ] No single monolithic file — if it's over 200 lines, split it

## Type safety
- [ ] Props interfaces use `Readonly<ComponentNameProps>`
- [ ] No `any` types — use `unknown` and narrow
- [ ] Template placeholder `StitchComponent` replaced with real component name

## Styling
- [ ] Stitch design tokens extracted and synced to `tailwind.config` (`theme.extend.colors`, `borderRadius`, `boxShadow`)
- [ ] Theme-mapped class names used (`bg-primary`, `text-foreground`) — no raw hex in className
- [ ] Dark mode (`dark:` variants) applied where applicable
- [ ] No leftover Stitch-only tokens (e.g. `background-light`) unless defined in project config

## Functionality
- [ ] `useTheme()` hook implemented and wired to `dark:` classes or CSS variable root
- [ ] All interactive elements have `onClick` / `onChange` handlers (or clear TODO comments)
- [ ] No `console.log` in production code

## Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] `<img>` elements have descriptive `alt` text
- [ ] ARIA attributes added where semantic HTML isn't enough

## References
- `references/tailwind-to-react.md` — token + class mapping guide
- `resources/component-template.tsx` — base component structure
