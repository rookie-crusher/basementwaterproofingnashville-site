import { cities } from '@/data/cities';
import { services } from '@/data/services';
import { pseoPages } from '@/data/registry';

/**
 * BUILD-TIME DATA GUARDRAILS
 *
 * Called from app/sitemap.ts, which runs during `next build`. A thrown error
 * here fails the build — deliberately. These checks exist because the failure
 * mode of a pSEO site is not a crash, it is quietly publishing 200 thin pages
 * and losing crawl trust across the whole domain. Better to fail loudly.
 *
 * If a check blocks you, write the content. Do not lower the threshold.
 */

const MIN_GEOLOGY = 400;
const MIN_DRAINAGE = 400;
const MIN_CODES = 250;
const MIN_CITY_FAQS = 3;

export function validateData(): void {
  const errors: string[] = [];

  // ── Published cities must have genuinely written local content ─────────
  for (const c of cities.filter((c) => c.status === 'published')) {
    const l = c.local;
    if (l.geology.length < MIN_GEOLOGY)
      errors.push(`${c.name}: local.geology is ${l.geology.length} chars, needs ${MIN_GEOLOGY}+`);
    if (l.drainage.length < MIN_DRAINAGE)
      errors.push(`${c.name}: local.drainage is ${l.drainage.length} chars, needs ${MIN_DRAINAGE}+`);
    if (l.codes.length < MIN_CODES)
      errors.push(`${c.name}: local.codes is ${l.codes.length} chars, needs ${MIN_CODES}+`);
    if (c.faqs.length < MIN_CITY_FAQS)
      errors.push(`${c.name}: has ${c.faqs.length} city FAQs, needs ${MIN_CITY_FAQS}+`);
    if (!c.local.authority.name)
      errors.push(`${c.name}: local.authority.name is empty`);
    if (!c.neighborhoods.length)
      errors.push(`${c.name}: no neighborhoods listed`);
    if (!c.housingStock)
      errors.push(`${c.name}: housingStock is empty`);
  }

  // ── No two cities may share local content (the doorway-page tell) ──────
  const seen = new Map<string, string>();
  for (const c of cities.filter((c) => c.status === 'published')) {
    for (const [field, text] of Object.entries(c.local)) {
      if (typeof text !== 'string' || text.length < 80) continue;
      const fingerprint = text.slice(0, 160).toLowerCase().replace(/\s+/g, ' ');
      const prior = seen.get(fingerprint);
      if (prior) {
        errors.push(
          `Duplicate local content: ${c.name}.${field} matches ${prior}. ` +
            `Templated local copy is what gets pSEO pages deindexed.`,
        );
      }
      seen.set(fingerprint, `${c.name}.${field}`);
    }
  }

  // ── Published services need real content too ──────────────────────────
  for (const s of services.filter((s) => s.status === 'published')) {
    if (!s.blurb) errors.push(`${s.name}: blurb is empty`);
    if (s.process.length < 3) errors.push(`${s.name}: needs 3+ process steps`);
    if (s.symptoms.length < 3) errors.push(`${s.name}: needs 3+ symptoms`);
  }

  // ── Sanity: routes exist and slugs are unique ─────────────────────────
  if (!pseoPages.length) errors.push('No pSEO pages generated — check statuses in the data layer.');
  const slugs = new Set<string>();
  for (const p of pseoPages) {
    if (slugs.has(p.slug)) errors.push(`Duplicate slug: ${p.slug}`);
    slugs.add(p.slug);
  }

  if (errors.length) {
    throw new Error(
      `\n\n=== DATA VALIDATION FAILED (${errors.length}) ===\n` +
        errors.map((e) => `  • ${e}`).join('\n') +
        `\n\nFix the data layer, or set the offending city/service to status: 'draft'.\n`,
    );
  }
}
