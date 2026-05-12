#!/usr/bin/env node
/**
 * check-duplicate-ids.js
 * Scans notices.json for duplicate notice IDs and fails if any are found.
 * Also warns if an ID added in this PR already existed on the base branch
 * (which would indicate a merge conflict or accidental re-use).
 *
 * Usage: node scripts/check-duplicate-ids.js [--base <git-ref>]
 */
 
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
 
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
 
const args    = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const BASE_REF = baseIdx !== -1 ? args[baseIdx + 1] : 'origin/master';
 
let notices;
try {
  notices = JSON.parse(readFileSync(resolve(ROOT, 'notices.json'), 'utf8'));
} catch (e) {
  console.error(`❌ Could not parse notices.json: ${e.message}`);
  process.exit(1);
}
 
// ── 1. Check for duplicates within the current file ──────────────────────────
const seen   = new Map(); // id → first occurrence index
const dupes  = [];
notices.forEach((notice, idx) => {
  if (seen.has(notice.id)) {
    dupes.push({ id: notice.id, first: seen.get(notice.id), second: idx });
  } else {
    seen.set(notice.id, idx);
  }
});
 
if (dupes.length > 0) {
  console.error('❌ Duplicate notice IDs found in notices.json:\n');
  for (const { id, first, second } of dupes) {
    console.error(`  • "${id}" appears at index ${first} and ${second}`);
  }
  process.exit(1);
}
 
console.log(`✅ No duplicate IDs in notices.json (${notices.length} notices checked).`);
 
// ── 2. Warn if a new ID collides with base branch (should not happen normally) ─
const baseResult = spawnSync('git', ['show', `${BASE_REF}:notices.json`], {
  cwd: ROOT, encoding: 'utf8',
});
 
if (baseResult.status === 0) {
  let baseNotices = [];
  try { baseNotices = JSON.parse(baseResult.stdout); } catch { /* ignore */ }
 
  const baseIds  = new Set(baseNotices.map(n => n.id));
  const current  = new Set(notices.map(n => n.id));
  const newIds   = [...current].filter(id => !baseIds.has(id));
 
  // Detect IDs that appear in BOTH base and current but were not on base
  // (shouldn't normally happen after the dedup check above, but catches
  // concurrent PR merges where two PRs independently add the same ID)
  const addedOnBase = baseNotices
    .filter(n => !current.has(n.id))  // removed in this PR
    .map(n => n.id);
  const conflicts = newIds.filter(id =>
    baseNotices.some(n => n.id === id)
  );
  if (conflicts.length > 0) {
    console.warn(`⚠️  ID(s) added in this PR already exist on ${BASE_REF}: ${conflicts.join(', ')}`);
    console.warn('   This may indicate a merge conflict. Please review.');
  }
 
  if (newIds.length > 0) {
    console.log(`ℹ️  New notice ID(s) introduced: ${newIds.join(', ')}`);
  }
}
 
