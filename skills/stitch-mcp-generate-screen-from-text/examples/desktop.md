# Desktop Screen Generation Examples

## 1. SaaS Analytics Dashboard

**User request:** "Build a dashboard showing revenue and user growth."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Desktop High-Fidelity analytics dashboard for a SaaS platform. Enterprise clean aesthetic. Light mode. Background: White (#ffffff). Primary: Indigo (#6366F1). Font: DM Sans.\n\nLeft sidebar navigation (200px): Logo top-left, nav items with icons (Overview, Projects, Reports, Settings), user avatar and name at bottom. Top bar: 'Analytics Overview' title, date range picker, 'Export' button.\n\nKPI row: 4 metric cards — Total Revenue ($142,800, +12% MoM), Active Users (8,420, +5%), Churn Rate (2.1%, -0.3%), Avg Session (4m 32s). Main chart: 'Monthly Recurring Revenue' line chart, last 12 months, indigo line with subtle fill. Bottom split: 'Top Performing Plans' bar chart left, 'Recent Signups' table right.",
    "deviceType": "DESKTOP",
    "modelId": "GEMINI_3_PRO"
  }
}
```

---

## 2. Admin Panel (Dark Mode)

**User request:** "Dark mode admin panel for server monitoring."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Desktop High-Fidelity admin console for server monitoring. Developer aesthetic. Dark mode. Background: Zinc-900 (#18181B). Primary: Emerald (#10B981). Font: IBM Plex Mono.\n\nDense information layout. Top bar: 'System Status' title, 'All Systems Operational' badge in green. Main grid: 6 server status cards in 3-column grid — each card shows Server name, CPU gauge (%), Memory gauge (%), Uptime, Status indicator (green/red dot). Bottom panel: Terminal-style log stream with color-coded severity (ERROR in red, WARN in yellow, INFO in emerald).",
    "deviceType": "DESKTOP",
    "modelId": "GEMINI_3_PRO"
  }
}
```

---

## 3. SaaS Landing Page

**User request:** "Landing page for a project management tool."

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "Desktop High-Fidelity landing page for 'Taskflow', a project management SaaS. Clean minimalist aesthetic. Light mode. Background: White (#ffffff). Primary: Violet (#7C3AED). Font: Inter.\n\nSticky top nav: Logo left, links center (Features, Pricing, Blog, Docs), 'Sign in' ghost button and 'Start free' primary button right. Hero: Large headline 'Ship projects faster, together', subtext 'The only PM tool your team will actually use', two CTA buttons ('Get started free' primary, 'See demo' ghost), hero mockup screenshot of dashboard. Features section: 3-column grid of feature cards with icon, title, description. Social proof: Logos row of known companies.",
    "deviceType": "DESKTOP",
    "modelId": "GEMINI_3_PRO"
  }
}
```
