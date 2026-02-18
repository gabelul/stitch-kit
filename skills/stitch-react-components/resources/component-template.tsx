import React from 'react';

/**
 * Template for Stitch-converted React components.
 * Replace `StitchComponent` with the actual component name.
 * Replace `StitchComponentProps` with domain-specific props.
 *
 * @see resources/architecture-checklist.md before shipping
 * @see references/tailwind-to-react.md for class mapping patterns
 */

interface StitchComponentProps {
  /** Content to render inside the component */
  readonly children?: React.ReactNode;
  /** Additional Tailwind classes to merge in */
  readonly className?: string;
}

/**
 * Base Stitch component wrapper.
 * Demonstrates: typed props, className passthrough, dark mode readiness.
 */
export const StitchComponent: React.FC<StitchComponentProps> = ({
  children,
  className = '',
}) => {
  return (
    // Use theme-mapped tokens (bg-background, text-foreground) — never hardcoded hex
    <div className={`relative bg-background text-foreground ${className}`}>
      {children}
    </div>
  );
};

export default StitchComponent;
