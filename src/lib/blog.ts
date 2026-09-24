import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import manifest from '@/data/image-manifest.json';

/**
 * BLOG ENGINE
 *
 * Articles live as markdown files in content/blog/ so they can be edited
 * without touching code. Parsed at build time, which works under
 * `output: 'export'` because every page is prerendered.
 *
 * ── ON IMAGE BRIEFS ─────────────────────────────────────────────────────
 * The house content standard calls for 5 to 6 image briefs per article,
 * placed inline. Those briefs are instructions for whoever produces the
 * visual, so rendering them to a reader would be a bug. They live in
 * frontmatter instead, and the body carries an {{image:N}} marker at the
 * point the visual belongs. The renderer turns that marker into a real image
 * slot with its caption; the brief itself is exported for the shot list.
 */

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export type ImageBrief = {
  n: number;
  /** screenshot | diagram | photo | chart | annotated */
  type: string;
  /** Precise instruction for whoever shoots or builds it. */
  capture: string;
  /** Caption as it should publish. */
  caption: string;
  /** What it proves that the prose cannot. */
  rationale: string;
  /** Alt text. Descriptive, not keyword stuffed. */
  alt: string;
  /** Filename SmartImage will look for in assets/images-src. */
  slot: string;
};

export type Article = {
  slug: string;
  title: string;
  /** Meta title, 60 chars max. */
  metaTitle: string;
  /** Meta description, 120 to 155 chars. */
  description: string;
  /** Topical cluster, used for grouping and related-article logic. */
  cluster: string;
  datePublished: string;
  dateModified: string;
  /** Target keywords this piece covers. For internal tracking, not stuffing. */
  keywords: string[];
  /** Explicit related-article slugs. Cluster siblings are added automatically. */
  related: string[];
  /** One-line summary of the original finding and its method. */
  finding?: string;
  /** Image slot picked as the card thumbnail in the admin panel. */
  featuredImage?: string;
  images: ImageBrief[];
  /** Raw markdown body. */
  body: string;
  /** Rendered HTML. */
  html: string;
  readingMinutes: number;
  wordCount: number;
  /** Pulled from the FAQ section for FAQPage schema. */
  faqs: { q: string; a: string }[];
};

/** Turn a heading into a stable anchor id. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Extract the FAQ section into structured data for FAQPage schema.
 * Looks for `## Frequently Asked Questions` then each `### question`.
 */
function extractFaqs(md: string): { q: string; a: string }[] {
  const start = md.search(/^##\s+Frequently Asked Questions\s*$/im);
  if (start === -1) return [];
  const after = md.slice(start);
  // stop at the next H2
  const end = after.slice(3).search(/^##\s+(?!#)/m);
  const block = end === -1 ? after : after.slice(0, end + 3);

  // Split rather than lookahead: JavaScript regex has no \Z anchor, and using
  // it silently dropped the final question from every article's schema.
  const faqs: { q: string; a: string }[] = [];
  const parts = block.split(/^###\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const q = (nl === -1 ? part : part.slice(0, nl)).trim();
    const a = (nl === -1 ? '' : part.slice(nl))
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip links for schema text
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

/**
 * Two transforms are applied to the generated HTML rather than by overriding
 * marked's renderer. Overriding it requires matching marked's internal token
 * and `this` types, which change between minor versions and broke the build
 * once already. Regex over the output is narrow, deterministic and stable.
 */

/** Give H2 and H3 ids so the table of contents can link to them. */
function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[23])>([\s\S]*?)<\/\1>/g,
    (_all, tag, inner) => `<${tag} id="${slugifyHeading(inner)}">${inner}</${tag}>`,
  );
}

/**
 * External links open in a new tab and carry rel="noopener nofollow".
 * Internal links are left alone, so internal link equity is not diluted.
 */
function markExternalLinks(html: string): string {
  return html.replace(/<a href="(https?:\/\/[^"]+)"/g, (_all, href) => {
    return `<a href="${href}" target="_blank" rel="noopener nofollow"`;
  });
}

function renderMarkdown(md: string): string {
  marked.use({ gfm: true, breaks: false });
  const html = marked.parse(md, { async: false }) as string;
  return markExternalLinks(addHeadingIds(html));
}

type ManifestEntry = {
  width: number;
  height: number;
  /** Direct external URL — used when optimised srcsets are not yet generated. */
  src?: string;
  webp?: { w: number; h: number; src: string }[];
  avif?: { w: number; h: number; src: string }[];
};
const imageIndex = manifest as unknown as Record<string, ManifestEntry>;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Replace {{image:N}} markers with a real figure.
 *
 * Emits <picture> with AVIF and WebP sources plus explicit width/height once
 * the photo exists in assets/images-src (run `npm run images`).
 *
 * A slot with no image behind it drops out of the article entirely, caption
 * included. Publishing an authoring brief to a reader is worse than publishing
 * one fewer figure; `npm run shotlist` is where the gap is meant to show up.
 */
