#!/usr/bin/env bash
# Driver for angular-jumpstart — build, serve, screenshot, smoke-test, stop.
# Run from the repo root: bash .claude/skills/run-angular-jumpstart/driver.sh [COMMAND]
#
# Commands:
#   start-frontend   Build frontend & start static HTTP server on port 4201
#   start-backend    Start NestJS backend on port 3000 (DATABASE_URL optional)
#   screenshot       Take a screenshot of the frontend (saves to /tmp/jumpstart-screenshot.png)
#   smoke            Full smoke run: start both, screenshot frontend, curl backend, stop all
#   stop             Stop any servers started by this script

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
FRONTEND_PID_FILE=/tmp/jumpstart-frontend.pid
BACKEND_PID_FILE=/tmp/jumpstart-backend.pid
SCREENSHOT_PATH=/tmp/jumpstart-screenshot.png

_log() { echo "==> $*"; }

start_frontend() {
  _log "Building Angular frontend..."
  cd "$REPO_ROOT/frontend"
  node_modules/.bin/ng build

  _log "Starting static HTTP server on port 4201..."
  pkill -f "python3 -m http.server 4201" 2>/dev/null || true
  sleep 1
  python3 -m http.server 4201 --directory dist/frontend/browser > /tmp/jumpstart-frontend.log 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"

  timeout 15 bash -c 'until curl -sf http://localhost:4201/ >/dev/null 2>&1; do sleep 1; done'
  _log "Frontend ready at http://localhost:4201/"
}

start_dev_server() {
  _log "Starting Angular dev server on port 4202..."
  pkill -f "ng serve" 2>/dev/null || true
  sleep 1
  cd "$REPO_ROOT/frontend"
  node_modules/.bin/ng serve --port 4202 --no-open > /tmp/jumpstart-ng-serve.log 2>&1 &
  echo $! > /tmp/jumpstart-ng-serve.pid

  timeout 60 bash -c 'until curl -sf http://localhost:4202/ >/dev/null 2>&1; do sleep 1; done'
  _log "Angular dev server ready at http://localhost:4202/"
}

start_backend() {
  _log "Building NestJS backend..."
  cd "$REPO_ROOT/backend"
  node_modules/.bin/nest build

  _log "Starting NestJS backend on port 3000..."
  pkill -f "node dist/src/main" 2>/dev/null || true
  sleep 1
  node dist/src/main.js > /tmp/jumpstart-backend.log 2>&1 &
  echo $! > "$BACKEND_PID_FILE"

  timeout 15 bash -c 'until curl -sf http://localhost:3000/ >/dev/null 2>&1; do sleep 1; done'
  _log "Backend ready at http://localhost:3000/"
}

take_screenshot() {
  local url="${1:-http://localhost:4201/}"
  _log "Taking screenshot of $url..."
  python3 - <<PYEOF
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-gpu'])
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('$url', wait_until='networkidle')
    page.screenshot(path='$SCREENSHOT_PATH')
    print(f"  Title: {page.title()}")
    errors = page.evaluate("""
      () => window.__errors || []
    """)
    if errors:
        print(f"  Console errors: {errors}")
    browser.close()
print("Screenshot saved to $SCREENSHOT_PATH")
PYEOF
}

smoke_test() {
  _log "=== Smoke test: angular-jumpstart ==="

  # Frontend
  start_frontend

  # Backend
  if curl -sf http://localhost:3000/ >/dev/null 2>&1; then
    _log "Backend already running on port 3000"
  else
    start_backend
  fi

  # Screenshot frontend
  take_screenshot "http://localhost:4201/"

  # Curl backend
  _log "Testing backend API..."
  BACKEND_RESPONSE=$(curl -s http://localhost:3000/)
  if [[ "$BACKEND_RESPONSE" == "Hello World!" ]]; then
    _log "Backend GET /  =>  '$BACKEND_RESPONSE'  ✓"
  else
    _log "Unexpected backend response: '$BACKEND_RESPONSE'"
    exit 1
  fi

  _log "=== Smoke test PASSED ==="
  _log "Screenshot: $SCREENSHOT_PATH"
}

stop_all() {
  _log "Stopping servers..."
  [[ -f "$FRONTEND_PID_FILE" ]] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE" || true
  [[ -f "$BACKEND_PID_FILE" ]] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE" || true
  pkill -f "python3 -m http.server 4201" 2>/dev/null || true
  pkill -f "node dist/src/main" 2>/dev/null || true
  _log "Done."
}

CMD="${1:-smoke}"
case "$CMD" in
  start-frontend) start_frontend ;;
  start-dev-server) start_dev_server ;;
  start-backend) start_backend ;;
  screenshot) take_screenshot "${2:-http://localhost:4201/}" ;;
  smoke) smoke_test ;;
  stop) stop_all ;;
  *) echo "Usage: $0 [start-frontend|start-dev-server|start-backend|screenshot|smoke|stop]"; exit 1 ;;
esac
