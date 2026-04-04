#!/usr/bin/env node
/**
 * build-tutor.js — generates a deployable AI tutor from a config file
 *
 * Usage:
 *   node build-tutor.js <config.json> [output-dir]
 *
 * Example:
 *   node build-tutor.js cfa-l1/tutor.config.json dist/cfa-l1
 *
 * Output: a complete Cloudflare Pages project ready to deploy
 */

const fs = require('fs');
const path = require('path');

const configPath = process.argv[2];
const outputDir = process.argv[3] || `dist/${path.basename(configPath, '.json').replace('.config', '')}`;

if (!configPath) {
  console.error('Usage: node build-tutor.js <config.json> [output-dir]');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const b = config.branding;
const bill = config.billing;

// Calculate days until exam
const examDate = new Date(config.exam_date);
const now = new Date();
const daysUntil = Math.max(0, Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)));
const monthsUntil = Math.ceil(daysUntil / 30);

// Icon SVGs
const ICONS = {
  book: '<path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>',
  brain: '<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
  chart: '<path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
  code: '<path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>',
};

const iconSvg = ICONS[b.logo_icon] || ICONS.book;

// Build subject buttons
const subjectButtons = [
  `<button class="subject-btn active" data-subject="all">All Topics</button>`,
  ...config.subjects.map(s => `<button class="subject-btn" data-subject="${s.id}">${s.label}</button>`)
].join('\n    ');

// Build subject JS maps
const subjectNames = { all: `All ${config.name} Topics` };
const subjectTopics = {};
config.subjects.forEach(s => {
  subjectNames[s.id] = s.label;
  subjectTopics[s.id] = s.topics;
});

// Build quick action buttons
const quickButtons = config.quick_actions.map(a =>
  `<button class="quick-btn" onclick="askQuick('${a.prompt.replace(/'/g, "\\'")}')">${a.label}</button>`
).join('\n    ');

// Build system prompt
const systemPromptBase = config.system_prompt_prefix
  .replace(/{name}/g, config.name)
  .replace(/{level}/g, config.level)
  .replace(/{exam_date}/g, config.exam_date)
  .replace(/{provider}/g, config.provider);

// Build welcome message
const welcomeMsg = config.welcome_message
  .replace(/{name}/g, config.name)
  .replace(/{level}/g, config.level)
  .replace(/{exam_date}/g, config.exam_date)
  .replace(/{provider}/g, config.provider);

// ═══ Generate HTML ═══
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name} ${config.level} — AI Tutor</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='${encodeURIComponent(b.accent)}'/><text x='16' y='22' text-anchor='middle' font-family='system-ui' font-weight='800' font-size='11' fill='white'>${config.id.slice(0,3).toUpperCase()}</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root{--bg:${b.bg};--card:${b.card};--border:rgba(0,0,0,0.06);--text:${b.text};--heading:${b.heading};--accent:${b.accent};--accent-dim:${b.accent_dim};--accent-light:${b.accent}12;--accent-border:${b.accent}2E;--muted:#8B8B9A;}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
    body{font-family:'Barlow',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;}
    .container{max-width:860px;margin:0 auto;width:100%;padding:0 1.5rem;}
    nav{border-bottom:1px solid var(--border);padding:.75rem 0;position:sticky;top:0;background:var(--bg);z-index:50;}
    nav .inner{display:flex;align-items:center;justify-content:space-between;}
    .logo{font-size:18px;font-weight:700;color:var(--accent);text-decoration:none;display:flex;align-items:center;gap:.5rem;}
    .logo .icon{width:28px;height:28px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;}
    .logo .icon svg{width:16px;height:16px;color:white;}
    .logo span{color:var(--muted);font-weight:400;font-size:14px;}
    .tag{font-family:'JetBrains Mono',monospace;font-size:10px;background:var(--accent-light);color:var(--accent);padding:3px 8px;border-radius:20px;}
    .subjects{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.25rem;}
    .subject-btn{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:.4rem .85rem;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;font-family:'Barlow',sans-serif;}
    .subject-btn:hover{border-color:var(--accent-border);color:var(--accent);background:var(--accent-light);}
    .subject-btn.active{border-color:var(--accent);color:white;background:var(--accent);}
    .chat-area{flex:1;display:flex;flex-direction:column;padding-bottom:1rem;}
    .messages{flex:1;overflow-y:auto;padding:1rem 0;}
    .message{margin-bottom:1.25rem;max-width:82%;}
    .message.user{margin-left:auto;}
    .message .bubble{padding:.85rem 1.1rem;font-size:14px;line-height:1.75;}
    .message.user .bubble{background:var(--accent);color:white;border-radius:18px 18px 4px 18px;}
    .message.ai .bubble{background:var(--card);border:1px solid var(--accent-border);color:var(--text);border-radius:18px 18px 18px 4px;box-shadow:0 1px 4px rgba(0,0,0,0.03);}
    .message.ai .bubble strong{color:var(--heading);} .message.ai .bubble em{color:var(--accent-dim);}
    .message.ai .bubble code{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--accent-light);padding:.2em .5em;border-radius:4px;color:var(--accent-dim);}
    .avatar-row{display:flex;align-items:center;gap:.5rem;margin-bottom:6px;}
    .message.user .avatar-row{justify-content:flex-end;}
    .role{font-size:12px;font-weight:600;color:var(--muted);}
    .message.user .role{color:var(--accent);} .message.ai .role{color:var(--accent-dim);}
    .avatar{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
    .avatar.tutor{background:var(--accent-light);color:var(--accent);border:1px solid var(--accent-border);}
    .avatar.user{background:var(--accent);color:white;}
    .input-area{border-top:1px solid var(--border);padding:1rem 0;}
    .input-row{display:flex;gap:.5rem;}
    .input-row input{flex:1;background:var(--card);border:1px solid var(--border);border-radius:24px;padding:.75rem 1.25rem;font-family:'Barlow',sans-serif;font-size:14px;color:var(--heading);outline:none;}
    .input-row input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-light);}
    .input-row input::placeholder{color:var(--muted);}
    .input-row button{background:var(--accent);border:none;color:white;border-radius:24px;padding:.75rem 1.5rem;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Barlow',sans-serif;}
    .input-row button:hover{background:var(--accent-dim);} .input-row button:disabled{opacity:.4;cursor:not-allowed;}
    .quick-actions{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem;}
    .quick-btn{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:.35rem .75rem;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;font-family:'Barlow',sans-serif;}
    .quick-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light);}
    .progress-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin:.5rem 0;}
    .progress-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .3s;}
    @media(max-width:640px){.subjects{gap:.3rem;}.subject-btn{font-size:11px;padding:.35rem .65rem;}.message{max-width:92%;}}
  </style>
