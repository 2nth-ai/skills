---
name: tech/elevenlabs
description: |
  ElevenLabs voice AI skill. Use when:
  (1) generating realistic speech from text — TTS with 70+ languages, emotional control, streaming,
  (2) cloning a voice — instant clone from audio sample or professional clone from 60s+ recording,
  (3) transcribing audio — speech-to-text at 20-50x real-time, 90+ languages,
  (4) building voice agents — conversational AI with phone/web/WhatsApp deployment, WebSocket streaming,
  (5) converting voices — speech-to-speech with emotion preservation,
  (6) dubbing and translation — translate and re-voice content in multiple languages,
  (7) generating sound effects or music — AI-generated audio assets.
license: MIT
compatibility: ElevenLabs API v1, Python SDK, TypeScript/JavaScript SDK, React SDK
homepage: https://skills.2nth.ai/tech/elevenlabs
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "ElevenLabs, TTS, text-to-speech, voice cloning, speech-to-text, voice agents, dubbing, sound effects, conversational AI, audio"
---

# ElevenLabs

ElevenLabs is a voice AI platform providing ultra-realistic text-to-speech, voice cloning, speech-to-text, and conversational AI agents. In the 2nth.ai stack it fills the voice layer — adding spoken interaction to Cloudflare Worker-based agents, AWS Connect contact flows, or any web/mobile surface.

> **Stub** — full skill pending. Core patterns documented below.

## Capabilities

| Feature | API | Models | Use case |
|---------|-----|--------|---------|
| **Text-to-Speech** | `POST /v1/text-to-speech/:voice_id` | eleven_v3, flash_v2_5, turbo_v2_5, multilingual_v2 | Narration, IVR prompts, notifications |
| **Streaming TTS** | `POST /v1/text-to-speech/:voice_id/stream` | Same | Real-time voice agents, low-latency playback |
| **Speech-to-Text** | `POST /v1/speech-to-text` | Scribe v1 | Transcription, meeting notes, call analytics |
| **Voice Cloning** | `POST /v1/voices/add` | — | Brand voice, character voices, personalisation |
| **Speech-to-Speech** | `POST /v1/speech-to-speech/:voice_id` | — | Voice conversion with emotion preservation |
| **Conversational AI** | Agents API + WebSocket | flash_v2_5 | Phone bots, web chat agents, WhatsApp |
| **Dubbing** | `POST /v1/dubbing` | — | Localise video/audio to other languages |
| **Sound Effects** | `POST /v1/sound-generation` | — | UI sounds, game audio, video production |
| **Music** | `POST /v1/music` | — | Background music, jingles |
| **Voice Library** | `GET /v1/voices` | — | 10,000+ pre-built voices |

## Authentication

```bash
# All requests use xi-api-key header
export ELEVENLABS_API_KEY="your-api-key-here"

curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/voices
```

## Models

| Model | Latency | Languages | Best for |
|-------|---------|-----------|---------|
| `eleven_v3` | ~500ms | 70+ | Highest expressiveness, narration, long-form |
| `eleven_flash_v2_5` | ~75ms | 70+ | Real-time agents, IVR, live interaction |
| `eleven_turbo_v2_5` | ~250ms | 70+ | Interactive use, balanced quality/speed |
| `eleven_multilingual_v2` | ~400ms | 32+ | Consistent multilingual quality, up to 10K chars |

## Text-to-speech (TypeScript)

```typescript
import ElevenLabs from 'elevenlabs';

const client = new ElevenLabs({ apiKey: process.env.ELEVENLABS_API_KEY });

// Generate and save to file
const audio = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
  text: 'Hello from ElevenLabs.',
  model_id: 'eleven_flash_v2_5',
  voice_settings: {
    stability: 0.5,        // 0–1: lower = more expressive variation
    similarity_boost: 0.75, // 0–1: how closely to match the cloned voice
    style: 0.0,
    use_speaker_boost: true,
  },
  output_format: 'mp3_44100_128',
});

// audio is a ReadableStream — pipe to file or Response
const fs = await import('fs');
const writer = fs.createWriteStream('output.mp3');
for await (const chunk of audio) writer.write(chunk);
writer.end();
```

## Streaming TTS (Cloudflare Worker)

```typescript
// Stream directly to the client — no buffering
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { text } = await req.json() as { text: string };

    const upstream = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb/stream',
      {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          output_format: 'mp3_44100_128',
        }),
      }
    );

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store',
      },
    });
  },
};
```

## Speech-to-text (Python)

```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="your-api-key")

with open("audio.mp3", "rb") as f:
    transcript = client.speech_to_text.convert(
        file=f,
        model_id="scribe_v1",
        language_code="en",  # omit for auto-detect
        diarize=True,        # speaker labels
        timestamps_granularity="word",
    )

for utterance in transcript.utterances:
    print(f"[{utterance.speaker}] {utterance.text}")
```

## Voice cloning (instant)

```typescript
// Instant clone — 30s+ audio sample, results in seconds
const formData = new FormData();
formData.append('name', 'My Brand Voice');
formData.append('description', 'Cloned from our CEO recording');
formData.append('files', new Blob([audioBuffer], { type: 'audio/mp3' }), 'sample.mp3');
formData.append('remove_background_noise', 'true');

const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
  method: 'POST',
  headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
  body: formData,
});
const { voice_id } = await response.json();
// Use voice_id in subsequent TTS calls
```

## Conversational AI agent (WebSocket)

```typescript
import { ElevenLabs } from '@elevenlabs/react'; // React SDK
// or use raw WebSocket for non-React environments

const ws = new WebSocket(
  `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`
);

ws.onopen = () => {
  // Send audio chunks (PCM 16kHz mono) or text input
  ws.send(JSON.stringify({ type: 'user_audio_chunk', user_audio_chunk: base64Audio }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'audio') {
    // Play base64-encoded audio response
    playAudio(msg.audio_event.audio_base_64);
  }
  if (msg.type === 'agent_response') {
    console.log('Agent said:', msg.agent_response_event.agent_response);
  }
};
```

## Pricing (API)

| Model | Per 1,000 characters |
|-------|---------------------|
| Flash / Turbo (`flash_v2_5`, `turbo_v2_5`) | $0.06 |
| Standard / v3 (`multilingual_v2`, `eleven_v3`) | $0.12 |
| Speech-to-text | per audio minute (see dashboard) |

Free tier: 10,000 credits/month (~10 min high-quality TTS), no commercial rights.

## Gotchas

- **Voice ID is immutable** — clone a new voice rather than updating an existing one; cloned voice IDs change if you delete and re-add
- **Instant clone quality** — background noise significantly degrades clone quality; always pass `remove_background_noise: true` and use a clean 60s+ sample for best results
- **`eleven_v3` 10K char limit** — multilingual_v2 supports up to 10,000 characters per request; v3 has a lower limit — split long content at sentence boundaries
- **Streaming + Cloudflare Workers** — Workers support streaming responses natively; avoid buffering the full audio blob before returning
- **Latency for IVR** — use `eleven_flash_v2_5` (~75ms) for Amazon Connect or Twilio IVR; standard models add perceptible delay
- **Rate limits** — free/starter tiers have concurrent request limits; implement a queue for burst workloads
- **Commercial rights** — free tier has no commercial rights; Pro plan ($99/mo) required for commercial use

## See also

- `tech/aws/connect` — Amazon Connect IVR; swap Connect's Polly TTS for ElevenLabs via Lambda
- `tech/cloudflare/workers` — stream ElevenLabs audio directly from a Worker
- `tech/cisco/collaboration` — add voice AI layer to Webex/CUCM contact flows
