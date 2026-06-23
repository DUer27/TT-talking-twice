#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="tt-talking-twice"

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

if ! systemctl list-unit-files "${SERVICE_NAME}.service" >/dev/null 2>&1; then
  log "Service ${SERVICE_NAME} is not installed"
  exit 0
fi

log "Stopping ${SERVICE_NAME}"
sudo systemctl stop "$SERVICE_NAME" || true

log "Current service status"
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true
