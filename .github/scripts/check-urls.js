#!/usr/bin/env node
/**
 * check-urls.js
 * Extracts every URL from notices.json (action_param, image, and any URLs in
 * localizations) and sends a HEAD request to each. Fails if any URL is
 * unreachable or returns a non-2xx status.
 *
 * Usage: node scripts/check-urls.js [--notices path/to/notices.json]
 */
 
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
 
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
 
// Allow overriding the notices path via --notices flag (useful for testing against a diff)
const args = process.argv.slice(2);
const noticesFlagIdx = args.indexOf('--notices');
const noticesPath = noticesFlagIdx !== -1
  ? resolve(args[noticesFlagIdx + 1])
  : resolve(ROOT, 'notices.json');
 
let notices;
try {
  notices = JSON.parse(readFileSync(noticesPath, 'utf8'));
} catch (e) {
  console.error(`❌ Could not parse notices.json: ${e.message}`);
  process.exit(1);
}
 
/** Collect all URLs from a notice object */
function extractUrls(notice) {
  const urls = [];
  for (const [lang, msg] of Object.entries(notice.localizedMessages ?? {})) {
    if (msg.actionParam) urls.push({ url: msg.actionParam, field: `localizedMessages.${lang}.actionParam` });
    if (msg.image)       urls.push({ url: msg.image,       field: `localizedMessages.${lang}.image` });
    // Scan description for embedded http(s) links
    const matches = (msg.description ?? '').matchAll(/https?:\/\/[^\s"')>]+/g);
    for (const m of matches) {
      urls.push({ url: m[0], field: `localizedMessages.${lang}.description` });
    }
  }
  return urls;
}
 
/** HEAD request with a 10s timeout, falls back to GET if HEAD returns 405 */
async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    if (res.status === 405) {
      // Server doesn't allow HEAD — retry with GET
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    }
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: null, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}
 
const allUrls = [];
for (const notice of notices) {
  for (const entry of extractUrls(notice)) {
    allUrls.push({ noticeId: notice.id, ...entry });
  }
}
 
// Deduplicate by URL to avoid hammering the same endpoint repeatedly
const seen = new Set();
const unique = allUrls.filter(({ url }) => {
  if (seen.has(url)) return false;
  seen.add(url);
  return true;
});
 
if (unique.length === 0) {
  console.log('ℹ️  No URLs found in notices.json.');
  process.exit(0);
}
 
console.log(`🔍 Checking ${unique.length} unique URL(s)…\n`);
 
const results = await Promise.all(
  unique.map(async (entry) => ({ ...entry, result: await checkUrl(entry.url) }))
);
 
let failed = false;
for (const { noticeId, field, url, result } of results) {
  if (result.ok) {
    console.log(`  ✅ [${noticeId}] ${field}: ${url} (${result.status})`);
  } else {
    const detail = result.error ?? `HTTP ${result.status}`;
    console.error(`  ❌ [${noticeId}] ${field}: ${url} — ${detail}`);
    failed = true;
  }
}
 
console.log('');
if (failed) {
  console.error('❌ One or more URLs are unreachable. Fix them before merging.');
  process.exit(1);
} else {
  console.log('✅ All URLs are reachable.');
}
