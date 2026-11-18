# BabuBazer – cPanel deployment (no Terminal needed)

Build one archive locally:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-cpanel-package.ps1
```

Outputs in `deploy/`:
- `babubazer-deploy.tar.gz` – app + `vendor` + compiled frontend + installer
- `INSTALL-LINK.txt` – the one-time installer link (random token, new on every build)

## First deploy

1. **cPanel → MultiPHP Manager**: domain on **PHP 8.4** (8.3+ required).
2. **cPanel → MySQL Databases**: create a database + user, add the user to the database with *All privileges*. Note the full names and the password.
3. **File Manager → `/home/USER/`** (one level above `public_html`): upload `babubazer-deploy.tar.gz`, **Extract**, delete the `.tar.gz`.
   This creates `babubazer/` and fills `public_html/` (including `install.php`).
4. Open the link from `INSTALL-LINK.txt` in the browser, replacing `YOUR-DOMAIN`:
   `https://YOUR-DOMAIN/install.php?token=...`
   Fill in the database details and the admin email/password → **Install**.
   It writes `.env`, runs migrations, creates the admin and caches config, then deletes itself.
5. Open the site and `/admin`.

> Never run `php artisan db:seed` on the live site – it creates demo accounts and wipes the catalog.

Uploaded images are stored directly in `public_html/storage` (no symlink needed on shared hosting).

## Updating later (no Terminal)
Rebuild, upload and extract over the old files in `/home/USER/`. Your `.env` and `public_html/storage` uploads are not in the archive, so they stay.
Database changes (new migrations) are not auto-applied in this mode – if a release adds a migration, tell the developer; a one-time update helper is needed (or use Terminal: `cd ~/babubazer && bash install.sh`).

If Terminal is available, `bash install.sh` is the alternative to the browser installer and also handles updates.

## Troubleshooting
- **"Not allowed"**: wrong/old token – use the link from the *latest* build.
- **"Already installed"**: `.env` exists; delete `public_html/install.php`.
- **500 error after install**: read `babubazer/storage/logs/laravel.log`.
- **Images missing**: `APP_URL` in `babubazer/.env` must match the site URL exactly.
- **Domain's document root is not `public_html`**: extract the `public_html/` contents there instead and keep the `../babubazer` path in its `index.php`.
