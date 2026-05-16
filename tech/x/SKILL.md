---
name: tech/x
description: |
  X (Twitter) API v2 skill. Use this skill when:
  (1) monitoring mentions and keywords in real-time via the filtered stream in a Cloudflare Worker,
  (2) polling for mentions with a Cron Trigger when stream access isn't available (Basic tier),
  (3) replying to tweets and mentions automatically with AI-drafted responses,
  (4) posting tweets and threads from a Cloudflare Worker,
  (5) sending and receiving X Direct Messages via the DM API v2,
  (6) authenticating with X — OAuth 2.0 PKCE for user context, Bearer token for public reads,
  (7) building the AI reply pattern — mention → Workers AI classify → Claude draft → post reply,
  (8) handling rate limits — per-endpoint windows, 429 backoff, and tier-based caps,
  (9) storing X conversation context in D1 and KV for multi-turn engagement,
  (10) filtering noise — dedup by tweet ID, skip retweets/own tweets, handle quote tweets.
license: MIT
compatibility: X API v2, OAuth 2.0 PKCE, Cloudflare Workers, Cron Triggers
homepage: https://skills.2nth.ai/tech/x
repository: https://github.com/2nth-ai/skills
requires:
  - tech
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "X, Twitter, Social Media, API v2, Mentions, DM, Streaming, AI, Automation"
allowed-tools: Read Write Edit Glob Grep
---

# X (Twitter) API v2

X is the real-time public conversation layer. For B2B and tech audiences, AI-powered mention monitoring and reply automation drives engagement and response time to near-zero.

**Tier reality check — pick your approach based on access:**

| Tier | Cost | Filtered stream | Monthly tweet cap | DMs |
|------|------|----------------|------------------|-----|
| Free | $0 | ✗ | 1,500 (write only) | ✗ |
| Basic | $100/mo | ✗ | 3,000 write / 10k read | ✓ |
| Pro | $5,000/mo | ✓ (500k rules) | 300k write / 1M read | ✓ |
| Enterprise | Custom | ✓ (full firehose) | Unlimited | ✓ |

**2nth.ai pattern for Basic tier:** Cron Trigger polls `GET /2/tweets/search/recent` every 5 minutes. For Pro+: filtered stream with a persistent Worker.

## Architecture

```
BASIC TIER (Cron polling):
  Cron Trigger (*/5 * * * *)
    → GET /2/tweets/search/recent?query=@youraccount
    → Filter: skip retweets, own tweets, already-processed IDs
    → Workers AI: classify intent
    → Claude via AI Gateway: draft reply
    → POST /2/tweets (reply_to tweet ID)
    → Store tweet ID in KV (dedup, 7-day TTL)

PRO TIER (Filtered stream):
  Worker fetch() with streaming response
    → GET /2/tweets/search/stream (persistent connection)
    → Parse SSE lines, extract tweet data
    → Same classify → draft → reply pipeline
    → ctx.waitUntil() for async processing
```

## Authentication

X uses three auth flows depending on what you're doing.

### App-only (Bearer token) — read public data
```typescript
// No user context needed. Read-only. Store as BEARER_TOKEN secret.
const headers = { Authorization: `Bearer ${env.BEARER_TOKEN}` };
```

### OAuth 2.0 PKCE — post tweets, DMs (user context)
```typescript
// Step 1: generate code verifier + challenge
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  // In practice, challenge = SHA-256 of verifier, but for Workers use:
  return { verifier, challenge: verifier }; // plain method for simplicity
}

// Step 2: redirect user to X auth
const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', env.X_CLIENT_ID);
authUrl.searchParams.set('redirect_uri', env.X_REDIRECT_URI);
authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read dm.read dm.write offline.access');
authUrl.searchParams.set('state', crypto.randomUUID());
authUrl.searchParams.set('code_challenge', pkce.challenge);
authUrl.searchParams.set('code_challenge_method', 'plain');

// Step 3: exchange code for tokens
async function exchangeCode(code: string, verifier: string, env: Env) {
  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: env.X_CLIENT_ID,
      redirect_uri: env.X_REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  const { access_token, refresh_token, expires_in } = await res.json();

  // Cache token in KV — refresh 5 min before expiry
  await env.KV.put('x_access_token', access_token, { expirationTtl: expires_in - 300 });
  await env.KV.put('x_refresh_token', refresh_token);
  return access_token;
}

// Step 4: refresh when expired
async function getXToken(env: Env): Promise<string> {
  const cached = await env.KV.get('x_access_token');
  if (cached) return cached;

  const refresh = await env.KV.get('x_refresh_token');
  if (!refresh) throw new Error('Not authenticated — re-run OAuth flow');

  const res = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
  });
  const { access_token, refresh_token: newRefresh, expires_in } = await res.json();
  await env.KV.put('x_access_token', access_token, { expirationTtl: expires_in - 300 });
  await env.KV.put('x_refresh_token', newRefresh);
  return access_token;
}
```

