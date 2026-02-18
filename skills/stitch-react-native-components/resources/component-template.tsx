/**
 * StitchComponent.tsx
 *
 * Generated from Stitch design via stitch-react-native-components skill.
 * Replace "StitchComponent" with the actual component name throughout.
 *
 * File location: src/components/StitchComponent.tsx
 */

import { StyleSheet, Text, Pressable, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

/**
 * Props for StitchComponent.
 * All data via props — never fetched inside the component.
 */
interface StitchComponentProps {
  /** Primary heading text */
  title: string
  /** Supporting description text — optional */
  description?: string
  /** Callback when the component is pressed */
  onPress?: () => void
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

/**
 * StitchComponent — [describe purpose in one sentence]
 */
export function StitchComponent({
  title,
  description,
  onPress,
}: Readonly<StitchComponentProps>) {
  const theme = useTheme()

  return (
    <Pressable
      // Visual press feedback via the style callback
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
      // Accessibility — required for screen readers
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      // Extend tap area without changing visual size
      hitSlop={8}
    >
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>

      {/* Description — only render when provided */}
      {description ? (
        <Text style={[styles.description, { color: theme.textMuted }]}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  )
}

// ------------------------------------------------------------
// Styles
// ------------------------------------------------------------

/**
 * StyleSheet.create hoists styles outside the render function.
 * Dynamic values (from theme) go inline — static values go here.
 */
const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    // Apple HIG / Material minimum touch target
    minHeight: 44,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
})
