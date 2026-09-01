#!/usr/bin/env node
/**
 * Repo consistency checks that don't need Claude Code installed.
 *
 * Run locally: node scripts/validate-repo.mjs
 * CI runs the same script, plus `node scripts/sync-skills.mjs --check`.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (msg) => console.log(`ok    ${msg}`);
const rel = (p) => relative(repoRoot, p).replace(/\\/g, '/');

const MANIFESTS = [
  'agents.json',
  '.claude-plugin/marketplace.json',
  'plugins/naffo/.claude-plugin/plugin.json',
];

/** 1. Every manifest parses. */
const parsed = {};
for (const file of MANIFESTS) {
  const path = join(repoRoot, file);
  if (!existsSync(path)) {
    fail(`${file}: missing`);
    continue;
  }
  try {
    parsed[file] = JSON.parse(readFileSync(path, 'utf8'));
    ok(`${file} parses`);
  } catch (err) {
    fail(`${file}: invalid JSON — ${err.message}`);
  }
}

/** 2. Versions agree. plugin.json wins at install time, so a stale value there
 *     silently prevents existing installs from ever updating. */
const market = parsed['.claude-plugin/marketplace.json'];
const plugin = parsed['plugins/naffo/.claude-plugin/plugin.json'];
const agents = parsed['agents.json'];
if (market && plugin && agents) {
  const entry = (market.plugins ?? []).find((p) => p.name === 'naffo');
  const seen = {
    'marketplace.json (top level)': market.version ?? market.metadata?.version,
    'marketplace.json (naffo entry)': entry?.version,
    'plugin.json': plugin.version,
    'agents.json': agents.version,
  };
  const unique = [...new Set(Object.values(seen))];
  if (unique.length !== 1 || unique[0] === undefined) {
    fail(
      'version mismatch across manifests:\n' +
        Object.entries(seen)
          .map(([k, v]) => `        ${k}: ${v}`)
          .join('\n')
    );
  } else {
    ok(`all manifests at ${unique[0]}`);
  }
}

/** 3. Marketplace entry sources exist and stay inside the repo. */
for (const entry of market?.plugins ?? []) {
  if (typeof entry.source !== 'string') continue;
  if (!entry.source.startsWith('./')) {
    fail(`marketplace.json ${entry.name}: relative source must start with "./"`);
    continue;
  }
  if (!existsSync(join(repoRoot, entry.source))) {
    fail(`marketplace.json ${entry.name}: source not found (${entry.source})`);
  }
}
if (market?.plugins?.length) ok('plugin sources resolve');

/** 4. Every SKILL.md has usable frontmatter. */
function skillFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return skillFiles(full);
    return e.name === 'SKILL.md' ? [full] : [];
  });
}
const skills = [...skillFiles(join(repoRoot, 'skills')), ...skillFiles(join(repoRoot, 'plugins'))];
if (skills.length === 0) fail('no SKILL.md files found');
for (const file of skills) {
  const text = readFileSync(file, 'utf8');
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!front) {
    fail(`${rel(file)}: no YAML frontmatter`);
    continue;
  }
  for (const key of ['name', 'description']) {
    if (!new RegExp(`^${key}:`, 'm').test(front[1])) fail(`${rel(file)}: frontmatter missing "${key}"`);
  }
  // Control characters corrupt the description Claude Code shows and are rejected
  // in plugin/marketplace names.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/.test(front[1])) {
    fail(`${rel(file)}: frontmatter contains control or replacement characters`);
  }
}
ok(`${skills.length} SKILL.md files have valid frontmatter`);

/** 4b. Every canonical skill is registered in agents.json, so cross-agent installs
 *      (Cursor, Copilot, Codex) see it too. */
const registered = new Set((agents?.skills ?? []).map((s) => s.name));
for (const file of skillFiles(join(repoRoot, 'skills'))) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'));
  const name = front && /^name:\s*(.+)$/m.exec(front[1])?.[1].trim();
  if (!name) continue;
  if (!registered.has(name)) fail(`agents.json: skill "${name}" (${rel(file)}) is not registered`);
}
for (const entry of agents?.skills ?? []) {
  if (!existsSync(join(repoRoot, entry.file))) {
    fail(`agents.json: skill "${entry.name}" points at a missing file (${entry.file})`);
  }
}
ok(`${registered.size} skills registered in agents.json`);

/** 5. Slash-command allowed-tools only name tools the skills actually document. */
const documented = new Set(
  skills
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n')
    .match(/naffo_[a-zA-Z0-9_]+/g) ?? []
);
const commandsDir = join(repoRoot, 'plugins/naffo/commands');
let commandCount = 0;
for (const name of existsSync(commandsDir) ? readdirSync(commandsDir) : []) {
  if (!name.endsWith('.md')) continue;
  commandCount++;
  const text = readFileSync(join(commandsDir, name), 'utf8');
  const line = /^allowed-tools:(.*)$/m.exec(text);
  if (!line) continue;
  for (const raw of line[1].split(',').map((s) => s.trim()).filter(Boolean)) {
    const bare = raw.replace(/^mcp__naffo__/, '');
    if (!bare.startsWith('naffo_')) continue;
    if (!documented.has(bare)) fail(`commands/${name}: allows ${bare}, which no SKILL.md documents`);
  }
  // Tools referenced in the body must also be permitted — but only for commands
  // that execute Naffo tools. `/naffo-setup` is a static guide whose body names
  // tools the *user* will trigger in conversation, so it declares none.
  const allowed = new Set(
    line[1].split(',').map((s) => s.trim().replace(/^mcp__naffo__/, ''))
  );
  const executesNaffoTools = [...allowed].some((t) => t.startsWith('naffo_'));
  if (!executesNaffoTools) continue;
  const body = text.slice(line.index + line[0].length);
  for (const used of new Set(body.match(/naffo_[a-zA-Z0-9_]+/g) ?? [])) {
    if (!allowed.has(used)) fail(`commands/${name}: body calls ${used} but allowed-tools omits it`);
  }
}
ok(`${commandCount} slash commands consistent with allowed-tools`);

if (failures.length) {
  console.error(`\n✘ ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\n✔ repo validation passed');
