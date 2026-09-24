import { api, esc, fmtDate, statusBadge, toast, toastError, confirmDialog, $, $$, SITE } from '../ui.js';
import { refreshRebuildBadge } from '../app.js';

const prefs = { tab: 'all', q: '', cluster: '', sort: 'date' };

export async function render(el) {
  let list = await api('GET', '/api/articles');

  el.innerHTML = `
    <div class="page-head"><h1>Articles</h1><a class="btn btn-sm" href="#/new">Add new</a><span class="spacer"></span></div>
    <div class="filters">
      <div class="tabs" role="tablist" id="tabs"></div>
      <span class="spacer"></span>
      <select id="cluster" aria-label="Filter by category"></select>
      <select id="sort" aria-label="Sort">
        <option value="date">Newest first</option>
        <option value="modified">Recently updated</option>
        <option value="title">Title A–Z</option>
      </select>
      <input type="search" id="q" placeholder="Search articles…" aria-label="Search articles">
    </div>
    <div class="card table-wrap"><table class="list">
      <thead><tr><th style="width:80px"></th><th>Title</th><th class="col-hide">Category</th><th>Status</th><th class="col-hide">Words</th><th class="col-hide">Date</th></tr></thead>
      <tbody id="rows"></tbody>
    </table></div>`;

  const q = $('#q', el);
  const clusterSel = $('#cluster', el);
  const sortSel = $('#sort', el);
  q.value = prefs.q;
  sortSel.value = prefs.sort;

  function paintFilters() {
    const counts = { all: list.length, published: list.filter((a) => !a.draft).length, draft: list.filter((a) => a.draft).length, issues: list.filter((a) => a.errors.length || a.warnings.length).length };
    $('#tabs', el).innerHTML = [
      ['all', 'All'],
      ['published', 'Published'],
      ['draft', 'Drafts'],
      ['issues', 'Needs attention'],
    ].map(([k, label]) => `<button role="tab" data-tab="${k}" class="${prefs.tab === k ? 'on' : ''}" aria-selected="${prefs.tab === k}">${label} <span class="muted">(${counts[k]})</span></button>`).join('');
    const clusters = [...new Set(list.map((a) => a.cluster).filter(Boolean))].sort();
    clusterSel.innerHTML = `<option value="">All categories</option>` + clusters.map((c) => `<option ${c === prefs.cluster ? 'selected' : ''}>${esc(c)}</option>`).join('');
  }

  function paintRows() {
    const needle = prefs.q.toLowerCase();
    let rows = list.filter((a) => {
      if (prefs.tab === 'published' && a.draft) return false;
      if (prefs.tab === 'draft' && !a.draft) return false;
      if (prefs.tab === 'issues' && !(a.errors.length || a.warnings.length)) return false;
      if (prefs.cluster && a.cluster !== prefs.cluster) return false;
      if (needle && !`${a.title} ${a.slug} ${a.cluster}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    rows = rows.sort((a, b) =>
      prefs.sort === 'title' ? a.title.localeCompare(b.title)
        : prefs.sort === 'modified' ? (b.modified || '').localeCompare(a.modified || '')
        : (b.datePublished || '9999').localeCompare(a.datePublished || '9999'),
    );
    const tbody = $('#rows', el);
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">${list.length ? 'No articles match these filters.' : 'No articles yet. <a href="#/new">Write the first one</a>.'}</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((a) => `
      <tr data-slug="${esc(a.slug)}">
        <td>${a.thumb ? `<img class="thumb" src="${esc(a.thumb)}" alt="" loading="lazy">` : '<span class="thumb-empty"></span>'}</td>
        <td>
          <a class="row-title" href="#/edit/${esc(a.slug)}">${esc(a.title)}</a>
          <div class="small muted mono">/blog/${esc(a.slug)}/</div>
          ${a.errors.length ? `<div class="issues"><span class="badge badge-err">${a.errors.length} blocking</span> <span class="muted">${esc(a.errors[0])}</span></div>` : ''}
          ${!a.errors.length && a.warnings.length ? `<div class="issues"><span class="badge badge-warn">${a.warnings.length} warning${a.warnings.length === 1 ? '' : 's'}</span> <span class="muted">${esc(a.warnings[0])}</span></div>` : ''}
          <div class="row-actions">
            <a href="#/edit/${esc(a.slug)}">Edit</a>
            <button class="link-btn" data-act="dup">Duplicate</button>
            ${a.draft ? '' : `<a href="${SITE}/blog/${esc(a.slug)}/" target="_blank" rel="noopener">View live</a>`}
            <button class="link-btn link-danger" data-act="trash">Trash</button>
          </div>
        </td>
        <td class="col-hide">${esc(a.cluster || '—')}</td>
        <td>${statusBadge(a)}</td>
        <td class="col-hide">${a.words.toLocaleString()}</td>
        <td class="col-hide small">${a.draft ? 'Draft' : 'Published'}<br>${esc(fmtDate(a.draft ? a.modified : a.datePublished))}</td>
      </tr>`).join('');
  }

  paintFilters();
  paintRows();

  $('#tabs', el).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    prefs.tab = b.dataset.tab;
    paintFilters();
    paintRows();
  });
  q.addEventListener('input', () => {
    prefs.q = q.value;
    paintRows();
  });
  clusterSel.addEventListener('change', () => {
    prefs.cluster = clusterSel.value;
    paintRows();
  });
  sortSel.addEventListener('change', () => {
    prefs.sort = sortSel.value;
    paintRows();
  });

  $('#rows', el).addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const slug = btn.closest('tr').dataset.slug;
    const art = list.find((a) => a.slug === slug);
    try {
      if (btn.dataset.act === 'dup') {
        const copy = await api('POST', `/api/articles/${slug}/duplicate`);
        toast(`Duplicated as a draft: <a href="#/edit/${esc(copy.slug)}">${esc(copy.title)}</a>`, 'ok');
      } else if (btn.dataset.act === 'trash') {
        const ok = await confirmDialog(`Move <b>${esc(art.title)}</b> to the trash?${art.draft ? '' : ' It comes off the live site a few minutes later.'} You can restore it from Trash.`, { okText: 'Move to trash', danger: true });
        if (!ok) return;
        await api('DELETE', `/api/articles/${slug}`);
        toast('Moved to the trash. <a href="#/trash">Undo</a>', 'ok');
      }
      list = await api('GET', '/api/articles');
      paintFilters();
      paintRows();
      refreshRebuildBadge();
    } catch (err) {
      toastError(err);
    }
  });
}
