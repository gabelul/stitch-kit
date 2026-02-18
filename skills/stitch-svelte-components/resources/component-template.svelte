<!--
  StitchComponent.svelte

  Generated from Stitch design via stitch-svelte-components skill.
  Replace "StitchComponent" with the actual component name.
  Import path: $lib/components/StitchComponent.svelte

  Svelte 5 runes API. No legacy Options API patterns.
-->

<script lang="ts">
  import { fade } from 'svelte/transition'

  // ----------------------------------------------------------
  // Types & Props
  // ----------------------------------------------------------

  /**
   * Props for this component.
   * All data comes through $props() — never imported directly from a store or module.
   */
  interface Props {
    /** Primary heading text */
    title: string
    /** Supporting description — optional */
    description?: string
    /** Callback for primary action */
    onAction?: () => void
    /** Render slot content */
    children?: import('svelte').Snippet
  }

  /**
   * $props() is the Svelte 5 replacement for `export let`.
   * Destructure with defaults for optional props.
   */
  const { title, description = '', onAction, children }: Props = $props()

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  /** $state() is the Svelte 5 replacement for reactive `let`. */
  let isExpanded = $state(false)

  // ----------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------

  /** $derived() is the Svelte 5 replacement for $: reactive statements. */
  const buttonLabel = $derived(isExpanded ? 'Collapse' : 'Expand')

  // ----------------------------------------------------------
  // Effects (use sparingly — prefer derived state when possible)
  // ----------------------------------------------------------

  // $effect(() => {
  //   // Runs when dependencies change. Cleanup by returning a function.
  //   console.log('title changed:', title)
  //   return () => { /* cleanup */ }
  // })
</script>

<!--
  Semantic landmark element.
  aria-labelledby connects the section to its visible heading for screen readers.
-->
<section
  aria-labelledby="stitch-component-title"
  in:fade={{ duration: 200 }}
>
  <!-- Heading — maintain hierarchy (h1 → h2 → h3, never skip) -->
  <h2 id="stitch-component-title">{title}</h2>

  <!-- Description — only render when provided -->
  {#if description}
    <p class="description">{description}</p>
  {/if}

  <!-- Named slot for nested content -->
  {#if children}
    <div class="content">
      {@render children()}
    </div>
  {/if}

  <!-- Example interactive element -->
  {#if onAction}
    <button
      type="button"
      onclick={onAction}
      class="btn-primary"
    >
      {buttonLabel}
    </button>
  {/if}
</section>

<!--
  Styles are SCOPED to this component by default.
  Use CSS custom properties (var(--token)) for theming — never hardcode hex values.
  The :global() selector escapes scoping when needed for child components.
-->
<style>
  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background-color: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    width: 100%;
    max-width: 42rem;

    /* Responsive padding */
    @media (min-width: 768px) {
      padding: var(--space-8);
    }
  }

  h2 {
    font-size: var(--text-2xl);
    font-weight: 700;
    font-family: var(--font-sans);
    color: var(--color-text);
    line-height: 1.25;
    margin: 0;
  }

  .description {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.6;
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Button — micro-interaction with CSS transitions */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background-color: var(--color-primary);
    color: var(--color-primary-fg);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    align-self: flex-start;

    /* Smooth micro-transition */
    transition:
      background-color var(--motion-duration-fast) var(--motion-ease-default),
      transform var(--motion-duration-fast) var(--motion-ease-default),
      box-shadow var(--motion-duration-fast) var(--motion-ease-default);
  }

  .btn-primary:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .btn-primary:active {
    transform: translateY(0);
    box-shadow: none;
  }

  /* Focus ring — never outline: none without a replacement */
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Reduced motion — disable all transitions in this component */
  @media (prefers-reduced-motion: reduce) {
    section,
    .btn-primary {
      transition: none;
    }
  }
</style>
