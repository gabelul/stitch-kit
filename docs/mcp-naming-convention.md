# Stitch MCP Naming Convention

## Rule

MCP wrapper skills follow the pattern: `stitch-mcp-<tool>` where `<tool>` is the MCP tool name with underscores replaced by hyphens.

```
MCP tool name (snake_case) → skill name (kebab-case)
generate_screen_from_text  → stitch-mcp-generate-screen-from-text
```

## Tool → skill mapping

| MCP tool name | Skill name |
|---------------|-----------|
| `create_project` | `stitch-mcp-create-project` |
| `list_projects` | `stitch-mcp-list-projects` |
| `get_project` | `stitch-mcp-get-project` |
| `generate_screen_from_text` | `stitch-mcp-generate-screen-from-text` |
| `list_screens` | `stitch-mcp-list-screens` |
| `get_screen` | `stitch-mcp-get-screen` |

## ID formats — the most common source of errors

Different Stitch MCP tools expect different ID formats. **Agents fail this constantly without explicit guidance.**

### projectId formats

| Tool | projectId format | Example |
|------|-----------------|---------|
| `get_project` | `projects/NUMERIC_ID` | `projects/3780309359108792857` |
| `list_screens` | `projects/NUMERIC_ID` | `projects/3780309359108792857` |
| `generate_screen_from_text` | **numeric only** | `3780309359108792857` |
| `get_screen` | **numeric only** | `3780309359108792857` |

### screenId formats

| Tool | screenId format | Example |
|------|----------------|---------|
| `get_screen` | **numeric/alphanumeric only** | `88805abc123def456` |

**Never pass `projects/ID` to `generate_screen_from_text` or `get_screen`.**

### Correct vs. wrong

```
✅ generate_screen_from_text projectId: "3780309359108792857"
❌ generate_screen_from_text projectId: "projects/3780309359108792857"

✅ get_screen projectId: "3780309359108792857", screenId: "88805abc123def456"
❌ get_screen projectId: "projects/3780309359108792857", screenId: "screens/88805abc123def456"

✅ list_screens projectId: "projects/3780309359108792857"
❌ list_screens projectId: "3780309359108792857"
```

## Tool prefix discovery

The MCP tool namespace prefix varies by client configuration (e.g. `stitch:`, `mcp__stitch__`, `mcp_stitch__stitch:`). Always run `list_tools` first to discover the prefix, then use it for all subsequent calls.

## References

- Stitch MCP setup: https://stitch.withgoogle.com/docs/mcp/guide/
- `skills-index.md` — full skills table
