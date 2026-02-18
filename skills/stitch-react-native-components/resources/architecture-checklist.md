# React Native Components — Architecture Checklist

Run through this checklist before marking the task complete.

## Structure

- [ ] Components are in `src/components/` — one file per component
- [ ] Screen files are in `app/(tabs)/` or `app/` (Expo Router conventions)
- [ ] Static content is in `src/data/mockData.ts`, not hardcoded in JSX
- [ ] Shared TypeScript types are in `src/types/index.ts`
- [ ] Theme tokens are in `src/theme/tokens.ts` with `lightTokens` and `darkTokens`
- [ ] `useTheme()` hook is in `src/theme/useTheme.ts`
- [ ] Each component has a `Readonly<ComponentNameProps>` interface

## React Native basics

- [ ] Every string is inside a `<Text>` component — no bare strings in JSX
- [ ] All layout uses `StyleSheet.create` (static values) + inline objects (dynamic theme values)
- [ ] No hardcoded hex colors in `StyleSheet.create` — theme values go inline
- [ ] All `<Image>` components have explicit `width` and `height` in their style
- [ ] `<ScrollView>` is used instead of `overflow-y: scroll` divs
- [ ] Long lists use `<FlatList>` with `keyExtractor`, not `<ScrollView>` + `map()`

## Touch and interaction

- [ ] All interactive elements use `<Pressable>` (not `<TouchableOpacity>` or `<View onPress>`)
- [ ] `hitSlop={8}` or larger on all small tap targets
- [ ] Minimum touch target: 44×44 dp (`minHeight: 44, minWidth: 44`)
- [ ] Press visual feedback: `style={({ pressed }) => [styles.x, { opacity: pressed ? 0.8 : 1 }]}`
- [ ] No nested `<Pressable>` elements (causes gesture conflicts)

## Safe area and platform

- [ ] `<SafeAreaProvider>` wraps the root layout in `app/_layout.tsx`
- [ ] Screen-level components use `useSafeAreaInsets()` for top/bottom padding
- [ ] Bottom navigation doesn't overlap home indicator on iPhone
- [ ] Keyboard handling: `<KeyboardAvoidingView behavior="padding">` on iOS forms
- [ ] Platform differences (if any) are handled with `Platform.OS === 'ios'`

## TypeScript

- [ ] No `any` types
- [ ] Theme tokens typed as `ThemeTokens` (inferred from `typeof lightTokens`)
- [ ] All component props use `Readonly<>`
- [ ] No `@ts-ignore` without explaining why

## Dark mode

- [ ] `useTheme()` hook is used in every component that renders colors
- [ ] No hardcoded `'#FFFFFF'` or `'#000000'` — use `theme.background`, `theme.text`
- [ ] Tested: toggle device to dark mode — no elements disappear or become unreadable

## Accessibility

- [ ] All `<Pressable>` elements have `accessible={true}`, `accessibilityRole`, and `accessibilityLabel`
- [ ] Decorative `<Image>` elements have `accessible={false}`
- [ ] Content images have `accessibilityLabel` describing the image
- [ ] Page titles use `accessibilityRole="header"` on the heading `<Text>`
- [ ] Related elements grouped with `accessibilityViewIsModal` or `.accessibilityElement(children: .combine)` equivalent

## Performance

- [ ] No `console.log` in production code
- [ ] `StyleSheet.create` used for static styles (hoisted outside render)
- [ ] `FlatList` used for any list of 10+ items
- [ ] `useCallback` / `useMemo` used where referential equality matters (event handlers passed to children)
- [ ] `React.memo` on pure leaf components that receive stable props

## Expo Router

- [ ] Navigation uses `router.push('/route')` — no hardcoded `navigation.navigate`
- [ ] Tab layout uses Expo Router `<Tabs>` — not `react-navigation` directly
- [ ] Deep link paths match the file structure in `app/`
- [ ] `app/_layout.tsx` has `<SafeAreaProvider>` and `<Stack>` (or `<Tabs>`)