</head>
<body>
<nav><div class="container inner">
  <a href="/" class="logo"><span class="icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${iconSvg}</svg></span>${config.name}<span>${config.level}</span></a>
  <div style="display:flex;align-items:center;gap:.75rem;"><span class="tag">${config.provider}</span><span class="tag">${monthsUntil} months to go</span></div>
</div></nav>
<div class="container" style="padding-top:1.5rem;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem;">
    <span style="font-size:13px;font-weight:600;color:var(--heading);">Study Progress</span>
    <span style="font-size:12px;color:var(--muted);">0 of ${config.subjects.length} topics reviewed</span>
  </div>
  <div class="progress-bar"><div class="progress-fill" style="width:0%;"></div></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin:.75rem 0 1rem;">
    <span style="font-size:12px;color:var(--muted);">Tokens: <strong id="token-display" style="color:var(--accent);">${bill.initial_tokens.toLocaleString()}</strong> <span>(~R${(bill.initial_tokens / bill.token_zar_rate).toLocaleString()})</span></span>
    <span style="font-size:11px;color:var(--muted);" id="token-used">Used this session: 0</span>
  </div>
  <div class="subjects" id="subjects">
    ${subjectButtons}
  </div>
  <div class="quick-actions">
    ${quickButtons}
  </div>
</div>
<div class="container chat-area">
  <div class="messages" id="messages">
    <div class="message ai">
      <div class="avatar-row"><div class="avatar tutor">${b.coach_initial}</div><div class="role">${b.coach_name}</div></div>
      <div class="bubble"><strong>${welcomeMsg}</strong></div>
    </div>
  </div>
  <div class="input-area">
    <form id="chat-form" class="input-row">
      <input type="text" id="user-input" placeholder="Ask a question, request practice problems..." autofocus>
      <button type="submit" id="send-btn">Send</button>
    </form>
  </div>
</div>
<script>
var currentSubject='all',conversationHistory=[],tokenBalance=${bill.initial_tokens},tokensUsedSession=0;
var SUBJECT_NAMES=${JSON.stringify(subjectNames)};
var SUBJECT_TOPICS=${JSON.stringify(subjectTopics)};
var SYSTEM_BASE=${JSON.stringify(systemPromptBase)};
var USER_NAME=${JSON.stringify(b.user_name)},USER_INIT=${JSON.stringify(b.user_initial)};
var COACH_NAME=${JSON.stringify(b.coach_name)},COACH_INIT=${JSON.stringify(b.coach_initial)};

