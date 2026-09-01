#!/usr/bin/env node
/**
 * Mirror the canonical skills in `skills/` into `plugins/naffo/skills/`.
 *
 * `skills/` is the source of truth: it is what `npx skills add` reads and what
 * Cursor/Copilot/Codex instructions point at. Claude Code plugin installs only
 * copy the plugin directory, so the plugin needs its own physical copy — a
 * relative path out of the plugin root (`../../skills`) is rejected by Claude
 * Code, and symlinks are not portable to Windows checkouts.
 *
 * Usage:
 *   node scripts/sync-skills.mjs           # write the mirror
 *   node scripts/sync-skills.mjs --check   # exit 1 if the mirror is stale
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(repoRoot, 'skills');
const dest = join(repoRoot, 'plugins', 'naffo', 'skills');
const checkOnly = process.argv.includes('--check');

/** Every directory that directly contains a SKILL.md, relative to `skills/`. */
function findSkillDirs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (existsSync(join(full, 'SKILL.md'))) out.push(full);
    else out.push(...findSkillDirs(full));
  }
  return out;
}

/** All files under a skill directory (SKILL.md plus any references/ assets). */
function filesIn(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesIn(full, base));
    else out.push(relative(base, full));
  }
  return out;
}

const skillDirs = findSkillDirs(src);
if (skillDirs.length === 0) {
  console.error('No SKILL.md found under skills/ — refusing to sync.');
  process.exit(1);
}

const drift = [];
const expected = new Set();

for (const skillDir of skillDirs) {
  // Plugin skills must sit one level under skills/, so nested paths such as
  // skills/analytics/runway-calculator flatten to skills/runway-calculator.
  const name = skillDir.split(/[\\/]/).pop();
  const target = join(dest, name);
  expected.add(name);

  for (const file of filesIn(skillDir)) {
    const from = join(skillDir, file);
    const to = join(target, file);
    const body = readFileSync(from);
    const same = existsSync(to) && readFileSync(to).equals(body);
    if (same) continue;
    drift.push(`${existsSync(to) ? 'stale' : 'missing'}: ${relative(repoRoot, to)}`);
    if (!checkOnly) {
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, body);
    }
  }
}

// Anything in the mirror that no longer exists upstream.
if (existsSync(dest)) {
  for (const entry of readdirSync(dest, { withFileTypes: true })) {
    if (!entry.isDirectory() || expected.has(entry.name)) continue;
    drift.push(`orphaned: ${relative(repoRoot, join(dest, entry.name))}`);
    if (!checkOnly) rmSync(join(dest, entry.name), { recursive: true, force: true });
  }
}

if (drift.length === 0) {
  console.log(`plugins/naffo/skills is in sync with skills/ (${skillDirs.length} skills).`);
  process.exit(0);
}

if (checkOnly) {
  console.error('plugins/naffo/skills is out of sync with skills/:');
  for (const line of drift) console.error(`  ${line}`);
  console.error('\nRun: node scripts/sync-skills.mjs');
  process.exit(1);
}

console.log(`Synced ${skillDirs.length} skills into plugins/naffo/skills:`);
for (const line of drift) console.log(`  ${line}`);
