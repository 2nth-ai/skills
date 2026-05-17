---
name: tech/design
description: |
  UI and product design craft skill. Use skills in this subdomain when working with:
  (1) design systems — tokens, theming, dark/light modes, the consistency layer,
  (2) component libraries — shadcn/ui, Radix, Headless UI, Aceternity, Magic UI,
  (3) CSS frameworks — Tailwind, Panda, UnoCSS, vanilla-extract, CSS-in-JS,
  (4) motion and interaction — Framer Motion, GSAP, CSS animations, View Transitions API,
  (5) web typography — variable fonts, fluid type, text pairing, responsive scale,
  (6) Figma workflows — dev mode, tokens export, plugin ecosystem, design-to-code,
  (7) AI design tools — v0, Lovable, Framer AI, design-to-code generators,
  (8) accessibility — WCAG patterns, ARIA, screen reader testing, keyboard navigation.
license: MIT
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Design, UI, UX, Frontend, Design Systems, Components, Motion, Typography, Accessibility"
---

# Design Skills

The craft of designing and building interfaces. This sub-domain covers the full frontend-design stack — from design tokens at the bottom to AI-assisted design-to-code at the top. It sits next to `tech/architecture` as the twin craft: architecture designs systems, design designs interfaces, both are opinion-heavy, and both are learned through patterns and trade-offs.

> **Sub-domain manifest.** Child skills carry the depth. The leaves below will each ship their own full SKILL.md with API patterns, code samples, and gotchas.

## Children

| Skill | What it covers |
|-------|----------------|
| `tech/design/systems` | Design tokens, theming, dark/light modes, the "how do you stay consistent" layer |
| `tech/design/frameworks` | Tailwind, Panda, UnoCSS, vanilla-extract, the CSS-in-JS trade-off space |
| `tech/design/components` | shadcn/ui, Radix, Headless UI, Aceternity, Magic UI, Radix Primitives |
| `tech/design/motion` | Framer Motion, GSAP, CSS animations, View Transitions API |
| `tech/design/typography` | Variable fonts, fluid type, pairing, responsive scale |
| `tech/design/accessibility` | WCAG patterns, ARIA, screen reader testing, keyboard navigation |
| `tech/design/figma` | Dev mode, tokens export, plugin ecosystem, Figma-to-code |
| `tech/design/ai-tools` | v0, Lovable, Framer AI, design-to-code generators, and the human review step |

## Common Principles Across Every Leaf

- **Tokens before components.** Every design decision cascades better when encoded as a token first. Never hardcode colours, spacing, or type scales into components — the refactor cost is paid with interest later.
- **Accessibility is not a layer.** It's built in from the first commit or it's almost impossible to retrofit. Start with semantic HTML and a keyboard-first walkthrough before anything else.
- **Motion carries meaning.** Animations that decorate are noise. Animations that communicate state change — entering, leaving, loading, error — earn their place.
- **AI-generated code needs design review.** v0 and its peers are great at first drafts and wrong at consistency. A human with a tokens file, a component inventory, and a review checklist is still the last step.
- **The interface is a system, not a collage.** Every decision (component, token, interaction) should be made once, tested once, and reused — the same compounding principle that drives the rest of the 2nth skill tree.

## Common Gotchas

- **Copy-pasting from v0 without reconciling tokens breaks the system.** v0 generates Tailwind classes from defaults. If your project has custom tokens, every generated component needs a token audit before merge — or the design system drift becomes permanent.
- **Radix Primitives compose differently to Headless UI.** Radix favours composable sub-components (`<Dialog.Root>`, `<Dialog.Trigger>`, `<Dialog.Content>`); Headless UI favours render props. Picking both in the same project is how inconsistency starts.
- **Motion libraries fight with React strict mode.** Framer Motion animations can double-fire in development under React 18 strict mode. Test in production build mode before blaming the library.
- **Figma dev mode tokens lie about spacing.** Figma exports auto-layout as padding values, but the generated CSS often loses the intended margin hierarchy. Verify against the original frame after every export.

## See Also

- `tech/architecture` — the sibling craft for system-shape decisions
- `tech/cloudflare/workers` — the runtime most interfaces in the 2nth ecosystem ship onto
- `biz/erp/shopify` — the role-based MCP pattern design tooling should mirror for multi-role teams
- `mkt/brand` — brand identity, advertising design, and logo work live in the marketing domain, not here
