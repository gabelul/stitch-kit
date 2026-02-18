# Tailwind Utility Reference for Stitch Conversions

Stitch exports **Tailwind-based HTML**. When converting to a target framework, map Tailwind utilities to the framework's native patterns — do not copy class names verbatim into non-Tailwind projects.

This is the Tailwind-side lookup. Framework-specific mappings live in each skill's `resources/` directory.

---

## Scale quick reference

Default spacing scale: `1` unit = `0.25rem` = `4px`

| Tailwind | px | rem |
|----------|----|-----|
| `p-1` | 4px | 0.25rem |
| `p-2` | 8px | 0.5rem |
| `p-3` | 12px | 0.75rem |
| `p-4` | 16px | 1rem |
| `p-5` | 20px | 1.25rem |
| `p-6` | 24px | 1.5rem |
| `p-8` | 32px | 2rem |
| `p-10` | 40px | 2.5rem |
| `p-12` | 48px | 3rem |
| `p-16` | 64px | 4rem |

Same scale applies to `m-*`, `gap-*`, `space-*`, `w-*`, `h-*`.

---

## Layout

| Tailwind class | Meaning |
|----------------|---------|
| `flex` | `display: flex` |
| `flex-col` | `flex-direction: column` |
| `flex-row` | `flex-direction: row` |
| `flex-wrap` | `flex-wrap: wrap` |
| `items-center` | `align-items: center` |
| `items-start` | `align-items: flex-start` |
| `items-end` | `align-items: flex-end` |
| `justify-center` | `justify-content: center` |
| `justify-between` | `justify-content: space-between` |
| `justify-around` | `justify-content: space-around` |
| `justify-end` | `justify-content: flex-end` |
| `grid` | `display: grid` |
| `grid-cols-2` | `grid-template-columns: repeat(2, 1fr)` |
| `grid-cols-3` | `grid-template-columns: repeat(3, 1fr)` |
| `gap-4` | `gap: 16px` |
| `absolute` | `position: absolute` |
| `relative` | `position: relative` |
| `fixed` | `position: fixed` |
| `sticky` | `position: sticky` |
| `inset-0` | `top:0; right:0; bottom:0; left:0` |
| `z-10` | `z-index: 10` |
| `overflow-hidden` | `overflow: hidden` |
| `overflow-y-scroll` | `overflow-y: scroll` |

---

## Sizing

| Tailwind | CSS equivalent |
|----------|----------------|
| `w-full` | `width: 100%` |
| `w-screen` | `width: 100vw` |
| `w-1/2` | `width: 50%` |
| `w-1/3` | `width: 33.333%` |
| `w-auto` | `width: auto` |
| `w-fit` | `width: fit-content` |
| `h-full` | `height: 100%` |
| `h-screen` | `height: 100vh` |
| `h-auto` | `height: auto` |
| `min-h-screen` | `min-height: 100vh` |
| `min-h-[44px]` | `min-height: 44px` (touch target) |
| `max-w-xs` | `max-width: 320px` |
| `max-w-sm` | `max-width: 384px` |
| `max-w-md` | `max-width: 448px` |
| `max-w-lg` | `max-width: 512px` |
| `max-w-xl` | `max-width: 576px` |
| `max-w-2xl` | `max-width: 672px` |
| `max-w-7xl` | `max-width: 1280px` |

---

## Typography

| Tailwind | Size / weight |
|----------|---------------|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |
| `text-4xl` | 36px |
| `font-normal` | weight 400 |
| `font-medium` | weight 500 |
| `font-semibold` | weight 600 |
| `font-bold` | weight 700 |
| `leading-tight` | line-height 1.25 |
| `leading-normal` | line-height 1.5 |
| `leading-relaxed` | line-height 1.625 |
| `tracking-tight` | letter-spacing -0.025em |
| `tracking-wide` | letter-spacing 0.025em |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `line-clamp-2` | clamp to 2 lines |
| `text-left` | `text-align: left` |
| `text-center` | `text-align: center` |

---

## Colors (Stitch custom tokens)

Stitch extends Tailwind with custom theme keys. These appear in the HTML as classes like `bg-primary`, `text-primary`, `border-[var(--color-border)]`.

| Stitch class / token | Likely semantic role |
|----------------------|---------------------|
| `bg-primary` / `--color-primary` | Brand primary color |
| `text-primary` | Primary foreground text |
| `bg-background` / `--color-background` | Page background |
| `bg-surface` / `--color-surface` | Card / panel background |
| `bg-card-light` / `bg-card-dark` | Card background (theme-specific) |
| `border-[var(--color-border)]` | Default border color |
| `text-muted` / `--color-text-muted` | Secondary / muted text |
| `shadow-soft` / `shadow-floating` | Custom shadow values |

When converting, map these to:
- **CSS variables** (HTML, Next.js) — keep as `var(--color-primary)` etc.
- **ThemeTokens struct** (SwiftUI) — `theme.primary`, `theme.surface`
- **useTheme() hook** (React Native) — `theme.primary`, `theme.surface`
- **Tailwind theme extension** (Next.js + Tailwind) — add to `tailwind.config.js`

---

## Border radius

| Tailwind | Radius |
|----------|--------|
| `rounded-sm` | 2px |
| `rounded` / `rounded-md` | 6–8px |
| `rounded-lg` | 12px |
| `rounded-xl` | 16px |
| `rounded-2xl` | 24px |
| `rounded-full` | 9999px (pill / circle) |
| `rounded-none` | 0px |

---

## Backgrounds & effects

| Tailwind | CSS |
|----------|-----|
| `bg-transparent` | `background: transparent` |
| `opacity-50` | `opacity: 0.5` |
| `shadow-sm` | small drop shadow |
| `shadow-md` | medium drop shadow |
| `shadow-lg` | large drop shadow |
| `shadow-none` | no shadow |
| `backdrop-blur-sm` | `backdrop-filter: blur(4px)` |
| `backdrop-blur-md` | `backdrop-filter: blur(12px)` |

---

## Dark mode

Stitch uses the `dark:` prefix. Classes like `dark:bg-gray-800` override the light mode value.

In conversions:
- **CSS variables approach** (Next.js, Svelte, HTML): map to `.dark` selector or `[data-theme="dark"]`
- **`prefers-color-scheme`**: use `@media (prefers-color-scheme: dark)` for HTML/CSS
- **React Native**: `useColorScheme()` → select `darkTokens` vs. `lightTokens`
- **SwiftUI**: `@Environment(\.colorScheme)` → select `ThemeTokens.dark` vs. `.light`

---

## State variants

| Tailwind prefix | When it applies |
|-----------------|----------------|
| `hover:` | Mouse hover |
| `focus:` | Keyboard / programmatic focus |
| `focus-visible:` | Focus only from keyboard (not click) |
| `active:` | While being pressed |
| `disabled:` | Element is disabled |
| `sm:` | ≥ 640px viewport |
| `md:` | ≥ 768px viewport |
| `lg:` | ≥ 1024px viewport |
| `xl:` | ≥ 1280px viewport |
| `dark:` | Dark color scheme |

---

## Transitions & animation

| Tailwind | CSS |
|----------|-----|
| `transition` | `transition: all 150ms cubic-bezier(...)` |
| `transition-colors` | transition only color properties |
| `duration-150` | 150ms |
| `duration-300` | 300ms |
| `ease-in-out` | `animation-timing-function: ease-in-out` |
| `animate-spin` | infinite rotation |
| `animate-pulse` | opacity pulse |
| `animate-bounce` | bounce |

For production animations, use `stitch-animate` instead of raw Tailwind animation utilities.
