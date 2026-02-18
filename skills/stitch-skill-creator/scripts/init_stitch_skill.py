#!/usr/bin/env python3
"""
Stitch Skill Initializer — bootstraps a new stitch-kit skill from the standard template.

Usage:
    python3 init_stitch_skill.py <skill-name> --path <path>

Examples:
    python3 init_stitch_skill.py ecommerce-architect --path skills/
    # Creates: skills/stitch-ui-ecommerce-architect

    python3 init_stitch_skill.py stitch-ui-blog-architect --path skills/
    # Creates: skills/stitch-ui-blog-architect

    python3 init_stitch_skill.py flutter-components --path skills/
    # Creates: skills/stitch-flutter-components

Rules:
    - Domain prompt architects: stitch-ui-[domain]-architect
    - Framework conversion skills: stitch-[framework]-components
    - Quality/analysis tools: stitch-[capability]
    - MCP wrappers: stitch-mcp-[tool-name]
"""

import sys
import re
from pathlib import Path

# ─── Templates ────────────────────────────────────────────────────────────────

SKILL_MD_TEMPLATE = """\
---
name: {skill_name}
description: [One clear sentence — when to use this skill and what it does.]
allowed-tools:
  - "Read"
  - "Write"
---

# {scenario_title}

**Constraint:** Only use this skill when the user explicitly mentions "Stitch" [and any additional trigger condition].

[One sentence describing what this skill does.]

## When to use this skill vs. similar skills

| Skill | Use when |
|-------|---------|
| `{skill_name}` | [This skill's use case] |
| `[similar-skill]` | [The other skill's use case] |

## Prerequisites

- [What the user/environment needs before this skill can run]

## Step 1: [First step]

[Instructions]

## Step 2: [Core workflow]

[Instructions]

## Output

[What this skill produces]

## Troubleshooting

| Issue | Fix |
|-------|-----|

## References

- `examples/usage.md` — Worked examples
"""

USAGE_MD_TEMPLATE = """\
# {scenario_title} — Usage Examples

## Example 1: [Scenario title]

**User:** "[Specific user request]"

**Skill activates because:** [Why this triggers the skill]

**What the skill does:**
1. [Step 1]
2. [Step 2]

**Output:**
[Description or snippet of what gets generated]

---

## Example 2: [Different scenario]

**User:** "[Another specific request]"

**Skill activates because:** [Reason]

**What the skill does:**
1. [Step 1]
2. [Step 2]

**Output:**
[Description or snippet]
"""

ARCH_CHECKLIST_TEMPLATE = """\
# {scenario_title} — Architecture Checklist

Run through this before marking the task complete.

## Structure
- [ ] Components are in separate files
- [ ] No single monolithic output file

## Types
- [ ] No `any` types
- [ ] All props have typed interfaces

## Dark mode
- [ ] Theme tokens used everywhere — no hardcoded colors

## Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Images have descriptive alt text

## Performance
- [ ] No `console.log` in production code
"""

# ─── Helpers ──────────────────────────────────────────────────────────────────

def normalize_skill_name(input_name: str) -> str:
    """
    Ensures the skill follows stitch-kit naming conventions.
    Adds stitch- prefix if missing.
    Does NOT auto-add suffixes — the caller decides the full name.
    """
    name = input_name.lower().strip()
    if not name.startswith("stitch-"):
        name = "stitch-" + name
    return name

def to_title(skill_name: str) -> str:
    """
    Converts 'stitch-ui-ecommerce-architect' → 'UI Ecommerce Architect'
    """
    core = re.sub(r"^stitch-", "", skill_name)
    return " ".join(word.capitalize() for word in core.split("-"))

def is_valid_name(name: str) -> bool:
    """Validates kebab-case, starts with stitch-, lowercase."""
    return bool(re.fullmatch(r"stitch-[a-z0-9]+(?:-[a-z0-9]+)*", name))

# ─── Core logic ───────────────────────────────────────────────────────────────

def init_skill(input_name: str, path: str) -> Path | None:
    skill_name = normalize_skill_name(input_name)
    scenario_title = to_title(skill_name)
    skill_dir = Path(path).resolve() / skill_name

    # Validation
    if not is_valid_name(skill_name):
        print(f"❌ Invalid skill name: {skill_name}")
        print("   Expected kebab-case starting with 'stitch-'")
        print(f"   Examples: stitch-ui-ecommerce-architect, stitch-flutter-components")
        return None

    if skill_dir.exists():
        print(f"❌ Skill directory already exists: {skill_dir}")
        return None

    # Create directories
    try:
        (skill_dir / "examples").mkdir(parents=True)
        print(f"✅ Created: {skill_dir}/")
    except Exception as e:
        print(f"❌ Failed to create directory: {e}")
        return None

    # Write SKILL.md
    skill_content = SKILL_MD_TEMPLATE.format(
        skill_name=skill_name,
        scenario_title=scenario_title,
    )
    (skill_dir / "SKILL.md").write_text(skill_content)
    print("✅ Created SKILL.md")

    # Write examples/usage.md
    usage_content = USAGE_MD_TEMPLATE.format(scenario_title=scenario_title)
    (skill_dir / "examples" / "usage.md").write_text(usage_content)
    print("✅ Created examples/usage.md")

    # Print next steps
    print(f"\n✅ Skill '{skill_name}' initialized.")
    print("\nNext steps:")
    print(f"  1. Edit {skill_dir}/SKILL.md — fill in description, steps, routing table")
    print(f"  2. Edit {skill_dir}/examples/usage.md — replace placeholders with real examples")
    print(f"  3. Add to .claude-plugin/marketplace.json in the right plugin group")
    print(f"  4. Add row to docs/skills-index.md")
    print(f"  5. Add row to README.md in the right layer table")

    return skill_dir

# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_name = sys.argv[1]
    path = "."

    # Parse --path flag
    for i, arg in enumerate(sys.argv[2:], start=2):
        if arg == "--path" and i + 1 < len(sys.argv):
            path = sys.argv[i + 1]
            break

    result = init_skill(input_name, path)
    sys.exit(0 if result else 1)

if __name__ == "__main__":
    main()
