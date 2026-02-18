# Animation Patterns — Copy-Paste Reference

Ready-to-use patterns for the most common UI animation scenarios.
All patterns respect `prefers-reduced-motion`.

---

## 1. Button hover lift (CSS — universal)

```css
.btn {
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-out),
    box-shadow var(--motion-duration-fast) var(--motion-ease-out),
    background-color var(--motion-duration-fast) var(--motion-ease-default);
}
.btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn:active { transform: translateY(0); box-shadow: var(--shadow-sm); }
```

---

## 2. Card hover elevation (CSS — universal)

```css
.card {
  transition:
    transform var(--motion-duration-base) var(--motion-ease-out),
    box-shadow var(--motion-duration-base) var(--motion-ease-out);
}
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
```

---

## 3. Fade + rise on page load (CSS keyframes)

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up var(--motion-duration-base) var(--motion-ease-out) both;
}
/* Stagger children: add style="--delay: Xms" and use animation-delay: var(--delay) */
```

---

## 4. Fade in (CSS keyframes)

```css
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in var(--motion-duration-fast) var(--motion-ease-out) both;
}
```

---

## 5. Scroll reveal — Framer Motion (React/Next.js)

```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'

export function RevealOnScroll({ children, delay = 0 }: {
  children: React.ReactNode
  delay?: number
}) {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 6. Staggered grid — Framer Motion (React/Next.js)

```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { ease: [0, 0, 0.2, 1], duration: 0.35 } }
}

export function StaggerGrid({ items }: { items: Item[] }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className="grid">{items.map(i => <Card key={i.id} {...i} />)}</div>
  return (
    <motion.div className="grid" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
      {items.map(i => <motion.div key={i.id} variants={item}><Card {...i} /></motion.div>)}
    </motion.div>
  )
}
```

---

## 7. Modal enter/exit — Framer Motion (React/Next.js)

```tsx
'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const reduce = useReducedMotion()
  const anim = reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
  const panelAnim = reduce ? {} : {
    initial: { opacity: 0, y: -20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: 20, scale: 0.97 },
    transition: { duration: 0.2 }
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="backdrop" {...anim} onClick={onClose} />
          <motion.div className="modal-panel" role="dialog" aria-modal="true" {...panelAnim}>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## 8. Fade in — Svelte transition

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition'
  let { show } = $props()
</script>

{#if show}
  <div in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
    Content
  </div>
{/if}
```

---

## 9. Slide-in panel — Svelte transition

```svelte
<script lang="ts">
  import { fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  let { isOpen } = $props()
</script>

{#if isOpen}
  <aside
    transition:fly={{ x: -280, duration: 300, easing: cubicOut }}
    role="dialog"
    aria-modal="true"
  >
    Sidebar content
  </aside>
{/if}
```

---

## 10. Scroll reveal — Svelte action

```svelte
<script lang="ts">
  function revealOnScroll(node: HTMLElement, delay = 0) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {}
    node.style.opacity = '0'
    node.style.transform = 'translateY(16px)'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.style.transition = `opacity 400ms cubic-bezier(0,0,0.2,1) ${delay}ms, transform 400ms cubic-bezier(0,0,0.2,1) ${delay}ms`
        node.style.opacity = '1'
        node.style.transform = 'translateY(0)'
        observer.unobserve(node)
      }
    }, { threshold: 0.1 })
    observer.observe(node)
    return { destroy() { observer.disconnect() } }
  }
</script>

<section use:revealOnScroll>Fades in on scroll</section>
<section use:revealOnScroll={100}>Fades in 100ms later</section>
```

---

## 11. Number counter (Svelte tweened store)

```svelte
<script lang="ts">
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let { target = 1000 } = $props()
  const count = tweened(0, { duration: 800, easing: cubicOut })

  $effect(() => {
    count.set(target)
  })
</script>

<span>{Math.round($count).toLocaleString()}</span>
```

---

## Reduced motion reminder

Always add this to your global CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
