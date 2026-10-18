#!/usr/bin/env bash
# Build and (re)start Molly Dashboard, then check that it answers.
#   deploy/deploy.sh                      # uses deploy/.env
#   ENV_FILE=~/web/molly.env deploy/deploy.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

ENV_FILE=${ENV_FILE:-deploy/.env}
[[ -f $ENV_FILE ]] || { echo "✗ $ENV_FILE missing: cp deploy/.env.example deploy/.env" >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" "$@"; }
port=$(grep -E '^MOLLY_PORT=' "$ENV_FILE" | tail -1 | cut -d= -f2-)
port=${port:-4470}

# The port must be free, or already published by this stack's own container.
if (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null &&
  [[ -z $(docker ps -q --filter label=com.docker.compose.project=molly --filter "publish=$port") ]]; then
  holder=$(docker ps --filter "publish=$port" --format '{{.Label "com.docker.compose.project"}} ({{.Names}})' | head -1)
  [[ -n $holder ]] || holder=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -Fc 2>/dev/null | sed -n 's/^c//p' | head -1)
  echo "✗ port $port is used by ${holder:-another program}: pick another MOLLY_PORT in $ENV_FILE" >&2
  exit 1
fi

echo "› building and starting (port $port)"
compose up -d --build --remove-orphans
for _ in $(seq 1 40); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$port/monitor"; then
    docker image prune -f >/dev/null
    compose ps
    echo "✓ Molly Dashboard on http://127.0.0.1:$port (point cloudflared at it)"
    exit 0
  fi
  sleep 3
done
echo "✗ no answer on port $port: docker compose --env-file $ENV_FILE logs dashboard" >&2
exit 1
