#!/usr/bin/env bash
# Deploy an app to Vercel (preview or production).
# Usage: bash ./scripts/vercel-deploy.sh <landing|web> [--prod]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP="${1:-}"
MODE="${2:-}"

usage() {
  echo "Usage: bash ./scripts/vercel-deploy.sh <landing|web> [--prod]" >&2
  exit 1
}

[[ -n "$APP" ]] || usage

case "$APP" in
  landing)
    APP_DIR="apps/landing-page-web"
    PROJECT_ID_VAR="VERCEL_PROJECT_ID_LANDING"
    ;;
  web)
    APP_DIR="apps/web"
    PROJECT_ID_VAR="VERCEL_PROJECT_ID_WEB"
    ;;
  *)
    usage
    ;;
esac

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?Set VERCEL_ORG_ID}"

PROJECT_ID="${!PROJECT_ID_VAR:-}"
if [[ -z "$PROJECT_ID" ]]; then
  echo "Set ${PROJECT_ID_VAR}" >&2
  exit 1
fi

export VERCEL_ORG_ID
export VERCEL_PROJECT_ID="$PROJECT_ID"

ARGS=(--token "$VERCEL_TOKEN" --yes)
if [[ "$MODE" == "--prod" ]]; then
  ARGS+=(--prod)
fi

echo "→ Deploying $APP ($APP_DIR)..."
npx --yes vercel@latest deploy "$APP_DIR" "${ARGS[@]}"
