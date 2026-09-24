// Article editor: TinyMCE for the body, WordPress-style boxes in the sidebar.
import {
  api, esc, el, $, $$, toast, toastError, modal, confirmDialog, uploadFile,
  fmtDate, fmtDateTime, timeAgo, today, debounce, SITE,
} from '../ui.js';
import { openMediaPicker } from '../media-picker.js';
import { setHashSilently, refreshRebuildBadge } from '../app.js';
import { slotFromUrl } from '../core/model.js';

const blank = () => ({
  slug: '', title: '', metaTitle: '', description: '', cluster: '', datePublished: today(), dateModified: '',
  draft: true, featuredImage: '', keywords: [], related: [], finding: '', images: [], html: '', sha: null,
  errors: [], warnings: [],
});

export async function render(el0, { slug } = {}) {
  const isNewAtStart = !slug;
  const [loaded, meta] = await Promise.all([
    slug ? api('GET', `/api/articles/${slug}`) : Promise.resolve(blank()),
    api('GET', '/api/meta'),
  ]);

  let article = loaded; // last saved server state
  const s = structuredClone(loaded); // working copy
  let isNew = isNewAtStart;
  let slugTouched = !isNew;
  let metaTouched = !isNew || !!s.metaTitle;
  let editingSlug = false;
  let dirty = false;
  let savedAt = null;
  let saving = false;
  let editor = null;
  let destroyed = false;
  const autosaveKey = () => `bw-autosave:${article.slug || 'new'}`;

  el0.innerHTML = `
    <div class="page-head">
      <h1 id="page-title">${isNew ? 'Add new article' : 'Edit article'}</h1>
      ${isNew ? '' : '<a class="btn btn-sm" href="#/new">Add new</a>'}
      <span class="spacer"></span>
      <span id="view-links"></span>
    </div>
    <div id="banners"></div>
    <div class="editor-grid">
      <div>
        <label class="sr-only" for="f-title">Title</label>
        <input id="f-title" class="title-input" placeholder="Add title" autocomplete="off">
        <div class="permalink" id="permalink"></div>
        <div class="editor-toolbar">
          <button type="button" class="btn btn-sm" id="add-media"><i class="ico ico-image"></i>Add media</button>
          <span class="small muted">Drag and drop or paste images straight into the editor. Use <b>Heading 2</b> for sections; they become the table of contents.</span>
        </div>
        <div class="editor-wrap"><textarea id="editor"></textarea></div>
      </div>

      <aside class="side">
        <details class="box" open>
          <summary>Publish</summary>
          <div class="box-body">
            <div class="publish-meta">
              <div class="row"><span>Status</span><span id="status-badge"></span></div>
              <label class="row"><span>Publish date</span><input type="date" id="f-date" style="width:auto"></label>
              <div class="row"><span>Last updated</span><span id="modified-label"></span></div>
              <label class="checkbox"><input type="checkbox" id="f-touch" checked> Set “last updated” to today when I save</label>
            </div>
            <ul class="msgs" id="msgs"></ul>
            <div class="publish-actions">
              <button type="button" class="link-btn link-danger" id="trash-btn">Move to trash</button>
              <div class="btns" id="publish-btns"></div>
            </div>
            <p class="save-state" id="save-state" style="margin:10px 0 0"></p>
          </div>
        </details>

        <details class="box" open>
          <summary>SEO</summary>
          <div class="box-body">
            <label class="field"><span>SEO title <span class="counter" id="c-meta"></span></span>
              <input id="f-meta" maxlength="80" placeholder="Shown as the blue link in Google">
              <span class="hint"><button type="button" class="link-btn" id="meta-from-title">Use the article title</button> · 60 characters max</span></label>
            <label class="field"><span>Meta description <span class="counter" id="c-desc"></span></span>
              <textarea id="f-desc" rows="4" placeholder="One or two sentences that make someone want to click"></textarea>
              <span class="hint">120–155 characters is best (110–165 allowed)</span></label>
            <div class="field-label">Google preview</div>
            <div class="serp"><div class="serp-url" id="serp-url"></div><div class="serp-title" id="serp-title"></div><div class="serp-desc" id="serp-desc"></div></div>
          </div>
        </details>

        <details class="box" open>
          <summary>Category</summary>
          <div class="box-body">
            <input id="f-cluster" list="cluster-list" placeholder="e.g. Crawl spaces">
            <datalist id="cluster-list">${meta.clusters.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
            <span class="hint">Pick an existing category or type a new one. The /blog/ page groups articles by category.</span>
          </div>
        </details>

        <details class="box" open>
          <summary>Keywords</summary>
          <div class="box-body">
            <div class="tags" id="tags"><input id="tag-input" placeholder="Add a keyword and press Enter" aria-label="Add keyword"></div>
            <span class="hint">Target search phrases, for your own tracking. Not shown on the page.</span>
          </div>
        </details>

        <details class="box" open>
          <summary>Featured image</summary>
          <div class="box-body">
            <div class="feat-grid" id="feat"></div>
            <span class="hint">Shown on the article's card on /blog/. Choose from images in the article.</span>
          </div>
        </details>

        <details class="box">
          <summary>Related articles</summary>
          <div class="box-body">
            <div class="check-list" id="related"></div>
            <span class="hint">Shown under the article. Articles in the same category are added automatically.</span>
          </div>
        </details>

        <details class="box">
          <summary>Key finding (optional)</summary>
          <div class="box-body">
            <textarea id="f-finding" rows="3" placeholder="One line on the original finding and how it was reached."></textarea>
          </div>
        </details>

        <details class="box" id="rev-box">
          <summary>Revisions <span class="badge" id="rev-count">0</span></summary>
          <div class="box-body"><ul class="plain rev-list" id="revs"><li class="muted">Loading…</li></ul></div>
        </details>
      </aside>
    </div>`;

  const f = {
    title: $('#f-title', el0), date: $('#f-date', el0), touch: $('#f-touch', el0), meta: $('#f-meta', el0),
    desc: $('#f-desc', el0), cluster: $('#f-cluster', el0), finding: $('#f-finding', el0), tagInput: $('#tag-input', el0),
  };

  // ── Paint helpers ──────────────────────────────────────────────────────
  function fillFields() {
    f.title.value = s.title;
    f.date.value = s.datePublished || '';
    f.meta.value = s.metaTitle;
    f.desc.value = s.description;
    f.cluster.value = s.cluster;
    f.finding.value = s.finding;
    paintTags();
    paintRelated();
    paintCounters();
    paintPermalink();
  }

  function paintHeader() {
    $('#page-title', el0).textContent = isNew ? 'Add new article' : 'Edit article';
    $('#view-links', el0).innerHTML = !isNew && !article.draft
      ? `<a class="btn btn-sm" href="${SITE}/blog/${esc(article.slug)}/" target="_blank" rel="noopener">View live</a>`
      : '';
    $('#status-badge', el0).innerHTML = isNew ? '<span class="badge">Not saved yet</span>' : article.draft ? '<span class="badge badge-draft">Draft</span>' : '<span class="badge badge-ok">Published</span>';
    $('#modified-label', el0).textContent = article.dateModified ? fmtDate(article.dateModified) : '—';
    $('#trash-btn', el0).hidden = isNew;
    $('#rev-box', el0).hidden = isNew;
    const btns = $('#publish-btns', el0);
    btns.innerHTML = article.draft || isNew
      ? `<button type="button" class="btn" data-save="draft">Save draft</button><button type="button" class="btn btn-primary" data-save="publish">Publish</button>`
      : `<button type="button" class="btn" data-save="draft" title="Takes it off the live site">Switch to draft</button><button type="button" class="btn btn-primary" data-save="publish">Update</button>`;
  }

  function paintMsgs(errors = article.errors, warnings = article.warnings) {
    $('#msgs', el0).innerHTML = [
      ...(errors || []).map((m) => `<li class="err">${esc(m)}</li>`),
      ...(warnings || []).map((m) => `<li class="warn">${esc(m)}</li>`),
    ].join('');
  }

  function paintSaveState(text) {
    const st = $('#save-state', el0);
    if (text) {
      st.textContent = text;
      st.className = 'save-state';
      return;
    }
    st.className = `save-state ${dirty ? 'dirty' : ''}`;
    st.textContent = dirty ? 'Unsaved changes (Ctrl+S to save)' : isNew ? 'Not saved yet' : savedAt ? `Saved ${timeAgo(savedAt)}` : 'No unsaved changes';
  }

  function paintPermalink() {
    const box = $('#permalink', el0);
    if (editingSlug) {
      box.innerHTML = `<span>Permalink:</span><span class="mono">${SITE.replace('https://', '')}/blog/</span>
        <input id="slug-input" value="${esc(s.slug)}" aria-label="URL slug" spellcheck="false"><span class="mono">/</span>
        <button type="button" class="btn btn-sm" id="slug-ok">OK</button>
        <button type="button" class="link-btn" id="slug-regen">From title</button>
        <button type="button" class="link-btn" id="slug-cancel">Cancel</button>`;
      const input = $('#slug-input', box);
      input.focus();
      input.select();
      const commit = () => {
        const v = input.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!v) return toastError(new Error('The slug cannot be empty.'));
        if (v !== s.slug) {
          s.slug = v;
          slugTouched = true;
          markDirty();
        }
        editingSlug = false;
        paintPermalink();
      };
      $('#slug-ok', box).onclick = commit;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          editingSlug = false;
          paintPermalink();
        }
      };
      $('#slug-cancel', box).onclick = () => {
        editingSlug = false;
        paintPermalink();
      };
      $('#slug-regen', box).onclick = async () => {
        const r = await api('GET', `/api/slugify?text=${encodeURIComponent(f.title.value)}&current=${encodeURIComponent(article.slug)}`);
        input.value = r.slug;
      };
      return;
    }
    const renamed = !isNew && s.slug !== article.slug;
    box.innerHTML = s.slug
      ? `<span>Permalink:</span><code>${SITE}/blog/<b>${esc(s.slug)}</b>/</code><button type="button" class="btn btn-sm" id="slug-edit">Edit</button>
         ${renamed && !article.draft ? `<span class="badge badge-warn">Changed. A 301 redirect from /blog/${esc(article.slug)}/ will be added.</span>` : ''}`
      : '<span>Permalink: created from the title</span>';
    $('#slug-edit', box)?.addEventListener('click', () => {
      editingSlug = true;
      paintPermalink();
    });
    paintSerp();
  }

  function counter(elm, len, ok, bad) {
    elm.textContent = `${len} chars`;
    elm.className = `counter ${bad ? 'bad' : ok ? 'good' : ''}`;
  }

  function paintCounters() {
    const ml = f.meta.value.length;
    counter($('#c-meta', el0), ml, ml > 0 && ml <= 60, ml > 60);
    const dl = f.desc.value.length;
    counter($('#c-desc', el0), dl, dl >= 120 && dl <= 155, dl > 0 && (dl < 110 || dl > 165));
    paintSerp();
  }

  function paintSerp() {
    $('#serp-url', el0).textContent = `basementwaterproofingnashville.com › blog › ${s.slug || '…'}`;
    const t = f.meta.value || f.title.value || 'SEO title';
    $('#serp-title', el0).textContent = t.length > 62 ? `${t.slice(0, 60)}…` : t;
    $('#serp-desc', el0).textContent = f.desc.value || 'Your meta description appears here.';
  }

  function paintTags() {
    const box = $('#tags', el0);
    $$('.tag', box).forEach((t) => t.remove());
    s.keywords.forEach((k, i) => {
      const t = el(`<span class="tag">${esc(k)}<button type="button" aria-label="Remove ${esc(k)}" data-i="${i}">&times;</button></span>`);
      box.insertBefore(t, f.tagInput);
    });
  }

  function paintRelated() {
    const others = meta.articles.filter((a) => a.slug !== article.slug && a.slug !== s.slug);
    $('#related', el0).innerHTML = others.length
      ? others.map((a) => `<label class="checkbox"><input type="checkbox" value="${esc(a.slug)}" ${s.related.includes(a.slug) ? 'checked' : ''}> <span>${esc(a.title)}${a.draft ? ' <span class="badge badge-draft">Draft</span>' : ''}</span></label>`).join('')
      : '<p class="muted small" style="margin:0">No other articles yet.</p>';
  }

  /** Images currently in the editor, for the featured image picker. */
  function editorImages() {
    // A debounced refresh can fire after the editor was closed.
    if (!editor || destroyed || !editor.getBody()) return [];
    const seen = new Set();
    return [...editor.getBody().querySelectorAll('img')]
      .map((img) => {
        const src = img.getAttribute('src') || '';
        const slot = img.getAttribute('data-slot') || slotFromUrl(src) || '';
        return { slot, src, placeholder: src.includes('a=placeholder') };
      })
      .filter((i) => i.slot && !i.placeholder && !seen.has(i.slot) && seen.add(i.slot));
  }

  function paintFeatured() {
    if (destroyed) return;
    const imgs = editorImages();
    if (s.featuredImage && !imgs.some((i) => i.slot === s.featuredImage)) s.featuredImage = '';
    $('#feat', el0).innerHTML =
      `<button type="button" data-slot="" class="${s.featuredImage ? '' : 'on'}" title="First photo in the article"><span class="auto">Automatic</span></button>` +
      imgs.map((i) => `<button type="button" data-slot="${esc(i.slot)}" class="${s.featuredImage === i.slot ? 'on' : ''}" title="${esc(i.slot)}"><img src="${esc(i.src)}" alt=""></button>`).join('');
  }

  async function paintRevisions() {
    if (isNew) return;
    try {
      const revs = await api('GET', `/api/articles/${article.slug}/revisions`);
      $('#rev-count', el0).textContent = revs.length;
      $('#revs', el0).innerHTML = revs.length
        ? revs.map((r) => `<li><span>${esc(fmtDateTime(r.savedAt))}<br><span class="muted">${esc(r.message.replace(/\s*\[skip ci\]/, ''))}</span></span><button type="button" class="btn btn-sm" data-rev="${esc(r.id)}" data-at="${esc(r.savedAt)}">Preview</button></li>`).join('')
        : '<li class="muted">Earlier versions appear here each time you save.</li>';
    } catch {}
  }

  // ── Dirty tracking & autosave ─────────────────────────────────────────
  function markDirty() {
    if (destroyed) return;
    dirty = true;
    paintSaveState();
  }

  function collect(draft) {
    return {
      slug: s.slug,
      title: f.title.value.trim(),
      metaTitle: f.meta.value.trim(),
      description: f.desc.value.trim(),
      cluster: f.cluster.value.trim(),
      datePublished: f.date.value,
      dateModified: article.dateModified,
      touchModified: f.touch.checked && !draft,
      draft,
      featuredImage: s.featuredImage,
      keywords: s.keywords,
      related: $$('#related input:checked', el0).map((i) => i.value),
      finding: f.finding.value.trim(),
      html: editor ? editor.getContent() : s.html,
      baseSha: article.sha,
    };
  }

  const autosaveTimer = setInterval(() => {
    if (!dirty || !editor) return;
    try {
      localStorage.setItem(autosaveKey(), JSON.stringify({ at: Date.now(), payload: collect(article.draft) }));
    } catch {}
  }, 15000);

  function checkAutosave() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(autosaveKey()) || 'null');
    } catch {}
    if (!saved) return;
    const b = el(`<div class="banner banner-info"><span>There is an unsaved version of this article from ${esc(fmtDateTime(new Date(saved.at).toISOString()))} in this browser.</span><span class="spacer"></span>
      <button type="button" class="btn btn-sm btn-primary">Restore it</button><button type="button" class="btn btn-sm">Discard</button></div>`);
    const [restore, discard] = $$('button', b);
    restore.onclick = () => {
      const p = saved.payload;
      Object.assign(s, { title: p.title, metaTitle: p.metaTitle, description: p.description, cluster: p.cluster, datePublished: p.datePublished, keywords: p.keywords || [], related: p.related || [], finding: p.finding, featuredImage: p.featuredImage, slug: p.slug || s.slug });
      fillFields();
      editor.setContent(p.html || '');
      paintFeatured();
      markDirty();
      b.remove();
      toast('Unsaved version restored. Save to keep it.', 'ok');
    };
    discard.onclick = () => {
      try {
        localStorage.removeItem(autosaveKey());
      } catch {}
      b.remove();
    };
    $('#banners', el0).append(b);
  }

  // ── Save ──────────────────────────────────────────────────────────────
  async function save(draft, force = false) {
    if (saving || !editor) return;
    if (editingSlug) $('#slug-ok', el0)?.click();
    const payload = collect(draft);
    if (!payload.title) {
      f.title.focus();
      return toastError(new Error('Give the article a title first.'));
    }
    if (!payload.slug) {
      const r = await api('GET', `/api/slugify?text=${encodeURIComponent(payload.title)}`);
      payload.slug = s.slug = r.slug;
    }
    if (force) payload.force = true;
    const wasDraft = isNew || article.draft;
    saving = true;
    $$('#publish-btns button', el0).forEach((b) => (b.disabled = true));
    paintSaveState('Saving…');
    try {
      const oldKey = autosaveKey();
      const res = isNew ? await api('POST', '/api/articles', payload) : await api('PUT', `/api/articles/${article.slug}`, payload);
      const wasNew = isNew;
      article = res.article;
      isNew = false;
      Object.assign(s, { slug: article.slug, featuredImage: article.featuredImage, datePublished: article.datePublished });
      f.date.value = article.datePublished || '';
      dirty = false;
      try {
        localStorage.removeItem(oldKey);
      } catch {}
      if (wasNew || res.renamedFrom) setHashSilently(`#/edit/${article.slug}`);
      paintHeader();
      paintMsgs();
      paintPermalink();
      paintSaveState();
      paintRevisions();
      refreshRebuildBadge();

      savedAt = new Date().toISOString();
      let msg = draft ? 'Draft saved.' : wasDraft ? 'Published.' : 'Updated.';
      if (!draft) msg += ' It will be live in a few minutes (<a href="#/build">progress</a>).';
      if (res.renamedFrom) msg += `<br>URL changed from /blog/${esc(res.renamedFrom)}/${res.updatedArticles.length ? `; links in ${res.updatedArticles.length} other article(s) updated` : ''}.`;
      toast(msg, 'ok', 7000);
    } catch (err) {
      if (err.status === 409 && err.data?.conflict) {
        const ok = await confirmDialog(esc(err.message), { title: 'Changed on disk', okText: 'Overwrite with my version', danger: true });
        saving = false;
        if (ok) return save(draft, true);
      } else if (err.status === 422) {
        paintMsgs(err.data.errors || [], []);
        $('#msgs', el0).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        toastError(err);
      } else toastError(err);
      paintSaveState();
    } finally {
      saving = false;
      $$('#publish-btns button', el0).forEach((b) => (b.disabled = false));
    }
  }

  // ── Events ────────────────────────────────────────────────────────────
  const slugFromTitle = debounce(async () => {
    if (slugTouched || destroyed) return;
    const t = f.title.value.trim();
    if (!t) return;
    const r = await api('GET', `/api/slugify?text=${encodeURIComponent(t)}&current=${encodeURIComponent(article.slug)}`);
    if (!slugTouched) {
      s.slug = r.slug;
      paintPermalink();
    }
  }, 400);

  f.title.addEventListener('input', () => {
    s.title = f.title.value;
    if (!metaTouched) {
      f.meta.value = f.title.value.slice(0, 60);
      paintCounters();
    }
    slugFromTitle();
    paintSerp();
    markDirty();
  });
  f.meta.addEventListener('input', () => {
    metaTouched = true;
    paintCounters();
    markDirty();
  });
  $('#meta-from-title', el0).addEventListener('click', () => {
    f.meta.value = f.title.value.slice(0, 60);
    metaTouched = true;
    paintCounters();
    markDirty();
  });
  f.desc.addEventListener('input', () => {
    paintCounters();
    markDirty();
  });
  for (const x of [f.cluster, f.finding, f.date]) x.addEventListener('input', markDirty);
  $('#related', el0).addEventListener('change', markDirty);

  // Tags
  const addTag = (v) => {
    for (const part of v.split(',')) {
      const t = part.trim();
      if (t && !s.keywords.includes(t)) s.keywords.push(t);
    }
    f.tagInput.value = '';
    paintTags();
    markDirty();
  };
  f.tagInput.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && f.tagInput.value.trim()) {
      e.preventDefault();
      addTag(f.tagInput.value);
    } else if (e.key === 'Backspace' && !f.tagInput.value && s.keywords.length) {
      s.keywords.pop();
      paintTags();
      markDirty();
    }
  });
  f.tagInput.addEventListener('blur', () => f.tagInput.value.trim() && addTag(f.tagInput.value));
  $('#tags', el0).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) {
      s.keywords.splice(Number(b.dataset.i), 1);
      paintTags();
      markDirty();
    } else f.tagInput.focus();
  });

  $('#feat', el0).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-slot]');
    if (!b) return;
    s.featuredImage = b.dataset.slot;
    paintFeatured();
    markDirty();
  });

  $('#publish-btns', el0).addEventListener('click', (e) => {
    const b = e.target.closest('button[data-save]');
    if (b) save(b.dataset.save === 'draft');
  });

  $('#trash-btn', el0).addEventListener('click', async () => {
    const ok = await confirmDialog(`Move <b>${esc(article.title)}</b> to the trash?${article.draft ? '' : ' It comes off the live site a few minutes later.'}`, { okText: 'Move to trash', danger: true });
    if (!ok) return;
    try {
      await api('DELETE', `/api/articles/${article.slug}`);
      dirty = false;
      toast('Moved to the trash. <a href="#/trash">Undo</a>', 'ok');
      location.hash = '#/articles';
    } catch (err) {
      toastError(err);
    }
  });

  $('#revs', el0).addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-rev]');
    if (!b) return;
    try {
      const rev = await api('GET', `/api/articles/${article.slug}/revisions/${b.dataset.rev}`);
      const r = await modal({
        title: `Version from ${fmtDateTime(b.dataset.at)}`,
        size: 'modal-lg',
        body: `<p class="muted small" style="margin-top:0">Restoring replaces the current version. The current version is kept as a revision, so you can switch back.</p>
          <div class="rev-preview"><h1 style="margin-bottom:12px">${esc(rev.title)}</h1>
          <p class="muted small">SEO title: ${esc(rev.metaTitle)}<br>Description: ${esc(rev.description)}<br>Category: ${esc(rev.cluster)} · ${rev.draft ? 'Draft' : 'Published'}</p><hr>${rev.html}</div>`,
        buttons: [{ label: 'Close', value: false }, { label: 'Restore this revision', class: 'btn-primary', value: true }],
      }).promise;
      if (!r) return;
      if (dirty && !(await confirmDialog('You have unsaved changes that will be lost. Restore anyway?', { okText: 'Restore', danger: true }))) return;
      const res = await api('POST', `/api/articles/${article.slug}/revisions/${b.dataset.rev}`);
      article = res.article;
      Object.assign(s, structuredClone(article));
      fillFields();
      editor.setContent(article.html);
      dirty = false;
      paintHeader();
      paintMsgs();
      paintFeatured();
      paintSaveState();
      paintRevisions();
      refreshRebuildBadge();
      toast('Revision restored.', 'ok');
    } catch (err) {
      toastError(err);
    }
  });

  async function insertMedia() {
    const r = await openMediaPicker({ mode: 'insert' });
    if (!r || !editor) return;
    const img = `<img src="${esc(r.item.url)}" alt="${esc(r.alt)}" data-slot="${esc(r.item.slot)}">`;
    editor.focus();
    editor.insertContent(r.caption ? `<figure class="image">${img}<figcaption>${esc(r.caption)}</figcaption></figure><p></p>` : `<p>${img}</p>`);
    if (!r.alt) toast('Tip: add alt text to the image (select it, then click the image button).', '', 6000);
  }
  $('#add-media', el0).addEventListener('click', insertMedia);

  // ── Initial paint ─────────────────────────────────────────────────────
  fillFields();
  paintHeader();
  paintMsgs();
  paintSaveState();
  paintRevisions();
  if (isNew) f.title.focus();

  // ── TinyMCE ───────────────────────────────────────────────────────────
  const refreshFeatured = debounce(paintFeatured, 500);
  let ready = false;
  const [ed] = await tinymce.init({
    target: $('#editor', el0),
    license_key: 'gpl',
    base_url: '/admin/vendor/tinymce',
    suffix: '.min',
    promotion: false,
    branding: false,
    plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen media table wordcount quickbars help autoresize',
    menubar: 'edit view insert format table tools help',
    toolbar:
      'undo redo | blocks | bold italic strikethrough | bullist numlist | blockquote hr | link unlink | bwmedia image media table | bwfaq | removeformat | searchreplace visualblocks code preview fullscreen',
    toolbar_mode: 'wrap',
    toolbar_sticky: true,
    block_formats: 'Paragraph=p; Heading 2 (section)=h2; Heading 3 (sub-section)=h3; Heading 4=h4; Code block=pre',
    min_height: 560,
    autoresize_bottom_margin: 40,
    content_css: '/admin/assets/editor-content.css',
    convert_urls: false,
    relative_urls: false,
    remove_script_host: false,
    image_caption: true,
    image_dimensions: false,
    image_description: true,
    image_title: false,
    object_resizing: false,
    link_title: false,
    link_target_list: false,
    link_context_toolbar: true,
    default_link_target: '',
    table_default_attributes: {},
    table_default_styles: {},
    table_style_by_css: false,
    table_header_type: 'section',
    media_live_embeds: true,
    paste_data_images: true,
    automatic_uploads: true,
    images_reuse_filename: true,
    quickbars_selection_toolbar: 'bold italic | link | h2 h3 | blockquote',
    quickbars_insert_toolbar: false,
    quickbars_image_toolbar: 'image',
    browser_spellcheck: true,
    contextmenu: false,
    help_tabs: ['shortcuts', 'keyboardnav'],
    images_upload_handler: (blobInfo, progress) =>
      uploadFile(new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.blob().type }), (p) => progress(p * 100))
        .then((item) => item.url)
        .catch((err) => Promise.reject({ message: err.message, remove: true })),
    file_picker_types: 'image',
    file_picker_callback: async (callback, _value, metaInfo) => {
      if (metaInfo.filetype !== 'image') return;
      const r = await openMediaPicker({ mode: 'pick' });
      if (r) callback(r.item.url, { alt: r.alt });
    },
    setup(editorInstance) {
      editorInstance.ui.registry.addButton('bwmedia', {
        icon: 'gallery',
        text: 'Add media',
        tooltip: 'Upload or choose an image',
        onAction: insertMedia,
      });
      editorInstance.ui.registry.addButton('bwfaq', {
        icon: 'comment',
        text: 'FAQ',
        tooltip: 'Insert an FAQ section (becomes FAQ rich-result markup)',
        onAction: () =>
          editorInstance.insertContent(
            '<h2>Frequently Asked Questions</h2><h3>Type the question here?</h3><p>Type the answer here.</p><h3>Another question?</h3><p>Its answer.</p>',
          ),
      });
      // Ctrl+S keeps the current status; a brand-new article saves as a draft.
      editorInstance.addShortcut('meta+s', 'Save', () => save(isNew || article.draft));
      editorInstance.on('input change undo redo ExecCommand', () => {
        if (!ready) return;
        markDirty();
        refreshFeatured();
      });
    },
  });
  // Navigated away while TinyMCE was loading: the textarea is gone.
  if (destroyed || !ed || !ed.getContainer()?.isConnected) {
    ed?.remove();
    clearInterval(autosaveTimer);
    return null;
  }
  editor = ed;
  editor.setContent(s.html || '');
  editor.undoManager.clear();
  editor.undoManager.add();
  ready = true;
  paintFeatured();
  checkAutosave();

  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      save(isNew || article.draft);
    }
  };
  document.addEventListener('keydown', onKey);
  const tick = setInterval(() => !dirty && !saving && paintSaveState(), 30000);

  return {
    canLeave(silentCheck) {
      if (!dirty) return true;
      if (silentCheck) return false;
      return window.confirm('You have unsaved changes. Leave without saving?');
    },
    cleanup() {
      destroyed = true;
      clearInterval(autosaveTimer);
      clearInterval(tick);
      document.removeEventListener('keydown', onKey);
      editor?.remove();
    },
  };
}
