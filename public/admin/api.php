<?php
/**
 * JSON API for the admin panel: /admin/api.php?a=<action>
 *
 * Deliberately thin. Article logic (markdown conversion, validation, the
 * frontmatter format) runs in the browser; this file handles login and
 * relays reads and commits to GitHub with the token, which never leaves
 * the server.
 */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
require __DIR__ . '/lib/auth.php';
require __DIR__ . '/lib/github.php';

bw_security_headers();

function out(int $status, array $data): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) throw new HttpError(400, 'Request body is not valid JSON.');
    return $data;
}

function github(): GitHub
{
    $c = bw_config();
    return new GitHub($c['token'], $c['repo'], $c['branch']);
}

/** The panel may only write content and images, never code or the workflow. */
function assert_writable(string $path): void
{
    $ok = preg_match('#^content/(blog|\.trash)/[a-z0-9-]+\.md$#', $path)
        || $path === 'content/redirects.json'
        || preg_match('#^assets/images-src/[a-z0-9-]+\.(jpg|png)$#', $path)
        || preg_match('#^public/images/[a-z0-9-]+\.svg$#', $path);
    if (!$ok) throw new HttpError(403, "The admin panel cannot write \"$path\".");
}

function mime_for(string $path): string
{
    return match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
        'jpg', 'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'avif' => 'image/avif',
        default => 'application/octet-stream',
    };
}

function base_slug(string $filename): string
{
    $stem = pathinfo($filename, PATHINFO_FILENAME);
    if (function_exists('iconv')) $stem = (string) @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $stem);
    $s = strtolower($stem);
    $s = trim((string) preg_replace('/[^a-z0-9]+/', '-', $s), '-');
    $s = rtrim(substr($s, 0, 60), '-');
    if ($s === '') $s = 'image';
    if (!str_starts_with($s, 'blog-')) $s = "blog-$s";
    return $s;
}

/** Check a GitHub token can push to the site repository and see its builds, then store it. */
function save_token(string $token): string
{
    $token = trim($token);
    if (!preg_match('/^(github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,255}$/', $token)) throw new HttpError(400, 'That does not look like a GitHub access token (it should start with github_pat_).');
    $c = bw_config();
    $gh = new GitHub($token, $c['repo'], $c['branch']);
    try {
        $info = $gh->repoInfo();
    } catch (HttpError $e) {
        throw new HttpError(400, "GitHub did not accept this token for {$c['repo']}. Check that it was created by the repository owner and given access to that repository.");
    }
    if (empty($info['permissions']['push'])) throw new HttpError(400, "The token can read {$c['repo']} but not write to it. Give it \"Contents: Read and write\" access.");
    try {
        $gh->runs($c['workflow'], 1);
    } catch (HttpError $e) {
        throw new HttpError(400, 'The token works for content but cannot see GitHub Actions. Give it "Actions: Read and write" access.');
    }
    $saved = bw_read_json('config.json');
    $saved['token'] = $token;
    $saved['connectedAt'] = gmdate('c');
    bw_write_json('config.json', $saved);
    return $c['repo'];
}

function valid_new_login(string $username, string $password): void
{
    if (!preg_match('/^[\w.@-]{3,40}$/', $username)) throw new HttpError(400, 'Username must be 3 to 40 letters, numbers, dots, dashes or underscores.');
    if (strlen($password) < 8) throw new HttpError(400, 'The password must be at least 8 characters.');
}

function placeholder_svg(string $slot): string
{
    $safe = htmlspecialchars($slot, ENT_QUOTES);
    return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
<rect width="800" height="450" fill="#f0f9ff" stroke="#7baec7" stroke-width="4" stroke-dasharray="14 10"/>
<text x="400" y="205" text-anchor="middle" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="#1e3a5f">Image not uploaded yet</text>
<text x="400" y="245" text-anchor="middle" font-family="ui-monospace,monospace" font-size="18" fill="#3b6d8a">$safe</text>
<text x="400" y="285" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="#3b6d8a">Hidden on the live site until a file with this name exists</text>
</svg>
SVG;
}

