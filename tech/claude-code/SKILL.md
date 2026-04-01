---
name: tech/claude-code
description: |
  Claude Code setup and patterns. Use this skill when:
  (1) setting up a new Claude Code environment for a client or project,
  (2) writing or improving a CLAUDE.md file,
  (3) configuring .claude/settings.json — tools, MCP servers, token limits,
  (4) injecting skills from skills.2nth.ai into a Claude Code session,
  (5) designing the client onboarding flow for the 2nth.ai platform.
license: MIT
compatibility: Claude Code CLI, claude.ai/code
homepage: https://skills.2nth.ai/tech/claude-code
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Claude Code, AI Development, 2nth Platform"
allowed-tools: Read Write Edit Glob Grep
---

# Claude Code

Claude Code is the primary build environment for all 2nth.ai work. Every client project should have a properly configured Claude Code environment.

## Project Structure

```
project/
├── CLAUDE.md                   # Project context — loaded automatically
├── .claude/
│   ├── settings.json           # Tool permissions, MCP servers
│   └── settings.local.json     # Local overrides (gitignore this)
└── memory/                     # Persistent memory (if enabled)
    └── MEMORY.md
```

## CLAUDE.md Principles

A good CLAUDE.md contains:
- **Commands**: how to build, test, deploy (specific to this project)
- **Architecture**: the big picture requiring multiple files to understand
- **Conventions**: project-specific patterns agents must follow

A CLAUDE.md does NOT contain:
- Generic best practices
- File listings that can be discovered
- Obvious instructions

## .claude/settings.json Pattern

```json
{
  "permissions": {
    "allow": [
      "Bash(wrangler:*)",
      "Bash(npm:*)",
      "Bash(npx:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)"
    ]
  }
}
```

## Injecting 2nth Skills

```bash
# Install skill into current project
npx skills add biz/erp/sage-x3

# This places the SKILL.md where Claude Code finds it
# and resolves the requires: chain automatically
```

## Token Economy Integration

Claude Code sessions should be routed through 2nth AI Gateway for token metering:

```bash
export ANTHROPIC_BASE_URL=https://gateway.ai.cloudflare.com/v1/{account}/{gateway}/anthropic
```

This enables per-client, per-project token tracking without changing any code.

## Common Gotchas

- **CLAUDE.md is auto-loaded**: Every directory in the path is checked. Repo-root CLAUDE.md sets the baseline; subdirectory CLAUDE.md files extend it.
- **settings.local.json**: Never commit this. It holds local paths and personal API keys.
- **Memory persists across sessions**: MEMORY.md in `.claude/projects/` accumulates context. Review it periodically.
- **Skills are additive**: Multiple SKILL.md files load in order. `requires:` chains resolve depth-first.
