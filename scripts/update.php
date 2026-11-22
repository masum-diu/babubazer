<?php
/**
 * BabuuBazaar browser updater for cPanel (no Terminal needed).
 *
 * Run it AFTER extracting a new babubazer-deploy.tar.gz over the old files:
 *   https://YOUR-DOMAIN/update.php?token=THE_TOKEN_FROM_THE_BUILD
 * It applies new database migrations, rebuilds the caches and deletes itself.
 */

const UPDATE_TOKEN = '__TOKEN__';

$appDir = realpath(__DIR__.'/../babubazer') ?: (__DIR__.'/../babubazer');

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');

function page(string $title, string $body): void
{
    echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        .'<title>BabuuBazaar updater</title><style>'
        .'body{font-family:system-ui,sans-serif;background:#0c242b;color:#12323a;margin:0;padding:24px}'
        .'.card{max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:28px}'
        .'h1{margin:0 0 6px;font-size:24px}'
        .'button{margin-top:22px;width:100%;padding:13px;border:0;border-radius:999px;background:#ff9d16;color:#fff;font-size:16px;font-weight:700;cursor:pointer}'
        .'.err{background:#fde8e6;color:#a8321f;padding:12px 14px;border-radius:12px;margin:14px 0}'
        .'.ok{background:#e3f5ef;color:#136350;padding:12px 14px;border-radius:12px;margin:14px 0}'
        .'small{color:#5b747b}pre{white-space:pre-wrap;font-size:12px;background:#f3f6f6;padding:10px;border-radius:10px}'
        .'</style></head><body><div class="card"><h1>'.htmlspecialchars($title).'</h1>'.$body.'</div></body></html>';
    exit;
}

function e(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES);
}

if (strlen(UPDATE_TOKEN) < 24 || ! hash_equals(UPDATE_TOKEN, (string) ($_REQUEST['token'] ?? ''))) {
    http_response_code(403);
    page('Not allowed', '<div class="err">Missing or wrong token. Use the link from <code>UPDATE-LINK.txt</code> of the <b>latest</b> build.</div>');
}

if (PHP_VERSION_ID < 80300) {
    page('PHP too old', '<div class="err">This site runs PHP '.PHP_VERSION.'. Set PHP 8.4 for the domain in cPanel → MultiPHP Manager.</div>');
}

if (! is_file($appDir.'/vendor/autoload.php')) {
    page('App folder not found', '<div class="err">Expected the app at <code>'.e($appDir).'</code>. Extract the archive in your home folder (one level above public_html).</div>');
}

if (! is_file($appDir.'/.env')) {
    page('Not installed yet', '<div class="err">No <code>.env</code> found, so this site has not been installed. Use <code>install.php</code> instead.</div>');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    page('Update BabuuBazaar',
        '<p>This applies new database changes and refreshes the caches. Your products, orders, users and uploaded images are not touched.</p>'
        .'<p><small>PHP '.PHP_VERSION.'</small></p>'
        .'<form method="post"><input type="hidden" name="token" value="'.e($_REQUEST['token']).'">'
        .'<button type="submit">Run update</button></form>');
}

$log = '';
try {
    foreach (['storage/logs', 'storage/framework/sessions', 'storage/framework/views', 'storage/framework/cache/data', 'bootstrap/cache'] as $d) {
        if (! is_dir($appDir.'/'.$d)) {
            @mkdir($appDir.'/'.$d, 0775, true);
        }
    }

    // Old route/config caches would hide new routes and settings: drop them before booting.
    foreach (['config.php', 'routes-v7.php', 'events.php', 'packages.php', 'services.php'] as $cache) {
        @unlink($appDir.'/bootstrap/cache/'.$cache);
    }

    require $appDir.'/vendor/autoload.php';
    $app = require $appDir.'/bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    $run = function (string $cmd, array $args = []) use (&$log) {
        $code = Illuminate\Support\Facades\Artisan::call($cmd, $args);
        $log .= '$ artisan '.$cmd." → exit $code\n".trim(Illuminate\Support\Facades\Artisan::output())."\n\n";
        if ($code !== 0) {
            throw new RuntimeException("artisan $cmd failed");
        }
    };

    $run('migrate', ['--force' => true]);
    $run('view:clear');
    $run('config:cache');
    $run('route:cache');
} catch (Throwable $ex) {
    page('Update failed', '<div class="err">'.e($ex->getMessage()).'</div><pre>'.e($log).'</pre>'
        .'<p><small>Nothing was deleted. Fix the problem (see <code>babubazer/storage/logs/laravel.log</code>) and reload this page to retry.</small></p>');
}

@unlink(__FILE__);

page('Updated ✔', '<div class="ok">BabuuBazaar is up to date.</div>'
    .'<p><a href="/">Open the storefront →</a><br><a href="/admin">Open the admin panel →</a></p>'
    .'<p><small>update.php has been deleted automatically. If it is still in public_html, delete it manually.</small></p>'
    .'<pre>'.e($log).'</pre>');
