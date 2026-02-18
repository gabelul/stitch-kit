# HTML/CSS → SwiftUI Layout Mapping Reference

Quick lookup when converting Stitch HTML to SwiftUI.

---

## Flex containers

| CSS | SwiftUI |
|-----|---------|
| `flex-col` (default) | `VStack(alignment: .leading, spacing: 16) { }` |
| `flex-col items-center` | `VStack(alignment: .center, spacing: 16) { }` |
| `flex-col items-end` | `VStack(alignment: .trailing, spacing: 16) { }` |
| `flex-row` | `HStack(alignment: .center, spacing: 12) { }` |
| `flex-row items-start` | `HStack(alignment: .top, spacing: 12) { }` |
| `flex-row justify-between` | `HStack { content; Spacer(); content }` |
| `flex-row justify-around` | `HStack { Spacer(); content; Spacer(); content; Spacer() }` |
| Absolute overlay | `ZStack(alignment: .topLeading) { base; overlay }` |

---

## Spacing

| CSS | SwiftUI |
|-----|---------|
| `gap-1` (4px) | `spacing: 4` in VStack/HStack |
| `gap-2` (8px) | `spacing: 8` |
| `gap-3` (12px) | `spacing: 12` |
| `gap-4` (16px) | `spacing: 16` |
| `gap-6` (24px) | `spacing: 24` |
| `p-4` (16px all) | `.padding(16)` |
| `px-4 py-2` | `.padding(.horizontal, 16).padding(.vertical, 8)` |
| `pt-4` | `.padding(.top, 16)` |
| `mx-auto` (center) | `.frame(maxWidth: .infinity)` + center alignment |
| `mb-4` | use `spacing` in parent VStack instead |

---

## Sizing

| CSS | SwiftUI |
|-----|---------|
| `w-full` | `.frame(maxWidth: .infinity)` |
| `h-full` | `.frame(maxHeight: .infinity)` |
| `w-12` (48px) | `.frame(width: 48)` |
| `h-12` (48px) | `.frame(height: 48)` |
| `w-1/2` | `.frame(maxWidth: .infinity)` on each child in HStack |
| `min-h-[44px]` (touch target) | `.frame(minHeight: 44)` |

---

## Typography

| CSS | SwiftUI |
|-----|---------|
| `text-xs` (12px) | `.font(.caption2)` |
| `text-sm` (14px) | `.font(.caption)` or `.font(.subheadline)` |
| `text-base` (16px) | `.font(.body)` |
| `text-lg` (18px) | `.font(.callout)` |
| `text-xl` (20px) | `.font(.title3)` |
| `text-2xl` (24px) | `.font(.title2)` |
| `text-3xl` (30px) | `.font(.title)` |
| `text-4xl` (36px) | `.font(.largeTitle)` |
| `font-medium` | `.fontWeight(.medium)` |
| `font-semibold` | `.fontWeight(.semibold)` |
| `font-bold` | `.fontWeight(.bold)` |
| `text-muted` | `.foregroundStyle(.secondary)` |
| `truncate` | `.lineLimit(1)` |
| `line-clamp-2` | `.lineLimit(2)` |
| No clamp | `.lineLimit(nil)` |

---

## Colors & backgrounds

| CSS | SwiftUI |
|-----|---------|
| `bg-[var(--color-surface)]` | `.background(theme.surface)` |
| `bg-primary` | `.background(theme.primary)` |
| `text-muted` | `.foregroundStyle(theme.textMuted)` |
| `border border-[var(--color-border)]` | `.overlay(RoundedRectangle(...).stroke(theme.border))` |
| `opacity-50` | `.opacity(0.5)` |
| `shadow-md` | `.shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)` |

---

## Border radius

| CSS | SwiftUI |
|-----|---------|
| `rounded-sm` (4px) | `.clipShape(RoundedRectangle(cornerRadius: 4))` |
| `rounded-md` (8px) | `.clipShape(RoundedRectangle(cornerRadius: 8))` |
| `rounded-lg` (12px) | `.clipShape(RoundedRectangle(cornerRadius: 12))` |
| `rounded-xl` (16px) | `.clipShape(RoundedRectangle(cornerRadius: 16))` |
| `rounded-full` | `.clipShape(Capsule())` or `.clipShape(Circle())` |

> **Note:** Use `.clipShape` over deprecated `.cornerRadius` modifier in iOS 17+.

---

## Images

| CSS | SwiftUI |
|-----|---------|
| `<img src="https://...">` | `AsyncImage(url: URL(string: "https://..."))` |
| `<img src="./local.png">` | `Image("local")` (add to Assets.xcassets) |
| `object-fit: cover` | `.scaledToFill()` + `.clipped()` |
| `object-fit: contain` | `.scaledToFit()` |
| `aspect-ratio: 16/9` | `.aspectRatio(16/9, contentMode: .fill)` |
| Circle avatar | `AsyncImage(...).clipShape(Circle())` |

---

## Interactive elements

| CSS | SwiftUI |
|-----|---------|
| Primary `<button>` | `Button("Label") { }.buttonStyle(.borderedProminent).tint(theme.primary)` |
| Secondary button | `Button("Label") { }.buttonStyle(.bordered)` |
| Ghost/text button | `Button("Label") { }.buttonStyle(.plain)` |
| Destructive button | `Button("Delete") { }.tint(.red)` |
| Icon-only button | `Button { action() } label: { Image(systemName: "star") }` |
| `<input type="text">` | `TextField("Placeholder", text: $text)` |
| `<input type="password">` | `SecureField("Password", text: $password)` |
| `<input type="search">` | `TextField("Search", text: $query).searchable(text: $query)` |
| Toggle/checkbox | `Toggle("Label", isOn: $isOn)` |
| Slider | `Slider(value: $value, in: 0...100)` |
| Stepper | `Stepper("Count: \(count)", value: $count, in: 0...10)` |

---

## Scroll and lists

| CSS | SwiftUI |
|-----|---------|
| `overflow-y: scroll` | `ScrollView { VStack { ... } }` |
| `overflow-x: scroll` (horizontal) | `ScrollView(.horizontal) { HStack { ... } }` |
| `overflow: hidden` | `.clipped()` |
| Long list (performance) | `List { ForEach(items) { ... } }` or `LazyVStack` inside `ScrollView` |
| Grid | `LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())]) { ... }` |
| Horizontal card scroll | `ScrollView(.horizontal, showsIndicators: false) { HStack(spacing: 16) { ... } }` |

---

## Navigation patterns

| Pattern | SwiftUI |
|---------|---------|
| Bottom tab bar | `TabView { View1().tabItem { Label("Home", systemImage: "house") } }` |
| Push navigation | `NavigationStack { ... NavigationLink("Go", destination: DetailView()) }` |
| Modal sheet | `.sheet(isPresented: $show) { ModalView() }` |
| Full screen | `.fullScreenCover(isPresented: $show) { FullView() }` |
| Dismiss sheet/nav | `@Environment(\.dismiss) var dismiss; dismiss()` |
| Alert | `.alert("Title", isPresented: $show) { Button("OK") { } }` |
| Action sheet | `.confirmationDialog("Choose", isPresented: $show) { ... }` |
