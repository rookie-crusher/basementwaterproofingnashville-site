// Router and shell. Each view module exports render(el, params) and may return
// { cleanup, canLeave } so the editor can guard unsaved changes.
import { api, $, $$, toastError } from './ui.js';
import * as dashboard from './views/dashboard.js';
import * as articles from './views/articles.js';
import * as editor from './views/editor.js';
import * as media from './views/media.js';
import * as build from './views/build.js';
import * as trash from './views/trash.js';
import * as settings from './views/settings.js';

const routes = [
  { re: /^\/?$/, nav: 'dashboard', view: dashboard, title: 'Dashboard' },
  { re: /^\/articles$/, nav: 'articles', view: articles, title: 'All articles' },
  { re: /^\/new$/, nav: 'new', view: editor, title: 'Add new article' },
  { re: /^\/edit\/([a-z0-9-]+)$/, nav: 'articles', view: editor, title: 'Edit article', params: (m) => ({ slug: m[1] }) },
  { re: /^\/media$/, nav: 'media', view: media, title: 'Media library' },
  { re: /^\/build$/, nav: 'build', view: build, title: 'Publishing' },
  { re: /^\/trash$/, nav: 'trash', view: trash, title: 'Trash' },
  { re: /^\/settings$/, nav: 'settings', view: settings, title: 'Settings' },
];

const view = $('#view');
let current = null; // { cleanup, canLeave }
let currentHash = null;
let silent = false;
let navToken = 0;

/** Change the URL without re-rendering, e.g. after a new article gets its slug. */
export function setHashSilently(hash) {
  silent = true;
  currentHash = hash;
  location.hash = hash;
}

async function route() {
  const hash = location.hash || '#/';
  if (silent) {
    silent = false;
    return;
  }
  if (current?.canLeave && !current.canLeave()) {
    // Put the old hash back without triggering another route.
    silent = true;
    location.hash = currentHash;
    return;
  }
  current?.cleanup?.();
  current = null;
  currentHash = hash;

  const path = hash.slice(1);
  const r = routes.find((x) => x.re.test(path)) ?? routes[0];
  const params = r.params ? r.params(path.match(r.re)) : {};
  $$('#nav a[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === r.nav));
  $('#nav').classList.remove('open');
  $('#nav-toggle').setAttribute('aria-expanded', 'false');
  document.title = `${r.title} · Site Admin`;
  // Each page renders into its own container. Loading can take a few seconds
  // (GitHub), and a page the user already left must not paint over the new one.
  const container = document.createElement('div');
  container.innerHTML = '<p class="loading">Loading…</p>';
  view.replaceChildren(container);
  window.scrollTo(0, 0);
  const token = ++navToken;
  try {
    const result = (await r.view.render(container, params)) || null;
    // The user navigated elsewhere while this view was still loading.
    if (token !== navToken) return result?.cleanup?.();
    current = result;
  } catch (err) {
    if (err.status === 401 || token !== navToken) return;
    // Not connected to GitHub yet (or the token stopped working): go to Settings.
    if (err.data?.setup && r.nav !== 'settings') {
      location.hash = '#/settings';
      return;
    }
    container.innerHTML = `<div class="card card-pad"><h2>Could not load this page</h2><p class="muted">${err.message}</p><p><a href="#/">Back to the dashboard</a></p></div>`;
    toastError(err);
  }
  refreshRebuildBadge();
}

/** Nav badge: changes are being published, or the last publish failed (!). */
let badgeTimer = null;
export async function refreshRebuildBadge() {
  clearTimeout(badgeTimer);
  try {
    const { runs } = await api('GET', '/api/builds');
    const last = runs[0];
    const badge = $('#build-badge');
    const running = last && last.status !== 'completed';
    const failed = last && last.status === 'completed' && last.conclusion === 'failure';
    badge.hidden = !running && !failed;
    badge.textContent = running ? 'Publishing' : '!';
    badge.className = `badge ${running ? 'badge-ok' : 'badge-err'}`;
    badge.title = running ? 'Your latest changes are being published' : 'The last publish failed. Open Publishing for details.';
    if (running) badgeTimer = setTimeout(refreshRebuildBadge, 15000);
  } catch {}
}

window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', (e) => {
  if (current?.canLeave && !current.canLeave(true)) {
    e.preventDefault();
    e.returnValue = '';
  }
});

$('#nav-toggle').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('#nav-toggle').setAttribute('aria-expanded', String(open));
});

$('#logout').addEventListener('click', async () => {
  if (current?.canLeave && !current.canLeave()) return;
  current = null;
  await api('POST', '/api/logout').catch(() => {});
  location.href = '/admin/';
});

api('GET', '/api/session')
  .then((s) => ($('#whoami').textContent = `(${s.username})`))
  .catch(() => {});

route();
