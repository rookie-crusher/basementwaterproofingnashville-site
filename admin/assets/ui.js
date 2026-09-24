// Shared helpers for the admin views.

export const SITE = 'https://basementwaterproofingnashville.com';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Data access (GitHub-backed) lives in store.js; re-exported for the views.
export { api, uploadFile, ApiError } from './store.js';

export function toast(message, type = '', ms = 4500) {
  const t = el(`<div class="toast ${type}" role="status"><div>${message}</div></div>`);
  document.getElementById('toasts').append(t);
  setTimeout(() => t.remove(), ms);
  return t;
}

export function toastError(err) {
  const extra = err?.data?.errors?.length ? `<br>${err.data.errors.map(esc).join('<br>')}` : '';
  toast(esc(err?.message || String(err)) + extra, 'err', 8000);
}

/**
 * Open a modal. `body` is an HTML string or node. Buttons are
 * [{ label, class, value }]; clicking one resolves the returned promise with
 * its value (or runs `onClick`, which may return false to keep it open).
 */
export function modal({ title, body, buttons = [], size = '', onOpen }) {
  const root = document.getElementById('modal-root');
  const backdrop = el(`
    <div class="modal-backdrop">
      <div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head"><h2>${esc(title)}</h2><button class="x" aria-label="Close">&times;</button></div>
        <div class="modal-body"></div>
        ${buttons.length ? '<div class="modal-foot"></div>' : ''}
      </div>
    </div>`);
  const bodyEl = $('.modal-body', backdrop);
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else if (body) bodyEl.append(body);

  const previouslyFocused = document.activeElement;
  let resolveFn;
  const promise = new Promise((r) => (resolveFn = r));
  const close = (value = null) => {
    backdrop.remove();
    document.removeEventListener('keydown', onKey, true);
    previouslyFocused?.focus?.();
    resolveFn(value);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close(null);
    }
  };
  document.addEventListener('keydown', onKey, true);
  $('.x', backdrop).onclick = () => close(null);
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) close(null);
  });

  const foot = $('.modal-foot', backdrop);
  for (const b of buttons) {
    const btn = el(`<button class="btn ${b.class || ''}" type="button">${esc(b.label)}</button>`);
    btn.onclick = async () => {
      if (b.onClick) {
        const r = await b.onClick(btn);
        if (r === false) return;
        close(r === undefined ? b.value : r);
      } else close(b.value);
    };
    foot.append(btn);
  }
  root.append(backdrop);
  onOpen?.(backdrop, close);
  (backdrop.querySelector('[autofocus]') || foot?.lastElementChild || $('.x', backdrop)).focus();
  return { el: backdrop, close, promise };
}

export function confirmDialog(message, { title = 'Are you sure?', okText = 'OK', danger = false } = {}) {
  return modal({
    title,
    body: `<p style="margin:0">${message}</p>`,
    buttons: [
      { label: 'Cancel', value: false },
      { label: okText, class: danger ? 'btn-danger-solid' : 'btn-primary', value: true },
    ],
  }).promise;
}

export function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s.length === 10 ? `${s}T12:00:00` : s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtDateTime(s) {
  if (!s) return '—';
  return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(s) {
  if (!s) return 'never';
  const sec = Math.round((Date.now() - new Date(s).getTime()) / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  return fmtDate(s);
}

export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function statusBadge(a) {
  return a.draft ? '<span class="badge badge-draft">Draft</span>' : '<span class="badge badge-ok">Published</span>';
}

/** Fill a [data-dims] label from the natural size of a [data-preview] image. */
export function showDimensions(root) {
  const img = root.querySelector('img[data-preview]');
  const label = root.querySelector('[data-dims]');
  if (!img || !label) return;
  const set = () => (label.textContent = img.naturalWidth ? `${img.naturalWidth}×${img.naturalHeight} px` : '—');
  if (img.complete) set();
  else img.addEventListener('load', set, { once: true });
}
