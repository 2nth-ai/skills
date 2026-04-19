---
name: tech/google/workspace/sheets
description: |
  Google Sheets API skill (stub). Use when: (1) reading cell ranges or whole sheets via values.get / values.batchGet,
  (2) appending rows via values.append — the idiomatic "add a log row" operation,
  (3) writing ranges or doing batch updates via values.batchUpdate,
  (4) creating charts, pivot tables, and formulas via spreadsheets.batchUpdate,
  (5) using Sheets as a lightweight CMS or as the output surface for AI-generated reports.
license: MIT
compatibility: Google Sheets API v4
homepage: https://skills.2nth.ai/tech/google/workspace/sheets
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
  categories: "Google Sheets, Workspace, CMS, Reports, Spreadsheets"
allowed-tools: Read Write Edit Glob Grep
---

# Google Sheets API (stub)

> **Status**: stub. Production depth pending.

## Common operations

```typescript
import { google } from 'googleapis';
const sheets = google.sheets({ version: 'v4', auth });

// Read a range (A1 notation)
const { data } = await sheets.spreadsheets.values.get({
  spreadsheetId: 'SHEET_ID',
  range: 'Intake!A2:F',
});
const rows = data.values ?? [];

// Append a row (idiomatic log-style write)
await sheets.spreadsheets.values.append({
  spreadsheetId: 'SHEET_ID',
  range: 'Intake!A:F',
  valueInputOption: 'USER_ENTERED',    // evaluate formulas; 'RAW' stores literally
  requestBody: { values: [['2n-014', 'POPIA audit', new Date().toISOString(), 'open', '', '']] },
});

// Batch read multiple ranges
await sheets.spreadsheets.values.batchGet({
  spreadsheetId: 'SHEET_ID',
  ranges: ['Intake!A:F', 'Tasks!A:D', 'Clients!A:C'],
});

// Batch update — clear + write + format in one round trip
await sheets.spreadsheets.batchUpdate({
  spreadsheetId: 'SHEET_ID',
  requestBody: {
    requests: [
      { updateCells: { range: { sheetId: 0 }, fields: 'userEnteredValue' } },      // clear sheet
      { appendCells: { sheetId: 0, rows: [{ values: [{ userEnteredValue: { stringValue: 'Client' } }] }], fields: '*' } },
    ],
  },
});
```

## Sheets as CMS pattern

Lightweight sites / dashboards that read a Sheet on the edge, cache in KV, and render SSR:

```
Cron → Cloud Run / Cloudflare Worker → sheets.values.get → KV cache → HTML render
```

Good for: low-traffic ops dashboards, client-editable FAQ content, AI-assisted report spreadsheets.

## Gotchas (high-level)

- `valueInputOption: USER_ENTERED` evaluates formulas. `RAW` treats strings literally. Wrong choice = `=2+2` shown as text, or `"hello"` becoming `#NAME?`.
- `append` with `insertDataOption: OVERWRITE` replaces existing rows below the target — usually NOT what you want. Default is `INSERT_ROWS` (safe).
- Read quota: 100 requests / 100 sec / user. `batchGet` on 10 ranges = 1 request, not 10.
- Sheets aren't databases. Above ~10k rows of read-write, move to Firestore or BigQuery.

## See Also

- [Workspace parent](../SKILL.md)
- [Drive API (for creating Sheets files)](../drive/SKILL.md)
