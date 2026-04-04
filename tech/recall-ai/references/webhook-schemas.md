# Recall.ai Webhook Schemas

Reference for all webhook event types, payload schemas, signature verification, and bot state machine.

## Table of contents

1. [Webhook setup](#webhook-setup)
2. [Signature verification](#signature-verification)
3. [Bot status webhooks](#bot-status-webhooks)
4. [Recording webhooks](#recording-webhooks)
5. [Transcript webhooks](#transcript-webhooks)
6. [Calendar webhooks](#calendar-webhooks)
7. [State management patterns](#state-management-patterns)

---

## Webhook setup

### Dashboard configuration

Register your webhook endpoint in the Recall dashboard:

```
https://{REGION}.recall.ai/dashboard/webhooks
```

**Endpoint format:** `https://your-domain.com/api/webhooks/recallai`

**Required event subscriptions:**
- `bot.*` — all bot lifecycle events
- `recording.done`
- `recording.failed`
- `transcript.done`
- `transcript.failed`

**Local development:** Use a stable tunnel URL (e.g., ngrok with a static domain). Recall cannot reach `localhost` or private IPs. Set up ngrok:

```bash
# Install ngrok and set up a static domain
ngrok http --url=your-static-domain.ngrok-free.app 3000
```

See https://docs.recall.ai/docs/local-webhook-development for the full local dev guide.

---

## Signature verification

Recall uses HMAC-based signature verification via Svix. The workspace verification secret is found in the Recall dashboard.

### Verification steps

1. Extract headers from the incoming request:
   - `svix-id`
   - `svix-timestamp`
   - `svix-signature`

2. Construct the signed content:
   ```
   signed_content = "{svix_id}.{svix_timestamp}.{raw_body}"
   ```

3. Compute HMAC-SHA256:
   ```python
   import hmac, hashlib, base64

   # The secret from dashboard starts with "whsec_"
   # Strip the prefix and base64-decode
   secret_bytes = base64.b64decode(webhook_secret.replace("whsec_", ""))

   signature = base64.b64encode(
       hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
   ).decode()
   ```

4. Compare with the signature in the header (the header may contain multiple signatures separated by spaces — match any one).

### Node.js example

```javascript
const crypto = require('crypto');

function verifyRecallWebhook(req, secret) {
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing Svix headers');
  }

  // Timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (Math.abs(now - ts) > 300) {
    throw new Error('Timestamp too old');
  }

  const rawBody = typeof req.body === 'string'
    ? req.body
    : JSON.stringify(req.body);

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64');
  const computed = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const expectedSigs = svixSignature.split(' ').map(s => s.split(',')[1] || s);
  const match = expectedSigs.some(sig => {
    try {
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sig));
    } catch {
      return false;
    }
  });

  if (!match) throw new Error('Invalid signature');
  return JSON.parse(rawBody);
}
```

### Python example

```python
import hmac
import hashlib
import base64
import time
import json

def verify_recall_webhook(headers: dict, raw_body: bytes, secret: str) -> dict:
    svix_id = headers.get('svix-id')
    svix_timestamp = headers.get('svix-timestamp')
    svix_signature = headers.get('svix-signature')

    if not all([svix_id, svix_timestamp, svix_signature]):
        raise ValueError('Missing Svix headers')

    # Timestamp check (5 min tolerance)
    ts = int(svix_timestamp)
    if abs(time.time() - ts) > 300:
        raise ValueError('Timestamp too old')

    signed_content = f"{svix_id}.{svix_timestamp}.{raw_body.decode()}"
    secret_bytes = base64.b64decode(secret.removeprefix('whsec_'))
    computed = base64.b64encode(
        hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
    ).decode()

    expected_sigs = [
        s.split(',')[1] if ',' in s else s
        for s in svix_signature.split(' ')
    ]
    if not any(hmac.compare_digest(computed, sig) for sig in expected_sigs):
        raise ValueError('Invalid signature')

    return json.loads(raw_body)
```

**Recommendation:** Use the official Svix library (`svix` on npm/pip) which handles all of this automatically:

```bash
npm install svix     # Node.js
pip install svix     # Python
```

```javascript
// Node.js with svix
const { Webhook } = require('svix');
const wh = new Webhook(process.env.RECALL_WEBHOOK_SECRET);
const payload = wh.verify(rawBody, headers);
```

---

## Bot status webhooks

Event pattern: `bot.*`

### Payload schema

```json
{
  "event": "bot.status_change",
  "data": {
    "data": {
      "code": "in_call_recording",
      "sub_code": null,
      "updated_at": "2024-12-21T14:01:00Z"
    },
    "bot": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "metadata": {}
    }
  }
}
```

### Bot status codes

These are the main status transitions a bot goes through:

| Code | Meaning |
|------|---------|
| `joining_call` | Bot is attempting to join the meeting |
| `in_waiting_room` | Bot is in the meeting's waiting room |
| `in_call_not_recording` | Bot is in the meeting but not yet recording |
| `recording_permission_allowed` | Host granted recording permission |
| `recording_permission_denied` | Host denied recording permission |
| `in_call_recording` | Bot is actively recording |
| `call_ended` | Meeting ended, bot is processing |
| `done` | All processing complete — artifacts are ready |
| `fatal` | Unrecoverable error — check `sub_code` for details |

### Common sub_codes for fatal status

| Sub Code | Meaning |
|----------|---------|
| `cannot_join_meeting` | Meeting URL invalid or meeting doesn't exist |
| `meeting_is_full` | Meeting has reached participant limit |
| `kicked_from_meeting` | Bot was removed by the host |
| `timeout_waiting_to_join` | Bot couldn't join within timeout |
| `meeting_ended_before_join` | Meeting ended before bot could join |

See https://docs.recall.ai/docs/sub-codes for the full sub_code reference.

### Typical happy-path sequence

```
joining_call → in_waiting_room (optional) → in_call_not_recording →
recording_permission_allowed (optional) → in_call_recording →
call_ended → done
```

---

## Recording webhooks

### recording.done

Fires when the recording has been processed and artifacts are available.

```json
{
  "event": "recording.done",
  "data": {
    "data": {
      "code": "done",
      "sub_code": null,
      "updated_at": "2024-12-21T14:35:00Z"
    },
    "recording": {
      "id": "824ad909-8736-4bb1-92d8-1639aa297cd2",
      "metadata": {}
    },
    "bot": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "metadata": {}
    }
  }
}
```

### recording.failed

```json
{
  "event": "recording.failed",
  "data": {
    "data": {
      "code": "failed",
      "sub_code": "no_audio_received",
      "updated_at": "2024-12-21T14:35:00Z"
    },
    "recording": {
      "id": "824ad909-...",
      "metadata": {}
    },
    "bot": {
      "id": "3fa85f64-...",
      "metadata": {}
    }
  }
}
```

---

## Transcript webhooks

### transcript.done

Fires when transcript processing is complete and ready for download.

```json
{
  "event": "transcript.done",
  "data": {
    "data": {
      "code": "done",
      "sub_code": null,
      "updated_at": "2024-12-21T14:36:00Z"
    },
    "transcript": {
      "id": "transcript-uuid",
      "metadata": {}
    },
    "recording": {
      "id": "824ad909-...",
      "metadata": {}
    },
    "bot": {
      "id": "3fa85f64-...",
      "metadata": {}
    }
  }
}
```

### transcript.failed

```json
{
  "event": "transcript.failed",
  "data": {
    "data": {
      "code": "failed",
      "sub_code": "zoom_global_captions_disabled",
      "updated_at": "2024-12-21T14:36:00Z"
    },
    "transcript": {
      "id": "transcript-uuid",
      "metadata": {}
    },
    "recording": {
      "id": "824ad909-...",
      "metadata": {}
    },
    "bot": {
      "id": "3fa85f64-...",
      "metadata": {}
    }
  }
}
```

### Common transcript failure sub_codes

| Sub Code | Meaning |
|----------|---------|
| `zoom_global_captions_disabled` | Zoom account has captions turned off |
| `no_speech_detected` | No audio was detected during the meeting |
| `transcription_provider_error` | Third-party transcription service failed |

---

## Calendar webhooks (V2)

If using Calendar V2 integration:

| Event | Fires when |
|-------|------------|
| `calendar.sync_events` | Calendar events have been synced |
| `calendar_event.created` | New calendar event detected |
| `calendar_event.updated` | Calendar event was modified |
| `calendar_event.deleted` | Calendar event was removed |

See https://docs.recall.ai/docs/calendar-v2-webhooks for full details.

---

## State management patterns

### Recommended minimal state per bot

```json
{
  "bot_id": "uuid",
  "recording_id": null,
  "transcript_id": null,
  "bot_status": "scheduled",
  "recording_status": null,
  "transcript_status": null,
  "transcript_failure_sub_code": null
}
```

### Update rules

- On `bot.*` → update `bot_status` (and optionally store `sub_code`)
- On `recording.done` → set `recording_id`, set `recording_status = "recording.done"`
- On `recording.failed` → set `recording_id`, set `recording_status = "recording.failed"`
- On `transcript.done` → set `transcript_id`, set `transcript_status = "transcript.done"`
- On `transcript.failed` → set `transcript_id`, set `transcript_status = "transcript.failed"`, store `sub_code`

### Handling out-of-order delivery

Webhooks can arrive in any order. Your handler should:

- Process each event independently
- Not require a specific prior state before updating
- Be safe to apply the same update multiple times (idempotent)
- Only update fields related to that event type

For example, if `transcript.done` arrives before `recording.done`, update transcript fields immediately without waiting for the recording event.

### Express.js webhook handler skeleton

```javascript
app.post('/api/webhooks/recallai', express.raw({ type: '*/*' }), (req, res) => {
  try {
    const payload = verifyRecallWebhook(req, process.env.RECALL_WEBHOOK_SECRET);
    const { event, data } = payload;
    const botId = data.bot.id;

    switch (true) {
      case event.startsWith('bot.'):
        updateBotStatus(botId, data.data.code, data.data.sub_code);
        break;
      case event === 'recording.done':
        updateRecordingStatus(botId, data.recording.id, 'recording.done');
        break;
      case event === 'recording.failed':
        updateRecordingStatus(botId, data.recording.id, 'recording.failed');
        break;
      case event === 'transcript.done':
        updateTranscriptStatus(botId, data.transcript.id, 'transcript.done');
        break;
      case event === 'transcript.failed':
        updateTranscriptStatus(botId, data.transcript.id, 'transcript.failed', data.data.sub_code);
        break;
    }

    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    res.status(400).send('Invalid webhook');
  }
});
```

### Flask webhook handler skeleton

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post('/api/webhooks/recallai')
def recall_webhook():
    try:
        payload = verify_recall_webhook(
            headers=dict(request.headers),
            raw_body=request.get_data(),
            secret=os.environ['RECALL_WEBHOOK_SECRET']
        )
    except ValueError as e:
        return str(e), 400

    event = payload['event']
    data = payload['data']
    bot_id = data['bot']['id']

    if event.startswith('bot.'):
        update_bot_status(bot_id, data['data']['code'], data['data'].get('sub_code'))
    elif event == 'recording.done':
        update_recording_status(bot_id, data['recording']['id'], 'recording.done')
    elif event == 'recording.failed':
        update_recording_status(bot_id, data['recording']['id'], 'recording.failed')
    elif event == 'transcript.done':
        update_transcript_status(bot_id, data['transcript']['id'], 'transcript.done')
    elif event == 'transcript.failed':
        update_transcript_status(
            bot_id, data['transcript']['id'], 'transcript.failed',
            data['data'].get('sub_code')
        )

    return 'ok', 200
```
