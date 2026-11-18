<?php
/**
 * BabuuBazaar browser installer for cPanel (no Terminal needed).
 *
 * Open:  https://YOUR-DOMAIN/install.php?token=THE_TOKEN_FROM_THE_BUILD
 * It deletes itself when the installation finishes.
 */

const INSTALL_TOKEN = '__TOKEN__';

$publicDir = __DIR__;
$appDir = realpath(__DIR__.'/../babubazer') ?: (__DIR__.'/../babubazer');

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');

function page(string $title, string $body): void
{
    echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        .'<title>BabuuBazaar installer</title><style>'
        .'body{font-family:system-ui,sans-serif;background:#0c242b;color:#12323a;margin:0;padding:24px}'
        .'.card{max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:28px}'
        .'h1{margin:0 0 6px;font-size:24px}label{display:block;margin:14px 0 4px;font-size:14px;font-weight:600}'
        .'input{width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid #d7dee0;border-radius:12px;font-size:15px}'
        .'button{margin-top:22px;width:100%;padding:13px;border:0;border-radius:999px;background:#1f8a70;color:#fff;font-size:16px;font-weight:700;cursor:pointer}'
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

if (strlen(INSTALL_TOKEN) < 24 || ! hash_equals(INSTALL_TOKEN, (string) ($_REQUEST['token'] ?? ''))) {
    http_response_code(403);
    page('Not allowed', '<div class="err">Missing or wrong token. Use the link with <code>?token=...</code> from the build output.</div>');
}

if (PHP_VERSION_ID < 80300) {
    page('PHP too old', '<div class="err">This site runs PHP '.PHP_VERSION.'. Set PHP 8.4 for the domain in cPanel → MultiPHP Manager.</div>');
}

if (! is_file($appDir.'/vendor/autoload.php')) {
    page('App folder not found', '<div class="err">Expected the app at <code>'.e($appDir).'</code>. Extract the archive in your home folder (one level above public_html).</div>');
}

if (is_file($appDir.'/.env')) {
    page('Already installed', '<div class="ok">An <code>.env</code> already exists, so the installer is locked. Delete <code>install.php</code> from public_html.</div>');
}

$defaults = [
    'app_url' => (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http').'://'.($_SERVER['HTTP_HOST'] ?? ''),
    'db_host' => 'localhost',
    'db_name' => '', 'db_user' => '', 'db_pass' => '',
    'admin_name' => 'Admin', 'admin_email' => '', 'admin_pass' => '',
];
$in = array_merge($defaults, array_intersect_key($_POST, $defaults));

$form = function (string $error = '') use ($in): void {
    $f = fn ($k, $label, $type = 'text', $hint = '') => '<label>'.$label.'</label><input type="'.$type.'" name="'.$k.'" value="'.($type === 'password' ? '' : e($in[$k])).'" required>'.($hint ? '<small>'.$hint.'</small>' : '');
    page('BabuuBazaar setup',
        ($error ? '<div class="err">'.$error.'</div>' : '')
        .'<p><small>PHP '.PHP_VERSION.' · one-time setup</small></p>'
        .'<form method="post"><input type="hidden" name="token" value="'.e($_REQUEST['token']).'">'
        .$f('app_url', 'Website URL', 'text', 'Exactly as it opens in the browser, e.g. https://babuubazaar.com')
        .$f('db_host', 'Database host')
        .$f('db_name', 'Database name', 'text', 'Full cPanel name, e.g. cpuser_babubazer')
        .$f('db_user', 'Database user', 'text', 'Full cPanel name')
        .$f('db_pass', 'Database password', 'password')
        .$f('admin_name', 'Admin name')
        .$f('admin_email', 'Admin email', 'email')
        .$f('admin_pass', 'Admin password', 'password', 'At least 8 characters')
        .'<button type="submit">Install</button></form>');
};

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $form();
}

// ---- validate ----
if (strlen($in['admin_pass']) < 8) {
    $form('Admin password must be at least 8 characters.');
}
if (! filter_var($in['admin_email'], FILTER_VALIDATE_EMAIL)) {
    $form('Enter a valid admin email.');
}

try {
    $pdo = new PDO('mysql:host='.$in['db_host'].';dbname='.$in['db_name'], $in['db_user'], $in['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    unset($pdo);
} catch (Throwable $ex) {
    $form('Could not connect to the database: '.e($ex->getMessage()));
}

// ---- write .env ----
$q = fn (string $v) => '"'.str_replace(['\\', '"', '$'], ['\\\\', '\\"', '\\$'], $v).'"';
$storagePath = $publicDir.'/storage';

$example = is_file($appDir.'/.env.production.example') ? file_get_contents($appDir.'/.env.production.example') : '';
$values = [
    'APP_URL' => rtrim($in['app_url'], '/'),
    'APP_KEY' => 'base64:'.base64_encode(random_bytes(32)),
    'DB_CONNECTION' => 'mysql',
    'DB_HOST' => $in['db_host'],
    'DB_DATABASE' => $in['db_name'],
    'DB_USERNAME' => $in['db_user'],
    'DB_PASSWORD' => $in['db_pass'],
    'PUBLIC_STORAGE_PATH' => $storagePath,
];
foreach ($values as $key => $val) {
    $line = $key.'='.$q($val);
    if (preg_match('/^'.preg_quote($key, '/').'=.*$/m', $example)) {
        $example = preg_replace_callback('/^'.preg_quote($key, '/').'=.*$/m', fn () => $line, $example, 1);
    } else {
        $example .= "\n".$line;
    }
}

foreach (['storage/logs', 'storage/framework/sessions', 'storage/framework/views', 'storage/framework/cache/data', 'bootstrap/cache'] as $d) {
    if (! is_dir($appDir.'/'.$d)) {
        @mkdir($appDir.'/'.$d, 0775, true);
    }
}
if (! is_dir($storagePath)) {
    @mkdir($storagePath, 0755, true);
}

if (file_put_contents($appDir.'/.env', $example) === false) {
    $form('Could not write the .env file. Check folder permissions.');
}

// ---- boot Laravel and run setup ----
$log = '';
try {
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
    $run('admin:create', [
        'email' => $in['admin_email'],
        '--name' => $in['admin_name'],
        '--password' => $in['admin_pass'],
    ]);
    $run('config:cache');
    $run('route:cache');
} catch (Throwable $ex) {
    @unlink($appDir.'/.env'); // allow a clean retry
    $in['admin_pass'] = '';
    $form('Setup failed: '.e($ex->getMessage()).'<pre>'.e($log).'</pre>');
}

@unlink(__FILE__);

page('Installed ✔', '<div class="ok">BabuuBazaar is ready.</div>'
    .'<p><a href="/admin">Open the admin panel →</a><br><a href="/">Open the storefront →</a></p>'
    .'<p><small>install.php has been deleted automatically. If it is still in public_html, delete it manually.</small></p>'
    .'<pre>'.e($log).'</pre>');
