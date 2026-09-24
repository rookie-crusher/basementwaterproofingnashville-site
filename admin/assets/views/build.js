import { api, esc, fmtDateTime, timeAgo, toast, toastError, $ } from '../ui.js';
import { refreshRebuildBadge } from '../app.js';

const LABEL = {
  queued: ['Waiting to start', 'badge'],
  in_progress: ['Publishing…', 'badge badge-ok'],
  success: ['Live', 'badge badge-ok'],
  failure: ['Failed', 'badge badge-err'],
  cancelled: ['Replaced by a newer publish', 'badge'],
  skipped: ['Skipped', 'badge'],
};

function state(run) {
  if (run.status !== 'completed') return LABEL[run.status] ?? LABEL.in_progress;
  return LABEL[run.conclusion] ?? [run.conclusion || 'Finished', 'badge'];
}

function duration(run) {
  const s = Math.max(0, Math.round((new Date(run.updated) - new Date(run.created)) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export async function render(el) {
  let poll = null;

  el.innerHTML = `
    <div class="page-head"><h1>Publishing</h1><span class="spacer"></span>
      <a class="btn" href="/" target="_blank" rel="noopener">View site</a>
      <button class="btn btn-primary" id="p-run">Publish again now</button></div>

    <div class="card card-pad">
      <h2 id="p-head">Checking…</h2>
      <p class="muted" id="p-sub" style="margin:6px 0 0"></p>
    </div>

    <div class="card">
      <div class="card-head"><h2>Recent publishes</h2><a class="small" id="p-gh" target="_blank" rel="noopener">Full logs on GitHub</a></div>
      <div class="table-wrap"><table class="list">
        <thead><tr><th>Status</th><th>Change</th><th class="col-hide">Started</th><th class="col-hide">Took</th></tr></thead>
        <tbody id="p-rows"><tr><td colspan="4" class="empty">Loading…</td></tr></tbody>
      </table></div>
    </div>

    <div class="card card-pad">
      <h2>How publishing works</h2>
      <ol class="steps small" style="margin-top:10px">
        <li>Publishing or updating an article saves it to the site's GitHub repository.</li>
        <li>GitHub builds the whole site: it checks every article, converts images to fast AVIF/WebP, and writes the sitemap.</li>
        <li>Hostinger picks up the finished site automatically. Changes are usually live 2 to 4 minutes after you save.</li>
      </ol>
      <p class="small muted" style="margin:8px 0 0">Saving a draft or uploading an image does not start a publish; nothing on the live site changes until an article is published. If a publish fails, the live site stays exactly as it was.</p>
    </div>`;

  async function load() {
    try {
      const { runs, actionsUrl } = await api('GET', '/api/builds');
      $('#p-gh', el).href = actionsUrl;
      const last = runs[0];
      const running = runs.some((r) => r.status !== 'completed');
      if (!last) {
        $('#p-head', el).textContent = 'Nothing published from the admin panel yet';
        $('#p-sub', el).textContent = 'The first publish starts as soon as you publish or update an article.';
      } else if (running) {
        $('#p-head', el).textContent = 'Publishing your latest changes…';
        $('#p-sub', el).textContent = `Started ${timeAgo(runs.find((r) => r.status !== 'completed').created)}. This page updates by itself.`;
      } else if (last.conclusion === 'success') {
        $('#p-head', el).textContent = 'The live site is up to date';
        $('#p-sub', el).textContent = `Last published ${timeAgo(last.updated)} (${fmtDateTime(last.updated)}).`;
      } else {
        $('#p-head', el).textContent = 'The last publish did not finish';
        $('#p-sub', el).innerHTML = `The live site still shows the previous version. <a href="${esc(last.url)}" target="_blank" rel="noopener">See what went wrong on GitHub</a>, fix it, then publish again.`;
      }
      $('#p-run', el).disabled = running;
      $('#p-rows', el).innerHTML = runs.length
        ? runs.map((r) => {
          const [label, cls] = state(r);
          return `<tr>
            <td><span class="${cls}">${esc(label)}</span></td>
            <td>${esc(r.message.replace(/\s*\[skip ci\]/, '') || (r.event === 'workflow_dispatch' ? 'Manual publish' : 'Update'))}<div class="small"><a href="${esc(r.url)}" target="_blank" rel="noopener">Details</a></div></td>
            <td class="col-hide small">${esc(fmtDateTime(r.created))}</td>
            <td class="col-hide small">${r.status === 'completed' ? duration(r) : '…'}</td></tr>`;
        }).join('')
        : '<tr><td colspan="4" class="empty">No publishes yet.</td></tr>';
      clearTimeout(poll);
      if (running) poll = setTimeout(load, 8000);
      refreshRebuildBadge();
    } catch (err) {
      if (err.data?.setup) throw err;
      toastError(err);
    }
  }

  $('#p-run', el).addEventListener('click', async () => {
    try {
      $('#p-run', el).disabled = true;
      await api('POST', '/api/rebuild');
      toast('Publish started. It takes a few minutes.', 'ok');
      setTimeout(load, 4000);
    } catch (err) {
      $('#p-run', el).disabled = false;
      toastError(err);
    }
  });

  await load();
  return { cleanup: () => clearTimeout(poll) };
}
