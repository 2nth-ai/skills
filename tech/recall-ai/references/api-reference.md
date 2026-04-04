# Recall.ai API Reference

Complete endpoint reference for the Recall.ai Meeting Bot API (v1.11).

## Table of contents

1. [Authentication](#authentication)
2. [Bot endpoints](#bot-endpoints)
3. [Recording endpoints](#recording-endpoints)
4. [Transcript endpoints](#transcript-endpoints)
5. [Calendar endpoints](#calendar-endpoints)
6. [Bot output endpoints](#bot-output-endpoints)
7. [Error handling](#error-handling)

---

## Authentication

All requests require the `Authorization` header:

```
Authorization: Token YOUR_API_KEY
```

Create API keys at `https://{REGION}.recall.ai/dashboard/developers/api-keys`

Base URL pattern: `https://{REGION}.recall.ai/api/v1/`

Available regions: `us-west-2`, `us-east-1`, `eu-central-1`, `ap-northeast-1`

---

## Bot endpoints

### Create Bot

```
POST /api/v1/bot/
```

Sends a bot to join a meeting. This is the primary entry point for every integration.

**Request body:**

```json
{
  "meeting_url": "https://meet.google.com/abc-defg-hij",
  "bot_name": "My Notetaker",
  "join_at": "2024-12-21T14:00:00Z",
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
    },
    "video_mixed_mp4": {},
    "start_recording_on": "participant_join"
  },
  "metadata": {
    "your_custom_key": "your_value"
  }
}
```

**Key fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meeting_url` | string | Yes | The meeting link (Zoom, Meet, Teams, etc.) |
| `bot_name` | string | No | Display name shown to other participants |
| `join_at` | ISO 8601 | No | Schedule when the bot joins. Strongly recommended for production |
| `recording_config` | object | No | Controls what gets recorded and how |
| `metadata` | object | No | Custom key-value pairs stored with the bot |

**Recording config options:**

| Key | Purpose |
|-----|---------|
| `transcript.provider` | Which transcription engine to use |
| `video_mixed_mp4` | Include to get post-call MP4 video |
| `audio_mixed_mp3` | Include to get post-call MP3 audio |
| `participant_events` | Capture join/leave events |
| `meeting_metadata` | Capture meeting title, etc. |
| `start_recording_on` | `"participant_join"` (default) or `"bot_join"` |
| `video_mixed_layout` | `"speaker_view"` (default) or `"gallery_view"` |

**Transcript provider options:**

```json
// Recall.ai's own transcription (recommended)
"provider": {
  "recallai_streaming": {
    "mode": "prioritize_accuracy",
    "language_code": "auto"
  }
}

// Meeting platform captions (simplest, least accurate)
"provider": {
  "meeting_captions": {}
}

// AWS Transcribe (bring your own keys)
"provider": {
  "aws_transcribe": {
    "language_code": "en-US"
  }
}
```

**Response (201):**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "meeting_url": "https://meet.google.com/abc-defg-hij",
  "bot_name": "My Notetaker",
  "join_at": "2024-12-21T14:00:00Z",
  "recording_config": { ... },
  "status_changes": [],
  "metadata": { ... }
}
```

### Retrieve Bot

```
GET /api/v1/bot/{bot_id}/
```

Returns full bot details including status, recordings, and media download URLs.

**Response includes:**

```json
{
  "id": "3fa85f64-...",
  "meeting_url": "...",
  "bot_name": "...",
  "status_changes": [
    {
      "code": "in_call_recording",
      "sub_code": null,
      "created_at": "2024-12-21T14:01:00Z"
    }
  ],
  "recordings": [
    {
      "id": "824ad909-...",
      "media_shortcuts": {
        "video_mixed": {
          "data": { "download_url": "https://..." },
          "format": "mp4"
        },
        "audio_mixed": {
          "data": { "download_url": "https://..." },
          "format": "mp3"
        },
        "transcript": {
          "data": { "download_url": "https://..." }
        }
      }
    }
  ],
  "meeting_metadata": {
    "title": "Weekly Standup"
  },
  "meeting_participants": [
    {
      "id": 1,
      "name": "Alice",
      "events": [
        { "code": "join", "created_at": "..." },
        { "code": "leave", "created_at": "..." }
      ]
    }
  ]
}
```

### List Bots

```
GET /api/v1/bot/
```

Paginated list. Supports query filters:

| Parameter | Description |
|-----------|-------------|
| `meeting_url` | Filter by meeting URL |
| `status_changes__code` | Filter by latest status |
| `ordering` | Sort field (e.g., `-created_at`) |

### Leave Call

```
POST /api/v1/bot/{bot_id}/leave_call/
```

Forces the bot to leave the meeting immediately.

### Pause / Resume Recording

```
POST /api/v1/bot/{bot_id}/pause_recording/
POST /api/v1/bot/{bot_id}/resume_recording/
```

### Send Chat Message

```
POST /api/v1/bot/{bot_id}/send_chat_message/
```

```json
{
  "message": "This meeting is being recorded for notes."
}
```

Platform support varies — works on Zoom, Google Meet, and Teams.

---

## Recording endpoints

### List Recordings

```
GET /api/v1/recording/?bot_id={bot_id}
```

### Retrieve Recording

```
GET /api/v1/recording/{recording_id}/
```

Returns recording metadata and `media_shortcuts` with download URLs for video, audio, and transcript files.

---

## Transcript endpoints

### List Transcripts

```
GET /api/v1/transcript/?recording_id={recording_id}
```

**Response:**

```json
{
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "transcript-uuid",
      "created_at": "2024-12-21T14:30:00Z",
      "status": {
        "code": "done",
        "sub_code": null,
        "updated_at": "2024-12-21T14:30:05Z"
      },
      "data": {
        "download_url": "https://...",
        "provider_data_download_url": "https://..."
      },
      "provider": {
        "recallai_streaming": {
          "language_code": "auto",
          "mode": "prioritize_accuracy"
        }
      },
      "diarization": {
        "use_separate_streams_when_available": true
      }
    }
  ]
}
```

### Retrieve Transcript

```
GET /api/v1/transcript/{transcript_id}/
```

Returns the same shape as a single item from the list endpoint. Use `data.download_url` to fetch the actual transcript content.

---

## Calendar endpoints (V2)

Calendar integration auto-schedules bots for meetings on connected calendars.

### Create Calendar User

```
POST /api/v2/calendar-users/
```

### Connect Google Calendar

Requires OAuth2 credentials for the user's Google Calendar. See the Recall docs for the full OAuth flow:
https://docs.recall.ai/docs/calendar-v2-google-calendar

### Connect Microsoft Outlook

Similar OAuth2 flow for Outlook calendars:
https://docs.recall.ai/docs/calendar-v2-microsoft-outlook

---

## Bot output endpoints

These let bots output media into meetings (for AI agent use cases).

### Output Video/Image

```
POST /api/v1/bot/{bot_id}/output_video/
```

Send images or video frames to the bot's camera feed in the meeting.

### Output Audio

```
POST /api/v1/bot/{bot_id}/output_audio/
```

Play audio through the bot's microphone in the meeting.

See https://docs.recall.ai/docs/output-video-in-meetings and https://docs.recall.ai/docs/output-audio-in-meetings for full details on building AI agents that participate in meetings.

---

## Error handling

### HTTP 507 — Insufficient capacity

Ad-hoc bot creation can return 507 when no bots are available. Required handling:

```
Retry every 30 seconds, up to 10 attempts.
After 10 failures, surface error and recommend scheduled bots.
```

### HTTP 429 — Rate limited

Read the `Retry-After` response header and wait exactly that long before retrying. Add small jitter.

### HTTP 400 — Bad request

Check the response body for field-level validation errors. Common causes:
- Invalid meeting URL format
- Missing required fields in recording_config
- Invalid ISO 8601 timestamp in join_at

### HTTP 401 — Unauthorized

API key is missing, invalid, or for the wrong region.

### HTTP 403 — Forbidden / CloudFront error

Usually means an invalid callback URL in Recall-facing config. Localhost and private IPs won't work.

### HTTP 404 — Not found

Bot ID doesn't exist in this region, or the bot was created in a different region.
