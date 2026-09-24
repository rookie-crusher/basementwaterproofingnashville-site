<?php
/**
 * GitHub API client for the admin panel.
 *
 * Every save becomes one commit on the site's repository (several files at
 * once when needed, such as a slug rename that also updates other articles).
 * Pushing to the branch starts the GitHub Action that builds the site and
 * hands it to Hostinger.
 *
 * Git objects are immutable, so blobs and trees are cached on disk by their
 * SHA and never re-downloaded.
 */
defined('BW_ADMIN') || exit;

final class GitHub
{
    private string $api = 'https://api.github.com';

    public function __construct(private string $token, public string $repo, public string $branch)
    {
        if ($token === '') {
            throw new HttpError(428, 'The admin panel is not connected to GitHub yet. Add the access token on the Settings page.', ['setup' => true]);
        }
    }

    // ── HTTP ─────────────────────────────────────────────────────────────
    private function handle(string $method, string $path, $body = null)
    {
        $ch = curl_init($this->api . $path);
        $headers = [
            'Accept: application/vnd.github+json',
            'Authorization: Bearer ' . $this->token,
            'X-GitHub-Api-Version: 2022-11-28',
            'User-Agent: bw-site-admin',
        ];
        if ($body !== null) $headers[] = 'Content-Type: application/json';
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_CONNECTTIMEOUT => 15,
        ]);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        return $ch;
    }

    public function request(string $method, string $path, $body = null, array $okStatuses = [200, 201, 204]): array
    {
        $ch = $this->handle($method, $path, $body);
        $raw = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($raw === false) throw new HttpError(502, "Could not reach GitHub: $err");
        $data = $raw === '' ? [] : (json_decode($raw, true) ?? []);
        if (!in_array($status, $okStatuses, true)) $this->fail($status, $data);
        return ['status' => $status, 'data' => $data];
    }

    private function fail(int $status, array $data): void
    {
        $msg = $data['message'] ?? 'Unknown error';
        if ($status === 401) {
            throw new HttpError(428, 'GitHub rejected the access token (it may have expired or been revoked). Add a new one on the Settings page.', ['setup' => true]);
        }
        if ($status === 403 && stripos($msg, 'rate limit') !== false) {
            throw new HttpError(503, 'GitHub rate limit reached. Try again in a few minutes.');
        }
        if ($status === 403 || $status === 404) {
            throw new HttpError(428, "The access token cannot reach {$this->repo} ($msg). Check the token's repository access and permissions on the Settings page.", ['setup' => true]);
        }
        throw new HttpError(502, "GitHub error ($status): $msg");
    }

    private function cachePath(string $kind, string $sha): string
    {
        if (!preg_match('/^[0-9a-f]{40}$/', $sha)) throw new HttpError(400, 'Bad object id.');
        $dir = bw_data_dir() . "/cache/$kind";
        if (!is_dir($dir)) mkdir($dir, 0700, true);
        return "$dir/$sha";
    }

    // ── Reading ──────────────────────────────────────────────────────────
    /** Current commit SHA of the branch. */
    public function head(): string
    {
        $r = $this->request('GET', "/repos/{$this->repo}/git/ref/heads/" . rawurlencode($this->branch));
        return $r['data']['object']['sha'];
    }

    /** Full file listing at a commit: [path => [sha, size]] plus the tree SHA. */
    public function tree(string $commit): array
    {
        $file = $this->cachePath('trees', $commit);
        if (is_file($file)) return json_decode((string) file_get_contents($file), true);
        $c = $this->request('GET', "/repos/{$this->repo}/git/commits/$commit")['data'];
        $t = $this->request('GET', "/repos/{$this->repo}/git/trees/{$c['tree']['sha']}?recursive=1")['data'];
        $files = [];
        foreach ($t['tree'] as $e) {
            if ($e['type'] === 'blob') $files[$e['path']] = ['sha' => $e['sha'], 'size' => $e['size'] ?? 0];
        }
        $out = ['commit' => $commit, 'tree' => $c['tree']['sha'], 'date' => $c['committer']['date'] ?? null, 'files' => $files];
        file_put_contents($file, json_encode($out));
        return $out;
    }

    /** Raw bytes of many blobs, fetched in parallel. [sha => bytes] */
    public function blobs(array $shas): array
    {
        $out = [];
        $missing = [];
        foreach (array_unique($shas) as $sha) {
            $file = $this->cachePath('blobs', $sha);
            if (is_file($file)) $out[$sha] = (string) file_get_contents($file);
            else $missing[] = $sha;
        }
        foreach (array_chunk($missing, 12) as $chunk) {
            $mh = curl_multi_init();
            $handles = [];
            foreach ($chunk as $sha) {
                $ch = $this->handle('GET', "/repos/{$this->repo}/git/blobs/$sha");
                curl_multi_add_handle($mh, $ch);
                $handles[$sha] = $ch;
            }
            do {
                $status = curl_multi_exec($mh, $running);
                if ($running) curl_multi_select($mh, 1.0);
            } while ($running && $status === CURLM_OK);
            foreach ($handles as $sha => $ch) {
                $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
                $data = json_decode((string) curl_multi_getcontent($ch), true) ?? [];
                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
                if ($code !== 200) $this->fail($code, $data);
                $bytes = base64_decode(str_replace("\n", '', $data['content'] ?? ''));
                file_put_contents($this->cachePath('blobs', $sha), $bytes);
                $out[$sha] = $bytes;
            }
            curl_multi_close($mh);
        }
        return $out;
    }

    /** Previous versions of one file (newest first). */
    public function history(string $path, int $limit = 30): array
    {
        $r = $this->request('GET', "/repos/{$this->repo}/commits?" . http_build_query(['path' => $path, 'sha' => $this->branch, 'per_page' => $limit]));
        return array_map(fn ($c) => [
            'id'      => $c['sha'],
            'savedAt' => $c['commit']['committer']['date'] ?? $c['commit']['author']['date'],
            'message' => strtok($c['commit']['message'], "\n"),
        ], $r['data']);
    }

    /** File contents at a given commit, or null if it did not exist then. */
    public function fileAt(string $path, string $commit): ?string
    {
        $tree = $this->tree($commit);
        $entry = $tree['files'][$path] ?? null;
        if (!$entry) return null;
        return $this->blobs([$entry['sha']])[$entry['sha']];
    }

    // ── Writing ──────────────────────────────────────────────────────────
    /**
     * Commit several changes at once.
     *   $files:  [['path' => ..., 'content' => utf8] | ['path', 'base64'] | ['path', 'delete' => true]]
     *   $expect: [path => blob sha | null]  refuse if the file changed (or appeared) since it was read.
     */
    public function commit(string $message, array $files, array $expect = []): array
    {
        for ($attempt = 0; $attempt < 3; $attempt++) {
            $head = $this->head();
            $tree = $this->tree($head);
            foreach ($expect as $path => $sha) {
                $now = $tree['files'][$path]['sha'] ?? null;
                if ($now !== $sha) {
                    throw new HttpError(409, $sha === null
                        ? "\"$path\" already exists."
                        : 'This article was changed by someone else (or in another tab) after you opened it. Reload to see the latest version, or save again to overwrite it.', ['conflict' => true, 'path' => $path]);
                }
            }
            $entries = [];
            foreach ($files as $f) {
                $path = $f['path'];
                if (!empty($f['delete'])) {
                    if (isset($tree['files'][$path])) $entries[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => null];
                    continue;
                }
                if (isset($f['base64'])) {
                    $blob = $this->request('POST', "/repos/{$this->repo}/git/blobs", ['content' => $f['base64'], 'encoding' => 'base64'])['data'];
                    $entries[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['sha']];
                } else {
                    $entries[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'content' => $f['content']];
                }
            }
            if (!$entries) return ['commit' => $head, 'unchanged' => true];
            $newTree = $this->request('POST', "/repos/{$this->repo}/git/trees", ['base_tree' => $tree['tree'], 'tree' => $entries])['data'];
            if ($newTree['sha'] === $tree['tree']) return ['commit' => $head, 'unchanged' => true];
            $commit = $this->request('POST', "/repos/{$this->repo}/git/commits", [
                'message' => $message,
                'tree'    => $newTree['sha'],
                'parents' => [$head],
            ])['data'];
            // Fast-forward only. If someone else committed in between, start again
            // on top of their commit (the expectations above are re-checked).
            $r = $this->request('PATCH', "/repos/{$this->repo}/git/refs/heads/" . rawurlencode($this->branch), ['sha' => $commit['sha'], 'force' => false], [200, 422]);
            if ($r['status'] === 200) return ['commit' => $commit['sha']];
        }
        throw new HttpError(409, 'The repository kept changing while saving. Please try again.');
    }

    // ── Builds ───────────────────────────────────────────────────────────
    public function runs(string $workflow, int $limit = 10): array
    {
        $r = $this->request('GET', "/repos/{$this->repo}/actions/workflows/$workflow/runs?per_page=$limit");
        return array_map(fn ($run) => [
            'id'         => $run['id'],
            'status'     => $run['status'],
            'conclusion' => $run['conclusion'],
            'event'      => $run['event'],
            'message'    => strtok($run['head_commit']['message'] ?? '', "\n"),
            'commit'     => $run['head_sha'],
            'created'    => $run['created_at'],
            'updated'    => $run['updated_at'],
            'url'        => $run['html_url'],
        ], $r['data']['workflow_runs'] ?? []);
    }

    public function dispatch(string $workflow): void
    {
        $this->request('POST', "/repos/{$this->repo}/actions/workflows/$workflow/dispatches", ['ref' => $this->branch]);
    }

    public function repoInfo(): array
    {
        return $this->request('GET', "/repos/{$this->repo}")['data'];
    }
}
