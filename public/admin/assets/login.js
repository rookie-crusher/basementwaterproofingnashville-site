// Login form, and the one-time setup form shown before an account exists.
(() => {
  const err = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  const label = btn.textContent;

  async function post(action, body) {
    const res = await fetch(`/admin/api.php?a=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-BW-Admin': '1' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  }

  function showError(message) {
    err.textContent = message;
    err.hidden = false;
  }

  async function submit(busyLabel, fn) {
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = busyLabel;
    try {
      await fn();
      location.reload();
    } catch (ex) {
      showError(ex.message);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  const toggle = document.getElementById('toggle-pw');
  const pw = document.getElementById('password');
  toggle?.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    if (!username || !password) return showError('Enter your username and password.');
    submit('Logging in…', () => post('login', { username, password })).then(() => pw.select());
  });

  document.getElementById('setup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = document.getElementById('token').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = pw.value;
    if (!token) return showError('Paste the GitHub access token first.');
    if (password.length < 8) return showError('Choose a password of at least 8 characters.');
    if (password !== document.getElementById('password2').value) return showError('The two passwords do not match.');
    submit('Checking with GitHub…', () => post('setup', { token, username, password }));
  });
})();
