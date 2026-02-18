# SwiftUI Components — Architecture Checklist

Run through this checklist before marking the task complete.

## Xcode project structure

- [ ] Views are in `Views/` — one file per view
- [ ] Reusable components are in `Views/Components/`
- [ ] Theme tokens are in `Theme/ThemeTokens.swift`
- [ ] Color extension is in `Theme/Color+App.swift`
- [ ] Static preview data is in `Models/MockData.swift` — not hardcoded in views
- [ ] `@main` entry point is in `[AppName].swift`

## SwiftUI correctness

- [ ] `@State` is used for local UI state (not business logic)
- [ ] `@StateObject` / `@ObservedObject` for view models (if MVVM)
- [ ] `@Environment` used for system values (colorScheme, dismiss, reducedMotion)
- [ ] No logic in `var body: some View` — extract to computed properties or helper views
- [ ] Views are small and composable — extract when `body` exceeds ~50 lines
- [ ] Previews have mock data — no force-unwraps in `#Preview`

## Layout

- [ ] `VStack`, `HStack`, `ZStack` used instead of `Group` for layout intent
- [ ] `Spacer()` used for `justify-content: space-between` patterns
- [ ] `LazyVStack` / `LazyVGrid` used inside `ScrollView` for long lists
- [ ] `List` used for data-driven lists (virtualized automatically)
- [ ] `.frame(maxWidth: .infinity)` replaces `w-full` / `width: 100%`
- [ ] No hardcoded pixel values where semantic sizing (`font(.headline)`) is available

## Touch targets and interaction

- [ ] All interactive views have `.frame(minHeight: 44)` — Apple HIG minimum
- [ ] Buttons use SwiftUI `Button` (not `.onTapGesture` on arbitrary views)
- [ ] Icon-only buttons have `.accessibilityLabel("Action name")`
- [ ] Press animation: `.scaleEffect(isPressed ? 0.96 : 1.0)` with `.spring()`
- [ ] Reduced motion respected: `@Environment(\.accessibilityReduceMotion)` gates animations

## Colors and dark mode

- [ ] `@Environment(\.colorScheme) private var colorScheme` in every themed view
- [ ] `private var theme: ThemeTokens { colorScheme == .dark ? .dark : .light }` pattern used
- [ ] No hardcoded `Color(hex:)` values in views — always via `theme.*`
- [ ] Tested in both light and dark mode (⌃⌘A in Simulator)
- [ ] `#Preview("Dark Mode")` block exists for every component

## Typography

- [ ] Semantic fonts used: `.font(.headline)`, `.font(.body)` — NOT `.font(.system(size: 17))`
- [ ] Dynamic Type works: increase text size in Simulator and verify layout holds
- [ ] Text doesn't truncate unexpectedly — `.lineLimit(nil)` or `.fixedSize` where needed

## Images

- [ ] Remote images use `AsyncImage` — no sync image loading
- [ ] Local images are in `Assets.xcassets` and loaded with `Image("name")`
- [ ] Aspect ratios are explicit: `.aspectRatio(16/9, contentMode: .fill)`
- [ ] Decorative images use `Image(decorative: "name")` — screen reader skips them
- [ ] Content images have `.accessibilityLabel("Description")`

## Accessibility

- [ ] Buttons are labeled by their `Text` child automatically — verify with VoiceOver
- [ ] Icon-only buttons have `.accessibilityLabel("Action name")`
- [ ] Related text groups combined: `.accessibilityElement(children: .combine)`
- [ ] Custom accessibility actions for swipe gestures if applicable
- [ ] App tested with VoiceOver enabled — no silent tappable areas

## Navigation

- [ ] `NavigationStack` used (not deprecated `NavigationView`)
- [ ] Tab bar uses `TabView` with `.tabItem { Label("Name", systemImage: "icon") }`
- [ ] Sheets dismissed via `@Environment(\.dismiss) var dismiss`
- [ ] Back navigation is automatic — no custom back buttons unless design requires
- [ ] Deep links handled if the app supports URL schemes

## Performance

- [ ] No `print()` statements in production code
- [ ] `LazyVStack` / `LazyVGrid` for lists of 20+ items
- [ ] `AsyncImage` for remote images — no manual URLSession in views
- [ ] `@StateObject` used when the view owns the model (not `@ObservedObject`)
