import { api, esc, fmtDate, toast, toastError, confirmDialog, $ } from '../ui.js';

export async function render(el) {
  const session = await api('GET', '/api/session');
  let list = [];
  let redirectsError = null;
  if (session.connected) {
    try {
      list = await api('GET', '/api/redirects');
    } catch (err) {
      redirectsError = err;
    }
  }
  const needsToken = !session.connected || redirectsError?.data?.setup;
  const tokenUrl = `https://github.com/settings/personal-access-tokens/new?name=${encodeURIComponent('Site admin – basementwaterproofingnashville.com')}&description=${encodeURIComponent('Lets the site admin panel save articles and start publishing.')}&expires_in=none&contents=write&actions=write`;

  el.innerHTML = `
    <div class="page-head"><h1>Settings</h1><span class="spacer"></span></div>

    ${needsToken ? `<div class="banner banner-warn">${redirectsError ? esc(redirectsError.message) : 'The admin panel needs a GitHub access token before it can load or save articles. It only takes a couple of minutes, once.'}</div>` : ''}

    <section class="card card-pad" id="gh-card">
      <h2>GitHub connection ${session.connected && !needsToken ? '<span class="badge badge-ok">Connected</span>' : '<span class="badge badge-warn">Not connected</span>'}</h2>
      <p class="muted small" style="margin:6px 0 12px">Articles are saved to the private repository <b>${esc(session.repo)}</b> (branch <code>${esc(session.branch)}</code>). Saving there is what publishes the site.</p>
      <details ${needsToken ? 'open' : ''}>
        <summary class="link-btn" style="display:inline">${needsToken ? 'How to create the token' : 'Replace the token'}</summary>
        <ol class="steps small" style="margin:10px 0 14px">
          <li>Sign in to GitHub as the owner of <b>${esc(session.repo.split('/')[0])}</b> and open <a href="${tokenUrl}" target="_blank" rel="noopener">New fine-grained token</a>.</li>
          <li><b>Token name:</b> Site admin. <b>Expiration:</b> No expiration (or a year, then replace it here).</li>
          <li><b>Repository access:</b> Only select repositories → <b>${esc(session.repo.split('/')[1])}</b>.</li>
          <li><b>Permissions → Repository permissions:</b> <b>Contents</b>: Read and write, and <b>Actions</b>: Read and write. (Metadata: Read-only is added automatically.)</li>
          <li>Click <b>Generate token</b>, copy it (it starts with <code>github_pat_</code>) and paste it below.</li>
        </ol>
        <form id="gh-form" style="max-width:520px">
          <label class="field"><span>Access token</span><input type="password" id="gh-token" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></label>
          <button class="btn btn-primary" type="submit">Check and save token</button>
          <p class="hint">The token is stored on the server outside the website folder and is never sent to your browser.</p>
        </form>
      </details>
    </section>

    <div class="dash-grid" style="margin-top:16px">
      <section class="card card-pad">
        <h2>Login details</h2>
        <p class="muted small">Signed in as <b>${esc(session.username)}</b>. Only a bcrypt hash of the password is stored.</p>
        <form id="pw-form" autocomplete="off" style="max-width:420px">
          <label class="field"><span>Username</span><input id="s-user" value="${esc(session.username)}" autocomplete="username"></label>
          <label class="field"><span>New password</span><input type="password" id="s-new" autocomplete="new-password" minlength="8"><span class="hint">At least 8 characters. Leave blank to change only the username.</span></label>
          <label class="field"><span>Confirm new password</span><input type="password" id="s-confirm" autocomplete="new-password"></label>
          <label class="field"><span>Current password</span><input type="password" id="s-current" autocomplete="current-password" required></label>
          <button class="btn btn-primary" type="submit">Save login details</button>
        </form>
        <p class="hint" style="margin-top:14px">Locked out? In Hostinger's File Manager, delete <code>bw-admin-data/credentials.json</code> (next to <code>public_html</code>). The admin then shows the setup form again, which needs a GitHub token for this repository.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Redirects</h2></div>
        <p class="muted small" style="padding:10px 16px 0;margin:0">Added automatically when you change the URL of a published article, so old links keep working.</p>
        <div class="table-wrap"><table class="list"><thead><tr><th>From</th><th>To</th><th></th></tr></thead><tbody id="r-rows"></tbody></table></div>
      </section>
    </div>`;

  function paint() {
    $('#r-rows', el).innerHTML = !session.connected || needsToken
      ? '<tr><td colspan="3" class="empty">Connect GitHub to see redirects.</td></tr>'
      : list.length
        ? list.map((r) => `<tr data-from="${esc(r.from)}"><td class="mono">/blog/${esc(r.from)}/</td><td class="mono">/blog/${esc(r.to)}/<div class="small muted">${esc(fmtDate(r.created))}</div></td><td><button class="btn btn-sm btn-danger" data-del>Remove</button></td></tr>`).join('')
        : '<tr><td colspan="3" class="empty">No redirects yet.</td></tr>';
  }
  paint();

  $('#gh-form', el).addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = $('#gh-token', el).value.trim();
    if (!token) return toastError(new Error('Paste the token first.'));
    const btn = e.submitter;
    btn.disabled = true;
    btn.textContent = 'Checking…';
    try {
      await api('POST', '/api/connect', { token });
      toast('Connected to GitHub. You are ready to go.', 'ok');
      location.hash = '#/';
    } catch (err) {
      toastError(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Check and save token';
    }
  });

  $('#r-rows', el).addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-del]');
    if (!b) return;
    const from = b.closest('tr').dataset.from;
    if (!(await confirmDialog(`Remove the redirect from <code>/blog/${esc(from)}/</code>? Old links to it will stop working after the next publish.`, { okText: 'Remove', danger: true }))) return;
    try {
      list = await api('DELETE', `/api/redirects/${from}`);
      paint();
      toast('Redirect removed.', 'ok');
    } catch (err) {
      toastError(err);
    }
  });

  $('#pw-form', el).addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = $('#s-new', el).value;
    const currentPassword = $('#s-current', el).value;
    if (newPassword !== $('#s-confirm', el).value) return toastError(new Error('The new passwords do not match.'));
    try {
      const r = await api('POST', '/api/account/password', {
        currentPassword,
        newUsername: $('#s-user', el).value.trim(),
        newPassword: newPassword || currentPassword,
      });
      $('#whoami').textContent = `(${r.username})`;
      e.target.reset();
      $('#s-user', el).value = r.username;
      toast('Login details saved.', 'ok');
    } catch (err) {
      toastError(err);
    }
  });
}
