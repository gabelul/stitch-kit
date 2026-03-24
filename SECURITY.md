# Security policy

## What this project is

stitch-kit is a collection of markdown skill files that teach AI coding agents how to call the Stitch MCP API. There's no server, no database, no authentication layer, and no user data processing. The skills are prompt instructions, not executable code.

That said, if you find something that shouldn't be here or a way this could be misused, I want to know about it.

## Reporting a vulnerability

Email **security@booplex.com** with:

- What you found
- Steps to reproduce (if applicable)
- How you think it could be exploited

I'll acknowledge receipt within 48 hours and follow up with a plan within a week. If you're right, you get credit in the fix commit (unless you'd rather stay anonymous).

## What counts as a security issue here

- API keys, tokens, or credentials accidentally committed to the repo
- Skill instructions that could trick an agent into leaking sensitive data
- MCP tool calls that could be crafted to access resources outside the intended scope
- Prompt injection vectors in skill templates

## What probably isn't a security issue

- The skills themselves don't execute code, so "the markdown says to run a command" isn't a vulnerability in the plugin. That's how skills work. The agent and user decide whether to run it.
- Stitch API rate limits or access control are Google's domain, not ours.

## Supported versions

Only the latest release gets security attention. If you're on an older version, update first and check if the issue persists.
