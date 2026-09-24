// Article file format and rules. Pure functions: no DOM, no network, so the
// same module runs in the browser and in Node tests.
//
// Mirrors src/lib/blog.ts: an article the panel accepts for publishing is one
// the build will accept too.

export const BLOG_DIR = 'content/blog';
export const TRASH_DIR = 'content/.trash';
export const REDIRECTS = 'content/redirects.json';
export const SRC_DIR = 'assets/images-src';
export const PUB_DIR = 'public/images';
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RASTER_RE = /\.(jpe?g|png|webp|tiff?)$/i;

export const articlePath = (slug) => `${BLOG_DIR}/${slug}.md`;

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function slugify(text) {
  const s = String(text ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (s.length <= 80) return s;
  const cut = s.slice(0, 80);
  return cut.slice(0, cut.lastIndexOf('-') > 40 ? cut.lastIndexOf('-') : 80);
}

export function assertSlug(slug) {
  if (!SLUG_RE.test(slug ?? '') || slug.length > 90) {
    throw new Error('The URL slug may only use lowercase letters, numbers and single hyphens (max 90 characters).');
  }
}

/** YAML dates can arrive as Date objects; keep them as YYYY-MM-DD strings. */
export function dateStr(v) {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

export function cleanList(v) {
  const arr = Array.isArray(v) ? v : String(v ?? '').split(/[\n,]/);
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
}

export function wordCount(md) {
  return String(md ?? '').split(/\s+/).filter(Boolean).length;
}

// ── Frontmatter ────────────────────────────────────────────────────────────
/** Split "---\nyaml\n---\nbody" the way gray-matter does. */
export function parseFrontmatter(raw, yaml) {
  const text = String(raw).replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, content: text };
  const end = text.indexOf('\n---', 4);
  if (end === -1) return { data: {}, content: text };
  const fm = text.slice(4, end);
  let rest = text.slice(end + 4);
  rest = rest.replace(/^[^\n]*\n?/, ''); // remainder of the closing delimiter line
  const data = yaml.safeLoad(fm) || {};
  return { data, content: rest };
}

/**
 * YAML in the same style as the hand-written articles: prose fields in double
 * quotes, short identifiers bare. A generic YAML dumper would restyle the
 * whole header on every save; this keeps a commit down to what was edited.
 */
const ALWAYS_QUOTE = new Set(['title', 'metaTitle', 'description', 'cluster', 'datePublished', 'dateModified', 'finding', 'capture', 'caption', 'rationale', 'alt']);
const YAML_WORDS = /^(true|false|yes|no|on|off|y|n|null|~)$/i;
const BRIEF_ORDER = ['n', 'type', 'slot', 'capture', 'caption', 'rationale', 'alt'];
const KEY_ORDER = ['title', 'metaTitle', 'description', 'cluster', 'datePublished', 'dateModified', 'draft', 'featuredImage', 'keywords', 'related', 'finding', 'images'];

function yamlScalar(v, key) {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  const plain = !ALWAYS_QUOTE.has(key) && /^[A-Za-z0-9][A-Za-z0-9 _./()'’-]*$/.test(s) && !YAML_WORDS.test(s) && !/^[\d.]+$/.test(s) && !/\s$/.test(s);
  return plain ? s : JSON.stringify(s); // JSON strings are valid YAML double-quoted scalars
}

function toYaml(data) {
  const out = [];
  for (const [k, v] of Object.entries(data)) {
    if (!Array.isArray(v)) {
      out.push(`${k}: ${yamlScalar(v, k)}`);
      continue;
    }
    if (!v.length) {
      out.push(`${k}: []`);
      continue;
    }
    out.push(`${k}:`);
    for (const item of v) {
      if (item === null || typeof item !== 'object') {
        out.push(`  - ${yamlScalar(item, k)}`);
        continue;
      }
      const keys = [...BRIEF_ORDER.filter((x) => x in item), ...Object.keys(item).filter((x) => !BRIEF_ORDER.includes(x))];
      keys
        .filter((x) => item[x] !== undefined && item[x] !== null && item[x] !== '')
        .forEach((x, i) => out.push(`${i === 0 ? '  - ' : '    '}${x}: ${yamlScalar(item[x], x)}`));
    }
  }
  return out.join('\n');
}

export function serializeArticle(data, body, yaml) {
  const clean = {};
  for (const k of KEY_ORDER) {
    const v = data[k];
    if (v === undefined || v === null || v === '' || v === false) continue;
    if (Array.isArray(v) && v.length === 0 && k !== 'images') continue;
    clean[k] = v;
  }
  for (const k of Object.keys(data)) {
    if (!(k in clean) && !KEY_ORDER.includes(k) && data[k] !== undefined && !(data[k] instanceof Date)) clean[k] = data[k];
  }
  if (Array.isArray(clean.images)) clean.images = [...clean.images].sort((a, b) => a.n - b.n);
  const text = `---\n${toYaml(clean)}\n---\n\n${String(body).replace(/^\n+/, '')}`;
  // Parse it straight back: a serializer bug must never reach the repository.
  const check = parseFrontmatter(text, yaml).data;
  if (check.title !== clean.title || (check.images ?? []).length !== (clean.images ?? []).length) {
    throw new Error('Internal check failed: the article header did not round-trip. Nothing was saved.');
  }
  return text;
}

// ── Validation ─────────────────────────────────────────────────────────────
/** `hasImage(slot)` tells whether an image file exists for a slot. */
export function validate(data, hasImage = () => true) {
  const errors = [];
  const warnings = [];
  const need = { title: 'Title', metaTitle: 'SEO title', description: 'Meta description', cluster: 'Category', datePublished: 'Publish date' };
  for (const [k, label] of Object.entries(need)) {
    if (!String(data[k] ?? '').trim()) errors.push(`${label} is required to publish.`);
  }
  const mt = String(data.metaTitle ?? '').length;
  if (mt > 60) errors.push(`SEO title is ${mt} characters; the limit is 60.`);
  const dl = String(data.description ?? '').length;
  if (dl && (dl < 110 || dl > 165)) errors.push(`Meta description is ${dl} characters; it must be 110 to 165 (aim for 120 to 155).`);
  if (data.datePublished && Number.isNaN(Date.parse(dateStr(data.datePublished)))) errors.push('Publish date is not a valid date.');
  for (const img of data.images ?? []) {
    if (!img.alt) warnings.push(`Image "${img.slot}" has no alt text.`);
    if (!hasImage(img.slot)) warnings.push(`Image "${img.slot}" has no file yet, so it is hidden on the live site.`);
  }
  return { errors, warnings };
}

// ── Image URLs inside the editor ───────────────────────────────────────────
export function rawUrl(path, sha) {
  return `/admin/api.php?a=raw&path=${encodeURIComponent(path)}${sha ? `&v=${sha}` : ''}`;
}
export function placeholderUrl(slot) {
  return `/admin/api.php?a=placeholder&slot=${encodeURIComponent(slot)}`;
}
/** Which image slot does an editor <img src> point at? */
export function slotFromUrl(src) {
  const s = String(src ?? '').replace(/&amp;/g, '&');
  if (!s.includes('/admin/api.php?')) return null;
  const q = new URLSearchParams(s.slice(s.indexOf('?') + 1));
  if (q.get('a') === 'placeholder') return q.get('slot') || null;
  if (q.get('a') === 'raw') {
    const file = (q.get('path') || '').split('/').pop();
    return file ? file.replace(/\.[a-z0-9]+$/i, '') : null;
  }
  return null;
}
