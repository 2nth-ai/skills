# Recall.ai Transcript Guide

How to retrieve, parse, and convert Recall.ai transcripts into human-readable format.

## Table of contents

1. [Transcript retrieval flow](#transcript-retrieval-flow)
2. [Raw transcript format](#raw-transcript-format)
3. [Converting to readable transcript](#converting-to-readable-transcript)
4. [Real-time vs async transcription](#real-time-vs-async-transcription)
5. [Diarization](#diarization)
6. [Language support](#language-support)

---

## Transcript retrieval flow

After receiving the `transcript.done` webhook:

### Step 1: Get the transcript object

```bash
curl -X GET "https://${RECALL_REGION}.recall.ai/api/v1/transcript/${TRANSCRIPT_ID}/" \
  -H "Authorization: Token ${RECALL_API_KEY}"
```

### Step 2: Download the transcript data

The response contains `data.download_url` — an S3 pre-signed URL. Fetch it:

```bash
curl -o transcript.json "$(jq -r '.data.download_url' response.json)"
```

### Step 3: Parse and use

The downloaded file is a JSON array of utterance segments. See format below.

### Alternative: via Bot Retrieve

You can also get the transcript download URL directly from the bot object:

```bash
curl -X GET "https://${RECALL_REGION}.recall.ai/api/v1/bot/${BOT_ID}/" \
  -H "Authorization: Token ${RECALL_API_KEY}"
```

Look in: `recordings[0].media_shortcuts.transcript.data.download_url`

---

## Raw transcript format

The downloaded transcript is a JSON array of utterance segments:

```json
[
  {
    "words": [
      {
        "text": "Hello",
        "start_timestamp": {
          "relative": 0.0,
          "absolute": "2024-12-21T14:01:00.000Z"
        },
        "end_timestamp": {
          "relative": 0.5,
          "absolute": "2024-12-21T14:01:00.500Z"
        }
      },
      {
        "text": "everyone,",
        "start_timestamp": {
          "relative": 0.5,
          "absolute": "2024-12-21T14:01:00.500Z"
        },
        "end_timestamp": {
          "relative": 1.1,
          "absolute": "2024-12-21T14:01:01.100Z"
        }
      },
      {
        "text": "let's",
        "start_timestamp": {
          "relative": 1.2,
          "absolute": "2024-12-21T14:01:01.200Z"
        },
        "end_timestamp": {
          "relative": 1.5,
          "absolute": "2024-12-21T14:01:01.500Z"
        }
      },
      {
        "text": "get",
        "start_timestamp": {
          "relative": 1.5,
          "absolute": "2024-12-21T14:01:01.500Z"
        },
        "end_timestamp": {
          "relative": 1.7,
          "absolute": "2024-12-21T14:01:01.700Z"
        }
      },
      {
        "text": "started.",
        "start_timestamp": {
          "relative": 1.7,
          "absolute": "2024-12-21T14:01:01.700Z"
        },
        "end_timestamp": {
          "relative": 2.2,
          "absolute": "2024-12-21T14:01:02.200Z"
        }
      }
    ],
    "language_code": "en",
    "participant": {
      "id": 1,
      "name": "Alice Johnson",
      "is_host": true,
      "platform": "zoom",
      "extra_data": {},
      "email": "alice@example.com"
    }
  },
  {
    "words": [
      {
        "text": "Sounds",
        "start_timestamp": { "relative": 3.0 },
        "end_timestamp": { "relative": 3.3 }
      },
      {
        "text": "good.",
        "start_timestamp": { "relative": 3.3 },
        "end_timestamp": { "relative": 3.7 }
      }
    ],
    "language_code": "en",
    "participant": {
      "id": 2,
      "name": "Bob Smith",
      "is_host": false,
      "platform": "zoom",
      "extra_data": {},
      "email": null
    }
  }
]
```

### Field reference

**Segment level:**

| Field | Type | Description |
|-------|------|-------------|
| `words` | array | Word-level transcript data |
| `language_code` | string | Detected language (ISO 639-1) |
| `participant` | object | Speaker identity info |

**Word level:**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | The transcribed word/token |
| `start_timestamp.relative` | float | Seconds from recording start |
| `start_timestamp.absolute` | string | ISO 8601 wall clock time (may be null) |
| `end_timestamp.relative` | float | Seconds from recording start |
| `end_timestamp.absolute` | string | ISO 8601 wall clock time (may be null) |

**Participant level:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Unique participant ID for this meeting |
| `name` | string | Display name in the meeting |
| `is_host` | boolean | Whether this participant is the meeting host |
| `platform` | string | Meeting platform (zoom, google_meet, teams, etc.) |
| `email` | string/null | Participant email when available |

---

## Converting to readable transcript

The raw format is word-level. Most applications need sentence-level or paragraph-level output. Here's how to convert:

### JavaScript implementation

```javascript
function convertToReadableTranscript(rawTranscript) {
  const readable = [];

  for (const segment of rawTranscript) {
    if (!segment.words || segment.words.length === 0) continue;

    const paragraph = segment.words.map(w => w.text).join(' ');
    const startTs = segment.words[0].start_timestamp;
    const endTs = segment.words[segment.words.length - 1].end_timestamp;

    readable.push({
      speaker: segment.participant?.name || `Speaker ${segment.participant?.id || 'Unknown'}`,
      paragraph: paragraph,
      start_timestamp: {
        relative: startTs?.relative ?? null,
        absolute: startTs?.absolute ?? null
      },
      end_timestamp: {
        relative: endTs?.relative ?? null,
        absolute: endTs?.absolute ?? null
      }
    });
  }

  return readable;
}
```

### Python implementation

```python
def convert_to_readable_transcript(raw_transcript: list) -> list:
    readable = []

    for segment in raw_transcript:
        words = segment.get('words', [])
        if not words:
            continue

        paragraph = ' '.join(w['text'] for w in words)
        start_ts = words[0].get('start_timestamp', {})
        end_ts = words[-1].get('end_timestamp', {})
        participant = segment.get('participant', {})

        readable.append({
            'speaker': participant.get('name') or f"Speaker {participant.get('id', 'Unknown')}",
            'paragraph': paragraph,
            'start_timestamp': {
                'relative': start_ts.get('relative'),
                'absolute': start_ts.get('absolute')
            },
            'end_timestamp': {
                'relative': end_ts.get('relative'),
                'absolute': end_ts.get('absolute')
            }
        })

    return readable
```

### Readable output format

```json
[
  {
    "speaker": "Alice Johnson",
    "paragraph": "Hello everyone, let's get started.",
    "start_timestamp": { "relative": 0.0, "absolute": "2024-12-21T14:01:00.000Z" },
    "end_timestamp": { "relative": 2.2, "absolute": "2024-12-21T14:01:02.200Z" }
  },
  {
    "speaker": "Bob Smith",
    "paragraph": "Sounds good.",
    "start_timestamp": { "relative": 3.0, "absolute": null },
    "end_timestamp": { "relative": 3.7, "absolute": null }
  }
]
```

### Formatting as plain text

```javascript
function transcriptToText(readable) {
  return readable.map(entry => {
    const mins = Math.floor(entry.start_timestamp.relative / 60);
    const secs = Math.floor(entry.start_timestamp.relative % 60);
    const ts = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `[${ts}] ${entry.speaker}: ${entry.paragraph}`;
  }).join('\n');
}
```

Output:
```
[00:00] Alice Johnson: Hello everyone, let's get started.
[00:03] Bob Smith: Sounds good.
```

---

## Real-time vs async transcription

### Async (post-call) — covered above

- Transcript is generated automatically when configured in the Create Bot request
- Available after `transcript.done` webhook fires
- Best for: meeting summaries, searchable archives, post-call analysis

### Real-time (during call)

Real-time transcription delivers utterances as they happen via webhook or WebSocket. This is a different workflow from the async approach covered in this guide.

**Real-time webhook endpoint setup:**

Configure `realtime_endpoints` in the bot's `recording_config`:

```json
{
  "recording_config": {
    "realtime_endpoints": [
      {
        "type": "webhook",
        "url": "https://your-domain.com/api/realtime-transcript",
        "events": ["transcript.utterance"]
      }
    ],
    "transcript": {
      "provider": {
        "recallai_streaming": {
          "mode": "prioritize_latency",
          "language_code": "auto"
        }
      }
    }
  }
}
```

**Real-time WebSocket:**

Connect to the bot's WebSocket endpoint for live transcript streaming. See https://docs.recall.ai/docs/real-time-websocket-endpoints for details.

Use `prioritize_latency` mode for real-time use cases where speed matters more than accuracy.

---

## Diarization

Diarization = identifying who said what.

### Configuration

Set in the Create Bot request:

```json
{
  "recording_config": {
    "transcript": {
      "diarization": {
        "use_separate_streams_when_available": true
      }
    }
  }
}
```

When `use_separate_streams_when_available` is `true`, Recall uses per-participant audio streams for diarization (when the platform supports it). This gives much better speaker attribution accuracy than acoustic-based diarization.

### Perfect diarization

On platforms that provide separate audio streams per participant (Zoom, Google Meet), Recall can achieve near-perfect diarization. Each segment in the transcript is tagged with the correct `participant` object.

See https://docs.recall.ai/docs/perfect-diarization for platform-specific details.

---

## Language support

### Recall.ai Transcription (`recallai_streaming`)

Supports 50+ languages with automatic detection when `language_code: "auto"` is set.

Common language codes:
- `en` — English
- `es` — Spanish
- `fr` — French
- `de` — German
- `pt` — Portuguese
- `ja` — Japanese
- `ko` — Korean
- `zh` — Chinese
- `ar` — Arabic
- `hi` — Hindi

### Meeting captions

Language support depends on the meeting platform's caption capabilities.

### Multilingual meetings

For meetings with multiple languages, use `language_code: "auto"` and each segment will be tagged with its detected language in the `language_code` field.

See https://docs.recall.ai/docs/multilingual-transcription for the full language list and best practices.
