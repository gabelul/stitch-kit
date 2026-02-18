/**
 * StitchComponent
 *
 * Generated from Stitch design via stitch-nextjs-components skill.
 * Replace "StitchComponent" with the actual component name throughout.
 *
 * Pattern: Server Component by default.
 * Add 'use client' only if this component uses hooks, onClick, or browser APIs.
 */

// Uncomment if this component needs interactivity:
// 'use client'

import type { ReactNode } from 'react'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

/**
 * Props for StitchComponent.
 * All data comes through props — never imported directly.
 * Use Readonly<> to prevent accidental mutation.
 */
interface StitchComponentProps {
  /** Primary content to display */
  title: string
  /** Supporting description text */
  description?: string
  /** Nested content — use for compound components */
  children?: ReactNode
  /** Callback for primary action — triggers 'use client' if needed */
  // onAction?: () => void
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

/**
 * StitchComponent — [describe what this component does in one sentence]
 *
 * @param props - {@link StitchComponentProps}
 */
export function StitchComponent({
  title,
  description,
  children,
}: Readonly<StitchComponentProps>) {
  return (
    <section
      // Semantic landmark — adjust to article, aside, div, etc. as appropriate
      aria-labelledby="stitch-component-title"
      className="
        /* Layout */
        flex flex-col gap-4
        /* Spacing */
        p-6 md:p-8
        /* Colors — always use CSS variable classes, never arbitrary hex */
        bg-[var(--color-surface)]
        text-[var(--color-text)]
        /* Geometry */
        rounded-[var(--radius-lg)]
        border border-[var(--color-border)]
        /* Shadow */
        shadow-sm
        /* Responsive */
        w-full max-w-2xl
      "
    >
      {/* Heading — maintain hierarchy (h1 → h2 → h3, never skip) */}
      <h2
        id="stitch-component-title"
        className="
          text-2xl font-bold
          text-[var(--color-text)]
          font-[var(--font-sans)]
        "
      >
        {title}
      </h2>

      {/* Description — optional, use text-muted for supporting copy */}
      {description && (
        <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
          {description}
        </p>
      )}

      {/* Slot for nested content */}
      {children && (
        <div className="flex flex-col gap-3">
          {children}
        </div>
      )}
    </section>
  )
}

// Default export for page-level components. Named export for UI primitives.
export default StitchComponent
