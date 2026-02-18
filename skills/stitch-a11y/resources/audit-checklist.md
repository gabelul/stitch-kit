# Accessibility Pre-Ship Checklist

Quick reference before every production deployment.
Target: **WCAG 2.1 AA**.

---

## 🏗 Semantic HTML

- [ ] Page has exactly one `<main>` landmark
- [ ] Navigation uses `<nav aria-label="...">` (label required when multiple navs exist)
- [ ] `<header>`, `<footer>`, `<aside>` used for landmark regions
- [ ] Heading hierarchy is sequential — no skipped levels (e.g., h1 → h3 without h2)
- [ ] Lists use `<ul>` / `<ol>` + `<li>`, not `<div>` + `<div>`
- [ ] Tables have `<caption>` and `<th scope="col/row">` headers
- [ ] Forms use `<label for="id">` or `aria-label` on every input

---

## 🏷 ARIA

- [ ] No `role="button"` on a real `<button>` (redundant)
- [ ] No ARIA used where semantic HTML already conveys the meaning
- [ ] Every `aria-labelledby` and `aria-describedby` references a real ID that exists
- [ ] Disclosure widgets (accordion, dropdown) have `aria-expanded` on the trigger
- [ ] Modal dialogs have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Loading/status updates use `aria-live="polite"` or `aria-live="assertive"`
- [ ] Icon-only interactive elements have `aria-label`
- [ ] Decorative images have `alt=""` and `aria-hidden="true"`

---

## ⌨️ Keyboard navigation

- [ ] Tab order follows visual reading order (no `tabIndex={1}` or higher)
- [ ] All interactive elements are reachable by Tab
- [ ] Modals: focus moves into modal on open, returns to trigger on close
- [ ] Dropdowns: Escape closes and returns focus to trigger
- [ ] Custom interactive elements: Enter / Space activates them
- [ ] No keyboard traps (except intentional modal focus traps)
- [ ] Skip link is present and works (first focusable element on page)

---

## 👁 Focus visibility

- [ ] No `outline: none` or `outline: 0` without a visible custom focus indicator
- [ ] Focus ring is visible in both light and dark mode
- [ ] Focus ring has sufficient contrast against all backgrounds it appears on
- [ ] `:focus-visible` used (not `:focus`) to avoid showing ring on mouse click

---

## 🖼 Images & media

- [ ] All `<img>` / `<Image>` have `alt` attribute
- [ ] Meaningful images have descriptive alt text
- [ ] Decorative images have `alt=""`
- [ ] Videos have captions or transcripts
- [ ] Audio has transcripts

---

## 🎨 Color & contrast

- [ ] Body text on background ≥ 4.5:1 contrast ratio
- [ ] Large text (18px+ regular or 14px+ bold) on background ≥ 3:1
- [ ] Interactive element boundaries visible against adjacent colors (≥ 3:1)
- [ ] Errors not indicated by color alone — also include icon or text
- [ ] Required fields not indicated by color alone — include `(required)` text or aria

---

## 🎬 Motion

- [ ] `@media (prefers-reduced-motion: reduce)` override in global CSS
- [ ] No autoplay video longer than 5 seconds (or provide pause control)
- [ ] No content that flashes more than 3 times per second

---

## 🧪 How to test

**Keyboard only:**
1. Unplug/disable mouse
2. Tab through the entire page
3. Verify every action is reachable and operable

**Screen reader:**
- macOS: VoiceOver (Cmd+F5) + Safari
- Windows: NVDA (free) + Chrome
- iOS: VoiceOver + Safari
- Android: TalkBack + Chrome

**Automated:**
- axe DevTools browser extension (free tier covers ~30% of WCAG issues)
- Lighthouse → Accessibility panel
- `npx axe-cli http://localhost:3000` for CI

**Contrast:**
- browser-native: Chrome DevTools → Elements → Accessibility tab → contrast ratio
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
