#!/usr/bin/env bash
# BabuuBazaar one-step installer / updater for cPanel.
# Run from the app folder:   cd ~/babubazer && bash install.sh
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

# --- pick the right PHP (cPanel default is often too old) -------------------
PHP=""
for candidate in ea-php84 /usr/local/bin/ea-php84 ea-php83 /usr/local/bin/ea-php83 php; do
  if command -v "$candidate" >/dev/null 2>&1; then
    ver="$("$candidate" -r 'echo PHP_VERSION_ID;' 2>/dev/null || echo 0)"
    if [ "$ver" -ge 80300 ]; then PHP="$candidate"; break; fi
  fi
done
if [ -z "$PHP" ]; then
  echo "ERROR: PHP 8.3+ not found. Set PHP 8.4 for the domain in MultiPHP Manager." >&2
  exit 1
fi
echo "Using PHP: $PHP ($($PHP -r 'echo PHP_VERSION;'))"

ask() { # ask "Question" "default" -> sets REPLY_VALUE
  local prompt="$1" default="$2" value
  if [ -n "$default" ]; then read -r -p "$prompt [$default]: " value; else read -r -p "$prompt: " value; fi
  REPLY_VALUE="${value:-$default}"
}
esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

FRESH=0
if [ ! -f .env ]; then
  FRESH=1
  echo
  echo "=== First-time setup ==="
  ask "Website URL (with https://)" "https://babuubazaar.com"; APP_URL="$REPLY_VALUE"
  ask "Database name (full cPanel name, e.g. user_babubazer)" ""; DB_NAME="$REPLY_VALUE"
  ask "Database user (full cPanel name)" ""; DB_USER="$REPLY_VALUE"
  read -r -s -p "Database password: " DB_PASS; echo

  cp .env.production.example .env
  set_env() { # set_env KEY VALUE
    local key="$1" val; val="$(esc "$2")"
    if grep -q "^$key=" .env; then
      local tmp; tmp="$(mktemp)"
      awk -v k="$key" -v v="$val" 'BEGIN{FS=OFS="="} $1==k{print k"=\""v"\""; next} {print}' .env > "$tmp" && mv "$tmp" .env
    else
      printf '%s="%s"\n' "$key" "$val" >> .env
    fi
  }
  set_env APP_URL "$APP_URL"
  set_env DB_DATABASE "$DB_NAME"
  set_env DB_USERNAME "$DB_USER"
  set_env DB_PASSWORD "$DB_PASS"
  "$PHP" artisan key:generate --force
fi

mkdir -p storage/logs storage/framework/{sessions,views,cache/data} storage/app/public bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo
echo "=== Database ==="
"$PHP" artisan config:clear >/dev/null
"$PHP" artisan migrate --force

if [ "$FRESH" = "1" ]; then
  echo
  echo "=== Admin account ==="
  ask "Admin email" ""; ADMIN_EMAIL="$REPLY_VALUE"
  ask "Admin name" "Admin"; ADMIN_NAME="$REPLY_VALUE"
  "$PHP" artisan admin:create "$ADMIN_EMAIL" --name="$ADMIN_NAME"

  echo
  echo "=== Image storage link ==="
  ask "Website folder (document root)" "$HOME/public_html"; DOCROOT="$REPLY_VALUE"
  if [ -e "$DOCROOT/storage" ] && [ ! -L "$DOCROOT/storage" ]; then
    echo "NOTE: $DOCROOT/storage already exists and is not a link; skipping."
  else
    ln -sfn "$APP_DIR/storage/app/public" "$DOCROOT/storage"
    echo "Linked $DOCROOT/storage"
  fi
fi

"$PHP" artisan config:cache
"$PHP" artisan route:cache

echo
echo "Done. Open your site, and the admin panel at /admin"
