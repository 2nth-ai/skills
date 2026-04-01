#!/usr/bin/env node
/**
 * catalog/build.js
 * Walks the skill tree, finds every SKILL.md, and generates a styled HTML page
 * in the catalog/ directory mirroring the skill path.
 *
 * Output:  catalog/<domain>/<sub>/<skill>.html  (or index.html for manifests)
 * Source:  <domain>/<sub>/<skill>/SKILL.md
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CATALOG = __dirname;
const GITHUB_BASE = 'https://github.com/2nth-ai/skills/blob/main';

// ── Frontmatter parser ──────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const meta = {};

  // Simple line-by-line YAML (handles scalar values, arrays with "- item" lines)
  let currentKey = null;
  let inArray = false;
  for (const line of raw.split('\n')) {
    const arrayItem = line.match(/^\s{2}-\s+(.+)$/);
    const keyVal = line.match(/^(\w[\w-]*):\s*(.*)$/);
    const blockScalar = line.match(/^(\w[\w-]*):\s*\|$/);

    if (blockScalar) {
      currentKey = blockScalar[1];
      meta[currentKey] = '';
      inArray = false;
    } else if (arrayItem && currentKey && inArray) {
      meta[currentKey].push(arrayItem[1]);
    } else if (keyVal) {
      currentKey = keyVal[1];
      inArray = false;
      if (keyVal[2] === '') {
        // check if next line will be array items
        meta[currentKey] = [];
        inArray = true;
      } else {
        meta[currentKey] = keyVal[2].replace(/^["']|["']$/g, '');
      }
    } else if (currentKey && typeof meta[currentKey] === 'string' && line.startsWith('  ')) {
      // block scalar continuation
      meta[currentKey] += (meta[currentKey] ? '\n' : '') + line.trim();
    }
  }

  return { meta, body };
}

// ── Markdown → HTML ─────────────────────────────────────────────────────────

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || 'text';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const code = codeLines.join('\n')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      out.push(`<pre><code class="lang-${lang}">${code}</code></pre>`);
      i++;
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1]?.match(/^\|[\s\-|]+\|$/)) {
      const headers = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(h => `<th>${inlineHtml(h.trim())}</th>`).join('');
      i += 2; // skip separator
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => `<td>${inlineHtml(c.trim())}</td>`).join('');
        rows.push(`<tr>${cells}</tr>`);
        i++;
      }
      out.push(`<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h1 = line.match(/^# (.+)$/);
    if (h3) { out.push(`<h3>${inlineHtml(h3[1])}</h3>`); i++; continue; }
    if (h2) { out.push(`<h2>${inlineHtml(h2[1])}</h2>`); i++; continue; }
    if (h1) { out.push(`<h1>${inlineHtml(h1[1])}</h1>`); i++; continue; }

    // Unordered list
    if (line.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(`<li>${inlineHtml(lines[i].replace(/^[-*] /, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(`<li>${inlineHtml(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const qLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        qLines.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${inlineHtml(qLines.join(' '))}</blockquote>`);
      continue;
    }

    // HR
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      out.push('<hr>'); i++; continue;
    }

    // Blank line
    if (line.trim() === '') { out.push(''); i++; continue; }

    // Paragraph
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !lines[i].match(/^[#`>-]/) && !lines[i].match(/^\d+\. /) &&
           !lines[i].includes('|')) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${inlineHtml(paraLines.join(' '))}</p>`);
    } else {
      i++;
    }
  }

  return out.join('\n');
}

function inlineHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // inline code — restore < > inside code after escaping
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c.replace(/&lt;/g,'<').replace(/&gt;/g,'>')}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

// ── HTML template ────────────────────────────────────────────────────────────

function renderPage({ skillPath, meta, bodyHtml, githubUrl, depth }) {
  const themeRelPath = '../'.repeat(depth) + 'theme.css';
  const homeRelPath = '../'.repeat(depth);
  const domainRelPath = '../'.repeat(depth - 2) + 'index.html';

  const name = meta.name || skillPath;
  const parts = name.split('/');
  const breadcrumbs = parts.map((part, idx) => {
    if (idx === parts.length - 1) return `<span class="breadcrumb-current">${part}</span>`;
    return `<a href="#">${part}</a>`;
  }).join('<span class="breadcrumb-sep">›</span>');

  const requiresList = Array.isArray(meta.requires) && meta.requires.length
    ? `<div class="meta-requires">
        <span class="meta-label">requires:</span>
        ${meta.requires.map(r => `<a class="skill-chip" href="${'../'.repeat(depth)}${r.replace(/\//g, '/')}.html">${r}</a>`).join('')}
       </div>`
    : '';

  const improvesList = Array.isArray(meta.improves) && meta.improves.length
    ? `<div class="meta-requires">
        <span class="meta-label">improves:</span>
        ${meta.improves.map(r => `<a class="skill-chip" href="#">${r}</a>`).join('')}
       </div>`
    : '';

  const statusBadge = meta['metadata.status'] === 'stub' || (meta.metadata || '').includes('stub')
    ? '<span class="badge badge-stub">stub</span>'
    : '<span class="badge badge-prod">production</span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — 2nth.ai Skills</title>
  <link rel="stylesheet" href="${themeRelPath}">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }

    nav {
      position: sticky; top: 0; z-index: 100;
      background: var(--nav-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 900px; margin: 0 auto; padding: 0 24px; height: 56px;
      display: flex; align-items: center; gap: 8px;
    }
    .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 14px; flex: 1; flex-wrap: wrap; }
    .breadcrumb a { color: var(--brand); text-decoration: none; font-weight: 500; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb-sep { color: var(--text-faint); }
    .breadcrumb-current { color: var(--text-3); }
    .nav-actions { display: flex; align-items: center; gap: 8px; }

    .btn-icon {
      width: 36px; height: 36px; border: 1px solid var(--border); background: var(--bg-card);
      border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: var(--text-3); transition: border-color 0.15s, color 0.15s;
    }
    .btn-icon:hover { border-color: var(--border-strong); color: var(--text); }
    .btn-icon svg { width: 16px; height: 16px; fill: currentColor; }
    .icon-sun, .icon-moon { display: none; }
    html:not([data-theme="dark"]) .icon-sun { display: block; }
    html[data-theme="dark"] .icon-moon { display: block; }
    @media (prefers-color-scheme: dark) {
      html:not([data-theme]) .icon-sun { display: none; }
      html:not([data-theme]) .icon-moon { display: block; }
    }

    .btn-gh {
      display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 36px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
      color: var(--text-2); text-decoration: none; font-size: 13px; font-weight: 500;
      transition: border-color 0.15s, color 0.15s; white-space: nowrap;
    }
    .btn-gh:hover { border-color: var(--border-strong); color: var(--text); }
    .btn-gh svg { width: 16px; height: 16px; fill: currentColor; }

    /* ── Layout ── */
    .page { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }

    /* ── Skill header ── */
    .skill-header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .skill-path {
      font-family: var(--font-mono); font-size: 13px; color: var(--text-muted);
      margin-bottom: 8px;
    }
    .skill-header h1 {
      font-family: var(--font-display); font-size: clamp(28px, 4vw, 44px);
      letter-spacing: 0.03em; line-height: 1; margin-bottom: 12px;
    }
    .skill-desc { font-size: 16px; color: var(--text-3); max-width: 640px; margin-bottom: 16px; line-height: 1.5; }
    .skill-meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 16px; }

    .badge {
      display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px;
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .badge-prod { background: var(--tag-prod-bg); color: var(--tag-prod); }
    .badge-stub { background: var(--tag-stub-bg); color: var(--tag-stub); }
    .badge-beta { background: var(--tag-beta-bg); color: var(--tag-beta); }

    .meta-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .meta-requires { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .skill-chip {
      font-family: var(--font-mono); font-size: 12px;
      background: var(--brand-dim); border: 1px solid var(--brand-border);
      color: var(--brand); padding: 2px 8px; border-radius: 4px;
      text-decoration: none;
    }
    .skill-chip:hover { border-color: var(--brand); }

    /* ── Skill body (rendered markdown) ── */
    .skill-body { font-size: 15px; color: var(--text-2); }
    .skill-body h1 { font-family: var(--font-display); font-size: 32px; letter-spacing: 0.03em; margin: 40px 0 12px; color: var(--text); }
    .skill-body h2 {
      font-family: var(--font-display); font-size: 22px; letter-spacing: 0.04em;
      margin: 36px 0 12px; color: var(--text); padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .skill-body h3 { font-size: 16px; font-weight: 600; margin: 24px 0 8px; color: var(--text); }
    .skill-body p { margin-bottom: 14px; line-height: 1.65; }
    .skill-body ul, .skill-body ol { margin: 0 0 14px 20px; }
    .skill-body li { margin-bottom: 6px; line-height: 1.55; }
    .skill-body pre {
      background: var(--code-bg); color: var(--code-text);
      font-family: var(--font-mono); font-size: 13px;
      border: 1px solid var(--border); border-radius: 8px;
      padding: 16px 20px; overflow-x: auto; margin: 16px 0;
      line-height: 1.5;
    }
    .skill-body code {
      font-family: var(--font-mono); font-size: 13px;
      background: var(--code-bg); color: var(--code-text);
      padding: 1px 5px; border-radius: 3px;
    }
    .skill-body pre code { background: none; padding: 0; }
    .skill-body blockquote {
      border-left: 3px solid var(--brand); padding: 8px 16px;
      background: var(--brand-dim); border-radius: 0 6px 6px 0;
      color: var(--text-3); margin: 16px 0; font-style: italic;
    }
    .skill-body table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .skill-body th {
      background: var(--bg-subtle); text-align: left; padding: 8px 12px;
      border: 1px solid var(--border); font-weight: 600; color: var(--text);
    }
    .skill-body td { padding: 8px 12px; border: 1px solid var(--border); color: var(--text-2); }
    .skill-body tr:nth-child(even) td { background: var(--bg-subtle); }
    .skill-body a { color: var(--brand); text-decoration: none; }
    .skill-body a:hover { text-decoration: underline; }
    .skill-body hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
    .skill-body strong { color: var(--text); }

    /* ── Footer nav ── */
    .page-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-back {
      display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid var(--border); color: var(--text-2); background: var(--bg-card);
      padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px;
      transition: border-color 0.15s;
    }
    .btn-back:hover { border-color: var(--border-strong); }

    @media (max-width: 600px) {
      .page { padding: 24px 16px 60px; }
    }
  </style>
</head>
<body>
  <script>
    (function(){
      var s = localStorage.getItem('2nth-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (s === 'dark' || (!s && prefersDark)) document.documentElement.setAttribute('data-theme','dark');
    })();
  </script>

  <nav>
    <div class="nav-inner">
      <div class="breadcrumb">
        <a href="${homeRelPath}">2nth.ai Skills</a>
        <span class="breadcrumb-sep">›</span>
        ${breadcrumbs}
      </div>
      <div class="nav-actions">
        <a class="btn-gh" href="${githubUrl}" target="_blank" rel="noopener">
          <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          SKILL.md
        </a>
        <button class="btn-icon" id="theme-toggle" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 16 16"><path d="M8 12a4 4 0 100-8 4 4 0 000 8zm0-10a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100 2 1 1 0 000-2zm7-5a1 1 0 100-2 1 1 0 000 2zM1 8a1 1 0 100-2 1 1 0 000 2zm12.07-5.07a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zM3.34 13.07a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zm9.73 0a1 1 0 101.41-1.41 1 1 0 00-1.41 1.41zM2.93 3.93a1 1 0 10-1.41 1.41 1 1 0 001.41-1.41z"/></svg>
          <svg class="icon-moon" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/></svg>
        </button>
      </div>
    </div>
  </nav>

  <div class="page">
    <div class="skill-header">
      <div class="skill-path">${name}</div>
      <h1>${parts[parts.length - 1].toUpperCase().replace(/-/g, ' ')}</h1>
      ${meta.description ? `<p class="skill-desc">${meta.description.split('\n')[0].replace(/Use this skill when.*$/, '').trim()}</p>` : ''}
      <div class="skill-meta">
        ${statusBadge}
        ${meta.compatibility ? `<span style="font-size:13px;color:var(--text-muted)">${meta.compatibility}</span>` : ''}
        ${meta.version ? `<span style="font-size:13px;color:var(--text-muted)">v${meta.version}</span>` : ''}
      </div>
      ${requiresList}
      ${improvesList}
    </div>

    <div class="skill-body">
      ${bodyHtml}
    </div>

    <div class="page-footer">
      <a class="btn-back" href="../">← Back to Cloudflare</a>
      <a class="btn-back" href="${homeRelPath}">← All Domains</a>
      <a class="btn-back" href="${githubUrl}" target="_blank" rel="noopener">View on GitHub ↗</a>
    </div>
  </div>

  <script>
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    btn.addEventListener('click', () => {
      const isDark = html.getAttribute('data-theme') === 'dark';
      if (isDark) { html.removeAttribute('data-theme'); localStorage.setItem('2nth-theme','light'); }
      else { html.setAttribute('data-theme','dark'); localStorage.setItem('2nth-theme','dark'); }
    });
  </script>
</body>
</html>`;
}

// ── File walker ──────────────────────────────────────────────────────────────

function findSkillFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'catalog' || entry === '.git' || entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findSkillFiles(full, results);
    } else if (entry === 'SKILL.md') {
      results.push(full);
    }
  }
  return results;
}

// ── Domain colours (matches theme.css) ──────────────────────────────────────

const DOMAIN_COLORS = {
  biz: '#8b5cf6', edu: '#22c55e', fin: '#10b981',
  health: '#0ea5e9', leg: '#f59e0b', tech: '#06b6d4',
};

const DOMAIN_LABELS = {
  biz: 'Business', edu: 'Education', fin: 'Finance',
  health: 'Healthcare', leg: 'Legal', tech: 'Technology',
};

// ── Domain index page template ────────────────────────────────────────────────

function renderDomainIndex({ domain, meta, skills }) {
  const color = DOMAIN_COLORS[domain] || '#06b6d4';
  const label = DOMAIN_LABELS[domain] || domain.toUpperCase();
  const desc = (meta.description || '').split('\n')[0].trim();
  const ghUrl = `https://github.com/2nth-ai/skills/tree/main/${domain}`;

  const cards = skills.map(s => {
    const isStub = !s.hasFile;
    const localHref = s.localPath || null;
    const badge = isStub
      ? '<span class="badge badge-stub">stub</span>'
      : '<span class="badge badge-prod">production</span>';
    const primaryLink = localHref
      ? `<a class="card-link card-link-primary" href="${localHref}">View skill →</a>`
      : `<a class="card-link card-link-primary" href="${s.ghUrl}" target="_blank" rel="noopener">GitHub ↗</a>`;

    return `
        <div class="card${isStub ? ' card-stub' : ''}">
          <div class="card-header">
            <span class="card-name">${s.path}</span>
            <div class="card-badges">${badge}</div>
          </div>
          <p class="card-desc">${s.desc || 'Coming soon.'}</p>
          <div class="card-links">
            ${primaryLink}
            <a class="card-link" href="${s.ghUrl}" target="_blank" rel="noopener">GitHub ↗</a>
          </div>
        </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} — 2nth.ai Skills</title>
  <link rel="stylesheet" href="../theme.css">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; }

    nav {
      position: sticky; top: 0; z-index: 100;
      background: var(--nav-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; gap: 8px; }
    .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 14px; flex: 1; }
    .breadcrumb a { color: var(--brand); text-decoration: none; font-weight: 500; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb-sep { color: var(--text-faint); }
    .breadcrumb-current { color: var(--text-3); }
    .nav-actions { display: flex; align-items: center; gap: 8px; }

    .btn-icon { width: 36px; height: 36px; border: 1px solid var(--border); background: var(--bg-card); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-3); transition: border-color 0.15s, color 0.15s; }
    .btn-icon:hover { border-color: var(--border-strong); color: var(--text); }
    .btn-icon svg { width: 16px; height: 16px; fill: currentColor; }
    .icon-sun, .icon-moon { display: none; }
    html:not([data-theme="dark"]) .icon-sun { display: block; }
    html[data-theme="dark"] .icon-moon { display: block; }
    @media (prefers-color-scheme: dark) { html:not([data-theme]) .icon-sun { display: none; } html:not([data-theme]) .icon-moon { display: block; } }

    .btn-gh { display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 36px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-2); text-decoration: none; font-size: 13px; font-weight: 500; transition: border-color 0.15s; white-space: nowrap; }
    .btn-gh:hover { border-color: var(--border-strong); color: var(--text); }
    .btn-gh svg { width: 16px; height: 16px; fill: currentColor; }

    .hero { background: var(--bg-subtle); border-bottom: 1px solid var(--border); padding: 48px 24px 40px; }
    .hero-inner { max-width: 1200px; margin: 0 auto; }
    .hero-badge { display: inline-flex; align-items: center; gap: 6px; border: 1px solid; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; background: color-mix(in srgb, ${color} 12%, transparent); border-color: color-mix(in srgb, ${color} 25%, transparent); color: ${color}; }
    .hero h1 { font-family: var(--font-display); font-size: clamp(36px, 5vw, 56px); letter-spacing: 0.02em; color: var(--text); margin-bottom: 12px; line-height: 1; }
    .hero p { font-size: 18px; color: var(--text-3); max-width: 680px; }

    main { max-width: 1200px; margin: 40px auto; padding: 0 24px 80px; }

    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.2s, box-shadow 0.2s; }
    .card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); }
    .card-stub { opacity: 0.65; }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .card-name { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text); }
    .card-badges { display: flex; gap: 4px; }
    .card-desc { font-size: 14px; color: var(--text-3); line-height: 1.5; flex: 1; }
    .card-links { display: flex; gap: 8px; flex-wrap: wrap; }
    .card-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; padding: 5px 10px; border-radius: 6px; text-decoration: none; border: 1px solid var(--border); color: var(--text-3); transition: border-color 0.15s, color 0.15s; }
    .card-link:hover { border-color: var(--border-strong); color: var(--text); }
    .card-link-primary { background: var(--brand-dim); border-color: var(--brand-border); color: var(--brand); }
    .card-link-primary:hover { border-color: var(--brand); color: var(--brand); }

    .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-prod { background: var(--tag-prod-bg); color: var(--tag-prod); }
    .badge-stub { background: var(--tag-stub-bg); color: var(--tag-stub); }

    .page-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); }
    .btn-back { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border); color: var(--text-2); background: var(--bg-card); padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-back:hover { border-color: var(--border-strong); }

    @media (max-width: 600px) { main { padding: 16px 16px 60px; } .hero { padding: 32px 16px 28px; } .cards { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <script>(function(){ var s=localStorage.getItem('2nth-theme'); var d=window.matchMedia('(prefers-color-scheme: dark)').matches; if(s==='dark'||(!s&&d)) document.documentElement.setAttribute('data-theme','dark'); })();</script>
  <nav>
    <div class="nav-inner">
      <div class="breadcrumb">
        <a href="../">2nth.ai Skills</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${domain}</span>
      </div>
      <div class="nav-actions">
        <a class="btn-gh" href="${ghUrl}" target="_blank" rel="noopener">
          <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <button class="btn-icon" id="theme-toggle" aria-label="Toggle theme">
          <svg class="icon-sun" viewBox="0 0 16 16"><path d="M8 12a4 4 0 100-8 4 4 0 000 8zm0-10a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100 2 1 1 0 000-2zm7-5a1 1 0 100-2 1 1 0 000 2zM1 8a1 1 0 100-2 1 1 0 000 2zm12.07-5.07a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zM3.34 13.07a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zm9.73 0a1 1 0 101.41-1.41 1 1 0 00-1.41 1.41zM2.93 3.93a1 1 0 10-1.41 1.41 1 1 0 001.41-1.41z"/></svg>
          <svg class="icon-moon" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/></svg>
        </button>
      </div>
    </div>
  </nav>

  <div class="hero">
    <div class="hero-inner">
      <div class="hero-badge">${domain}</div>
      <h1>${label.toUpperCase()}</h1>
      <p>${desc}</p>
    </div>
  </div>

  <main>
    <div class="cards">${cards}</div>
    <div class="page-footer">
      <a class="btn-back" href="../">← All Domains</a>
    </div>
  </main>

  <script>
    const btn = document.getElementById('theme-toggle'), html = document.documentElement;
    btn.addEventListener('click', () => {
      const d = html.getAttribute('data-theme') === 'dark';
      if (d) { html.removeAttribute('data-theme'); localStorage.setItem('2nth-theme','light'); }
      else { html.setAttribute('data-theme','dark'); localStorage.setItem('2nth-theme','dark'); }
    });
  </script>
</body>
</html>`;
}

// ── Scan a domain for its skills ─────────────────────────────────────────────

function scanDomain(domain) {
  const domainDir = join(ROOT, domain);
  const skills = [];

  function scanDir(dir, prefix = '') {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }

    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'SKILL.md') continue;
      const full = join(dir, entry);
      if (!statSync(full).isDirectory()) continue;

      const skillPath = prefix ? `${prefix}/${entry}` : entry;
      const skillMdPath = join(full, 'SKILL.md');
      let hasFile = false, desc = '', meta = {};

      try {
        const content = readFileSync(skillMdPath, 'utf8');
        hasFile = true;
        const parsed = parseFrontmatter(content);
        meta = parsed.meta;
        // First numbered use case line, or fallback to first non-empty line
        const descLines = (meta.description || '').split('\n').map(l => l.trim()).filter(Boolean);
        const useCase = descLines.find(l => /^\(1\)/.test(l));
        desc = useCase ? useCase.replace(/^\(1\)\s*/, '') : (descLines.find(l => !l.startsWith('Use this')) || descLines[0] || '');
      } catch { /* no SKILL.md — stub */ }

      // Determine local catalog path for this skill
      let localPath = null;
      // Special case: tech/cloudflare has its own hand-written index
      if (domain === 'tech' && entry === 'cloudflare') {
        localPath = `cloudflare/`;
      } else {
        // Check if a generated html exists (skillPath may be nested, e.g. erp/woocommerce)
        const htmlPath = join(CATALOG, domain, `${skillPath}.html`);
        try {
          statSync(htmlPath);
          // Compute relative href from domain index to the html file
          localPath = `${skillPath}.html`;
        } catch { /* no html yet */ }
      }

      skills.push({
        path: skillPath,
        hasFile,
        desc,
        meta,
        ghUrl: `https://github.com/2nth-ai/skills/tree/main/${domain}/${skillPath}`,
        localPath,
      });

      // Recurse into subdirectories
      scanDir(full, skillPath);
    }
  }

  scanDir(domainDir);
  return skills;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const DOMAINS = ['biz', 'edu', 'fin', 'health', 'leg', 'tech'];
const skillFiles = findSkillFiles(ROOT);
let built = 0;

// 1. Generate individual skill pages
for (const skillPath of skillFiles) {
  const relToRoot = relative(ROOT, skillPath);           // e.g. tech/cloudflare/workers/SKILL.md
  const skillDir = dirname(relToRoot);                    // e.g. tech/cloudflare/workers
  const parts = skillDir.split('/');
  const depth = parts.length;                             // how deep in the tree

  const content = readFileSync(skillPath, 'utf8');
  const { meta, body } = parseFrontmatter(content);
  const bodyHtml = mdToHtml(body);

  // Output path: catalog/<skillDir>.html  (e.g. catalog/tech/cloudflare/workers.html)
  // Exception: top-level domain manifests → catalog/<domain>/index.html (already exist, skip)
  let outPath;
  if (depth === 1) {
    // domain manifest (e.g. tech/SKILL.md) — skip, handled by domain index below
    continue;
  } else {
    // leaf skill or subdomain manifest → flatten to parent dir + leaf name
    const parentDir = parts.slice(0, -1);
    const leafName = parts[parts.length - 1];

    // For AI sub-subdomain, flatten into cloudflare/
    if (parentDir.includes('ai') && parentDir.length > 2) {
      const cfDir = join(CATALOG, 'tech', 'cloudflare');
      outPath = join(cfDir, `${leafName}.html`);
    } else {
      outPath = join(CATALOG, ...parentDir, `${leafName}.html`);
    }
  }

  const githubUrl = `${GITHUB_BASE}/${relToRoot}`;
  const outDepth = outPath.replace(CATALOG + '/', '').split('/').length;

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderPage({
    skillPath: skillDir,
    meta,
    bodyHtml,
    githubUrl,
    depth: outDepth,
  }));

  console.log(`  ✓ ${relToRoot} → ${relative(CATALOG, outPath)}`);
  built++;
}

// 2. Generate domain index pages
console.log('\nBuilding domain indexes...');
for (const domain of DOMAINS) {
  const domainSkillPath = join(ROOT, domain, 'SKILL.md');
  let meta = {};
  try {
    const content = readFileSync(domainSkillPath, 'utf8');
    meta = parseFrontmatter(content).meta;
  } catch { /* no domain SKILL.md */ }

  const skills = scanDomain(domain);
  const html = renderDomainIndex({ domain, meta, skills });
  const outPath = join(CATALOG, domain, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log(`  ✓ ${domain}/ → ${relative(CATALOG, outPath)} (${skills.length} skills)`);
  built++;
}

console.log(`\nBuilt ${built} pages total.`);
