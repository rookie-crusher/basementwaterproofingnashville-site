/**
 * CONTENT OVERLAP CHECK
 *
 * Measures pairwise 8-gram overlap between every exported programmatic page.
 * Run it after `npm run build` (needs ./out) and watch it as you add cities.
 *
 *   npm run overlap
 *
 * Why this exists: the failure mode of pSEO is not a crash, it is publishing
 * pages that are 80% identical and losing crawl trust across the domain. This
 * gives you a number instead of a hunch.
 *
 * Rules of thumb for pairs of programmatic pages:
 *   < 50%  healthy — genuinely different content
 *   50–65% acceptable if the shared part is legitimate shared navigation
 *   > 70%  fix it before publishing more; these are near-duplicates
 *
 * Remember a chunk of any score is the nav and footer, which are shared by
 * design. Watch the trend as you scale, not the absolute number.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OUT = 'out';
if (!existsSync(OUT)) {
  console.error('[overlap] ./out not found — run `npm run build` first');
  process.exit(1);
}

const N = 8;
const WARN = 70;

function plain(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(text) {
  const w = text.toLowerCase().split(' ');
  const set = new Set();
  for (let i = 0; i + N <= w.length; i++) set.add(w.slice(i, i + N).join(' '));
  return set;
}

const dirs = (await readdir(OUT, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && /-[a-z]{2}$/.test(d.name))
  .map((d) => d.name)
  .sort();

if (dirs.length < 2) {
  console.log('[overlap] fewer than 2 programmatic pages; nothing to compare');
  process.exit(0);
}

const docs = new Map();
for (const d of dirs) {
  const text = plain(await readFile(path.join(OUT, d, 'index.html'), 'utf8'));
  docs.set(d, { words: text.split(' ').length, sh: shingles(text) });
}

console.log('\nWord count per page');
for (const [name, { words }] of docs) console.log(`  ${String(words).padStart(6)}  ${name}`);

console.log(`\nPairwise ${N}-gram overlap`);
const names = [...docs.keys()];
let worst = { pct: 0, pair: '' };
for (let i = 0; i < names.length; i++) {
  for (let j = i + 1; j < names.length; j++) {
    const a = docs.get(names[i]).sh;
    const b = docs.get(names[j]).sh;
    let shared = 0;
    for (const s of a) if (b.has(s)) shared++;
    const pct = (shared / Math.min(a.size, b.size)) * 100;
    if (pct > worst.pct) worst = { pct, pair: `${names[i]} vs ${names[j]}` };
    const flag = pct > WARN ? '  <-- too similar' : '';
    console.log(`  ${pct.toFixed(1).padStart(5)}%  ${names[i]} vs ${names[j]}${flag}`);
  }
}

console.log(`\nWorst pair: ${worst.pct.toFixed(1)}% — ${worst.pair}`);
if (worst.pct > WARN) {
  console.error(`\n[overlap] FAIL: ${worst.pct.toFixed(1)}% exceeds the ${WARN}% threshold.`);
  console.error('Add content that is specific to the service AND the city (see Service.localLens).');
  process.exit(1);
}
console.log('[overlap] OK\n');
