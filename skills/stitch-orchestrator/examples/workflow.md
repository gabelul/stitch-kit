# End-to-End Workflow Example

## Scenario: Designing a SaaS analytics app

**User:** "Use Stitch to design a dashboard for my SaaS analytics tool. I want a clean, modern look with indigo as the primary color."

---

### Step 0: Preflight
*Orchestrator runs `list_tools`*

Found: `stitch:create_project`, `stitch:generate_screen_from_text`, `stitch:list_screens`, `stitch:get_screen`
Namespace: `stitch:`

→ Proceed with Full Execution Workflow.

---

### Step 1: Classify intent
New screen from scratch → full workflow.

---

### Step 2: Design Spec generation
*Orchestrator calls `stitch-ui-design-spec-generator`*

Input: "SaaS analytics tool, clean modern, indigo primary"

Output:
```json
{
  "theme": "LIGHT",
  "primaryColor": "#6366F1",
  "font": "DM Sans",
  "roundness": "Medium",
  "density": "COMPACT",
  "designMode": "HIGH_FIDELITY",
  "styleKeywords": ["Clean", "Modern", "SaaS", "Structured"],
  "deviceType": "DESKTOP"
}
```

---

### Step 3: Prompt assembly
*Orchestrator calls `stitch-ui-prompt-architect` in Path B mode*

Output:
```
Desktop High-Fidelity analytics dashboard for a SaaS platform. Clean modern aesthetic. Light mode. Background: White (#ffffff). Primary: Indigo (#6366F1). Font: DM Sans.

Left sidebar navigation (200px): Logo top-left, nav items (Overview, Revenue, Users, Reports, Settings) with icons, user avatar + name at bottom. Top bar: Page title 'Overview', date range picker, notification bell, 'Export CSV' button.

KPI row: 4 cards — MRR ($48,200, +8.3% MoM, green arrow), Active Users (3,847, +12%), Churn Rate (1.9%, -0.4%), Avg Revenue Per User ($12.54). Line chart: 'Revenue Growth' spanning last 12 months, indigo primary line with subtle fill. Two-column bottom: 'Top Plans' horizontal bar chart left, 'Recent Signups' table right (avatar, name, plan, date).
```

---

### Step 4: Create project
*Orchestrator calls `stitch-mcp-create-project`*

```json
{ "name": "create_project", "arguments": { "title": "SaaS Analytics Dashboard" } }
```

Result: `{ "name": "projects/3780309359108792857" }`

- Full name: `projects/3780309359108792857`
- Numeric ID: `3780309359108792857`

---

### Step 5: Generate screen
*Orchestrator calls `stitch-mcp-generate-screen-from-text`*

```json
{
  "name": "generate_screen_from_text",
  "arguments": {
    "projectId": "3780309359108792857",
    "prompt": "[assembled prompt from Step 3]",
    "deviceType": "DESKTOP",
    "modelId": "GEMINI_3_PRO"
  }
}
```

---

### Step 6: Retrieve screen
*Orchestrator calls `stitch-mcp-list-screens`, then `stitch-mcp-get-screen`*

list_screens: `{ "projectId": "projects/3780309359108792857" }`
→ Found screen: `88805abc123def456`

get_screen: `{ "projectId": "3780309359108792857", "screenId": "88805abc123def456" }`
→ Returns `htmlCode.downloadUrl` and `screenshot.downloadUrl`

Download HTML:
```bash
bash scripts/fetch-stitch.sh "$htmlCode_downloadUrl" "temp/source.html"
```

Orchestrator shows screenshot URL to user and asks framework preference.
User selects: **A) Convert to Next.js**

---

### Step 7: Design system extraction
*Orchestrator calls `stitch-design-system`*

Reads `temp/source.html` → extracts colors, fonts, spacing.

Generates:
- `design-tokens.css` with light/dark mode CSS variables
- `tailwind-theme.css` with `@theme` block
- `DESIGN.md` with Section 6 Stitch copy-paste block

---

### Step 8: Framework conversion
*Orchestrator calls `stitch-nextjs-components`*

Reads `temp/source.html` + `design-tokens.css`

Generates:
- `src/data/mockData.ts` — extracted KPI values, chart data
- `src/components/Sidebar.tsx` — Server Component
- `src/components/TopBar.tsx` — Client Component (date picker interaction)
- `src/components/KPICard.tsx` — Server Component
- `src/components/RevenueChart.tsx` — Client Component (chart interaction)
- `src/components/SignupsTable.tsx` — Server Component
- `app/dashboard/page.tsx` — Route entry composing all components

---

### Step 9: Quality pass
Orchestrator offers animations + a11y. User selects animations.

*Orchestrator calls `stitch-animate`*

Adds to components:
- `RevealOnScroll` wrapper around KPI cards (staggered fade-up, 60ms delay each)
- Chart fade-in transition on mount
- Card hover lift effect (CSS micro-interaction)
- `prefers-reduced-motion` override in `globals.css`

---

### Final output

```
## Design Complete: SaaS Analytics Dashboard

**Project ID:** 3780309359108792857
**Screen ID:** 88805abc123def456

### Files created
- design-tokens.css
- tailwind-theme.css
- DESIGN.md
- src/data/mockData.ts
- src/components/Sidebar.tsx
- src/components/TopBar.tsx
- src/components/KPICard.tsx
- src/components/RevenueChart.tsx
- src/components/SignupsTable.tsx
- app/dashboard/page.tsx

### Next steps
- Run `npm run dev` to preview
- Use `stitch-a11y` for an accessibility pass before launching
```
