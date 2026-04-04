---
name: tech/recall-ai
description: |
  Integrate with the Recall.ai Meeting Bot API to send bots to video meetings
  (Zoom, Google Meet, Microsoft Teams, Webex, Slack Huddles), retrieve recordings,
  transcripts, and meeting metadata. Use this skill when:
  (1) sending a bot to join and record a meeting programmatically,
  (2) retrieving post-call recordings (MP4 video, MP3 audio) or transcripts with speaker diarization,
  (3) building webhook handlers for bot status, recording, and transcript events,
  (4) implementing calendar-driven bot scheduling,
  (5) building real-time or async meeting transcription pipelines,
  (6) any project that needs programmatic access to meeting conversation data via Recall.ai.
license: MIT
compatibility: Any runtime with HTTPS — Node.js, Python, Cloudflare Workers, etc.
homepage: https://skills.2nth.ai/tech/recall-ai
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Meeting Intelligence, Transcription, Recall.ai, Video, Zoom, Google Meet, Teams, Webhooks"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Recall.ai Integration

Recall.ai is the universal API for meeting bots — it captures recordings, transcripts, and metadata from Zoom, Google Meet, Microsoft Teams, Webex, Slack Huddles, and GoTo Meeting. All you need is a meeting URL. No host permissions or native platform integrations required.

## Authentication

Store as environment variables — never hardcode:

```bash
RECALL_REGION=us-west-2          # us-west-2 | us-east-1 | eu-central-1 | ap-northeast-1
RECALL_API_KEY=your_api_key_here
RECALL_WEBHOOK_SECRET=your_workspace_verification_secret   # starts with whsec_
```

All requests require: `Authorization: Token ${RECALL_API_KEY}`

Base URL: `https://${RECALL_REGION}.recall.ai/api/v1/`

Sign up and get keys at `https://${RECALL_REGION}.recall.ai/dashboard/developers/api-keys`. US West (`us-west-2`) is pay-as-you-go and the easiest starting point.

## Core workflow

Every Recall.ai integration follows this pattern:

1. **Create a bot** — sends a participant to a meeting via meeting URL
2. **Bot joins and records** — captures audio, video, transcript, metadata
3. **Webhooks notify your app** — bot status changes, recording done, transcript done
4. **Retrieve artifacts** — download recordings, transcripts, participant data

### Step 1: Build the webhook handler FIRST

Build this before creating any bots. Recall delivers events via Svix webhooks. The handler must verify signatures, return 2xx immediately, and be idempotent. See [webhook-schemas.md](references/webhook-schemas.md) for verification code and payload schemas.

Subscribe to these events in the Recall dashboard:
- `bot.*` — bot lifecycle (joining, recording, leaving, errors)
- `recording.done` / `recording.failed`
- `transcript.done` / `transcript.failed`

### Step 2: Create a bot

```bash
curl -X POST "https://${RECALL_REGION}.recall.ai/api/v1/bot/" \
  -H "Authorization: Token ${RECALL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_url": "https://meet.google.com/abc-defg-hij",
    "bot_name": "Meeting Notetaker",
    "recording_config": {
      "transcript": {
        "provider": {
          "recallai_streaming": {
            "mode": "prioritize_accuracy",
            "language_code": "auto"
          }
        },
        "diarization": {
          "use_separate_streams_when_available": true
        }
      }
    }
  }'
```

Response contains a `bot_id` (UUID). Store it — this is your handle for everything.

For production: always use `join_at` (ISO 8601) to schedule bots in advance.

### Step 3: Handle webhooks and retrieve data

Once `transcript.done` fires:

1. Get the transcript: `GET /api/v1/transcript/{transcript_id}/`
2. Download from `data.download_url` (pre-signed S3 URL)
3. Parse the JSON array of utterance segments

For recordings: after `recording.done`, call `GET /api/v1/bot/{bot_id}/` and get the MP4 from `recordings[].media_shortcuts.video_mixed.data.download_url`.

See [transcript-guide.md](references/transcript-guide.md) for the full transcript format and conversion to readable text.

## Quick reference

| Task | Endpoint | Method |
|------|----------|--------|
| Send bot to meeting | `/api/v1/bot/` | POST |
| Get bot status | `/api/v1/bot/{id}/` | GET |
| List all bots | `/api/v1/bot/` | GET |
| Get recording | via bot retrieve -> `recordings[].media_shortcuts` | GET |
| List transcripts | `/api/v1/transcript/?recording_id={id}` | GET |
| Get transcript | `/api/v1/transcript/{id}/` | GET |
| Remove bot from call | `/api/v1/bot/{id}/leave_call/` | POST |
| Pause recording | `/api/v1/bot/{id}/pause_recording/` | POST |
| Resume recording | `/api/v1/bot/{id}/resume_recording/` | POST |
| Send chat message | `/api/v1/bot/{id}/send_chat_message/` | POST |

## Transcription options

| Provider | Key | Notes |
|----------|-----|-------|
| Recall.ai (default) | `recallai_streaming` | Best for most use cases. Modes: `prioritize_accuracy` or `prioritize_latency` |
| Meeting captions | `meeting_captions` | Uses the platform's built-in captions |
| AWS Transcribe | `aws_transcribe` | Bring your own AWS credentials |
| Google Cloud STT | `google_cloud_stt` | Bring your own GCP credentials |

## Supported platforms

Zoom (all tiers), Google Meet, Microsoft Teams (business + personal), Cisco Webex, Slack Huddles, GoTo Meeting (beta).

## Common Gotchas

- **Never poll for completion.** Use webhooks. Recall is async/event-driven by design. Polling wastes quota and misses events.
- **Ad-hoc bot creation returns 507 under load.** Retry every 30s for up to 10 attempts, then surface the error. Use `join_at` scheduled bots in production to avoid this entirely.
- **Localhost webhooks won't work.** Recall needs a publicly reachable HTTPS URL. Use ngrok with a static domain for local dev.
- **Don't fetch transcript before `transcript.done`.** The download URL isn't ready until the webhook fires.
- **Webhook handlers must return 2xx fast.** Do all processing async — Recall will retry on timeouts and mark your endpoint as failing.
- **Region mismatch = 404.** A bot created in `us-west-2` doesn't exist in `eu-central-1`. Always use the same region for all calls on a given bot.
- **Webhook signatures use Svix HMAC.** Strip the `whsec_` prefix before base64-decoding the secret. Use the official `svix` library if possible.

## See Also

- [API Reference](references/api-reference.md) — full endpoint catalog with request/response shapes
- [Webhook Schemas](references/webhook-schemas.md) — event types, payload schemas, signature verification, state machine
- [Transcript Guide](references/transcript-guide.md) — transcript format, readable conversion, diarization
- [Recall.ai Docs](https://docs.recall.ai/)
- [Agent Quickstarts](https://docs.recall.ai/docs/agent-quickstarts)
