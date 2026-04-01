---
name: tech/cloudflare/email
description: |
  Cloudflare Email Routing — inbound email processing in Workers + MailChannels outbound. Use this skill when:
  (1) triggering AI workflows from inbound email (client briefs, intake forms),
  (2) sending transactional email from Workers without a third-party ESP,
  (3) building Penny's email briefing dispatch system,
  (4) routing domain email (e.g. hello@2nth.ai) to Workers for AI triage.
  Free — included with any Cloudflare-managed domain.
license: MIT
compatibility: Cloudflare Workers, Email Routing
homepage: https://skills.2nth.ai/tech/cloudflare/email
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "0.1.0"
  status: stub
  categories: "Cloudflare, Email Routing, MailChannels, Workers"
---

# Cloudflare Email Routing

Email Routing lets you process inbound email inside a Worker via the `email` event handler. MailChannels integration enables outbound transactional email — no separate ESP required.

**Free** on any Cloudflare-managed domain.

## wrangler.toml

```toml
[[email]]
type = "receive"
name = "email-handler"
destination_address = "worker"   # routes all matched email to your Worker
```

## Inbound — receiving email in a Worker

```typescript
import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export default {
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext) {
    // Reject spam before processing
    if (message.headers.get('x-spam-flag') === 'YES') {
      message.setReject('Spam rejected');
      return;
    }

    // Read raw MIME content
    const rawEmail = await new Response(message.raw).text();

    // Forward to another address
    await message.forward('penny@2nth.ai');

    // Or trigger an AI workflow with the email body
    await env.QUEUE.send({
      type: 'email_intake',
      from: message.from,
      subject: message.headers.get('subject'),
      body: rawEmail,
    });
  }
};
```

## Outbound — sending email via MailChannels

```typescript
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}, env: Env): Promise<void> {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: params.from ?? 'penny@2nth.ai', name: 'Penny — 2nth.ai' },
      subject: params.subject,
      content: [{ type: 'text/html', value: params.html }],
    }),
  });

  if (!response.ok) {
    throw new Error(`MailChannels error: ${response.status}`);
  }
}
```

## Common Gotchas

- **SPF/DKIM required for MailChannels**: Add `include:relay.mailchannels.net` to your SPF record and set up DKIM, or your email will be rejected.
- **Email Routing must be enabled in the dashboard**: Can't configure purely via wrangler.toml — enable per-domain in the Cloudflare dashboard first.
- **`message.raw` is a ReadableStream**: Wrap in `new Response(message.raw).text()` to read it.
- **Email Workers count toward Worker request limits**: A busy inbound address counts the same as a web request.

## See Also

- [Queues (async processing of email events)](../queues/SKILL.md)
- [Workflows (multi-step email-triggered pipelines)](../workflows/SKILL.md)
- [Workers runtime](../workers/SKILL.md)
