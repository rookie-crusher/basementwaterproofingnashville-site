import { api, esc, fmtDate, timeAgo, statusBadge, toastError, $ } from '../ui.js';

export async function render(el) {
  const [list, media, builds] = await Promise.all([
    api('GET', '/api/articles'),
    api('GET', '/api/media'),
    api('GET', '/api/builds').catch(() => ({ runs: [] })),
  ]);
  const published = list.filter((a) => !a.draft);
  const drafts = list.filter((a) => a.draft);
  const blocking = published.filter((a) => a.errors.length);
  const last = builds.runs[0];
  const running = builds.runs.some((r) => r.status !== 'completed');
  const failed = last && last.status === 'completed' && last.conclusion === 'failure';
  const lastLive = builds.runs.find((r) => r.conclusion === 'success');
  const recent = [...list].sort((a, b) => (b.modified || '').localeCompare(a.modified || '')).slice(0, 6);

  el.innerHTML = `
    <div class="page-head"><h1>Dashboard</h1><span class="spacer"></span>
      <a class="btn btn-primary" href="#/new">Add new article</a></div>

    ${running ? `<div class="banner banner-info"><span>Your latest changes are being published. They will be live in a few minutes.</span><span class="spacer"></span><a class="btn btn-sm" href="#/build">Details</a></div>` : ''}
    ${failed ? `<div class="banner banner-warn"><span>The last publish did not finish, so the live site shows the previous version.</span><span class="spacer"></span><a class="btn btn-sm" href="#/build">See why</a></div>` : ''}
    ${blocking.length ? `<div class="banner banner-warn"><span>${blocking.length} published article${blocking.length === 1 ? ' has' : 's have'} problems that will stop publishing.</span><span class="spacer"></span><a class="btn btn-sm" href="#/articles">Review</a></div>` : ''}

    <div class="stats">
      <a class="card stat" href="#/articles" style="text-decoration:none"><b>${published.length}</b><span>Published articles</span></a>
      <a class="card stat" href="#/articles" style="text-decoration:none"><b>${drafts.length}</b><span>Drafts</span></a>
      <a class="card stat" href="#/media" style="text-decoration:none"><b>${media.length}</b><span>Images in the library</span></a>
      <a class="card stat" href="#/build" style="text-decoration:none"><b style="font-size:1.15rem;padding:8px 0 5px">${running ? 'Publishing…' : esc(lastLive ? timeAgo(lastLive.updated) : 'Not yet')}</b><span>Last published</span></a>
    </div>

    <div class="dash-grid">
      <section class="card">
        <div class="card-head"><h2>Recently updated</h2><a href="#/articles" class="small">All articles</a></div>
        ${recent.length ? `<ul class="plain recent">${recent.map((a) => `
          <li>
            ${a.thumb ? `<img class="thumb" src="${esc(a.thumb)}" alt="">` : '<span class="thumb-empty"></span>'}
            <div class="grow"><a href="#/edit/${esc(a.slug)}">${esc(a.title)}</a>
              <div class="small muted">${esc(a.cluster || 'No category')}${a.modified ? ` · ${esc(fmtDate(a.modified))}` : ''}</div></div>
            ${statusBadge(a)}
          </li>`).join('')}</ul>` : '<p class="empty">No articles yet.</p>'}
      </section>

      <div>
        <section class="card card-pad">
          <h2>Quick draft</h2>
          <form id="quick" style="margin-top:12px">
            <label class="field"><span>Title</span><input id="q-title" placeholder="What is the article about?" required></label>
            <button class="btn btn-primary" type="submit">Create draft and open editor</button>
          </form>
        </section>
        <section class="card card-pad">
          <h2>How publishing works</h2>
          <ol class="steps small" style="margin-top:10px">
            <li>Write or edit an article. <b>Save draft</b> keeps it private.</li>
            <li>Press <b>Publish</b> (or <b>Update</b>). The site rebuilds itself automatically.</li>
            <li>A few minutes later it is live. Track progress under <a href="#/build">Publishing</a>.</li>
          </ol>
        </section>
      </div>
    </div>`;

  $('#quick', el).addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('#q-title', el).value.trim();
    if (!title) return;
    const btn = e.submitter;
    btn.disabled = true;
    try {
      const { slug } = await api('GET', `/api/slugify?text=${encodeURIComponent(title)}`);
      const res = await api('POST', '/api/articles', { title, slug, draft: true, html: '' });
      location.hash = `#/edit/${res.article.slug}`;
    } catch (err) {
      btn.disabled = false;
      toastError(err);
    }
  });
}
