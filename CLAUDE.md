# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`github.com/2nth-ai/skills` is the canonical skill tree for the 2nth.ai platform. It is consumed by Claude Code, Cursor, Windsurf, Cline, and any AI agent runtime.

This is not a deployable application. It is a knowledge library.

## Structure

```
SKILLS.md           root index — load this first to understand what's available
SKILL_FORMAT.md     canonical spec for writing new skills
domain/SKILL.md     domain manifest (thin — routing + discovery)
domain/sub/SKILL.md subdomain manifest
domain/sub/leaf/SKILL.md  leaf skill (full implementation guidance)
agents/penny/AGENT.md     Penny's agent definition
```

## Adding or editing a skill

1. Read `SKILL_FORMAT.md` first.
2. Follow the path convention: `domain/subdomain/skill-name/SKILL.md`.
3. Add `requires:` for any skill this one depends on.
4. Add `improves:` pointing to the parent domain.
5. Update `SKILLS.md` tree to mark the new skill and its status.
6. Increment `version:` in frontmatter if changing an existing skill.

Changes to production skills (marked `✓ production` in SKILLS.md) require Penny's review before merging.

## CI/CD

GitHub Actions automate validation and deployment:

- **Skill validation**: PRs that touch SKILL.md files are validated against SKILL_FORMAT.md (`.github/workflows/skill-validate.yml`)
- **Preview deploys**: Every PR gets a preview at `<branch>.skills-2nth-ai.pages.dev` (`.github/workflows/preview-deploy.yml`)
- **Production deploy**: Merges to `main` auto-deploy to `skills.2nth.ai` (`.github/workflows/deploy-production.yml`)
- **Staging**: The `dev` branch deploys to `dev.skills.2nth.ai`

The `agents/skills` agent (skills@2nth.ai) manages the review pipeline. See `agents/skills/AGENT.md`.

## Domain taxonomy

Top-level domains are fixed: `edu`, `biz`, `leg`, `fin`, `tech`. Subdomains within each are infinitely extensible — add subdirectories as specialisations emerge. A leaf skill that gets used widely enough to spawn variants should be promoted to a subdomain with its own manifest.

## What not to do

- Don't add OpenClaw references to skill files.
- Don't create application code here — this repo is documentation only.
- Don't modify production skills without bumping the version.
