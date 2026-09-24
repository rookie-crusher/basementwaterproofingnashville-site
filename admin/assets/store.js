// Data layer for the admin panel.
//
// The site's content lives in a GitHub repository. api.php relays reads and
// commits with the token; everything else (parsing, markdown conversion,
// validation, renames, trash) happens here. Views call api(method, url, body)
// with REST-style URLs, which this module answers.
import * as M from './core/model.js';
import { createConverter } from './core/convert.js';
import { marked } from '../vendor/marked.esm.js';
import TurndownService from '../vendor/turndown.browser.es.js';
import { gfm } from '../vendor/turndown-plugin-gfm.browser.es.js';

const yaml = window.jsyaml;
const conv = createConverter({ marked, TurndownService, gfm });
const MAX_WIDTH = 2400;

export class ApiError extends Error {
  constructor(message, status = 400, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
const fail = (status, message, data = {}) => {
  throw new ApiError(message, status, data);
};

// ── Server ──────────────────────────────────────────────────────────────────
async function server(method, action, { body, params } = {}) {
  const qs = new URLSearchParams({ a: action, ...(params || {}) });
  const opts = { method, headers: { 'X-BW-Admin': '1' } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`/admin/api.php?${qs}`, opts);
  } catch {
    fail(0, 'Could not reach the server. Check your internet connection.');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && action !== 'password') {
    location.reload(); // back to the login page
    fail(401, 'Session ended');
  }
  if (!res.ok) fail(res.status, data.error || `Request failed (${res.status})`, data);
  return data;
}

// ── Repository snapshot ─────────────────────────────────────────────────────
let snap = null; // { head, date, files: { path: { sha, size } }, at }
const textCache = new Map(); // blob sha -> text

async function tree(force = false) {
  if (!force && snap && Date.now() - snap.at < 4000) return snap;
  snap = { ...(await server('GET', 'tree')), at: Date.now() };
  return snap;
}

async function readTexts(paths) {
  const t = await tree();
  const missing = [...new Set(paths.map((p) => t.files[p]?.sha).filter((s) => s && !textCache.has(s)))];
  for (let i = 0; i < missing.length; i += 200) {
    const r = await server('POST', 'blobs', { body: { shas: missing.slice(i, i + 200) } });
    for (const [sha, text] of Object.entries(r.blobs)) textCache.set(sha, text);
  }
  return Object.fromEntries(paths.map((p) => [p, t.files[p] ? textCache.get(t.files[p].sha) ?? null : null]));
}

async function commit(message, files, expect = {}, skipBuild = false) {
  const r = await server('POST', 'commit', { body: { message, files, expect, skipBuild } });
  snap = null;
  return r;
}

// ── Images ──────────────────────────────────────────────────────────────────
function imageFiles(t) {
  const out = [];
  for (const [path, e] of Object.entries(t.files)) {
    const dir = path.slice(0, path.lastIndexOf('/'));
    const file = path.slice(path.lastIndexOf('/') + 1);
    if (dir === M.SRC_DIR && M.RASTER_RE.test(file)) out.push({ path, file, kind: 'photo', ...e });
    else if (dir === M.PUB_DIR && /\.svg$/i.test(file)) out.push({ path, file, kind: 'svg', ...e });
  }
  return out.map((i) => ({ ...i, slot: i.file.replace(/\.[a-z0-9]+$/i, ''), url: M.rawUrl(i.path, i.sha) }));
}
const findImage = (t, slot) => imageFiles(t).find((i) => i.slot === slot);
const urlFor = (t, slot) => findImage(t, slot)?.url ?? M.placeholderUrl(slot);

// ── Articles ────────────────────────────────────────────────────────────────
function blogPaths(t, dir = M.BLOG_DIR) {
  return Object.keys(t.files).filter((p) => p.startsWith(dir + '/') && p.endsWith('.md') && !p.slice(dir.length + 1).includes('/'));
}

async function readArticle(slug) {
  M.assertSlug(slug);
  const t = await tree();
  const path = M.articlePath(slug);
  if (!t.files[path]) fail(404, `No article with the slug "${slug}".`);
  const raw = (await readTexts([path]))[path];
  const { data, content } = M.parseFrontmatter(raw, yaml);
  return { raw, data, content, sha: t.files[path].sha, t };
}

function editorModel(slug, data, content, t, sha) {
  const images = data.images ?? [];
  return {
    slug,
    title: data.title ?? '',
    metaTitle: data.metaTitle ?? '',
    description: data.description ?? '',
    cluster: data.cluster ?? '',
    datePublished: M.dateStr(data.datePublished),
    dateModified: M.dateStr(data.dateModified),
    draft: data.draft === true,
    featuredImage: data.featuredImage ?? '',
    keywords: data.keywords ?? [],
    related: data.related ?? [],
    finding: data.finding ?? '',
    images,
    html: conv.toEditorHtml(content, images, (s) => urlFor(t, s)),
    words: M.wordCount(content),
    sha,
    ...M.validate(data, (s) => !!findImage(t, s)),
  };
}

async function getArticle(slug) {
  const { data, content, sha, t } = await readArticle(slug);
  return editorModel(slug, data, content, t, sha);
}

async function allArticles() {
  const t = await tree();
  const paths = blogPaths(t);
  const texts = await readTexts(paths);
  return paths.map((path) => {
    const slug = path.slice(M.BLOG_DIR.length + 1, -3);
    const { data, content } = M.parseFrontmatter(texts[path] ?? '', yaml);
    return { slug, path, data, content };
  });
}

async function listArticles() {
  const t = await tree();
  const list = await allArticles();
  return list
    .map(({ slug, data, content }) => {
      const images = data.images ?? [];
      const has = (s) => !!findImage(t, s);
      const thumbSlot =
        (data.featuredImage && has(data.featuredImage) && data.featuredImage) ||
        images.find((i) => i.type === 'photo' && has(i.slot))?.slot ||
        images.find((i) => has(i.slot))?.slot;
      const datePublished = M.dateStr(data.datePublished);
      const dateModified = M.dateStr(data.dateModified);
      return {
        slug,
        title: data.title ?? slug,
        cluster: data.cluster ?? '',
        datePublished,
        dateModified,
        modified: dateModified || datePublished || '',
        draft: data.draft === true,
        words: M.wordCount(content),
        thumb: thumbSlot ? urlFor(t, thumbSlot) : null,
        ...M.validate(data, has),
      };
    })
    .sort((a, b) => (b.datePublished || '9999').localeCompare(a.datePublished || '9999') || a.title.localeCompare(b.title));
}

async function readRedirects() {
  const t = await tree();
  if (!t.files[M.REDIRECTS]) return [];
  return JSON.parse((await readTexts([M.REDIRECTS]))[M.REDIRECTS] || '[]');
}
const redirectsFile = (list) => ({ path: M.REDIRECTS, content: JSON.stringify(list, null, 2) + '\n' });

async function saveArticle(originalSlug, p) {
  const slug = String(p.slug ?? '').trim() || M.slugify(p.title);
  M.assertSlug(slug);
  if (!String(p.title ?? '').trim()) fail(400, 'Give the article a title.');

  const t = await tree(true);
  let existing = null;
  if (originalSlug) existing = await readArticle(originalSlug);
  const newPath = M.articlePath(slug);
  if (slug !== originalSlug && t.files[newPath]) fail(409, `Another article already uses the slug "${slug}".`);

  const { body, images } = conv.fromEditorHtml(p.html ?? '', existing?.data.images ?? [], (s) => findImage(t, s)?.kind === 'svg');
  const draft = p.draft === true;
  const wasDraft = existing ? existing.data.draft === true : true;
  const data = {
    ...(existing?.data ?? {}),
    title: String(p.title).trim(),
    metaTitle: String(p.metaTitle ?? '').trim(),
    description: String(p.description ?? '').replace(/\s+/g, ' ').trim(),
    cluster: String(p.cluster ?? '').trim(),
    datePublished: String(p.datePublished ?? '').trim() || (draft ? '' : M.today()),
    dateModified: p.touchModified ? M.today() : M.dateStr(p.dateModified).trim(),
    draft,
    featuredImage: images.some((i) => i.slot === p.featuredImage) ? p.featuredImage : '',
    keywords: M.cleanList(p.keywords),
    related: M.cleanList(p.related).filter((s) => s !== slug),
    finding: String(p.finding ?? '').trim(),
    images,
  };
  if (!data.dateModified || (data.datePublished && data.dateModified < data.datePublished)) data.dateModified = data.datePublished;

  if (!draft) {
    const { errors } = M.validate(data, (s) => !!findImage(t, s));
    if (errors.length) fail(422, 'Fix these before publishing:', { errors });
  }

  const files = [{ path: newPath, content: M.serializeArticle(data, body, yaml) }];
  const expect = {};
  if (existing && !p.force) expect[M.articlePath(originalSlug)] = p.baseSha ?? existing.sha;
  if (slug !== originalSlug) expect[newPath] = null;

  const renamed = originalSlug && slug !== originalSlug;
  const touched = [];
  let redirects = await readRedirects();
  let redirectsChanged = false;
  if (renamed) {
    files.push({ path: M.articlePath(originalSlug), delete: true });
    if (!wasDraft) {
      // Old URL keeps working; chains collapse onto the newest slug.
      redirects = redirects.filter((r) => r.from !== slug && r.from !== originalSlug).map((r) => (r.to === originalSlug ? { ...r, to: slug } : r));
      redirects.push({ from: originalSlug, to: slug, created: M.today() });
      redirectsChanged = true;
    }
    // Update `related` lists and in-body links in the other articles.
    const linkRe = new RegExp(`\\]\\(/blog/${originalSlug}/?([#)])`, 'g');
    for (const a of await allArticles()) {
      if (a.slug === originalSlug || a.slug === slug) continue;
      let changed = false;
      const d = { ...a.data };
      if (Array.isArray(d.related) && d.related.includes(originalSlug)) {
        d.related = d.related.map((s) => (s === originalSlug ? slug : s));
        changed = true;
      }
      let b = a.content;
      if (linkRe.test(b)) {
        b = b.replace(linkRe, `](/blog/${slug}/$1`);
        changed = true;
      }
      linkRe.lastIndex = 0;
      if (changed) {
        files.push({ path: a.path, content: M.serializeArticle(d, b, yaml) });
        touched.push(a.slug);
      }
    }
  }
  if (!draft && redirects.some((r) => r.from === slug)) {
    redirects = redirects.filter((r) => r.from !== slug); // a live slug must not redirect away
    redirectsChanged = true;
  }
  if (redirectsChanged) files.push(redirectsFile(redirects));

  const verb = !existing ? (draft ? 'Create draft' : 'Publish') : draft ? (wasDraft ? 'Save draft' : 'Unpublish') : wasDraft ? 'Publish' : 'Update';
  await commit(`${verb}: ${data.title}${renamed ? ` (URL /blog/${originalSlug}/ -> /blog/${slug}/)` : ''}`, files, expect, draft && wasDraft);
  return { article: await getArticle(slug), renamedFrom: renamed ? originalSlug : null, updatedArticles: touched };
}

async function duplicateArticle(slug) {
  const { data, content, t } = await readArticle(slug);
  let copy = `${slug}-copy`;
  for (let i = 2; t.files[M.articlePath(copy)]; i++) copy = `${slug}-copy-${i}`;
  const next = { ...data, title: `${data.title} (copy)`, draft: true, datePublished: '', dateModified: '' };
  await commit(`Duplicate: ${data.title}`, [{ path: M.articlePath(copy), content: M.serializeArticle(next, content, yaml) }], { [M.articlePath(copy)]: null }, true);
  return getArticle(copy);
}

// ── Revisions (git history) ─────────────────────────────────────────────────
async function listRevisions(slug) {
  M.assertSlug(slug);
  const { revisions } = await server('GET', 'history', { params: { path: M.articlePath(slug) } });
  return revisions.slice(1); // the newest entry is the current version
}

async function getRevision(slug, id) {
  const { content: raw } = await server('GET', 'file', { params: { path: M.articlePath(slug), ref: id } });
  const t = await tree();
  const { data, content } = M.parseFrontmatter(raw, yaml);
  return { ...editorModel(slug, data, content, t, null), raw };
}

async function restoreRevision(slug, id) {
  const cur = await readArticle(slug);
  const rev = await getRevision(slug, id);
  const revDraft = M.parseFrontmatter(rev.raw, yaml).data.draft === true;
  await commit(`Restore earlier version: ${rev.title}`, [{ path: M.articlePath(slug), content: rev.raw.replace(/\r\n/g, '\n') }], { [M.articlePath(slug)]: cur.sha }, revDraft && cur.data.draft === true);
  return { article: await getArticle(slug), restoredFrom: rev.title };
}

// ── Trash ───────────────────────────────────────────────────────────────────
async function trashArticle(slug) {
  const { data, content, sha, t } = await readArticle(slug);
  let id = slug;
  if (t.files[`${M.TRASH_DIR}/${id}.md`]) id = `${slug}--${Date.now()}`;
  await commit(
    `Move to trash: ${data.title}`,
    [
      { path: `${M.TRASH_DIR}/${id}.md`, content: M.serializeArticle({ ...data, trashedAt: new Date().toISOString() }, content, yaml) },
      { path: M.articlePath(slug), delete: true },
    ],
    { [M.articlePath(slug)]: sha },
    data.draft === true,
  );
  return { trashed: slug };
}

async function listTrash() {
  const t = await tree();
  const paths = blogPaths(t, M.TRASH_DIR);
  const texts = await readTexts(paths);
  return paths
    .map((p) => {
      const id = p.slice(M.TRASH_DIR.length + 1, -3);
      const { data } = M.parseFrontmatter(texts[p] ?? '', yaml);
      return { id, slug: id.replace(/--\d+$/, ''), title: data.title ?? id, deletedAt: String(data.trashedAt ?? '') };
    })
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

function trashPath(id) {
  if (!/^[a-z0-9-]+$/.test(id)) fail(400, 'Bad trash id.');
  return `${M.TRASH_DIR}/${id}.md`;
}

async function restoreFromTrash(id) {
  const t = await tree(true);
  const path = trashPath(id);
  if (!t.files[path]) fail(404, 'Not in the trash.');
  const slug = id.replace(/--\d+$/, '');
  if (t.files[M.articlePath(slug)]) fail(409, `An article with the slug "${slug}" already exists. Rename or trash it first.`);
  const { data, content } = M.parseFrontmatter((await readTexts([path]))[path], yaml);
  delete data.trashedAt;
  // Back as a draft, so nothing goes live again without a deliberate publish.
  await commit(`Restore from trash: ${data.title}`, [
    { path: M.articlePath(slug), content: M.serializeArticle({ ...data, draft: true }, content, yaml) },
    { path, delete: true },
  ], { [M.articlePath(slug)]: null }, true);
  return getArticle(slug);
}

async function purgeFromTrash(id) {
  const path = trashPath(id);
  await commit(`Delete permanently: ${id}`, [{ path, delete: true }], {}, true);
  return { purged: id };
}

// ── Media ───────────────────────────────────────────────────────────────────
async function listMedia() {
  const t = await tree();
  const articles = await allArticles();
  const usage = new Map();
  for (const a of articles) {
    for (const s of new Set([...(a.data.images ?? []).map((i) => i.slot), a.data.featuredImage])) {
      if (!s) continue;
      if (!usage.has(s)) usage.set(s, []);
      usage.get(s).push({ slug: a.slug, title: a.data.title ?? a.slug });
    }
  }
  // Site pages reference photos by name in src/ (e.g. 'work-drainage-trench').
  const codePaths = Object.keys(t.files).filter((p) => p.startsWith('src/') && /\.(tsx?|mjs|js)$/.test(p));
  const code = Object.values(await readTexts(codePaths)).join('\n');
  return imageFiles(t)
    .map((i) => ({
      slot: i.slot,
      file: i.file,
      path: i.path,
      kind: i.kind,
      url: i.url,
      bytes: i.size,
      articles: usage.get(i.slot) ?? [],
      usedBySite: code.includes(`'${i.slot}'`) || code.includes(`"${i.slot}"`),
    }))
    .sort((a, b) => a.slot.localeCompare(b.slot));
}

async function deleteMedia(file) {
  const item = (await listMedia()).find((m) => m.file === file);
  if (!item) fail(404, 'File not found.');
  if (item.articles.length) fail(409, `Used in: ${item.articles.map((a) => a.title).join('; ')}. Remove it from those articles first.`);
  if (item.usedBySite) fail(409, 'This image is used by a site page (services, city pages or home). It cannot be deleted here.');
  await commit(`Delete image ${item.file}`, [{ path: item.path, delete: true }], {}, true);
  return { deleted: item.file };
}

/**
 * Resize in the browser before uploading: rotated upright from EXIF, at most
 * 2400px wide, re-encoded. The build makes the web sizes from this original.
 */
async function prepareUpload(file) {
  const name = file.name || 'pasted-image.png';
  if (/\.svg$/i.test(name) || file.type === 'image/svg+xml') return { blob: file, name };
  let bmp;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    fail(400, `"${name}" is not an image this browser can read. Use JPG, PNG, WebP or SVG.`);
  }
  const scale = Math.min(1, MAX_WIDTH / bmp.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close?.();
  const png = file.type === 'image/png' || /\.png$/i.test(name);
  const blob = await new Promise((r) => canvas.toBlob(r, png ? 'image/png' : 'image/jpeg', 0.88));
  return { blob, name: name.replace(/\.[^.]+$/, '') + (png ? '.png' : '.jpg') };
}

export async function uploadFile(file, onProgress) {
  const { blob, name } = await prepareUpload(file);
  const res = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/api.php?a=upload');
    xhr.setRequestHeader('X-BW-Admin', '1');
    xhr.setRequestHeader('X-Filename', encodeURIComponent(name));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 401) location.reload();
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new ApiError(data.error || `Upload failed (${xhr.status})`, xhr.status, data));
    };
    xhr.onerror = () => reject(new ApiError('Upload failed: the server did not respond.', 0));
    xhr.send(blob);
  });
  snap = null;
  const t = await tree(true);
  const sha = t.files[res.path]?.sha;
  return { ...res, url: M.rawUrl(res.path, sha), articles: [], usedBySite: false };
}