## Required secrets
```bash
wrangler secret put BEARER_TOKEN        # App-only token (read public data)
wrangler secret put X_CLIENT_ID         # OAuth 2.0 client ID
wrangler secret put X_CLIENT_SECRET     # OAuth 2.0 client secret
wrangler secret put X_REDIRECT_URI      # OAuth callback URL
wrangler secret put X_OWN_USER_ID       # Your account user ID (skip own tweets)
```

## Cron Trigger — mention polling (Basic tier)

Add to `wrangler.toml`:
```toml
[triggers]
crons = ["*/5 * * * *"]   # every 5 minutes
```

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(pollMentions(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // OAuth callback handler
    const url = new URL(request.url);
    if (url.pathname === '/callback') return handleOAuthCallback(url, env);
    return new Response('X Bot Worker');
  }
};

async function pollMentions(env: Env) {
  // Get since_id from KV to avoid reprocessing
  const sinceId = await env.KV.get('x_since_id');

  const params = new URLSearchParams({
    query: `@${env.X_HANDLE} -is:retweet -from:${env.X_OWN_USER_ID}`,
    'tweet.fields': 'author_id,created_at,conversation_id,in_reply_to_user_id',
    'user.fields': 'username,name',
    expansions: 'author_id',
    max_results: '10',
    ...(sinceId ? { since_id: sinceId } : {}),
  });

  const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` },
  });

  if (res.status === 429) {
    const reset = res.headers.get('x-rate-limit-reset');
    console.log(`Rate limited. Resets at ${new Date(Number(reset) * 1000).toISOString()}`);
    return;
  }

  const data = await res.json() as XSearchResponse;
  if (!data.data?.length) return;

  // Update since_id — newest tweet is first
  await env.KV.put('x_since_id', data.data[0].id, { expirationTtl: 86400 * 30 });

  const usersMap = Object.fromEntries(
    (data.includes?.users ?? []).map(u => [u.id, u])
  );

  // Process oldest-first (data comes newest-first)
  for (const tweet of [...data.data].reverse()) {
    await processMention(tweet, usersMap[tweet.author_id], env);
  }
}

async function processMention(tweet: XTweet, author: XUser | undefined, env: Env) {
  // Dedup — skip if already processed
  const seen = await env.KV.get(`x_processed:${tweet.id}`);
  if (seen) return;

  // Mark as processed immediately
  await env.KV.put(`x_processed:${tweet.id}`, '1', { expirationTtl: 86400 * 7 });

  const text = tweet.text.replace(/@\w+\s*/g, '').trim(); // strip @mentions
  if (!text) return;

  // Load thread context
  const ctxKey = `x_ctx:${tweet.conversation_id ?? tweet.id}`;
  const context = JSON.parse(await env.KV.get(ctxKey) ?? '[]') as string[];

  // Classify
  const { response: intent } = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'Classify as: product | support | feedback | spam | general. One word.' },
      { role: 'user', content: text.slice(0, 400) },
    ],
  });

  if (intent.trim() === 'spam') return; // don't engage with spam

  // Draft reply
  const username = author?.username ?? 'there';
  const reply = await draftReply(text, intent.trim(), username, context, env);

  // Post reply
  await postTweet(reply, tweet.id, env);

  // Update context
  context.push(`@${username}: ${text}`, `Bot: ${reply}`);
  await env.KV.put(ctxKey, JSON.stringify(context.slice(-8)), { expirationTtl: 86400 * 2 });

  // Store in D1
  await env.DB.prepare(
    'INSERT OR IGNORE INTO x_mentions (tweet_id, author_id, username, text, intent, ts) VALUES (?,?,?,?,?,?)'
  ).bind(tweet.id, tweet.author_id, username, text, intent.trim(), Date.now()).run();
}
```

## Filtered stream (Pro tier)

```typescript
// Add rules for what to stream
async function addStreamRule(value: string, tag: string, env: Env) {
  await fetch('https://api.twitter.com/2/tweets/search/stream/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.BEARER_TOKEN}` },
    body: JSON.stringify({ add: [{ value, tag }] }),
  });
}

// @youraccount mentions — excluding retweets and own tweets
await addStreamRule(`@2nthai -is:retweet -from:${ownUserId}`, 'mentions');
await addStreamRule(`"2nth.ai" -is:retweet lang:en`, 'brand');

// Connect to stream — NOTE: Workers have a 30s CPU limit per request
// Use a Durable Object or Queue for true persistent streaming
async function connectStream(env: Env) {
  const res = await fetch(
    'https://api.twitter.com/2/tweets/search/stream?tweet.fields=author_id,created_at&expansions=author_id',
    { headers: { Authorization: `Bearer ${env.BEARER_TOKEN}` } }
  );

  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    for (const line of chunk.split('\n')) {
      if (!line.trim() || line.trim() === '{}') continue; // heartbeat
      try {
        const event = JSON.parse(line) as XStreamEvent;
        await processMention(event.data, event.includes?.users?.[0], env);
      } catch { /* partial line — accumulate */ }
    }
  }
}
```

## Posting tweets

```typescript
async function postTweet(text: string, replyToId: string | null, env: Env) {
  const token = await getXToken(env);

  const body: Record<string, any> = { text };
  if (replyToId) body.reply = { in_reply_to_tweet_id: replyToId };

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const reset = res.headers.get('x-rate-limit-reset');
    throw new Error(`Rate limited until ${new Date(Number(reset) * 1000).toISOString()}`);
  }

  return res.json();
}

