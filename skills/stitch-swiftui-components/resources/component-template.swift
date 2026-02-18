// StitchComponentView.swift
// Generated from Stitch design via stitch-swiftui-components skill.
// Replace "StitchComponent" with the actual view name throughout.

import SwiftUI

// MARK: - View

/// StitchComponent — [describe purpose in one sentence]
///
/// Usage:
/// ```swift
/// StitchComponentView(title: "Hello", description: "World")
/// ```
struct StitchComponentView: View {

  // MARK: - Properties (props equivalent)

  /// Primary heading text
  let title: String

  /// Supporting description — optional
  var description: String = ""

  /// Callback for primary action — nil hides the action button
  var onAction: (() -> Void)? = nil

  // MARK: - Environment

  /// Automatically switches between light and dark theme tokens
  @Environment(\.colorScheme) private var colorScheme

  /// Resolved theme tokens for current color scheme
  private var theme: ThemeTokens {
    colorScheme == .dark ? .dark : .light
  }

  /// Respects user's Reduce Motion accessibility setting
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  // MARK: - State

  @State private var isPressed = false

  // MARK: - Body

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {

      // Title
      Text(title)
        .font(.headline)
        .foregroundStyle(theme.text)
        .lineLimit(nil)                  // Allow multiline

      // Description — only render when non-empty
      if !description.isEmpty {
        Text(description)
          .font(.subheadline)
          .foregroundStyle(theme.textMuted)
          .lineLimit(3)
      }

      // Action button — only render when provided
      if let action = onAction {
        Button(action: action) {
          Text("Action")
            .font(.subheadline)
            .fontWeight(.semibold)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(theme.primary)
            .foregroundStyle(theme.primaryFg)
            .clipShape(Capsule())
            // Press feedback (respects reduced motion)
            .scaleEffect(isPressed ? 0.96 : 1.0)
            .animation(
              reduceMotion ? .none : .spring(response: 0.2, dampingFraction: 0.6),
              value: isPressed
            )
        }
        .simultaneousGesture(
          DragGesture(minimumDistance: 0)
            .onChanged { _ in isPressed = true }
            .onEnded   { _ in isPressed = false }
        )
        // Accessibility — button is labeled by its Text child automatically
        .accessibilityHint("Activates the primary action")
      }
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .frame(minHeight: 44)  // Apple HIG minimum touch target
    .background(theme.surface)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .overlay(
      RoundedRectangle(cornerRadius: 12)
        .stroke(theme.border, lineWidth: 1)
    )
  }
}

// MARK: - Preview

#Preview("Light Mode") {
  VStack(spacing: 16) {
    StitchComponentView(
      title: "Card Title",
      description: "Supporting description text that can span multiple lines."
    )
    StitchComponentView(
      title: "With Action",
      description: "This card has a primary action.",
      onAction: { print("Action tapped") }
    )
    StitchComponentView(title: "Title Only")
  }
  .padding()
}

#Preview("Dark Mode") {
  VStack(spacing: 16) {
    StitchComponentView(
      title: "Dark Card",
      description: "Preview in dark mode.",
      onAction: { }
    )
  }
  .padding()
  .preferredColorScheme(.dark)
}
