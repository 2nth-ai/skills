---
name: tech/cloudflare/r2
description: |
  Cloudflare R2 — S3-compatible object storage with zero egress fees. Use this skill when:
  (1) storing files, images, documents, or exports uploaded by users,
  (2) serving static assets (PDFs, CSVs, media) from the edge without egress costs,
  (3) replacing D1 text columns that hold binary or large string data (>10KB),
  (4) implementing multipart uploads for large files,
  (5) generating presigned URLs for client-direct uploads or time-limited downloads,
  (6) connecting R2 to a custom domain for public asset serving.
license: MIT
compatibility: Cloudflare Workers, S3-compatible clients (AWS SDK v3)
homepage: https://skills.2nth.ai/tech/cloudflare/r2
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, R2, Object Storage, Files, S3"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare R2

R2 is S3-compatible object storage with **zero egress fees** — you pay only for storage and operations, not for data transfer out. Critical for AI workloads that serve large outputs.

**Free tier**: 10GB storage, 1M Class A ops/month (writes), 10M Class B ops/month (reads).
**Paid**: $0.015/GB-month storage, $4.50/M Class A, $0.36/M Class B.

## wrangler.toml binding

```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "my-bucket"

# For separate read-only public bucket
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "my-assets"
```

```bash
wrangler r2 bucket create my-bucket
wrangler r2 bucket list
```

## Core operations from Workers

```typescript
// Upload (put)
await env.R2.put('documents/report-2026.pdf', pdfBuffer, {
  httpMetadata: { contentType: 'application/pdf' },
  customMetadata: { uploadedBy: userId, projectId },
});

// Download (get)
const obj = await env.R2.get('documents/report-2026.pdf');
if (!obj) return new Response('Not found', { status: 404 });
return new Response(obj.body, {
  headers: { 'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream' },
});

// Stream directly (memory-efficient for large files)
const obj = await env.R2.get(key);
if (!obj) return new Response('Not found', { status: 404 });
return new Response(obj.body, { headers: { 'Content-Type': obj.httpMetadata?.contentType ?? '' } });

// Delete
await env.R2.delete('documents/old-report.pdf');

// List objects
const listed = await env.R2.list({ prefix: 'documents/', limit: 100 });
for (const obj of listed.objects) {
  console.log(obj.key, obj.size, obj.uploaded);
}

// Head (metadata only, no body)
const head = await env.R2.head('documents/report-2026.pdf');
if (head) console.log(head.size, head.customMetadata);
```

## Presigned URLs (client uploads)

Generate a time-limited URL for direct browser → R2 uploads without going through your Worker:

```typescript
import { AwsClient } from 'aws4fetch';

const r2 = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto',
});

const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`);
url.searchParams.set('X-Amz-Expires', '3600'); // 1 hour

const signed = await r2.sign(new Request(url, { method: 'PUT' }), { aws: { signQuery: true } });
return Response.json({ uploadUrl: signed.url });
```

## Public bucket serving

Enable public access in the Cloudflare dashboard or connect a custom domain:

```
https://pub-<id>.r2.dev/<key>          # default public URL
https://assets.yourdomain.com/<key>   # custom domain (via Pages or R2 domain settings)
```

## Multipart upload (large files)

```typescript
// For files >100MB — breaks into parts
const upload = await env.R2.createMultipartUpload(key, { httpMetadata: { contentType } });
const part1 = await upload.uploadPart(1, chunk1);
const part2 = await upload.uploadPart(2, chunk2);
await upload.complete([part1, part2]);
```

## Common Gotchas

- **Never store large blobs in D1**: D1 has a 1MB row limit and gets slow with binary data. Anything >10KB (images, PDFs, CSVs) belongs in R2.
- **Zero egress ≠ zero cost**: Writes (Class A ops) cost more than reads (Class B). Batch small writes where possible.
- **No directory concept**: R2 uses flat key namespace. Use `/` in key names as a convention (e.g., `users/123/avatar.jpg`).
- **`obj.body` is a ReadableStream**: Don't read it twice. If you need both the body and metadata, cache the body to a variable.
- **Custom domains need a zone**: Public R2 domains via `r2.dev` work out of the box; custom domains require a Cloudflare zone.
- **S3 SDK v3 works with R2**: Point `endpoint` to `https://<account-id>.r2.cloudflarestorage.com` and use `auto` as the region.

## See Also

- [D1 SQL database](../d1/SKILL.md) — for structured data, not files
- [KV store](../kv/SKILL.md) — for config and small values
- [Workers runtime](../workers/SKILL.md)
