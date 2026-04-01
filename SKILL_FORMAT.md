# SKILL.md Format

Canonical specification for writing a skill in the 2nth.ai skill tree.

## Frontmatter

```yaml
---
name: domain/subdomain/skill-name       # path-based, matches directory location
description: |
  One paragraph explaining WHEN to use this skill.
  Agents use this to decide whether to load it — be specific and enumerated.
  (1) use case one,
  (2) use case two,
  (3) use case three.
license: MIT
compatibility: What runtimes/environments this skill works in
homepage: https://skills.2nth.ai/domain/subdomain/skill-name
repository: https://github.com/2nth-ai/skills
requires:
  - domain/other-skill     # skills this one depends on (resolved automatically)
improves:
  - domain/parent          # parent domain this skill contributes back to
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Tag1, Tag2, Tag3"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---
```

## Body Structure

```markdown
# Skill Title

One paragraph: what the system is, why it matters, what this skill enables.

## Authentication
How to authenticate. Always state where credentials go (env vars, wrangler secrets, .env).

## [Core patterns]
The 3–5 most important things the agent needs to know. Prefer code examples over prose.

## [Domain-specific sections]
API patterns, data models, doctype structures, query examples — whatever the domain requires.

## Common Gotchas
Things that trip up even experienced practitioners. Short bullets. Minimum 3.

## See Also
- [Reference docs](references/filename.md)
- [Related skill](../related/SKILL.md)
```

## Rules

- **Description is the trigger.** Agents load skills based on the description match. Enumerate use cases precisely.
- **`requires:` is resolved automatically.** Don't repeat content from required skills — reference them and trust the chain.
- **Gotchas are mandatory** for any production skill. Minimum 3.
- **Credentials:** always specify where they go. Never hardcode in examples.
- **No OpenClaw references** in skill files.
- **Stubs are valid.** A skill with only frontmatter and a one-line body is better than no skill — it holds the path in the tree.
- **Increment `version:`** when content changes significantly enough to affect agent behaviour.

## Skill Depth Levels

| Level | Description | Example |
|-------|-------------|---------|
| Domain manifest | Describes the domain, lists child skills | `biz/SKILL.md` |
| Subdomain manifest | Describes the subdomain | `biz/erp/SKILL.md` |
| Leaf skill | Full implementation guidance | `biz/erp/sage-x3/SKILL.md` |

Domain and subdomain manifests are thin — their job is routing and discovery. Leaf skills carry the depth.
