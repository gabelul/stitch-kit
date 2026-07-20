---
name: stitch-react-native-components
description: Converts a Stitch mobile screen, a local HTML file, or a URL into React Native / Expo components — TypeScript, StyleSheet, Expo Router, dark mode via useColorScheme, and proper touch targets. Cross-platform iOS and Android. Only the Stitch route needs an API key.
allowed-tools:
  - "stitch*:*"
  - "Bash"
  - "Read"
  - "Write"
---

# Stitch → React Native / Expo Components

You are a React Native engineer. You convert mobile UI layouts — a Stitch screen generated with `deviceType: MOBILE`, a local HTML file, or a URL — into cross-platform React Native components using Expo. You work in TypeScript, use `StyleSheet.create` for styles, and follow Expo Router conventions for navigation.

## When to use this skill

Use this skill when:
- The user wants a **native mobile app** (iOS + Android) from an existing design
- The user mentions "React Native", "Expo", "mobile app", "iOS", "Android"
- The source is a **mobile layout** — narrow, vertical, touch-sized targets (a Stitch screen with `deviceType: MOBILE`, or a local file/URL that reads as mobile)

**Note:** For a mobile WebView app (Capacitor, Ionic, PWA), use `stitch-html-components` instead. React Native outputs actual native UI — not web views.

## Prerequisites

A mobile-layout source, read as structural and visual reference only — nothing here ships, RN components get written from scratch. Any one of these works:

- A **Stitch screen** — needs Stitch MCP access and a screen generated with `deviceType: MOBILE`
- A **local HTML file** of a mobile layout — no Stitch account required
- A **URL** rendering a mobile layout — no Stitch account required

Desktop layouts don't translate well to RN, regardless of which route you took — verify the source is narrow and vertical before converting.

Also:
- Target project uses **Expo** (SDK 50+) — not bare React Native
- `expo-router` for file-based navigation

## Step 1: Resolve the source

Everything downstream reads one file: `temp/source.html`. Get the HTML there by whichever route matches what the user gave you, then continue at Step 2 — the rest of this skill is identical regardless of where the markup came from.

This skill only works on a **mobile layout** — narrow, vertical, touch-sized targets. Desktop layouts don't translate to RN regardless of source. How you confirm mobile-ness depends on where the HTML came from:

- **Stitch screen** — check it was generated with `deviceType: MOBILE`. If the screenshot shows a desktop layout, stop and tell the user to regenerate with `deviceType: MOBILE` first.
- **Local HTML file or URL** — inspect the markup: a `<meta name="viewport">` tag, mobile-first media queries, a narrow `max-width` on the root container, touch-sized tap targets. If it's clearly a desktop layout (wide multi-column grid, hover-only interactions, no viewport meta), stop and tell the user the source isn't a mobile layout — don't tell them to "regenerate with deviceType: MOBILE," that instruction is meaningless outside Stitch.

**From a Stitch screen:**

1. **Namespace discovery** — `list_tools` to find the Stitch MCP prefix
2. **Fetch metadata** — `[prefix]:get_screen` for the design JSON
3. **Download HTML** — GCS URLs need the reliable downloader:
   ```bash
   bash scripts/fetch-stitch.sh "[htmlCode.downloadUrl]" "temp/source.html"
   ```
4. **Visual audit** — check `screenshot.downloadUrl` before converting. Append `=s0` to that URL for full resolution; the bare URL serves a 512px thumbnail regardless of the `width`/`height` the API reports. Confirm it's a mobile layout, per the check above.

**From a local HTML file:**

```bash
mkdir -p temp && cp "path/to/design.html" temp/source.html
```

Open it and confirm it's a mobile layout, per the check above.

**From a URL:**

```bash
bash scripts/fetch-stitch.sh "https://example.com/page" "temp/source.html"
```

Despite the name, that script is a generic hardened downloader — follows redirects, retries transient failures, handles gzip, and fails loudly on an empty result. It does not care whether the URL points at Stitch. Confirm the page is a mobile layout, per the check above.

