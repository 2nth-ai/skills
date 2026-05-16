#!/usr/bin/env node
/**
 * validate-skill.mjs
 *
 * Validates SKILL.md files changed in a PR against SKILL_FORMAT.md spec.
 * Exit code 0 = all pass, 1 = failures found.
 *
 * Usage: node validate-skill.mjs <file1> [file2] ...
 * Or pipe changed files: git diff --name-only | grep SKILL.md | xargs node validate-skill.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

// ── Frontmatter parser (aligned with catalog/build.js) ─────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const meta = {};

  // Container types: 'multiline-string' | 'array' | 'map' | 'undetermined' | null
  let currentKey = null;
  let containerType = null;

  const strip = v => v.replace(/^["']|["']$/g, '');

  for (const line of raw.split('\n')) {
    const topKeyVal       = line.match(/^(\w[\w-]*):\s*(.*)$/);
    const blockScalar     = line.match(/^(\w[\w-]*):\s*\|$/);
    const indentedArray   = line.match(/^\s{2}-\s+(.+)$/);
    const indentedKeyVal  = line.match(/^\s{2,}(\w[\w-]*):\s*(.*)$/);

    if (blockScalar) {
      currentKey = blockScalar[1];
      meta[currentKey] = '';
      containerType = 'multiline-string';
    } else if (topKeyVal) {
      currentKey = topKeyVal[1];
      if (topKeyVal[2] === '') {
        // Empty value — could be array OR map; decide on next indented line
        meta[currentKey] = null;
        containerType = 'undetermined';
      } else {
        meta[currentKey] = strip(topKeyVal[2]);
        containerType = 'scalar';
      }
    } else if (indentedArray && currentKey && (containerType === 'undetermined' || containerType === 'array')) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(strip(indentedArray[1]));
      containerType = 'array';
    } else if (indentedKeyVal && currentKey && (containerType === 'undetermined' || containerType === 'map')) {
      if (typeof meta[currentKey] !== 'object' || meta[currentKey] === null || Array.isArray(meta[currentKey])) {
        meta[currentKey] = {};
      }
      meta[currentKey][indentedKeyVal[1]] = strip(indentedKeyVal[2]);
      containerType = 'map';
    } else if (currentKey && containerType === 'multiline-string' && line.startsWith('  ')) {
      meta[currentKey] += (meta[currentKey] ? '\n' : '') + line.trim();
    }
  }

  return { meta, body };
}

// ── Derive expected skill name from file path ──────────────────────────────

function expectedNameFromPath(filePath) {
  const rel = relative(ROOT, filePath);
  // e.g. biz/erp/sage-x3/SKILL.md → biz/erp/sage-x3
  const parts = rel.split('/');
  parts.pop(); // remove SKILL.md
  return parts.join('/');
}

// ── Determine skill depth ──────────────────────────────────────────────────

function skillDepth(filePath) {
  const rel = relative(ROOT, filePath);
  const parts = rel.split('/').filter(p => p !== 'SKILL.md');
  return parts.length; // 1 = domain, 2 = subdomain, 3+ = leaf
}

// ── Check if a required skill path exists ──────────────────────────────────

function requiredSkillExists(skillPath) {
  const skillFile = resolve(ROOT, skillPath, 'SKILL.md');
  const manifestFile = resolve(ROOT, skillPath + '.md');
  return existsSync(skillFile) || existsSync(manifestFile);
}

// ── Count gotcha bullets ───────────────────────────────────────────────────

function countGotchaBullets(body) {
  const gotchaMatch = body.match(/##\s*Common\s+Gotchas\s*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/i);
  if (!gotchaMatch) return 0;
  const section = gotchaMatch[1];
  const bullets = section.match(/^[\s]*[-*]\s+/gm);
  return bullets ? bullets.length : 0;
}

// ── Check for OpenClaw references ──────────────────────────────────────────

function hasOpenClawRefs(content) {
  return /openclaw/i.test(content);
}

// ── Determine if skill is a stub ───────────────────────────────────────────

function isStub(body) {
  const trimmed = body.trim();
  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  return lines.length <= 5;
}

// ── Validate a single SKILL.md file ────────────────────────────────────────

function validateSkill(filePath) {
  const results = { file: relative(ROOT, filePath), checks: [], pass: true };

  function check(name, passed, detail) {
    results.checks.push({ name, passed, detail });
    if (!passed) results.pass = false;
  }

  // Read file
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    check('file-readable', false, `Cannot read file: ${err.message}`);
    return results;
  }

  // Parse frontmatter
  const { meta, body } = parseFrontmatter(content);

  check('frontmatter-exists',
    Object.keys(meta).length > 0,
    Object.keys(meta).length > 0 ? 'Frontmatter parsed' : 'No frontmatter found');

  if (Object.keys(meta).length === 0) return results;

  // Required fields
  check('has-name', !!meta.name, meta.name ? `name: ${meta.name}` : 'Missing name field');
  check('has-description', !!meta.description, meta.description ? 'Description present' : 'Missing description field');

  // Version check (in metadata or top-level)
  const version = meta.version || (meta.metadata && meta.metadata.version);
  check('has-version', !!version, version ? `version: ${version}` : 'Missing version field (metadata.version or version)');

  // Name matches path
  if (meta.name) {
    const expected = expectedNameFromPath(filePath);
    check('name-matches-path',
      meta.name === expected,
      meta.name === expected ? `Path matches: ${expected}` : `name "${meta.name}" does not match path "${expected}"`);
  }

  // Description quality — should enumerate use cases
  if (meta.description) {
    const hasEnumeration = /\(\d\)/.test(meta.description) || /\d\./.test(meta.description);
    check('description-enumerates',
      hasEnumeration,
      hasEnumeration ? 'Description enumerates use cases' : 'Description should enumerate use cases with (1), (2), (3)');
  }

  // Requires references exist
  if (meta.requires && Array.isArray(meta.requires)) {
    for (const req of meta.requires) {
      const exists = requiredSkillExists(req);
      check(`requires-exists:${req}`,
        exists,
        exists ? `Dependency exists: ${req}` : `Missing dependency: ${req}/SKILL.md not found`);
    }
  }

  // OpenClaw references
  check('no-openclaw', !hasOpenClawRefs(content), hasOpenClawRefs(content) ? 'OpenClaw references found — remove them' : 'No OpenClaw references');

  // Depth-specific checks
  const depth = skillDepth(filePath);
  const stub = isStub(body);

  if (depth >= 3 && !stub) {
    // Leaf skill, non-stub — needs gotchas
    const gotchaCount = countGotchaBullets(body);
    check('gotchas-minimum',
      gotchaCount >= 3,
      gotchaCount >= 3 ? `${gotchaCount} gotchas found` : `Only ${gotchaCount} gotcha(s) — minimum 3 required for production leaf skills`);
  }

  if (stub) {
    check('stub-noted', true, 'Skill is a stub — reduced requirements apply');
  }

  return results;
}

// ── Format results as markdown ─────────────────────────────────────────────

function formatMarkdown(allResults) {
  let md = '## skills@2nth.ai — Skill Validation Report\n\n';

  let allPass = true;
  for (const result of allResults) {
    const icon = result.pass ? '✅' : '❌';
    allPass = allPass && result.pass;
    md += `### ${icon} \`${result.file}\`\n\n`;
    md += '| Check | Status | Detail |\n';
    md += '|-------|--------|--------|\n';
    for (const c of result.checks) {
      md += `| ${c.name} | ${c.passed ? '✅' : '❌'} | ${c.detail} |\n`;
    }
    md += '\n';
  }

  if (allPass) {
    md += '**All checks passed.** This PR is ready for review.\n';
  } else {
    md += '**Some checks failed.** Please fix the issues above and push again.\n';
  }

  return md;
}

// ── Main ───────────────────────────────────────────────────────────────────

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('No SKILL.md files to validate.');
  process.exit(0);
}

const results = [];
for (const file of files) {
  const absPath = resolve(file);
  if (!absPath.endsWith('SKILL.md')) continue;
  results.push(validateSkill(absPath));
}

if (results.length === 0) {
  console.log('No SKILL.md files found in input.');
  process.exit(0);
}

const markdown = formatMarkdown(results);
console.log(markdown);

// Write to file for GitHub Actions to pick up
const outputFile = process.env.VALIDATION_OUTPUT;
if (outputFile) {
  const { writeFileSync } = await import('fs');
  writeFileSync(outputFile, markdown);
}

const allPass = results.every(r => r.pass);
process.exit(allPass ? 0 : 1);
