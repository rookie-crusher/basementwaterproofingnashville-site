import { api, esc, uploadFile, toast, toastError, confirmDialog, fmtBytes, showDimensions, $ } from '../ui.js';

export async function render(el) {
  let items = await api('GET', '/api/media');
  let selected = null;
  const f = { q: '', type: '' };

  el.innerHTML = `
    <div class="page-head"><h1>Media library</h1>
      <label class="btn btn-sm btn-primary">Upload images<input type="file" id="m-file" accept="image/*,.svg" multiple hidden></label>
      <span class="spacer"></span></div>
    <div class="dropzone" id="m-drop" style="margin-bottom:16px">
      <strong>Drop images anywhere here to upload</strong>
      <p class="small" style="margin:6px 0 0">Photos are turned upright and resized to 2400px wide in your browser before uploading. Publishing turns them into fast AVIF and WebP at four sizes. SVG diagrams are kept as they are.</p>
      <div class="progress" id="m-prog" hidden><div></div></div>
    </div>
    <div class="filters">
      <input type="search" id="m-q" placeholder="Search by file name…" aria-label="Search images">
      <select id="m-type" aria-label="Filter">
        <option value="">All images</option><option value="photo">Photos</option><option value="svg">SVG diagrams</option><option value="unused">Not used anywhere</option>
      </select>
      <span class="spacer"></span><span class="muted small" id="m-count"></span>
    </div>
    <div class="media-layout">
      <div class="media-grid" id="m-grid"></div>
      <aside class="card card-pad media-detail" id="m-side"><p class="muted" style="margin:0">Select an image to see where it is used.</p></aside>
    </div>`;

  const grid = $('#m-grid', el);
  const side = $('#m-side', el);

  function unused(m) {
    return !m.articles.length && !m.usedBySite;
  }

  function paintGrid() {
    const n = f.q.toLowerCase();
    const shown = items.filter((m) => {
      if (n && !m.file.toLowerCase().includes(n)) return false;
      if (f.type === 'photo' && m.kind !== 'photo') return false;
      if (f.type === 'svg' && m.kind !== 'svg') return false;
      if (f.type === 'unused' && !unused(m)) return false;
      return true;
    });
    $('#m-count', el).textContent = `${shown.length} of ${items.length}`;
    grid.innerHTML = shown.length
      ? shown.map((m) => `
        <button type="button" class="media-item ${selected?.file === m.file ? 'on' : ''}" data-file="${esc(m.file)}" title="${esc(m.file)}">
          ${unused(m) ? '<span class="badge flag">Unused</span>' : ''}
          <img src="${esc(m.url)}" alt="" loading="lazy"><div class="cap">${esc(m.slot)}</div>
        </button>`).join('')
      : '<p class="muted">No images match.</p>';
  }

  function paintSide() {
    if (!selected) {
      side.innerHTML = '<p class="muted" style="margin:0">Select an image to see where it is used.</p>';
      return;
    }
    const m = selected;
    const blocked = m.articles.length || m.usedBySite;
    side.innerHTML = `
      <img src="${esc(m.url)}" alt="" data-preview>
      <dl class="kv">
        <dt>File</dt><dd class="mono">${esc(m.file)}</dd>
        <dt>Type</dt><dd>${m.kind === 'svg' ? 'SVG diagram' : 'Photo'}</dd>
        <dt>Size</dt><dd><span data-dims>…</span> · ${fmtBytes(m.bytes)}</dd>
        <dt>Used in</dt><dd>${m.articles.length ? m.articles.map((a) => `<a href="#/edit/${esc(a.slug)}">${esc(a.title)}</a>`).join('<br>') : m.usedBySite ? 'Site pages (services, city pages or home)' : '<span class="muted">Nothing yet</span>'}</dd>
      </dl>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn btn-sm" href="${esc(m.url)}" target="_blank" rel="noopener">Open original</a>
        <button type="button" class="btn btn-sm btn-danger" id="m-del" ${blocked ? 'disabled title="Remove it from the pages that use it first"' : ''}>Delete permanently</button>
      </div>
      ${blocked ? '<p class="hint">Images in use cannot be deleted. Remove them from the articles first.</p>' : ''}`;
    showDimensions(side);
    $('#m-del', side)?.addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete <b>${esc(m.file)}</b>? This cannot be undone.`, { okText: 'Delete', danger: true }))) return;
      try {
        await api('DELETE', `/api/media/${encodeURIComponent(m.file)}`);
        items = items.filter((x) => x.file !== m.file);
        selected = null;
        paintGrid();
        paintSide();
        toast('Image deleted.', 'ok');
      } catch (err) {
        toastError(err);
      }
    });
  }

  async function handleFiles(files) {
    const prog = $('#m-prog', el);
    const bar = prog.firstElementChild;
    prog.hidden = false;
    const list = [...files];
    let ok = 0;
    let last = null;
    for (let i = 0; i < list.length; i++) {
      try {
        last = await uploadFile(list[i], (p) => (bar.style.width = `${((i + p) / list.length) * 100}%`));
        ok++;
      } catch (err) {
        toastError(err);
      }
    }
    prog.hidden = true;
    bar.style.width = '0';
    items = await api('GET', '/api/media');
    if (last) selected = items.find((m) => m.slot === last.slot) ?? null;
    paintGrid();
    paintSide();
    if (ok) toast(`${ok} image${ok === 1 ? '' : 's'} uploaded. Insert them from the article editor with <b>Add media</b>.`, 'ok');
  }

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.media-item');
    if (!b) return;
    selected = items.find((m) => m.file === b.dataset.file);
    paintGrid();
    paintSide();
  });
  $('#m-q', el).addEventListener('input', (e) => {
    f.q = e.target.value.trim();
    paintGrid();
  });
  $('#m-type', el).addEventListener('change', (e) => {
    f.type = e.target.value;
    paintGrid();
  });
  $('#m-file', el).addEventListener('change', (e) => handleFiles(e.target.files));

  const drop = $('#m-drop', el);
  const over = (e) => {
    if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
    e.preventDefault();
    drop.classList.add('over');
  };
  const leave = () => drop.classList.remove('over');
  const dropped = (e) => {
    if (!e.dataTransfer?.files.length) return;
    e.preventDefault();
    leave();
    handleFiles(e.dataTransfer.files);
  };
  el.addEventListener('dragover', over);
  el.addEventListener('dragleave', leave);
  el.addEventListener('drop', dropped);

  paintGrid();

  return {
    cleanup() {
      el.removeEventListener('dragover', over);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', dropped);
    },
  };
}
