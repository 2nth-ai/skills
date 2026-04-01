---
name: tech/cloudflare/workflows
description: |
  Cloudflare Workflows — durable multi-step execution. Use this skill when:
  (1) orchestrating multi-step AI agent pipelines that must survive Worker restarts,
  (2) implementing long-running tasks (minutes to hours) that Queues cannot handle alone,
  (3) building saga patterns — compensate earlier steps if a later step fails,
  (4) coordinating sequential AI calls (classify → retrieve → generate → store) with retry at each step,
  (5) replacing complex state machines in Durable Objects with declarative step definitions.
  Currently in open beta — available on Workers Paid plan.
license: MIT
compatibility: Cloudflare Workers (Paid, beta)
homepage: https://skills.2nth.ai/tech/cloudflare/workflows
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/queues
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Workflows, Orchestration, Durable Execution, Beta"
---

# Cloudflare Workflows

Workflows provide durable execution for multi-step processes. Unlike Queues (fire-and-forget) or Durable Objects (stateful compute), Workflows let you define a sequence of steps where each step can retry independently and the overall state persists even if the Worker restarts.

**Status**: Open beta on Workers Paid plan.

## wrangler.toml

```toml
[[workflows]]
name = "brief-analysis"
binding = "BRIEF_WORKFLOW"
class_name = "BriefAnalysisWorkflow"
```

## Workflow class

```typescript
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

interface BriefParams {
  projectId: string;
  userId: string;
  briefText: string;
}

export class BriefAnalysisWorkflow extends WorkflowEntrypoint<Env, BriefParams> {
  async run(event: WorkflowEvent<BriefParams>, step: WorkflowStep): Promise<void> {
    const { projectId, userId, briefText } = event.payload;

    // Step 1: Classify the brief (retries automatically on failure)
    const classification = await step.do('classify-intent', async () => {
      return classifyWithWorkersAI(briefText, this.env);
    });

    // Step 2: Retrieve relevant skills via Vectorize (parallel)
    const [skills, userProfile] = await Promise.all([
      step.do('retrieve-skills', async () => {
        return searchSkills(briefText, classification.domain, this.env);
      }),
      step.do('load-user-profile', async () => {
        return loadUser(userId, this.env);
      }),
    ]);

    // Step 3: Generate AI analysis (expensive — retried if it fails)
    const analysis = await step.do('generate-analysis', async () => {
      return generateAnalysis({ briefText, classification, skills, userProfile }, this.env);
    });

    // Step 4: Persist results + notify user
    await step.do('save-results', async () => {
      await this.env.DB.prepare('UPDATE projects SET analysis = ?, status = ? WHERE id = ?')
        .bind(JSON.stringify(analysis), 'complete', projectId)
        .run();
    });

    // step.sleep() for scheduled follow-ups
    await step.sleep('wait-before-notify', '5 minutes');

    await step.do('send-notification', async () => {
      await sendEmail(userProfile.email, 'Your analysis is ready', analysis, this.env);
    });
  }
}
```

## Triggering a workflow from a Worker

```typescript
// Start a workflow instance
const instance = await env.BRIEF_WORKFLOW.create({
  id: `brief-${projectId}`,  // deterministic ID — idempotent
  params: { projectId, userId, briefText },
});

// Check status
const status = await instance.status();
console.log(status.status); // 'running' | 'complete' | 'errored' | 'paused'
```

## Common Gotchas

- **Open beta**: API may change before GA. Pin your `compatibility_date` and check release notes.
- **Steps are idempotent by default**: If a step runs twice (e.g., after a retry), it will re-execute. Make your step functions safe to run multiple times.
- **`step.do()` caches results**: Once a step completes, its result is persisted. Subsequent runs of the Workflow skip completed steps.
- **step.sleep() for delays**: Use `step.sleep()` instead of `setTimeout` — it persists the sleep across Worker restarts.
- **Workflows complement Queues**: Use Queues for simple fan-out; use Workflows for multi-step orchestration with dependencies between steps.

## See Also

- [Queues (simpler async tasks)](../queues/SKILL.md)
- [Durable Objects (stateful compute)](../durable-objects/SKILL.md)
- [Workers AI (inference steps)](../ai/workers-ai/SKILL.md)
