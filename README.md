# 2nth.ai skills

The 2nth.ai skill tree. A fractal, self-referencing library of AI agent skills — organised by domain, consumed by Claude Code and any AI agent runtime.

> **Note**: The legacy public UI at `skills.2nth.ai` was retired 2026-05-17. The SKILL.md files in this repo remain the source of truth that agents load at runtime. For human-facing knowledge content, see [`know.2nth.ai`](https://know.2nth.ai).

## Domains

| Domain | Path | Status |
|--------|------|--------|
| Business | `biz/` | Active |
| Education | `edu/` | Stub |
| Finance | `fin/` | Stub |
| Healthcare | `health/` | Stub |
| Legal | `leg/` | Stub |
| Technology | `tech/` | Active |

## Install a skill

```bash
npx skills add biz/erp/sage-x3
```

Or reference directly in any agent context:

```
https://raw.githubusercontent.com/2nth-ai/skills/main/biz/erp/sage-x3/SKILL.md
```

## Skill format

See [SKILL_FORMAT.md](SKILL_FORMAT.md) for the canonical specification.

## Repository

`github.com/2nth-ai/skills` — maintained by [2nth.ai](https://2nth.ai), informed by [imbilawork](https://imbilawork.com).
