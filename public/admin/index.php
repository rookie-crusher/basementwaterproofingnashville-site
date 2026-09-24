<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/auth.php';
bw_security_headers();
$user = bw_user();
$needsSetup = !$user && bw_needs_setup();
$repo = bw_config()['repo'];
[$repoOwner, $repoName] = explode('/', $repo);
$tokenUrl = 'https://github.com/settings/personal-access-tokens/new?' . http_build_query([
    'name' => 'Site admin – basementwaterproofingnashville.com',
    'description' => 'Lets the site admin panel save articles and start publishing.',
    'expires_in' => 'none',
    'contents' => 'write',
    'actions' => 'write',
]);
$v = '2'; // bump to bust browser caches of the admin assets
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= $user ? 'Site Admin' : 'Log in · Site Admin' ?></title>
  <link rel="icon" href="/brand/icon-32.png">
  <link rel="stylesheet" href="/admin/assets/admin.css?v=<?= $v ?>">
</head>
<?php if ($needsSetup): ?>
<body class="login-page">
  <main class="login-card setup-card">
    <img class="login-logo" src="/brand/logo-mark.png" alt="" width="64" height="64">
    <h1>Set up the admin</h1>
    <p class="muted">One time only. This connects the admin to the site's GitHub repository and creates your login.</p>
    <details class="setup-steps" open>
      <summary>1. Create a GitHub access token</summary>
      <ol class="steps small">
        <li>Signed in to GitHub as <b><?= htmlspecialchars($repoOwner) ?></b>, open <a href="<?= htmlspecialchars($tokenUrl) ?>" target="_blank" rel="noopener">New fine-grained token</a>.</li>
        <li><b>Expiration:</b> No expiration. <b>Repository access:</b> Only select repositories → <b><?= htmlspecialchars($repoName) ?></b>.</li>
        <li><b>Repository permissions:</b> Contents → Read and write. Actions → Read and write.</li>
        <li>Click <b>Generate token</b> and copy it (it starts with <code>github_pat_</code>).</li>
      </ol>
    </details>
    <form id="setup-form" novalidate>
      <label class="field"><span>GitHub access token</span>
        <input id="token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" required></label>
      <p class="setup-sub">2. Choose your admin login</p>
      <label class="field"><span>Username</span>
        <input id="username" value="Mukul76" autocomplete="username" autocapitalize="off" spellcheck="false" required></label>
      <label class="field"><span>Password <span class="muted">(at least 8 characters)</span></span>
        <input id="password" type="password" autocomplete="new-password" required></label>
      <label class="field"><span>Confirm password</span>
        <input id="password2" type="password" autocomplete="new-password" required></label>
      <p id="login-error" class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary btn-block" type="submit" id="login-btn">Check token and finish setup</button>
    </form>
  </main>
  <script src="/admin/assets/login.js?v=<?= $v ?>"></script>
</body>
<?php elseif (!$user): ?>
<body class="login-page">
  <main class="login-card">
    <img class="login-logo" src="/brand/logo-mark.png" alt="" width="64" height="64">
    <h1>Site Admin</h1>
    <p class="muted">Basement Waterproofing Nashville</p>
    <form id="login-form" novalidate>
      <label class="field">
        <span>Username</span>
        <input id="username" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" required autofocus>
      </label>
      <label class="field">
        <span>Password</span>
        <span class="password-wrap">
          <input id="password" name="password" type="password" autocomplete="current-password" required>
          <button type="button" class="link-btn" id="toggle-pw" aria-label="Show password">Show</button>
        </span>
      </label>
      <p id="login-error" class="form-error" role="alert" hidden></p>
      <button class="btn btn-primary btn-block" type="submit" id="login-btn">Log in</button>
    </form>
  </main>
  <script src="/admin/assets/login.js?v=<?= $v ?>"></script>
</body>
<?php else: ?>
<body>
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="#/">
        <img src="/brand/logo-mark.png" alt="" width="32" height="32">
        <span><strong>Site Admin</strong><small>Basement Waterproofing Nashville</small></span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav id="nav" class="nav">
        <a href="#/" data-nav="dashboard"><i class="ico ico-home"></i>Dashboard</a>
        <a href="#/articles" data-nav="articles"><i class="ico ico-doc"></i>All articles</a>
        <a href="#/new" data-nav="new"><i class="ico ico-plus"></i>Add new article</a>
        <a href="#/media" data-nav="media"><i class="ico ico-image"></i>Media library</a>
        <a href="#/build" data-nav="build"><i class="ico ico-rocket"></i>Publishing <span class="badge" id="build-badge" hidden></span></a>
        <a href="#/trash" data-nav="trash"><i class="ico ico-trash"></i>Trash</a>
        <a href="#/settings" data-nav="settings"><i class="ico ico-gear"></i>Settings</a>
        <div class="nav-foot">
          <a href="/" target="_blank" rel="noopener"><i class="ico ico-eye"></i>View site</a>
          <button type="button" id="logout"><i class="ico ico-exit"></i>Log out <span id="whoami" class="muted">(<?= htmlspecialchars($user) ?>)</span></button>
        </div>
      </nav>
    </aside>
    <main class="main" id="view" tabindex="-1"><p class="loading">Loading…</p></main>
  </div>
  <div id="toasts" class="toasts" aria-live="polite"></div>
  <div id="modal-root"></div>

  <script src="/admin/vendor/js-yaml.min.js"></script>
  <script src="/admin/vendor/tinymce/tinymce.min.js"></script>
  <!-- No ?v= here: views import '../app.js', and a different URL would load a
       second copy of the router. Freshness comes from Cache-Control: no-cache. -->
  <script type="module" src="/admin/assets/app.js"></script>
</body>
<?php endif; ?>
</html>