function updateTokenDisplay(){
  document.getElementById('token-display').textContent=tokenBalance.toLocaleString();
  document.getElementById('token-used').textContent='Used this session: '+tokensUsedSession.toLocaleString();
  var zar=(tokenBalance/${bill.token_zar_rate}).toFixed(0);
  document.getElementById('token-display').parentElement.querySelector('span:last-child').textContent='(~R'+Number(zar).toLocaleString()+')';
}
document.getElementById('subjects').addEventListener('click',function(e){
  if(e.target.classList.contains('subject-btn')){
    document.querySelectorAll('.subject-btn').forEach(function(b){b.classList.remove('active');});
    e.target.classList.add('active');currentSubject=e.target.dataset.subject;
    addMessage('ai','Switched to <strong>'+SUBJECT_NAMES[currentSubject]+'</strong>. '+(SUBJECT_TOPICS[currentSubject]?'Topics: '+SUBJECT_TOPICS[currentSubject]+'.':'Ask me anything.')+'<br><br>What would you like to work on?');
  }
});
function askQuick(t){document.getElementById('user-input').value=t;document.getElementById('chat-form').dispatchEvent(new Event('submit'));}
document.getElementById('chat-form').addEventListener('submit',async function(e){
  e.preventDefault();var input=document.getElementById('user-input');var text=input.value.trim();if(!text)return;
  addMessage('user',escapeHtml(text));input.value='';
  var btn=document.getElementById('send-btn');btn.disabled=true;btn.textContent='...';
  var sysPrompt=SYSTEM_BASE+' Current focus: '+SUBJECT_NAMES[currentSubject]+'. '+(SUBJECT_TOPICS[currentSubject]?'Key topics: '+SUBJECT_TOPICS[currentSubject]+'. ':'');
  conversationHistory.push({role:'user',content:text});
  try{
    var res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:sysPrompt,messages:conversationHistory.slice(-10)})});
    var data=await res.json();var reply=data.reply||data.error||'Sorry, I could not generate a response.';
    conversationHistory.push({role:'assistant',content:reply});addMessage('ai',formatReply(reply));
    if(data.usage){tokensUsedSession+=data.usage.total||0;tokenBalance=Math.max(0,tokenBalance-(data.usage.total||0));updateTokenDisplay();}
  }catch(err){addMessage('ai','Network error — please try again.');}
  btn.disabled=false;btn.textContent='Send';
});
function addMessage(role,html){
  var div=document.createElement('div');div.className='message '+(role==='user'?'user':'ai');
  if(role==='user'){div.innerHTML='<div class="avatar-row"><div class="role">'+USER_NAME+'</div><div class="avatar user">'+USER_INIT+'</div></div><div class="bubble">'+html+'</div>';}
  else{div.innerHTML='<div class="avatar-row"><div class="avatar tutor">'+COACH_INIT+'</div><div class="role">'+COACH_NAME+'</div></div><div class="bubble">'+html+'</div>';}
  document.getElementById('messages').appendChild(div);div.scrollIntoView({behavior:'smooth',block:'end'});
}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function formatReply(t){return t.replace(/\\*\\*(.*?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.*?)\\*/g,'<em>$1</em>').replace(/\`(.*?)\`/g,'<code>$1</code>').replace(/\\n/g,'<br>');}
</script>
</body>
</html>`;

// ═══ Generate chat API ═══
const chatApi = `interface Env { AI: Ai; }
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  let body: { system?: string; messages?: Array<{ role: string; content: string }> };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }
  const system = body.system || 'You are a tutor.';
  const messages = body.messages || [];
  if (!messages.length) return Response.json({ error: 'No messages' }, { status: 400 });
  try {
    const aiMessages = [{ role: 'system', content: system }, ...messages.map(m => ({ role: m.role as 'user'|'assistant', content: m.content }))];
    const response = await env.AI.run('${bill.model}', { messages: aiMessages, max_tokens: ${bill.max_tokens}, temperature: ${bill.temperature} });
    const reply = (response as any).response || '';
    const inputTokens = Math.ceil(JSON.stringify(aiMessages).length / 4);
    const outputTokens = Math.ceil(reply.length / 4);
    return Response.json({ reply, usage: { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens } });
  } catch (err) { return Response.json({ error: 'AI failed: ' + (err as Error).message }, { status: 500 }); }
};`;

// ═══ Generate wrangler.toml ═══
const wrangler = `name = "${config.deploy.project_name}"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./public"

[ai]
binding = "AI"
`;

// ═══ Generate package.json ═══
const pkg = JSON.stringify({
  name: config.deploy.project_name,
  version: '1.0.0',
  private: true,
  scripts: {
    dev: 'wrangler pages dev public --ai=AI',
    deploy: `wrangler pages deploy public --project-name ${config.deploy.project_name}`,
  },
  devDependencies: { wrangler: '^4.0' },
}, null, 2);

// ═══ Write files ═══
const dirs = [
  outputDir,
  `${outputDir}/public`,
  `${outputDir}/functions/api`,
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

fs.writeFileSync(`${outputDir}/public/index.html`, html);
fs.writeFileSync(`${outputDir}/functions/api/chat.ts`, chatApi);
fs.writeFileSync(`${outputDir}/wrangler.toml`, wrangler);
fs.writeFileSync(`${outputDir}/package.json`, pkg);
fs.writeFileSync(`${outputDir}/.gitignore`, 'node_modules/\n.wrangler/\n');

console.log(`✅ Tutor generated: ${outputDir}/`);
console.log(`   Name:     ${config.name} ${config.level}`);
console.log(`   Subjects: ${config.subjects.length}`);
console.log(`   Model:    ${bill.model}`);
console.log(`   Tokens:   ${bill.initial_tokens.toLocaleString()}`);
console.log(`   Deploy:   cd ${outputDir} && npm install && npm run deploy`);
if (config.deploy.custom_domain) {
  console.log(`   Domain:   ${config.deploy.custom_domain} (add CNAME → ${config.deploy.project_name}.pages.dev)`);
}
