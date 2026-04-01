---
name: edu/curriculum
description: |
  Curriculum designer AI expert. Use this skill when:
  (1) generating standards-aligned lesson plans for any subject, grade, and curriculum framework (CAPS, IEB, Cambridge, IB, Common Core, Australian, Ofsted),
  (2) designing multi-week unit plans with objectives, lesson summaries, and assessment schedules,
  (3) building term or semester scope-and-sequence documents with framework code references,
  (4) aligning or rewriting learning objectives to Bloom's Taxonomy cognitive levels,
  (5) generating three-tier learner differentiation (support / core / extension) for any lesson,
  (6) mapping existing lesson content to framework codes and identifying curriculum coverage gaps,
  (7) creating substitute teacher plans requiring minimal preparation,
  (8) designing formative and summative assessment tasks with mark allocation and success criteria,
  (9) producing remediation plans for learners struggling with specific topics.
license: MIT
compatibility: Any — outputs Markdown, DOCX, JSON
homepage: https://skills.2nth.ai/edu/curriculum
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - edu
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Education, Curriculum Design, Lesson Plans, CAPS, IB, Cambridge"
allowed-tools: Read Write Edit
---

# Curriculum Designer AI

Curriculum design is one of the most time-intensive tasks in education — a single unit plan can take 4-8 hours to produce at quality. This skill gives AI agents the frameworks, terminology, and structured output patterns to produce standards-aligned lesson plans, unit overviews, and scope-and-sequence documents that a teacher or instructional designer can refine and use immediately.

All output is designed as a professional first draft. A teacher's professional judgement is always the final gate before classroom use.

## Supported Curriculum Frameworks

| Framework | Region | Key Characteristics | Grade Range | Assessment Style |
|-----------|--------|---------------------|-------------|-----------------|
| **CAPS** (Curriculum & Assessment Policy Statement) | South Africa | National, term-based, subject-specific ATPs, mandatory formal assessments per term | R-12 | School-based assessment + national exams (Gr 12) |
| **IEB** (Independent Examinations Board) | South Africa | Independent schools, broader curriculum interpretation, strong extended writing component | R-12 | Internal SBA + IEB national exams |
| **Cambridge IGCSE** | International | Syllabus-driven, tiered papers (Core/Extended), practical components, globally recognised | Grade 8-10 (14-16) | External Cambridge examinations |
| **Cambridge A-Level** | International | Subject depth, AS/A2 structure, coursework options, university entrance standard | Grade 11-12 (16-18) | External Cambridge examinations |
| **IB MYP** | International | Concept-based, interdisciplinary, inquiry-led, personal project in Year 5 | Grade 6-10 (11-16) | Criterion-referenced, internal moderation |
| **IB DP** | International | Six subject groups, Theory of Knowledge, Extended Essay, CAS, Higher/Standard Level | Grade 11-12 (16-18) | Internal + external IBO examinations |
| **Common Core** | USA | ELA and Math standards, college-and-career readiness focus, state-level implementation | K-12 | State assessments (SBAC, PARCC, etc.) |
| **Australian Curriculum** | Australia | Eight learning areas, cross-curriculum priorities, general capabilities, v9.0 | F-10 | NAPLAN + school assessment |
| **Ofsted Framework** | UK | Intent, implementation, and impact curriculum model | All | Inspection framework |

## Pairing by Role

| Role | Primary Use | Time Saved |
|------|-------------|------------|
| Classroom Teacher | Daily lesson planning, substitute plans, differentiated worksheets | 3-5 hrs / week |
| Instructional Designer | Full unit design with objectives, activities, assessments | 6-10 hrs / unit |
| Head of Department | Scope and sequence alignment, cross-teacher consistency | 4-8 hrs / term |
| Curriculum Coordinator | Standards auditing, gap analysis, curriculum mapping | 8-15 hrs / audit |

## Lesson Plan Generation

Primary output format. Provide subject, grade, topic, framework, and duration — the AI returns a fully structured lesson plan including all teaching phases, resources, and differentiation.

```json
{
  "lesson_plan": {
    "subject": "Mathematics",
    "grade": "Grade 10",
    "topic": "Quadratic Equations",
    "framework": "CAPS",
    "duration": "60 minutes",
    "learning_objectives": [
      "Factorise quadratic expressions with integer coefficients (Bloom's: Apply)",
      "Solve quadratic equations using factorisation (Bloom's: Apply)",
      "Verify solutions by substitution (Bloom's: Evaluate)"
    ],
    "lesson_phases": {
      "introduction": {
        "duration": "10min",
        "activity": "Review factorisation of algebraic expressions — class discussion with mini-whiteboard responses",
        "resource": "Mini whiteboards or printed warm-up card"
      },
      "direct_instruction": {
        "duration": "20min",
        "activity": "Teacher models factorisation of trinomials using standard form ax^2 + bx + c. Two worked examples on board.",
        "resource": "Board / projected slides, textbook p.142"
      },
      "guided_practice": {
        "duration": "15min",
        "activity": "Learners work in pairs on 4 structured problems with scaffolded steps.",
        "resource": "Worksheet A (pairs)"
      },
      "independent_practice": {
        "duration": "10min",
        "activity": "Individual work: solve 3 quadratic equations using factorisation",
        "resource": "Textbook Exercise 4.2, Q1-3"
      },
      "closure": {
        "duration": "5min",
        "activity": "Exit ticket — 3 equations solved individually; teacher collects to inform next lesson",
        "resource": "Exit ticket slip"
      }
    },
    "differentiation": {
      "support": "Provide factorisation scaffolding sheet with step-by-step prompts; allow calculator for arithmetic",
      "core": "Standard practice problems as above",
      "extension": "Introduce discriminant (b^2 - 4ac) and nature of roots; challenge: create own quadratic given specific roots"
    },
    "caps_reference": "Algebra: 2.1 — Equations and Inequalities, Grade 10",
    "assessment": "Exit ticket: 3 quadratic equations to solve independently (formative)",
    "resources": ["Textbook Ch 4", "Mini whiteboards", "Factorisation scaffold (support tier)", "Exit ticket slips"]
  }
}
```

