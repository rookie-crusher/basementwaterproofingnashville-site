// "Add media" dialog: upload or choose an image, set alt text and caption.
import { api, esc, el, modal, uploadFile, toastError, fmtBytes, showDimensions, $ } from './ui.js';

/**
 * mode 'insert' -> resolves { item, alt, caption }  (caption field shown)
 * mode 'pick'   -> resolves { item, alt }           (for TinyMCE's image dialog)
 * Resolves null if cancelled.
 */
export async function openMediaPicker({ mode = 'insert' } = {}) {
  let items = await api('GET', '/api/media');
  let selected = null;
  let filter = '';

  const body = el(`
    <div class="picker">
      <div class="picker-list">
        <div class="dropzone" id="mp-drop">
          <p style="margin:0 0 8px"><strong>Drop images here</strong> or</p>
          <label class="btn btn-sm">Select files<input type="file" id="mp-file" accept="image/*,.svg" multiple hidden></label>
          <p class="small" style="margin:8px 0 0">JPG, PNG, WebP or SVG. Photos are resized to 2400px wide before uploading and converted to fast AVIF/WebP when the site is published.</p>
          <div class="progress" id="mp-prog" hidden><div></div></div>
        </div>
        <div style="margin:12px 0"><input type="search" id="mp-q" placeholder="Search images…" aria-label="Search images"></div>
        <div class="media-grid" id="mp-grid"></div>
      </div>
      <div class="picker-side" id="mp-side"><p class="muted">Select an image to see its details.</p></div>
    </div>`);

  const grid = $('#mp-grid', body);
  const side = $('#mp-side', body);

  function paintGrid() {
    const n = filter.toLowerCase();
    const shown = items.filter((m) => !n || m.slot.includes(n));
    grid.innerHTML = shown.length
      ? shown.map((m) => `
        <button type="button" class="media-item ${selected?.slot === m.slot ? 'on' : ''}" data-slot="${esc(m.slot)}" title="${esc(m.file)}">
          <img src="${esc(m.url)}" alt="" loading="lazy"><div class="cap">${esc(m.slot)}</div>
        </button>`).join('')
      : '<p class="muted">No images found.</p>';
  }

  function paintSide() {
    if (!selected) {
      side.innerHTML = '<p class="muted">Select an image to see its details.</p>';
      return;
    }
    const used = selected.articles.map((a) => esc(a.title)).join(', ');
    side.innerHTML = `
      <img src="${esc(selected.url)}" alt="" data-preview style="width:100%;border-radius:6px;background:#eef2f7;max-height:200px;object-fit:contain">
      <dl class="kv"><dt>File</dt><dd class="mono">${esc(selected.file)}</dd>
        <dt>Size</dt><dd><span data-dims>…</span> · ${fmtBytes(selected.bytes)}</dd>
        ${used ? `<dt>Used in</dt><dd>${used}</dd>` : ''}</dl>
      <label class="field"><span>Alt text <span class="muted">(describes the image for screen readers and Google)</span></span>
        <textarea id="mp-alt" rows="2" placeholder="e.g. Crew sealing a crawl space vapor barrier seam"></textarea></label>
      ${mode === 'insert' ? `<label class="field"><span>Caption <span class="muted">(optional, shown under the image)</span></span>
        <textarea id="mp-cap" rows="2"></textarea></label>` : ''}`;
    showDimensions(side);
  }

  async function handleFiles(files) {
    const prog = $('#mp-prog', body);
    const bar = prog.firstElementChild;
    prog.hidden = false;
    let last = null;
    const list = [...files];
    for (let i = 0; i < list.length; i++) {
      try {
        last = await uploadFile(list[i], (p) => (bar.style.width = `${((i + p) / list.length) * 100}%`));
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
    $('#mp-alt', body)?.focus();
  }

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.media-item');
    if (!b) return;
    selected = items.find((m) => m.slot === b.dataset.slot);
    paintGrid();
    paintSide();
  });
  grid.addEventListener('dblclick', (e) => {
    if (e.target.closest('.media-item')) insertBtn()?.click();
  });
  $('#mp-q', body).addEventListener('input', (e) => {
    filter = e.target.value.trim();
    paintGrid();
  });
  $('#mp-file', body).addEventListener('change', (e) => handleFiles(e.target.files));
  const drop = $('#mp-drop', body);
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('over');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  paintGrid();

  let m;
  const insertBtn = () => m?.el.querySelector('.modal-foot .btn-primary');
  m = modal({
    title: mode === 'insert' ? 'Add media' : 'Choose an image',
    body,
    size: 'modal-lg',
    buttons: [
      { label: 'Cancel', value: null },
      {
        label: mode === 'insert' ? 'Insert into article' : 'Use this image',
        class: 'btn-primary',
        onClick: () => {
          if (!selected) {
            toastError(new Error('Select or upload an image first.'));
            return false;
          }
          return {
            item: selected,
            alt: $('#mp-alt', body)?.value.trim() ?? '',
            caption: $('#mp-cap', body)?.value.trim() ?? '',
          };
        },
      },
    ],
  });
  return m.promise;
}
