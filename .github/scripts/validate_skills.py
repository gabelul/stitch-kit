#!/usr/bin/env python3
"""
validate_skills.py — stitch-kit CI validator.

Checks every skill in skills/ against the stitch-kit spec:
  1. Every skills/*/ directory has a SKILL.md
  2. Every SKILL.md has valid YAML frontmatter with 'name' and 'description'
  3. The 'name' in frontmatter matches the directory name
  4. Directory names follow the stitch-* convention
  5. Every skill path in .claude-plugin/marketplace.json exists on disk

Usage:
    python3 .github/scripts/validate_skills.py

Exit code 0 = all checks passed. Exit code 1 = one or more failures.
"""

import json
import re
import sys
from pathlib import Path

# Repo root = two levels up from this script (.github/scripts/validate_skills.py)
REPO_ROOT = Path(__file__).parent.parent.parent
SKILLS_DIR = REPO_ROOT / "skills"
MARKETPLACE = REPO_ROOT / ".claude-plugin" / "marketplace.json"

errors = []
warnings = []


def err(msg: str) -> None:
    """Record an error (will cause non-zero exit)."""
    errors.append(msg)
    print(f"  ERROR: {msg}")


def warn(msg: str) -> None:
    """Record a warning (informational only, does not fail the build)."""
    warnings.append(msg)
    print(f"  WARN:  {msg}")


def parse_frontmatter(skill_md_path: Path) -> dict | None:
    """
    Parses YAML frontmatter from a SKILL.md file.

    Expects the file to start with ---, contain key: value pairs,
    and close with ---. Returns a dict of the parsed fields, or
    None if no valid frontmatter block is found.

    @param skill_md_path - Path to the SKILL.md file
    @returns dict of frontmatter fields, or None if parsing fails
    """
    content = skill_md_path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return None

    frontmatter = {}
    for line in match.group(1).splitlines():
        # Skip list items (e.g. "  - Bash") and blank lines
        line = line.strip()
        if not line or line.startswith("-"):
            continue
        if ":" in line:
            key, _, value = line.partition(":")
            frontmatter[key.strip()] = value.strip()

    return frontmatter


def check_skills() -> None:
    """
    Validates every subdirectory in skills/ against the stitch-kit spec.

    Checks performed per skill:
    - Directory follows stitch-* naming convention
    - SKILL.md exists
    - SKILL.md has valid frontmatter with 'name' and 'description'
    - Frontmatter 'name' matches directory name
    """
    if not SKILLS_DIR.is_dir():
        err(f"skills/ directory not found at {SKILLS_DIR}")
        return

    skill_dirs = sorted([d for d in SKILLS_DIR.iterdir() if d.is_dir()])

    if not skill_dirs:
        warn("No skill directories found in skills/")
        return

    print(f"\nChecking {len(skill_dirs)} skill directories...\n")

    for skill_dir in skill_dirs:
        name = skill_dir.name
        prefix = f"  [{name}]"

        # Check 1: naming convention
        if not name.startswith("stitch-"):
            err(f"{prefix} directory name must start with 'stitch-' (got '{name}')")

        # Check 2: SKILL.md exists
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            err(f"{prefix} missing SKILL.md")
            continue  # Can't do further checks without the file

        # Check 3: valid frontmatter
        frontmatter = parse_frontmatter(skill_md)
        if frontmatter is None:
            err(f"{prefix} SKILL.md has no valid YAML frontmatter block (expected --- ... ---)")
            continue

        if "name" not in frontmatter:
            err(f"{prefix} SKILL.md frontmatter missing required field: 'name'")
        if "description" not in frontmatter:
            err(f"{prefix} SKILL.md frontmatter missing required field: 'description'")

        # Check 4: name matches directory
        if "name" in frontmatter and frontmatter["name"] != name:
            err(
                f"{prefix} frontmatter 'name' ({frontmatter['name']}) "
                f"does not match directory name ({name})"
            )

        # Recommendation: examples/ directory
        examples_dir = skill_dir / "examples"
        if not examples_dir.is_dir():
            warn(f"{prefix} no examples/ directory — consider adding usage examples")


def check_marketplace() -> None:
    """
    Validates .claude-plugin/marketplace.json.

    Checks:
    - File exists and is valid JSON
    - Every skill path referenced in 'skills' arrays exists on disk
    """
    print(f"\nChecking marketplace.json...\n")

    if not MARKETPLACE.exists():
        err(f"marketplace.json not found at {MARKETPLACE}")
        return

    try:
        data = json.loads(MARKETPLACE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(f"marketplace.json is not valid JSON: {e}")
        return

    plugins = data.get("plugins", [])
    for plugin in plugins:
        plugin_name = plugin.get("name", "(unnamed)")
        for skill_path in plugin.get("skills", []):
            # Paths in marketplace.json are relative to the repo root (e.g. "./skills/stitch-foo")
            resolved = (REPO_ROOT / skill_path).resolve()
            if not resolved.is_dir():
                err(
                    f"  [marketplace:{plugin_name}] skill path '{skill_path}' "
                    f"does not exist on disk"
                )


def main() -> None:
    """Run all validation checks and exit with appropriate code."""
    print("stitch-kit skill validator")
    print("=" * 40)

    check_skills()
    check_marketplace()

    print("\n" + "=" * 40)

    if errors:
        print(f"\nFailed: {len(errors)} error(s), {len(warnings)} warning(s)")
        sys.exit(1)
    elif warnings:
        print(f"\nPassed with {len(warnings)} warning(s) — no errors.")
    else:
        print("\nAll checks passed.")


if __name__ == "__main__":
    main()
