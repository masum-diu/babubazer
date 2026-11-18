# Builds ONE ready-to-upload archive for cPanel: ./deploy/babubazer-deploy.tar.gz
# Extract it in /home/USER/ (creates babubazer/ and fills public_html/), then run:
#   cd ~/babubazer && bash install.sh
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '1/4 Building frontend...'
npm run build | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

$stage = Join-Path $root 'deploy\stage'
if (Test-Path "$root\deploy") { Remove-Item "$root\deploy" -Recurse -Force }
New-Item -ItemType Directory -Force "$stage\babubazer", "$stage\public_html" | Out-Null

Write-Host '2/4 Copying application...'
$xd = @('node_modules', '.git', 'deploy', 'tests', 'public', 'scripts', '.idea', '.vscode')
robocopy $root "$stage\babubazer" /E /XD $xd /XF .env '*.sqlite' '*.log' .phpunit.result.cache /NFL /NDL /NJH /NJS /NP | Out-Null

# Clean runtime folders so no local sessions/logs/cache are shipped.
foreach ($d in 'storage\logs', 'storage\framework\sessions', 'storage\framework\views', 'storage\framework\cache') {
    $p = "$stage\babubazer\$d"
    if (Test-Path $p) { Get-ChildItem $p -Recurse -File | Where-Object { $_.Name -ne '.gitignore' } | Remove-Item -Force }
}
Get-ChildItem "$stage\babubazer\bootstrap\cache" -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne '.gitignore' } | Remove-Item -Force
foreach ($d in 'storage\logs', 'storage\framework\sessions', 'storage\framework\views', 'storage\framework\cache\data', 'storage\app\public') {
    New-Item -ItemType Directory -Force "$stage\babubazer\$d" | Out-Null
}

Write-Host '3/4 Preparing public_html...'
robocopy "$root\public" "$stage\public_html" /E /XD storage /XF hot /NFL /NDL /NJH /NJS /NP | Out-Null
$index = @'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// App lives one level above public_html in /babubazer
$base = __DIR__.'/../babubazer';

if (file_exists($maintenance = $base.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $base.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $base.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
'@
# UTF-8 *without* BOM (a BOM before <?php breaks headers), LF line endings.
[System.IO.File]::WriteAllText("$stage\public_html\index.php", $index.Replace("`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))

Write-Host '4/4 Creating archives...'
Copy-Item "$root\scripts\install.sh" "$stage\babubazer\install.sh"

# Browser installer (no Terminal needed) with a fresh random one-time token.
$token = -join ((48..57) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
$installer = (Get-Content "$root\scripts\install.php" -Raw).Replace('__TOKEN__', $token).Replace("`r`n", "`n")
[System.IO.File]::WriteAllText("$stage\public_html\install.php", $installer, (New-Object System.Text.UTF8Encoding($false)))
New-Item -ItemType Directory -Force "$root\deploy" | Out-Null
Set-Content -Path "$root\deploy\INSTALL-LINK.txt" -Value "https://YOUR-DOMAIN/install.php?token=$token"
tar -czf "$root\deploy\babubazer-deploy.tar.gz" -C $stage babubazer public_html
Remove-Item $stage -Recurse -Force
Get-ChildItem "$root\deploy" | Format-Table Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
Write-Host 'Done. Follow DEPLOY.md'
