<?php
/**
 * Login: one admin account, bcrypt hash, file-based lockout per IP.
 *
 * No credentials ship with the code (the repository is public). Until an
 * account exists, the admin shows a one-time setup form that also asks for
 * the GitHub token; only the repository owner can create a token that can
 * write to it, so nobody else can claim the admin first.
 */
defined('BW_ADMIN') || exit;

const BW_MAX_FAILURES = 5;
const BW_LOCKOUT_SECONDS = 15 * 60;

function bw_credentials(): ?array
{
    $saved = bw_read_json('credentials.json');
    return !empty($saved['username']) && !empty($saved['hash']) ? $saved : null;
}

function bw_needs_setup(): bool
{
    return bw_credentials() === null;
}

function bw_verify_login(string $username, string $password): bool
{
    $cred = bw_credentials();
    if (!$cred) return false;
    $passOk = password_verify($password, $cred['hash']);
    return hash_equals($cred['username'], $username) && $passOk;
}

function bw_client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/** Runs $fn with the lockout table locked, and saves what it returns. */
function bw_with_failures(callable $fn)
{
    $file = bw_data_dir() . '/login-failures.json';
    $fh = fopen($file, 'c+');
    flock($fh, LOCK_EX);
    $table = json_decode(stream_get_contents($fh) ?: '[]', true) ?: [];
    $now = time();
    foreach ($table as $ip => $row) {
        if (($row['until'] ?? 0) < $now && ($row['last'] ?? 0) < $now - BW_LOCKOUT_SECONDS) unset($table[$ip]);
    }
    [$result, $table] = $fn($table, $now);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($table));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $result;
}

function bw_locked_seconds(string $ip): int
{
    return bw_with_failures(function ($t, $now) use ($ip) {
        $left = max(0, ($t[$ip]['until'] ?? 0) - $now);
        return [$left, $t];
    });
}

/** Returns attempts left before lockout. */
function bw_record_failure(string $ip): int
{
    return bw_with_failures(function ($t, $now) use ($ip) {
        $row = $t[$ip] ?? ['count' => 0, 'until' => 0];
        $row['count']++;
        $row['last'] = $now;
        if ($row['count'] >= BW_MAX_FAILURES) $row['until'] = $now + BW_LOCKOUT_SECONDS;
        $t[$ip] = $row;
        return [max(0, BW_MAX_FAILURES - $row['count']), $t];
    });
}

function bw_clear_failures(string $ip): void
{
    bw_with_failures(function ($t) use ($ip) {
        unset($t[$ip]);
        return [null, $t];
    });
}

function bw_set_credentials(string $username, string $password): void
{
    bw_write_json('credentials.json', [
        'username'  => $username,
        'hash'      => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
        'updatedAt' => gmdate('c'),
    ]);
}