// ── Router ──────────────────────────────────────────────────────────────────
export async function api(method, url, body) {
  const u = new URL(url, location.origin);
  const [a, b, c, d] = u.pathname.replace(/^\/api\//, '').split('/').filter(Boolean).map(decodeURIComponent);
  const q = u.searchParams;
  try {
    if (a === 'session') return server('GET', 'session');
    if (a === 'logout') return server('POST', 'logout');
    if (a === 'account' && b === 'password') return server('POST', 'password', { body });
    if (a === 'connect') return server('POST', 'connect', { body });
    if (a === 'builds') return server('GET', 'builds');
    if (a === 'rebuild') return server('POST', 'rebuild');
    if (a === 'meta') {
      const list = await listArticles();
      return { clusters: [...new Set(list.map((x) => x.cluster).filter(Boolean))].sort(), articles: list.map((x) => ({ slug: x.slug, title: x.title, draft: x.draft })) };
    }
    if (a === 'slugify') {
      const base = M.slugify(q.get('text'));
      const taken = new Set((await listArticles()).map((x) => x.slug));
      taken.delete(q.get('current') || '');
      let slug = base;
      for (let i = 2; slug && taken.has(slug); i++) slug = `${base}-${i}`;
      return { slug };
    }
    if (a === 'articles') {
      if (!b && method === 'GET') return listArticles();
      if (!b && method === 'POST') return saveArticle(null, body);
      if (b && !c && method === 'GET') return getArticle(b);
      if (b && !c && method === 'PUT') return saveArticle(b, body);
      if (b && !c && method === 'DELETE') return trashArticle(b);
      if (c === 'duplicate') return duplicateArticle(b);
      if (c === 'revisions' && !d) return listRevisions(b);
      if (c === 'revisions' && method === 'GET') return getRevision(b, d);
      if (c === 'revisions' && method === 'POST') return restoreRevision(b, d);
    }
    if (a === 'trash') {
      if (!b) return listTrash();
      if (c === 'restore') return restoreFromTrash(b);
      if (method === 'DELETE') return purgeFromTrash(b);
    }
    if (a === 'redirects') {
      if (!b) return readRedirects();
      const next = (await readRedirects()).filter((r) => r.from !== b);
      await commit(`Remove redirect /blog/${b}/`, [redirectsFile(next)]);
      return next;
    }
    if (a === 'media') {
      if (!b) return listMedia();
      if (method === 'DELETE') return deleteMedia(b);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || String(err), 400);
  }
  fail(404, `Unknown route ${method} ${url}`);
}
