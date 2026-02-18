# Mobile App Screen Generation Examples

## 1. Login Screen (Cyberpunk Style)

**User request:** "Cyberpunk login page for a mobile game."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Mobile High-Fidelity login screen for a cyberpunk game 'NetRunner'. Neon aesthetic. Dark mode. Background: Deep black (#050505). Primary: Neon blue (#00D9FF). Font: Orbitron.\n\nCenter-aligned vertical stack. Header: Glitch-effect 'NETRUNNER' logo with horizontal scan-line overlay. Form: 'NetID' input field with neon blue glowing border, 'Passcode' input with eye-toggle icon, neon pink glow on focus. Primary CTA: Full-width 'JACK IN' button with animated neon border. Divider: 'OR CONNECT VIA' with subtle lines. OAuth row: Ghost buttons for Google and Discord. Footer: 'New agent? Register your ID' link in muted cyan.",
    "deviceType": "MOBILE",
    "modelId": "GEMINI_3_PRO"
  }
}
```

---

## 2. Social Media Feed

**User request:** "Instagram-style home feed."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Mobile High-Fidelity home feed for a photo-sharing social app. Clean minimalist aesthetic. Light mode. Background: White (#ffffff). Primary: Pink (#EC4899). Font: Inter.\n\nTop bar: App logo left, search icon + DM icon right. Stories bar: Horizontal scroll of circular avatars with gradient rings — 'Your story' first, then Emma, Jake, Sophia, Carlos. Feed: Full-width post cards — user avatar + name + timestamp header, full-width photo, action bar (heart, comment, share, bookmark icons), like count 'Liked by Anna and 842 others', caption with 'more' link. Bottom nav: Home (active), Search, Reels, Shop, Profile icons.",
    "deviceType": "MOBILE",
    "modelId": "GEMINI_3_FLASH"
  }
}
```

---

## 3. E-commerce Product Detail

**User request:** "Product detail page for a sneaker store."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Mobile High-Fidelity product detail screen for a premium sneaker store. Streetwear aesthetic. Light mode. Background: White (#ffffff). Primary: Black (#18181B). Font: Space Grotesk.\n\nTop: Back arrow + share icon. Hero: Full-width image carousel showing 'Air Max 90 OG' sneaker from multiple angles, dot indicators. Info section: Brand tag 'Nike', product name 'Air Max 90 OG White/Infrared', price '$140', 5-star rating '(1,247 reviews)'. Size selector: Row of size chips (US 7, 8, 9, 10, 11, 12) — 9 highlighted as selected, 7 greyed out (unavailable). Color options: 3 circular swatches. Description: Short collapsible text. Sticky bottom bar: 'Add to Cart' full-width black button, heart icon (save) to its left.",
    "deviceType": "MOBILE",
    "modelId": "GEMINI_3_PRO"
  }
}
```

---

## 4. Fitness Tracker Home

**User request:** "Home screen for a fitness app."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Mobile High-Fidelity home screen for a fitness tracking app 'FlexOS'. Dark athletic aesthetic. Dark mode. Background: Zinc-900 (#18181B). Primary: Neon green (#22C55E). Font: DM Sans.\n\nTop: Greeting 'Good morning, Alex 👋', date subtitle. Today's goal ring: Large circular progress ring (67% complete), center shows '2,847 / 4,200 cal'. Quick stats row: 3 cards — Steps 8,432, Active Minutes 52, Water 6/8 cups. Workout recommendations: Horizontal scroll of workout cards — gradient thumbnail, workout name, duration, difficulty badge. Recent activity: List of today's logged exercises with icon, name, duration, calories. Bottom nav: Home (active), Workout, Nutrition, Progress, Profile.",
    "deviceType": "MOBILE",
    "modelId": "GEMINI_3_PRO"
  }
}
```
