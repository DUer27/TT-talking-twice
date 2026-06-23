#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="tt-talking-twice"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_USER="${SUDO_USER:-$(id -un)}"
NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"

log() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

fail() {
  printf '\n\033[1;31m%s\033[0m\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

if [[ "$(uname -s)" != "Linux" ]]; then
  fail "This script is intended for Debian/Linux servers."
fi

need_cmd sudo

if [[ -z "$NODE_BIN" || -z "$NPM_BIN" ]]; then
  fail "Node.js/npm not found. Install Node.js 18+ first, then rerun this script."
fi

NODE_MAJOR="$("$NODE_BIN" -p "Number(process.versions.node.split('.')[0])")"
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  fail "Node.js 18+ is recommended for production. Current: $("$NODE_BIN" -v)"
fi

if [[ ! -f "$APP_DIR/.env" ]]; then
  log "Creating .env from .env.example"
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  fail "Created $APP_DIR/.env. Edit DB settings, SMTP settings, VERIFICATION_CODE_SECRET, and DEFAULT_ADMIN_PASSWORD, then rerun this script."
fi

log "Installing Node dependencies"
cd "$APP_DIR"
npm ci

log "Writing systemd service"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
TMP_SERVICE="$(mktemp)"
cat > "$TMP_SERVICE" <<EOF
[Unit]
Description=TT Talking Twice
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
ExecStart=${NODE_BIN} server/app.js
Restart=always
RestartSec=3
User=${APP_USER}
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo mv "$TMP_SERVICE" "$SERVICE_FILE"
sudo chmod 644 "$SERVICE_FILE"

log "Starting service"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

log "Service is ready"
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true

cat <<EOF

Useful commands:
  sudo systemctl status ${SERVICE_NAME}
  journalctl -u ${SERVICE_NAME} -f
  sudo systemctl restart ${SERVICE_NAME}
  bash scripts/stop-service-debian.sh
  bash scripts/cleanup-service-debian.sh

App target:
  http://127.0.0.1:6999

If this is behind Nginx/Caddy, proxy the domain to:
  http://127.0.0.1:6999
EOF
