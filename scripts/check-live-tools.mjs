#!/usr/bin/env node
/**
 * Cross-check every naffo_* tool the skills and commands reference against the
 * live MCP catalog.
 *
 * The endpoint serves `tools/list` unauthenticated for catalog discovery, so this
 * needs no credentials. It is NOT part of the default CI run because it depends
 * on the network and on the deployed server version.
 *
 *   node scripts/check-live-tools.mjs
 *   node scripts/check-live-tools.mjs --url https://staging.example/api/mcp
 *
 * Exit 1 when a skill references a tool the server does not expose.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const urlFlag = process.argv.indexOf('--url');
const endpoint = urlFlag !== -1 ? process.argv[urlFlag + 1] : 'https://naffo.tech/api/mcp';

/**
 * Tool names the skills mention *in order to say they do not exist*. Agents
 * invent these otherwise, so the negative mention earns its place — but it must
 * not be counted as a reference. If one of these ever shows up in a live
 * catalog, the skill note is stale and this script says so.
 */
const KNOWN_ABSENT = new Map([
  [
    'naffo_move_lead_stage',
    'never shipped; replaced by naffo_update_lead({ leadId, stageId }) — the skills document that explicitly',
  ],
]);

async function rpc(method, params) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  if (!res.ok) throw new Error(`${method} → HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.error) throw new Error(`${method} → ${json.error.code} ${json.error.message}`);
  return json.result;
}

/** Every tool name the deployed server exposes. */
async function liveCatalog() {
  const tools = new Map();
  let cursor;
  do {
    const page = await rpc('tools/list', cursor ? { cursor } : {});
    for (const tool of page.tools ?? []) tools.set(tool.name, tool);
    cursor = page.nextCursor;
  } while (cursor);
  return tools;
}

/** Every naffo_* name referenced in skills, commands, and agent docs. */
function referenced() {
  const refs = new Map();
  const walk = (dir) => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return /\.(md|json)$/.test(e.name) ? [full] : [];
    });
  };
  const files = [
    ...walk(join(repoRoot, 'skills')),
    ...walk(join(repoRoot, 'plugins')),
    join(repoRoot, 'AGENTS.md'),
    join(repoRoot, 'TESTING.md'),
    join(repoRoot, '.cursorrules'),
    join(repoRoot, '.github/copilot-instructions.md'),
  ].filter(existsSync);

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const raw of text.match(/naffo_[a-zA-Z0-9_]+/g) ?? []) {
      const name = raw.replace(/^naffo__?naffo_/, 'naffo_');
      if (!refs.has(name)) refs.set(name, new Set());
      refs.get(name).add(relative(repoRoot, file).replace(/\\/g, '/'));
    }
  }
  return refs;
}

const live = await liveCatalog();
const refs = referenced();

console.log(`endpoint : ${endpoint}`);
console.log(`live     : ${live.size} tools exposed`);
console.log(`referenced: ${refs.size} distinct tool names in this repo`);

// A documented-absent name that turns up live means the skill note is now wrong.
const staleNotes = [...KNOWN_ABSENT.keys()].filter((name) => live.has(name));
if (staleNotes.length) {
  console.warn(`\n⚠ ${staleNotes.length} tool(s) documented as non-existent are now live:`);
  for (const name of staleNotes) console.warn(`  ${name} — drop the "does not exist" note from the skills`);
}

const missing = [...refs.keys()]
  .filter((name) => !live.has(name) && !KNOWN_ABSENT.has(name))
  .sort();
const unused = [...live.keys()].filter((name) => !refs.has(name)).sort();

if (KNOWN_ABSENT.size) {
  console.log(`\n${KNOWN_ABSENT.size} name(s) intentionally documented as absent (not counted):`);
  for (const [name, why] of KNOWN_ABSENT) console.log(`  ${name} — ${why}`);
}

if (unused.length) {
  console.log(`\n${unused.length} live tools not mentioned by any skill (informational):`);
  for (const name of unused) console.log(`  ${name}`);
}

if (missing.length) {
  const strict = process.argv.includes('--strict');
  const label = strict ? '✘' : '⚠';
  const log = strict ? console.error : console.warn;
  log(`\n${label} ${missing.length} referenced tool(s) this deployment does not expose:`);
  for (const name of missing) {
    log(`  ${name}`);
    for (const file of refs.get(name)) log(`      ${file}`);
  }
  log(
    '\nEither the server build is behind the skills, or the skill names a tool that ' +
      'no longer exists.\nEvery one of these must sit behind a documented capability ' +
      'gate + fallback, or the agent will hallucinate the call.'
  );
  if (strict) process.exit(1);
  console.log('\n(warning only — pass --strict to fail on this)');
  process.exit(0);
}

console.log('\n✔ every referenced tool exists in the live catalog');