**From a screenshot:** there's no upload route — the Stitch MCP API has no image-upload tool. Either recreate the design from a text prompt via `stitch-mcp-generate-screen-from-text`, or hand-write the HTML and use the local-file route above.

> Only the Stitch route needs an API key. Converting a local file or a URL works with no Google account at all.

## Step 2: Project structure

```
app/
├── (tabs)/
│   ├── _layout.tsx       ← Tab navigator
│   ├── index.tsx         ← Home tab
│   └── [other-tabs].tsx
├── _layout.tsx           ← Root layout (ThemeProvider, SafeAreaProvider)
└── modal.tsx             ← Modal routes
src/
├── components/           ← Reusable components
│   └── [Name].tsx
├── data/
│   └── mockData.ts       ← Static content — never hardcoded in components
├── theme/
│   ├── tokens.ts         ← Design tokens as TypeScript constants
│   └── useTheme.ts       ← Hook to access current theme tokens
└── types/
    └── index.ts
```

## Step 3: The HTML → React Native mapping

This is the core of the conversion. Apply these rules systematically:

### Layout mapping

| HTML/CSS | → React Native |
|---|---|
| `<div style="display:flex; flex-direction:column">` | `<View style={{flexDirection:'column'}}>` |
| `<div style="display:flex; flex-direction:row">` | `<View style={{flexDirection:'row'}}>` |
| `<div style="display:grid; grid-template-columns:1fr 1fr">` | `<View style={{flexDirection:'row', flexWrap:'wrap'}}>` with `width:'50%'` children |
| `overflow-y: scroll` container | `<ScrollView>` |
| Long lists | `<FlatList data={items} renderItem={...} keyExtractor={...}>` |
| `position: fixed` bottom nav | `<View style={{position:'absolute', bottom:0, left:0, right:0}}>` |
| `position: absolute` overlay | `<View style={{position:'absolute', ...}}>` inside a parent with `position:'relative'` |

### Content mapping

| HTML | → React Native |
|---|---|
| `<p>`, `<span>`, text nodes | `<Text>` |
| `<h1>` → `<h6>` | `<Text>` with large font size + fontWeight: 'bold' |
| `<img src="...">` | `<Image source={{uri: '...'}} style={{width:X, height:Y}}>` |
| `<button>` | `<Pressable>` (preferred) or `<TouchableOpacity>` |
| `<a>` (navigation) | `<Pressable onPress={() => router.push('/route')}>` |
| `<input type="text">` | `<TextInput>` |
| `<input type="password">` | `<TextInput secureTextEntry={true}>` |
| `<input type="checkbox">` | Custom or `@expo/vector-icons` + `Pressable` |
| `<select>` / dropdown | `@react-native-picker/picker` or custom modal picker |
| `<nav>` (tabs) | Expo Router `<Tabs>` layout |

### Spacing mapping

React Native uses unitless numbers (dp — density-independent pixels):

```ts
// Approximate Tailwind → RN
const spacing = {
  1: 4,   // p-1 = 4dp
  2: 8,   // p-2 = 8dp
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
}
```

### Color mapping

Pull the hex values below from whatever token source the HTML actually has, in this order:

1. **Inline `tailwind.config`** in `<head>` (what Stitch emits) — use it directly if present.
2. **CSS custom properties** (`:root { --color-primary: ... }`) — common in hand-written and templated HTML.
3. **A linked or inline stylesheet** — parse declared colors, font-families, radii, spacing.
4. **Last resort** — derive tokens from the most frequent computed values in the markup (dominant background, text color, accent, heading/body font, border radius), and tell the user what you inferred so they can correct it.

The URL route only downloads the single HTML response — externally-linked stylesheets may not come along for the ride. If none of the above resolves a token, say so instead of inventing a palette.