function injectImageSlots(html: string, images: ImageBrief[]): string {
  return html.replace(/<p>\s*\{\{image:(\d+)\}\}\s*<\/p>/g, (_all, n) => {
    const brief = images.find((i) => i.n === Number(n));
    if (!brief) return '';
    const entry = imageIndex[brief.slot];
    if (!entry) return '';
    const caption = brief.caption ? `<figcaption>${brief.caption}</figcaption>` : '';

    // External URL entry — render directly without srcsets
    if (entry.src && (!entry.webp || entry.webp.length === 0)) {
      return (
        `<figure class="article-figure">` +
        `<img src="${esc(entry.src)}" alt="${esc(brief.alt)}" ` +
        `width="${entry.width}" height="${entry.height}" ` +
        `loading="lazy" decoding="async" style="width:100%;height:auto;object-fit:cover;display:block">` +
        `${caption}</figure>`
      );
    }

    const srcset = (list: NonNullable<ManifestEntry['webp']>) =>
      list.map((v) => `${v.src} ${v.w}w`).join(', ');
    const fallback = entry.webp![entry.webp!.length - 1];
    const sizes = '(min-width: 768px) 720px, 100vw';

    return (
      `<figure class="article-figure"><picture>` +
      `<source type="image/avif" srcset="${srcset(entry.avif!)}" sizes="${sizes}">` +
      `<source type="image/webp" srcset="${srcset(entry.webp!)}" sizes="${sizes}">` +
      `<img src="${fallback.src}" alt="${esc(brief.alt)}" width="${entry.width}" ` +
      `height="${entry.height}" loading="lazy" decoding="async">` +
      `</picture>${caption}</figure>`
    );
  });
}

function parse(file: string): Article | null {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, '');

  // Drafts saved from the admin panel stay out of the build entirely: no page,
  // no sitemap entry, and none of the publish-time checks below.
  if (data.draft === true) return null;

  const words = content.split(/\s+/).filter(Boolean).length;
  const images: ImageBrief[] = data.images ?? [];
  let html = renderMarkdown(content);
  html = injectImageSlots(html, images);

  const required = ['title', 'metaTitle', 'description', 'cluster', 'datePublished'];
  for (const key of required) {
    if (!data[key]) throw new Error(`content/blog/${file}: frontmatter is missing "${key}"`);
  }
  if (String(data.metaTitle).length > 60) {
    throw new Error(
      `content/blog/${file}: metaTitle is ${String(data.metaTitle).length} chars, max 60`,
    );
  }
  const dl = String(data.description).length;
  if (dl < 110 || dl > 165) {
    throw new Error(`content/blog/${file}: description is ${dl} chars, target 120 to 155`);
  }

  return {
    slug,
    title: data.title,
    metaTitle: data.metaTitle,
    description: data.description,
    cluster: data.cluster,
    datePublished: data.datePublished,
    dateModified: data.dateModified ?? data.datePublished,
    keywords: data.keywords ?? [],
    related: data.related ?? [],
    finding: data.finding,
    featuredImage: data.featuredImage,
    images,
    body: content,
    html,
    wordCount: words,
    readingMinutes: Math.max(1, Math.round(words / 225)),
    faqs: extractFaqs(content),
  };
}

let cache: Article[] | null = null;

export function allArticles(): Article[] {
  if (cache) return cache;
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  cache = files
    .map(parse)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => Date.parse(b.datePublished) - Date.parse(a.datePublished));
  return cache;
}

export function getArticle(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}

export function clusters(): { name: string; articles: Article[] }[] {
  const map = new Map<string, Article[]>();
  for (const a of allArticles()) {
    if (!map.has(a.cluster)) map.set(a.cluster, []);
    map.get(a.cluster)!.push(a);
  }
  return [...map.entries()].map(([name, articles]) => ({ name, articles }));
}

/**
 * Related articles: explicit `related` slugs first, then cluster siblings,
 * then most recent. Deduplicated, capped.
 */
export function relatedArticles(article: Article, limit = 3): Article[] {
  const all = allArticles().filter((a) => a.slug !== article.slug);
  const byslug = new Map(all.map((a) => [a.slug, a]));

  const picked: Article[] = [];
  const push = (a?: Article) => {
    if (a && !picked.find((p) => p.slug === a.slug)) picked.push(a);
  };

  for (const slug of article.related) push(byslug.get(slug));
  for (const a of all) if (a.cluster === article.cluster) push(a);
  for (const a of all) push(a);

  return picked.slice(0, limit);
}

/**
 * The image to use as an article's card thumbnail.
 *
 * Two rules, in order. Only consider briefs that have a real file behind them,
 * because an unshot slot renders as nothing and would leave a hole in a grid of
 * cards. Then prefer a photograph over a diagram: most articles open on a
 * chart, which is right inside the piece and wrong on a card, where an 800×500
 * line drawing cropped to a thumbnail reads as a blank rectangle.
 */
export function cardImage(article: Article): ImageBrief | undefined {
  const available = article.images.filter((i) => imageIndex[i.slot]);
  const featured = available.find((i) => i.slot === article.featuredImage);
  if (featured) return featured;
  return available.find((i) => i.type === 'photo') ?? available[0];
}

/** Table of contents from the H2s. */
export function tableOfContents(article: Article): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const re = /^##\s+(?!#)(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(article.body)) !== null) {
    const text = m[1].replace(/[*_`]/g, '').trim();
    out.push({ id: slugifyHeading(text), text });
  }
  return out;
}