## Scope and Sequence Design

Generate a full term or semester plan with CAPS references, topic sequencing, and integrated assessment schedule:

```markdown
## Term 2 Mathematics — Grade 10 (CAPS)

| Week | Topic                    | CAPS Reference         | Duration | Assessment       |
|------|--------------------------|------------------------|----------|------------------|
| 1-2  | Quadratic Equations      | 2.1 Algebra            | 6 hrs    | Classwork        |
| 3    | Quadratic Inequalities   | 2.2 Algebra            | 3 hrs    | Homework         |
| 4-5  | Nature of Roots          | 2.3 Algebra            | 4 hrs    | Quiz (20 marks)  |
| 6    | Number Patterns          | 2.4 Patterns           | 3 hrs    | Classwork        |
| 7-8  | Analytical Geometry      | 3.1 Geometry           | 6 hrs    | Assignment       |
| 9    | Trigonometry — Identities| 4.1 Trigonometry       | 3 hrs    | Classwork        |
| 10   | Revision & Test          | —                      | 3 hrs    | Formal Test (50m)|
```

## Standards Audit Prompt Pattern

Map existing lessons against a curriculum framework to identify gaps, overlaps, and coverage imbalances:

```
STANDARDS AUDIT REQUEST
Framework: CAPS Mathematics Grade 10
Existing coverage: [paste lesson titles or topics]

Analyse:
1. Which CAPS topics are covered? (map to framework codes)
2. Which CAPS topics are missing or undercovered?
3. Are there topics covered that fall outside the CAPS scope for this grade?
4. Suggested resequencing or additions?

Return as: Gap Analysis Table + Priority Additions List
```

## Differentiation Template

Adapt any existing lesson for three learner tiers without redesigning the core plan:

```
DIFFERENTIATION REQUEST
Base lesson: [paste lesson summary or objectives]
Subject: [subject]   Grade: [grade]

Generate:
- SUPPORT tier: scaffolded version for learners below grade level
  (simplified language, visual prompts, reduced steps, peer support)
- CORE tier: standard version as planned
- EXTENSION tier: deeper challenge for advanced learners
  (higher Bloom's level, open-ended task, real-world application)

Include: adjusted activity descriptions, additional resources, assessment modifications
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `edu_lesson_plan` | Generate a full structured lesson plan for any subject, grade, topic, and framework |
| `edu_unit_plan` | Design a multi-week unit with objectives, lesson summaries, and assessment schedule |
| `edu_scope_sequence` | Build a term or semester scope-and-sequence document with framework references |
| `edu_bloom_align` | Tag and rewrite learning objectives to specified Bloom's Taxonomy levels |
| `edu_differentiate` | Generate three-tier differentiation (support / core / extension) for any lesson |
| `edu_standards_map` | Map existing lesson content to framework codes and identify coverage gaps |
| `edu_resource_list` | Generate a curated resource list for any topic, grade, and subject |
| `edu_sub_plan` | Create a self-contained substitute teacher plan requiring minimal preparation |

### MCP Tool Call Example

```json
{
  "tool": "edu_lesson_plan",
  "subject": "Life Sciences",
  "grade": "Grade 11",
  "topic": "Meiosis vs Mitosis",
  "framework": "CAPS",
  "duration": 55,
  "differentiation": true,
  "blooms_target_level": "apply",
  "output_format": "markdown"
}
```

## Common Gotchas

- **Framework currency** — CAPS is reviewed periodically by the DBE; Cambridge updates syllabuses on 2-4 year cycles; IB updates MYP and DP on regular revision schedules. Always verify against the current official framework document for your specific subject and year group before finalising output.
- **Bloom's verb misuse** — "understand" and "know" are not valid Bloom's verbs. Use measurable action verbs: "describe", "explain", "calculate", "evaluate", "design". The AI tags objectives correctly; human review should catch any prose that slips through.
- **Time allocations are indicative** — lesson phase durations are starting estimates. Real classrooms run differently; teachers must adjust to their context. Do not present AI-generated timing as fixed.
- **Assessment task weighting** — CAPS specifies mandatory formal assessment tasks per term with prescribed mark allocations. AI-generated assessment tasks must comply with these requirements or they cannot be submitted as formal SBA.
- **Differentiation is not simplification** — the support tier must still address the same learning objective at the appropriate cognitive level; it changes scaffolding and access, not the goal. Flag any AI output that reduces the cognitive demand rather than the access barriers.
- **Cross-curricular claims need verification** — the AI identifies cross-curricular links based on pattern matching; some suggestions are obvious (Maths in Physics) and some are superficial. Human review should confirm genuine curriculum integration opportunities.

## Recommended Pairings

- **assessment-builder** — generate question papers and rubrics alongside lesson plans
- **research-assistant** — source academic evidence for curriculum decisions

## See Also

- [edu/](../SKILL.md) — EDU domain manifest
