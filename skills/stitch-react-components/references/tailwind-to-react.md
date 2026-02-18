# Tailwind → React (Vite + Tailwind) Mapping

When converting **Stitch HTML** to React, **keep Tailwind utility classes** but **map Stitch design tokens to the project theme** (`tailwind.config`, CSS variables). Never copy raw hex when a theme key exists.

> Rule: Extract Stitch's inline `tailwind.config` (from the HTML `<script>` block or `DESIGN.md`) and sync with your project's `tailwind.config.*` before generating components.

---

## 1. Layout

| Tailwind pattern | React output |
|------------------|--------------|
| `flex`, `flex-col`, `flex items-center` | Keep as-is |
| `grid`, `grid-cols-2`, `grid-cols-3` | Keep as-is |
| `sticky top-0` | Keep as-is |
| `container`, `mx-auto` | Keep as-is |

---

## 2. Spacing

| Tailwind | React |
|----------|-------|
| `p-*`, `px-*`, `py-*` | Keep (`p-4`, `px-6`) |
| `mb-*`, `gap-*`, `space-y-*` | Keep |

No conversion needed — Tailwind spacing IS the output.

---

## 3. Sizing

| Tailwind | React |
|----------|-------|
| `w-full`, `w-10`, `h-*`, `min-h-screen` | Keep all |

---

## 4. Typography

| Tailwind | React |
|----------|-------|
| `text-xs` → `text-2xl` | Keep |
| `font-normal`, `font-medium`, `font-bold` | Keep |
| `text-gray-500` | Keep OR map to `text-muted-foreground` if project uses shadcn-style tokens |
| `text-primary` | Map to theme: ensure `primary` is in `theme.extend.colors` |

Prefer **semantic token names** (`text-foreground`, `text-muted-foreground`) over raw `text-gray-*` when the project has them.

---

## 5. Colors — Stitch → project theme

| Stitch / Tailwind | React |
|-------------------|-------|
| `bg-primary`, `text-primary` | Map to `tailwind.config` `theme.extend.colors.primary` |
| `background-light`, `background-dark` | Map to theme `background` or use `bg-[#hex]` only if no theme key |
| `card-light`, `card-dark` | Map to `card`, `card-foreground` (shadcn-style) |
| `border-light`, `border-dark` | Map to theme border color |
| `shadow-soft`, `shadow-floating` (Stitch) | Define in `theme.extend.boxShadow`; then use `shadow-soft` in JSX |

---

## 6. Borders & Radius

| Tailwind | React |
|----------|-------|
| `border`, `border-b`, `border-2 border-dashed` | Keep |
| `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full` | Keep; add to `theme.extend.borderRadius` if Stitch overrides defaults |
| `border-gray-200`, `dark:border-gray-700` | Keep or map to `border`, `border-muted` |

---

## 7. Effects

| Tailwind | React |
|----------|-------|
| `shadow-sm`, `shadow-md` | Keep |
| `shadow-soft` (Stitch custom) | Add to `theme.extend.boxShadow` in config |

---

## 8. Interactivity

| Tailwind | React |
|----------|-------|
| `hover:bg-gray-100` | Keep or theme `hover:bg-accent` |
| `focus:ring-1 focus:ring-primary` | Keep; ensure `primary` in theme |
| `dark:*` variants | Keep; ensure dark mode is configured (`class` or `media`) |
| `peer`, `peer-checked:` | Keep OR replace with React `useState` + conditional class |

---

## 9. Icons — Material Symbols → React

Stitch HTML uses Material Symbols font icons. Replace in React:

| Stitch | React (Lucide) |
|--------|----------------|
| `chevron_left` | `<ChevronLeft />` |
| `expand_more` | `<ChevronDown />` |
| `add` | `<Plus />` |
| `remove` | `<Minus />` |
| `add_photo_alternate` | `<ImagePlus />` |
| `search` | `<Search />` |
| `close` | `<X />` |

Do not include Material Symbols font in React unless the project explicitly uses it.

---

## 10. Don't do these

- Don't use raw hex in `className` when a theme key exists (`bg-primary` not `bg-[#1677FF]`)
- Don't leave Stitch token names (`background-light`) in JSX unless they're in your `tailwind.config`
- Don't use raw `<button>` or `<input>` when the project has shared components — use those with `className` passed through
- Don't forget to add Stitch's custom `borderRadius` and `boxShadow` to the project config — otherwise `rounded-xl` and `shadow-soft` won't compile correctly
