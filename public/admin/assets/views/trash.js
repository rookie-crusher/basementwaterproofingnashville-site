import { api, esc, fmtDateTime, toast, toastError, confirmDialog, $ } from '../ui.js';
import { refreshRebuildBadge } from '../app.js';

export async function render(el) {
  let items = await api('GET', '/api/trash');

  el.innerHTML = `
    <div class="page-head"><h1>Trash</h1><span class="spacer"></span></div>
    <p class="muted" style="margin-top:-8px">Restored articles come back as drafts, so nothing goes live again until you publish it.</p>
    <div class="card table-wrap"><table class="list">
      <thead><tr><th>Title</th><th class="col-hide">Slug</th><th class="col-hide">Deleted</th><th style="width:1%"></th></tr></thead>
      <tbody id="t-rows"></tbody></table></div>`;

  function paint() {
    $('#t-rows', el).innerHTML = items.length
      ? items.map((t) => `
        <tr data-id="${esc(t.id)}">
          <td><b>${esc(t.title)}</b></td>
          <td class="col-hide mono">${esc(t.slug)}</td>
          <td class="col-hide small">${t.deletedAt ? esc(fmtDateTime(t.deletedAt)) : '—'}</td>
          <td style="white-space:nowrap"><button class="btn btn-sm" data-act="restore">Restore</button> <button class="btn btn-sm btn-danger" data-act="purge">Delete permanently</button></td>
        </tr>`).join('')
      : '<tr><td colspan="4" class="empty">The trash is empty.</td></tr>';
  }
  paint();

  $('#t-rows', el).addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const id = b.closest('tr').dataset.id;
    const item = items.find((t) => t.id === id);
    try {
      if (b.dataset.act === 'restore') {
        const a = await api('POST', `/api/trash/${id}/restore`);
        toast(`Restored as a draft: <a href="#/edit/${esc(a.slug)}">${esc(a.title)}</a>`, 'ok');
      } else {
        if (!(await confirmDialog(`Permanently delete <b>${esc(item.title)}</b> and its revision history? This cannot be undone.`, { okText: 'Delete permanently', danger: true }))) return;
        await api('DELETE', `/api/trash/${id}`);
        toast('Deleted permanently.', 'ok');
      }
      items = await api('GET', '/api/trash');
      paint();
      refreshRebuildBadge();
    } catch (err) {
      toastError(err);
    }
  });
}
