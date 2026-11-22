<?php
/**
 * One-off diagnostic page for a 500 error on cPanel (no Terminal needed).
 * Upload to public_html, open  /diag.php?token=THE_TOKEN , copy what it shows, then press "Delete diag.php".
 * It never prints .env contents; password-like values in log lines are redacted.
 */

const DIAG_TOKEN = '__TOKEN__';

$appDir = realpath(__DIR__.'/../babubazer') ?: (__DIR__.'/../babubazer');

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');

function e($v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES);
}

function redact(string $s): string
{
    $s = preg_replace('/(pass(word)?|secret|token|key)(["\']?\s*[=:]\s*["\']?)[^\s"\',;)]+/i', '$1$3[redacted]', $s);

    return preg_replace('/base64:[A-Za-z0-9+\/=]{20,}/', 'base64:[redacted]', $s);
}

if (strlen(DIAG_TOKEN) < 24 || ! hash_equals(DIAG_TOKEN, (string) ($_REQUEST['token'] ?? ''))) {
    http_response_code(403);
    exit('Not allowed');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['delete'] ?? '') === '1') {
    @unlink(__FILE__);
    exit('diag.php deleted. You can close this page.');
}

echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    .'<title>Diagnostics</title><body style="font-family:system-ui,sans-serif;max-width:900px;margin:20px auto;padding:0 14px">'
    .'<h2>BabuuBazaar diagnostics</h2>';

function row(string $label, bool $ok, string $note = ''): void
{
    echo '<div>'.($ok ? '✅' : '❌').' '.e($label).($note !== '' ? ' <small>— '.e($note).'</small>' : '').'</div>';
}

echo '<h3>1. Environment</h3>';
echo '<div>PHP '.e(PHP_VERSION).' ('.e(PHP_SAPI).')</div>';
row('PHP 8.3+', PHP_VERSION_ID >= 80300);
row('App folder: '.$appDir, is_dir($appDir));
row('vendor/autoload.php', is_file($appDir.'/vendor/autoload.php'));
row('.env exists', is_file($appDir.'/.env'));
foreach (['pdo_mysql', 'mbstring', 'openssl', 'fileinfo', 'ctype', 'tokenizer', 'xml', 'json'] as $ext) {
    row('PHP extension '.$ext, extension_loaded($ext));
}

echo '<h3>2. Files of the latest release</h3>';
foreach ([
    $appDir.'/database/migrations/2026_11_22_100000_create_wishlists_table.php',
    $appDir.'/app/Http/Controllers/WishlistController.php',
    $appDir.'/app/Http/Middleware/HandleInertiaRequests.php',
    $appDir.'/resources/views/app.blade.php',
    __DIR__.'/build/manifest.json',
    __DIR__.'/build/fonts-manifest.json',
    __DIR__.'/favicon-32x32.png',
    __DIR__.'/index.php',
] as $f) {
    row(str_replace(dirname(__DIR__), '~', $f), is_file($f));
}

echo '<h3>3. Writable folders</h3>';
foreach (['storage/logs', 'storage/framework/views', 'storage/framework/cache', 'storage/framework/sessions', 'bootstrap/cache'] as $d) {
    row($d, is_dir($appDir.'/'.$d) && is_writable($appDir.'/'.$d));
}
$cached = array_values(array_diff(@scandir($appDir.'/bootstrap/cache') ?: [], ['.', '..', '.gitignore']));
echo '<div><small>bootstrap/cache contains: '.e($cached ? implode(', ', $cached) : '(empty)').'</small></div>';

echo '<h3>4. Last error in storage/logs/laravel.log</h3>';
$logFile = $appDir.'/storage/logs/laravel.log';
if (! is_file($logFile)) {
    echo '<div>No laravel.log file.</div>';
} else {
    $size = filesize($logFile);
    $fh = fopen($logFile, 'r');
    fseek($fh, max(0, $size - 120000));
    $tail = stream_get_contents($fh);
    fclose($fh);
    $pos = strrpos($tail, '.ERROR:');
    if ($pos === false) {
        echo '<div>No ERROR entry in the last 120 KB of the log.</div>';
    } else {
        $start = strrpos(substr($tail, 0, $pos), "\n");
        $entry = substr($tail, $start === false ? 0 : $start + 1);
        $lines = array_slice(explode("\n", $entry), 0, 14);
        echo '<pre style="white-space:pre-wrap;background:#f4f4f4;padding:10px;border-radius:8px;font-size:12px">'
            .e(redact(substr(implode("\n", $lines), 0, 4000))).'</pre>';
    }
}

echo '<h3>5. Live request to /</h3>';
flush();
try {
    require $appDir.'/vendor/autoload.php';
    $app = require $appDir.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    $res = $kernel->handle(Illuminate\Http\Request::create('/', 'GET'));
    row('GET / → HTTP '.$res->getStatusCode(), $res->getStatusCode() < 400);
} catch (Throwable $ex) {
    row('GET / threw '.get_class($ex), false);
    echo '<pre style="white-space:pre-wrap;background:#fde8e6;padding:10px;border-radius:8px;font-size:12px">'
        .e(redact($ex->getMessage()."\n".str_replace(dirname($appDir), '~', $ex->getFile()).':'.$ex->getLine()))
        .'</pre>';
}

echo '<form method="post" style="margin-top:30px"><input type="hidden" name="token" value="'.e($_REQUEST['token']).'">'
    .'<input type="hidden" name="delete" value="1"><button style="padding:10px 18px">Delete diag.php</button></form></body>';
