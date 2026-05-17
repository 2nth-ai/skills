---
name: tech/google/workspace/calendar
description: |
  Google Calendar API skill (stub). Use when: (1) creating events via events.insert with Google Meet auto-generation,
  (2) checking availability across users with freebusy.query,
  (3) listing / updating / cancelling events,
  (4) receiving push notifications (channels.watch) on calendar changes,
  (5) building scheduling flows — conference rooms, timezone handling, recurring events.
license: MIT
compatibility: Google Calendar API v3
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
  categories: "Google Calendar, Scheduling, Workspace, Meet, Availability"
allowed-tools: Read Write Edit Glob Grep
---

# Google Calendar API (stub)

> **Status**: stub. Production depth pending.

## Common operations

```typescript
import { google } from 'googleapis';
const cal = google.calendar({ version: 'v3', auth });

// Create an event with auto-generated Meet link
const { data: ev } = await cal.events.insert({
  calendarId: 'primary',
  conferenceDataVersion: 1,
  requestBody: {
    summary: 'Client intake — 2n-014',
    start: { dateTime: '2026-04-25T09:00:00+02:00', timeZone: 'Africa/Johannesburg' },
    end:   { dateTime: '2026-04-25T10:00:00+02:00', timeZone: 'Africa/Johannesburg' },
    attendees: [{ email: 'client@example.com' }],
    conferenceData: { createRequest: { requestId: crypto.randomUUID() } },
  },
});
console.log(ev.hangoutLink);   // https://meet.google.com/xxx-xxxx-xxx

// Check availability across multiple calendars (finding a slot)
const { data: busy } = await cal.freebusy.query({
  requestBody: {
    timeMin: '2026-04-25T08:00:00+02:00',
    timeMax: '2026-04-25T18:00:00+02:00',
    timeZone: 'Africa/Johannesburg',
    items: [{ id: 'alice@example.com' }, { id: 'bob@example.com' }],
  },
});
// busy.calendars[email].busy = [{ start, end }, ...] — invert for free slots
```

## Scheduling flow pattern

```
User picks preferred window
  → freebusy.query across required attendees
  → compute overlapping free slots
  → events.insert on confirmed slot (conferenceData for Meet)
  → Notifications handled automatically (attendees get invites)
```

## Push notifications

```typescript
// Subscribe to calendar changes — Google POSTs to your endpoint on change
await cal.events.watch({
  calendarId: 'primary',
  requestBody: {
    id: crypto.randomUUID(),
    type: 'web_hook',
    address: 'https://my-app.run.app/calendar/webhook',
    token: 'verify-token',       // echoed back for verification
    expiration: (Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),  // max 30d
  },
});
```

## Gotchas (high-level)

- Timezones are a nightmare. Always send `{ dateTime, timeZone }` or `{ date }` (all-day). Naive UTC strings silently shift.
- `conferenceDataVersion: 1` must be set on the request OR no Meet link is generated.
- Watch channel expires in max 30 days — renew via a scheduled job.
- Recurring events: `events.list` returns the series; `events.instances` returns individual occurrences. Modifying one instance creates an "exception" — handle UPDATE vs CREATE carefully.
- `primary` is the user's main calendar. Shared / resource calendars have their own IDs (e.g. `c_xxx@group.calendar.google.com`).

## See Also

- [Workspace parent](../SKILL.md)
- [Gmail (for invite emails you send around scheduling)](../gmail/SKILL.md)