```ts
// src/theme/tokens.ts
export const lightTokens = {
  background: '#FFFFFF',   // from --color-background
  surface: '#F4F4F5',
  primary: '#6366F1',
  primaryFg: '#FFFFFF',
  text: '#09090B',
  textMuted: '#71717A',
  border: '#E4E4E7',
} as const

export const darkTokens = {
  background: '#09090B',
  surface: '#18181B',
  primary: '#818CF8',      // Lighter shade for dark bg
  primaryFg: '#09090B',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  border: '#27272A',
} as const

export type ThemeTokens = typeof lightTokens
```

## Step 4: Dark mode with useColorScheme

```tsx
// src/theme/useTheme.ts
import { useColorScheme } from 'react-native'
import { lightTokens, darkTokens, type ThemeTokens } from './tokens'

/**
 * Returns the current theme's design tokens.
 * Automatically switches based on system color scheme.
 */
export function useTheme(): ThemeTokens {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTokens : lightTokens
}
```

```tsx
// Usage in any component
import { useTheme } from '@/theme/useTheme'

export function Card({ title }: { title: string }) {
  const theme = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
})
```

## Step 5: Safe area and platform considerations

```tsx
// app/_layout.tsx — root layout
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  )
}
```

```tsx
// In screen components — use safe area insets
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content */}
    </View>
  )
}
```

## Step 6: Component template

```tsx
// src/components/StitchComponent.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/theme/useTheme'

/**
 * Props for StitchComponent.
 * All data via props — never fetched inside the component.
 */
interface StitchComponentProps {
  title: string
  description?: string
  onPress?: () => void
}

/**
 * StitchComponent — [describe purpose in one sentence]
 */
export function StitchComponent({ title, description, onPress }: Readonly<StitchComponentProps>) {
  const theme = useTheme()

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,   // Visual feedback on press
        },
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={8}   // Increase tap area without changing visual size
    >
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    // Minimum touch target
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
```

## Step 7: Accessibility in React Native

```tsx
// Every interactive element needs these props
<Pressable
  accessible={true}
  accessibilityRole="button"    // "button" | "link" | "text" | "image" | "header" | ...
  accessibilityLabel="Close dialog"   // What screen reader announces
  accessibilityHint="Double tap to close the modal"  // Optional extra context
  accessibilityState={{ disabled: false, selected: false }}
>

// Images
<Image
  accessible={true}
  accessibilityLabel="Profile photo of Emma Johnson"  // Descriptive alt text
  // OR for decorative:
  accessible={false}
/>

// Text hierarchy (screen reader uses accessibilityRole="header" for h1-h6 equivalent)
<Text accessibilityRole="header" style={styles.pageTitle}>Dashboard</Text>
```

## Execution steps

1. **Verify** the source is a mobile layout (see Step 1)
2. **Data layer** — create `src/data/mockData.ts` from the static content in the design
3. **Tokens** — create `src/theme/tokens.ts` from extracted colors, and `useTheme.ts`
4. **Components** — convert each visual section to a component using the mapping rules above
5. **Screen** — compose components in the Expo Router screen file (`app/(tabs)/index.tsx`)
6. **Verify** — run `npx expo start` and test on both iOS Simulator and Android Emulator

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `StyleSheet.create` type error | Import `StyleSheet` from `'react-native'` |
| Text outside `<Text>` error | Every string must be inside `<Text>` — even `{' '}` spaces |
| Flex layout looks wrong | RN defaults to `flexDirection:'column'` — explicit is safer |
| Image not showing | Requires explicit `width` and `height` on the style |
| Keyboard pushes layout up | Use `KeyboardAvoidingView` with `behavior='padding'` on iOS |
| Bottom safe area overlap | Use `useSafeAreaInsets()` from `react-native-safe-area-context` |

## References

- `resources/component-template.tsx` — Boilerplate RN component
- `resources/architecture-checklist.md` — Pre-ship checklist
- `scripts/fetch-stitch.sh` — Reliable GCS HTML downloader