try {
    $a = $_GET['a'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];

    // CSRF: writes must carry a custom header (impossible cross-origin without
    // a CORS preflight, which is never granted) and a same-origin Origin.
    if ($method !== 'GET') {
        if (($_SERVER['HTTP_X_BW_ADMIN'] ?? '') !== '1') throw new HttpError(403, 'Missing request header.');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && parse_url($origin, PHP_URL_HOST) . (parse_url($origin, PHP_URL_PORT) ? ':' . parse_url($origin, PHP_URL_PORT) : '') !== ($_SERVER['HTTP_HOST'] ?? '')) {
            throw new HttpError(403, 'Cross-origin request refused.');
        }
    }

    // One-time setup: only while no admin account exists, and only with a
    // token that can write to the site repository (proof of ownership).
    if ($a === 'setup' && $method === 'POST') {
        if (!bw_needs_setup()) throw new HttpError(403, 'The admin account is already set up. Log in instead.');
        $ip = bw_client_ip();
        if ($wait = bw_locked_seconds($ip)) throw new HttpError(429, 'Too many failed attempts. Try again in ' . ceil($wait / 60) . ' minute(s).');
        $b = body();
        $username = trim((string) ($b['username'] ?? ''));
        $password = (string) ($b['password'] ?? '');
        valid_new_login($username, $password);
        try {
            save_token((string) ($b['token'] ?? ''));
        } catch (HttpError $e) {
            bw_record_failure($ip);
            throw $e;
        }
        bw_set_credentials($username, $password);
        bw_clear_failures($ip);
        bw_start_session();
        session_regenerate_id(true);
        $_SESSION['user'] = $username;
        $_SESSION['seen'] = time();
        out(200, ['ok' => true, 'username' => $username]);
    }

    if ($a === 'login' && $method === 'POST') {
        if (bw_needs_setup()) throw new HttpError(409, 'The admin has not been set up yet. Reload the page to see the setup form.');
        $ip = bw_client_ip();
        if ($wait = bw_locked_seconds($ip)) throw new HttpError(429, 'Too many failed attempts. Try again in ' . ceil($wait / 60) . ' minute(s).');
        $b = body();
        if (!bw_verify_login((string) ($b['username'] ?? ''), (string) ($b['password'] ?? ''))) {
            $left = bw_record_failure($ip);
            throw new HttpError(401, $left > 0
                ? "Incorrect username or password. $left attempt(s) left before a 15 minute lockout."
                : 'Too many failed attempts. Try again in 15 minutes.');
        }
        bw_clear_failures($ip);
        bw_start_session();
        session_regenerate_id(true);
        $_SESSION['user'] = bw_credentials()['username'];
        $_SESSION['seen'] = time();
        out(200, ['ok' => true, 'username' => $_SESSION['user']]);
    }

    $user = bw_user();
    if (!$user) throw new HttpError(401, 'Your session has ended. Please log in again.');
    session_write_close(); // do not hold the session lock during slow GitHub calls

    switch ($a) {
        case 'logout':
            bw_start_session();
            $_SESSION = [];
            session_destroy();
            out(200, ['ok' => true]);

        case 'session':
            $c = bw_config();
            out(200, ['username' => $user, 'repo' => $c['repo'], 'branch' => $c['branch'], 'domain' => $c['domain'], 'connected' => $c['token'] !== '']);

        case 'tree':
            $gh = github();
            $head = $gh->head();
            $t = $gh->tree($head);
            out(200, ['head' => $head, 'date' => $t['date'], 'files' => $t['files']]);

        case 'blobs': // text files by blob SHA
            $shas = array_slice((array) (body()['shas'] ?? []), 0, 400);
            $bytes = github()->blobs($shas);
            out(200, ['blobs' => $bytes]);

        case 'raw': // image preview through the token (the repository is private)
            $path = (string) ($_GET['path'] ?? '');
            if (!preg_match('#^(assets/images-src|public/images)/[\w.-]+$#', $path)) throw new HttpError(400, 'Bad path.');
            $gh = github();
            $sha = (string) ($_GET['v'] ?? '');
            if (!preg_match('/^[0-9a-f]{40}$/', $sha)) {
                $sha = $gh->tree($gh->head())['files'][$path]['sha'] ?? '';
                if ($sha === '') throw new HttpError(404, 'Image not found.');
            }
            $data = $gh->blobs([$sha])[$sha];
            header_remove('Cache-Control');
            header('Content-Type: ' . mime_for($path));
            header('Cache-Control: private, max-age=31536000, immutable');
            if (str_ends_with($path, '.svg')) header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'");
            echo $data;
            exit;

        case 'placeholder':
            header_remove('Cache-Control');
            header('Content-Type: image/svg+xml');
            header('Cache-Control: private, max-age=86400');
            echo placeholder_svg((string) ($_GET['slot'] ?? ''));
            exit;

        case 'file': // one file at a past commit (revisions)
            $path = (string) ($_GET['path'] ?? '');
            $ref = (string) ($_GET['ref'] ?? '');
            if (!preg_match('/^[0-9a-f]{40}$/', $ref)) throw new HttpError(400, 'Bad revision id.');
            $text = github()->fileAt($path, $ref);
            if ($text === null) throw new HttpError(404, 'That version was not found.');
            out(200, ['path' => $path, 'content' => $text]);

        case 'history':
            out(200, ['revisions' => github()->history((string) ($_GET['path'] ?? ''))]);

        case 'commit':
            if ($method !== 'POST') break;
            $b = body();
            $files = (array) ($b['files'] ?? []);
            if (!$files) throw new HttpError(400, 'Nothing to save.');
            foreach ($files as $f) {
                assert_writable((string) ($f['path'] ?? ''));
                if (!isset($f['delete']) && !is_string($f['content'] ?? null)) throw new HttpError(400, 'Text content expected.');
            }
            $message = trim((string) ($b['message'] ?? 'Update content'));
            $message = mb_substr($message, 0, 200) . "\n\nSaved in the site admin by $user.";
            if (!empty($b['skipBuild'])) $message = preg_replace('/^[^\n]*/', '$0 [skip ci]', $message, 1);
            out(200, github()->commit($message, $files, (array) ($b['expect'] ?? [])));

        case 'upload':
            if ($method !== 'POST') break;
            $name = rawurldecode((string) ($_SERVER['HTTP_X_FILENAME'] ?? 'image'));
            $bytes = file_get_contents('php://input');
            if (!$bytes) throw new HttpError(400, 'Empty upload.');
            if (strlen($bytes) > 25 * 1048576) throw new HttpError(413, 'Image too large (25 MB max).');
            $info = @getimagesizefromstring($bytes);
            if ($info && in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG], true)) {
                $ext = $info[2] === IMAGETYPE_PNG ? 'png' : 'jpg';
                $dir = 'assets/images-src';
                $kind = 'photo';
            } elseif (preg_match('/<svg[\s>]/i', substr($bytes, 0, 2048))) {
                $bytes = preg_replace(['#<script[\s\S]*?</script>#i', '#\son\w+\s*=\s*("[^"]*"|\'[^\']*\')#i', '#(href\s*=\s*["\'])\s*javascript:[^"\']*#i'], ['', '', '$1#'], $bytes);
                $ext = 'svg';
                $dir = 'public/images';
                $kind = 'svg';
            } else {
                throw new HttpError(400, 'That file is not an image this site can use (JPG, PNG, WebP or SVG).');
            }
            $gh = github();
            $taken = [];
            foreach (array_keys($gh->tree($gh->head())['files']) as $p) {
                if (preg_match('#^(assets/images-src|public/images)/([^/]+)\.[a-z]+$#i', $p, $m)) $taken[$m[2]] = true;
            }
            $slot = base_slug($name);
            for ($i = 2, $base = $slot; isset($taken[$slot]); $i++) $slot = "$base-$i";
            $path = "$dir/$slot.$ext";
            $res = $gh->commit("Upload image $slot.$ext [skip ci]\n\nUploaded in the site admin by $user.", [['path' => $path, 'base64' => base64_encode($bytes)]], [$path => null]);
            out(201, ['slot' => $slot, 'file' => "$slot.$ext", 'path' => $path, 'kind' => $kind, 'bytes' => strlen($bytes), 'commit' => $res['commit']]);

        case 'builds':
            $c = bw_config();
            out(200, ['runs' => github()->runs($c['workflow']), 'actionsUrl' => "https://github.com/{$c['repo']}/actions"]);

        case 'rebuild':
            if ($method !== 'POST') break;
            github()->dispatch(bw_config()['workflow']);
            out(202, ['ok' => true]);

        case 'connect': // save the GitHub token after checking it can push
            if ($method !== 'POST') break;
            out(200, ['ok' => true, 'repo' => save_token((string) (body()['token'] ?? ''))]);

        case 'password':
            if ($method !== 'POST') break;
            $b = body();
            if (!bw_verify_login($user, (string) ($b['currentPassword'] ?? ''))) throw new HttpError(403, 'Your current password is incorrect.');
            $newUser = trim((string) ($b['newUsername'] ?? $user));
            $pw = (string) ($b['newPassword'] ?? '');
            valid_new_login($newUser, $pw);
            bw_set_credentials($newUser, $pw);
            bw_start_session();
            session_regenerate_id(true);
            $_SESSION['user'] = $newUser;
            out(200, ['ok' => true, 'username' => $newUser]);
    }
    throw new HttpError(404, 'Unknown action.');
} catch (HttpError $e) {
    out($e->status, ['error' => $e->getMessage()] + $e->extra);
} catch (Throwable $e) {
    error_log('[bw-admin] ' . $e);
    out(500, ['error' => 'Server error: ' . $e->getMessage()]);
}
