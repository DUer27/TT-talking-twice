#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="tt-talking-twice"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

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
need_cmd systemctl

log "Stopping ${SERVICE_NAME}"
sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true

log "Disabling ${SERVICE_NAME}"
sudo systemctl disable "$SERVICE_NAME" 2>/dev/null || true

if [[ -f "$SERVICE_FILE" ]]; then
  log "Removing ${SERVICE_FILE}"
  sudo rm -f "$SERVICE_FILE"
fi

log "Reloading systemd"
sudo systemctl daemon-reload
sudo systemctl reset-failed "$SERVICE_NAME" 2>/dev/null || true

log "Removing local runtime files"
rm -f \
  "$APP_DIR/.server.pid" \
  "$APP_DIR/.server.err.log" \
  "$APP_DIR/.server.out.log" \
  "$APP_DIR/server-start.err" \
  "$APP_DIR/server-start.log"

cat <<EOF

Cleanup complete.

Kept intentionally:
  ${APP_DIR}/.env
  ${APP_DIR}/node_modules
  your database

To start again:
  bash scripts/start-service-debian.sh
EOF
