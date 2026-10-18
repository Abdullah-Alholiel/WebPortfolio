#!/bin/bash
# Portfolio staging keepalive runner (self-restarting).
# Why: no sudo/systemd on this host — bash loop + nohup keeps the staging
# server up across crashes and VPS reboots (cron @reboot relaunches it).
#
# Env: STAGING_KEY (required), STAGING_PORT (default 3210)
# Kill: pkill -f portfolio-staging-runner

set -u
PORT="${STAGING_PORT:-3210}"
APP_DIR="/home/ubuntu/.hermes/profiles/fullstack-dev/home/projects/WebPortfolio"
export NEXT_PUBLIC_STAGING_NOTES=on
export STAGING_NOTES_KEY="${STAGING_KEY}"
export PORT="$PORT"
export NODE_ENV=production
export HOSTNAME=127.0.0.1

cd "$APP_DIR" || exit 1

while true; do
  echo "[$(date -Is)] starting next start on :$PORT"
  npx next start -H 127.0.0.1 -p "$PORT" >> "$APP_DIR/.staging/staging.log" 2>&1
  code=$?
  echo "[$(date -Is)] next exited code=$code — restarting in 5s"
  sleep 5
done
