---
name: tech/google/workspace/drive
description: |
  Google Drive API skill (stub). Use when: (1) creating, reading, or updating files/folders via Drive API v3,
  (2) managing permissions — per-file, per-folder, shared drives, link sharing,
  (3) exporting Google Docs/Sheets/Slides to PDF or Office formats,
  (4) watching a folder for changes via push notifications (Drive Activity API),
  (5) scoping access narrowly with drive.file (only files your app creates/opens).
license: MIT
compatibility: Drive API v3, Drive Activity API v2
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/workspace
improves:
  - tech/google/workspace
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "0.1.0"
  categories: "Google Drive, Workspace, Files, Shared Drives, Permissions"
allowed-tools: Bash(gcloud:*) Read Write Edit Glob Grep
---

# Google Drive API (stub)

> **Status**: stub. Production depth pending.

## Scope choice

| Scope | Grants | Notes |
|-------|--------|-------|
| `drive.file` | Only files your app creates or is opened with | **Prefer this** — no verification audit |
| `drive.readonly` | Read all of user's Drive | Restricted scope |
| `drive.metadata.readonly` | Metadata only, no content | Restricted scope |
| `drive` | Full access | Restricted scope, avoid unless needed |

## Quick start

```typescript
import { google } from 'googleapis';

const drive = google.drive({ version: 'v3', auth });

// Create a folder
const { data: folder } = await drive.files.create({
  requestBody: { name: 'Client 2n-014 intake', mimeType: 'application/vnd.google-apps.folder' },
  fields: 'id,name,webViewLink',
});

// Upload a file into it
const { data: file } = await drive.files.create({
  requestBody: { name: 'contract.pdf', parents: [folder.id!] },
  media: { mimeType: 'application/pdf', body: fs.createReadStream('./contract.pdf') },
  fields: 'id,webViewLink',
});

// Grant someone view access
await drive.permissions.create({
  fileId: file.id!,
  requestBody: { role: 'reader', type: 'user', emailAddress: 'client@example.com' },
  sendNotificationEmail: true,
});
```

## Shared drives

Shared drives (formerly Team Drives) are owned by the organisation, not a person. Files survive employee offboarding. Always check `supportsAllDrives: true` on list/search calls.

```typescript
const { data } = await drive.files.list({
  q: "'DRIVE_ID' in parents",
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
  driveId: 'DRIVE_ID',
  corpora: 'drive',
});
```

## Gotchas (high-level)

- Without `supportsAllDrives: true`, shared-drive files are invisible.
- `drive.file` scope hides files the app didn't create/open — including copies. Copy flows break silently.
- Push notifications require domain verification in Search Console.
- Exporting a large Google Doc to PDF has a 10MB size cap; chunk or use Docs API.

## See Also

- [Workspace parent](../SKILL.md)
- [Gmail API (for attachment-to-Drive workflows)](../gmail/SKILL.md)
