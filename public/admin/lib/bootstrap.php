<?php
/**
 * Shared setup for the online admin panel.
 *
 * The panel's code ships with the site (public/admin -> public_html/admin),
 * but nothing secret lives there. The GitHub token, the password hash,
 * sessions and caches live in a data folder one level ABOVE public_html:
 *
 *   /home/<user>/domains/<domain>/bw-admin-data/
 *
 * so a deploy never overwrites them and a browser can never fetch them.
 */
declare(strict_types=1);

const BW_ADMIN = true;

const BW_SITE = [
    'repo'     => 'rookie-crusher/basementwaterproofingnashville-site',
    'branch'   => 'main',
    'workflow' => 'deploy.yml',
    'domain'   => 'https://basementwaterproofingnashville.com',
];

class HttpError extends Exception
{
    public function __construct(public int $status, string $message, public array $extra = [])
    {
        parent::__construct($message);
    }
}

function bw_data_dir(): string
{
    static $dir = null;
    if ($dir !== null) return $dir;
    $dir = getenv('BW_ADMIN_DATA') ?: dirname(rtrim((string) $_SERVER['DOCUMENT_ROOT'], '/\\')) . '/bw-admin-data';
    foreach (['', '/sessions', '/cache'] as $sub) {
        if (!is_dir($dir . $sub) && !mkdir($dir . $sub, 0700, true) && !is_dir($dir . $sub)) {
            throw new HttpError(500, "The admin data folder could not be created at $dir.");
        }
    }
    // Belt and braces, in case the folder ever ends up inside the web root.
    if (!is_file("$dir/.htaccess")) file_put_contents("$dir/.htaccess", "Require all denied\n");
    return $dir;
}

function bw_read_json(string $name, array $default = []): array
{
    $file = bw_data_dir() . "/$name";
    if (!is_file($file)) return $default;
    $data = json_decode((string) file_get_contents($file), true);
    return is_array($data) ? $data : $default;
}

function bw_write_json(string $name, array $data): void
{
    $file = bw_data_dir() . "/$name";
    $tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n", LOCK_EX);
    @chmod($tmp, 0600);
    rename($tmp, $file);
}

/** Site defaults merged with what was saved on the Settings page. */
function bw_config(): array
{
    $saved = bw_read_json('config.json');
    return [
        'repo'     => $saved['repo'] ?? BW_SITE['repo'],
        'branch'   => $saved['branch'] ?? BW_SITE['branch'],
        'workflow' => BW_SITE['workflow'],
        'domain'   => BW_SITE['domain'],
        'token'    => $saved['token'] ?? '',
    ];
}

function bw_is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

const BW_SESSION_IDLE = 8 * 3600;

function bw_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_save_path(bw_data_dir() . '/sessions');
    session_name('bw_admin');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) BW_SESSION_IDLE);
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/admin/',
        'secure'   => bw_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
    // Sliding idle timeout: active editing never logs you out mid-article.
    if (!empty($_SESSION['user']) && (time() - ($_SESSION['seen'] ?? 0)) > BW_SESSION_IDLE) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    if (!empty($_SESSION['user'])) $_SESSION['seen'] = time();
}

function bw_user(): ?string
{
    bw_start_session();
    return $_SESSION['user'] ?? null;
}

function bw_security_headers(): void
{
    header('X-Frame-Options: DENY');
    header("Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
    header('Referrer-Policy: same-origin');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');
}