// Post a thread (split long content into connected tweets)
async function postThread(tweets: string[], env: Env) {
  let previousId: string | null = null;
  for (const text of tweets) {
    const result = await postTweet(text, previousId, env) as { data: { id: string } };
    previousId = result.data.id;
    await new Promise(r => setTimeout(r, 500)); // 0.5s gap between thread tweets
  }
}
```

## Direct Messages

```typescript
// Send a DM
async function sendDM(recipientId: string, text: string, env: Env) {
  const token = await getXToken(env);
  return fetch(`https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
}

// Read DM conversation (polling — no webhook for DMs on Basic)
async function getDMConversation(recipientId: string, env: Env) {
  const token = await getXToken(env);
  const res = await fetch(
    `https://api.twitter.com/2/dm_conversations/with/${recipientId}/dm_events?dm_event.fields=text,created_at,sender_id`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json() as Promise<{ data: XDMEvent[] }>;
}
```

## AI reply builder

```typescript
async function draftReply(
  text: string,
  intent: string,
  username: string,
  context: string[],
  env: Env
): Promise<string> {
  const contextStr = context.slice(-6).join('\n');

  const res = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are @2nthai on X. Reply to @${username}'s tweet. Be concise, direct, and useful — this is X, not a blog. Max 240 characters. No hashtag spam. No em-dashes. No bullet points.`,
      messages: [
        ...(contextStr ? [{ role: 'user', content: `Thread context:\n${contextStr}` }] : []),
        { role: 'user', content: text },
      ],
    }),
  }).then(r => r.json());

  const reply = res.content[0].text.trim();
  // Hard cap at 280 chars (X limit)
  return reply.length > 280 ? reply.slice(0, 277) + '...' : reply;
}
```

## TypeScript interfaces

```typescript
interface XSearchResponse {
  data?: XTweet[];
  includes?: { users?: XUser[] };
  meta?: { newest_id: string; oldest_id: string; result_count: number };
}

interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  conversation_id?: string;
  in_reply_to_user_id?: string;
}

interface XUser {
  id: string;
  name: string;
  username: string;
}

interface XStreamEvent {
  data: XTweet;
  includes?: { users?: XUser[] };
  matching_rules?: Array<{ id: string; tag: string }>;
}

interface XDMEvent {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
}
```

## D1 schema

```sql
CREATE TABLE x_mentions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  tweet_id  TEXT UNIQUE NOT NULL,
  author_id TEXT NOT NULL,
  username  TEXT,
  text      TEXT,
  intent    TEXT,
  ts        INTEGER NOT NULL
);

CREATE INDEX idx_x_author ON x_mentions(author_id);
CREATE INDEX idx_x_intent ON x_mentions(intent);
```

## Rate limits (2024 reference)

| Endpoint | Free | Basic | Pro |
|----------|------|-------|-----|
| GET /2/tweets/search/recent | ✗ | 60/15min | 300/15min |
| POST /2/tweets | 17/24h | 100/24h | 300/24h |
| GET /2/users/me/mentions | ✗ | 5/15min | 180/15min |
| Filtered stream connections | ✗ | ✗ | 50 |
| DM send | ✗ | 100/24h | 1,000/24h |

Always read `x-rate-limit-remaining` and `x-rate-limit-reset` headers. Log and skip on 429 — never retry in a tight loop.

## Gotchas

- **Cron gaps vs stream** — Basic tier has no stream, so a 5-minute cron means you respond up to 5 minutes late. For near-real-time on Basic, reduce to `*/1 * * * *` but watch the search rate limit (60 req/15min = 4/min max).
- **Own tweet echoes** — `GET /2/users/me/mentions` returns your own @-mentions. Always filter `author_id !== env.X_OWN_USER_ID` or use `-from:yourid` in the query.
- **Retweet noise** — always add `-is:retweet` to search queries. RTs flood the results without any reply intent.
- **280 char hard cap** — X rejects tweets over 280 characters with a 400. Always truncate before posting.
- **Conversation context** — `conversation_id` is the ID of the root tweet in a thread. Key your KV context on `conversation_id`, not individual tweet IDs, for multi-turn thread support.
- **OAuth 2.0 token refresh** — refresh tokens are single-use. When you refresh, store the new refresh token immediately. If you lose it, the user must re-authenticate.
- **`since_id` drift** — if your Worker is down for >7 days, tweets older than 7 days fall outside the recent search window. The bot will miss that gap silently. Log and alert if `since_id` is >6 days old.
- **No webhook on Basic** — unlike Meta and Slack, X doesn't push events to you unless you're on Account Activity API (Enterprise). Polling is the only option on Free/Basic.
- **Quote tweet text** — quoted tweet text is not in `tweet.text`. Use `expansions=referenced_tweets.id` and `tweet.fields=text` to get the quoted content if needed for context.
