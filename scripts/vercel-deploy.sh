#!/usr/bin/env bash
# Deploy an app to Vercel (preview or production).
# Usage: bash ./scripts/vercel-deploy.sh <landing|web> [--prod]
#
# Run from the fe workspace root. Do NOT pass the app subdirectory to
# `vercel deploy` — Vercel Project Settings → Root Directory must already be:
#   landing → apps/landing-page-web
#   web     → apps/web
# Passing the path again doubles it (…/apps/…/apps/…).
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
    EXPECTED_ROOT="apps/landing-page-web"
    ;;
  web)
    APP_DIR="apps/web"
    PROJECT_ID_VAR="VERCEL_PROJECT_ID_WEB"
    EXPECTED_ROOT="apps/web"
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

if [[ ! -d "$APP_DIR" ]]; then
  echo "Missing app directory: $APP_DIR (cwd=$ROOT)" >&2
  exit 1
fi

export VERCEL_ORG_ID
export VERCEL_PROJECT_ID="$PROJECT_ID"

ARGS=(--token "$VERCEL_TOKEN" --yes)
if [[ "$MODE" == "--prod" ]]; then
  ARGS+=(--prod)
fi

echo "→ Deploying $APP from workspace root"
echo "  Expected Vercel Root Directory: $EXPECTED_ROOT"
echo "  Project id env: $PROJECT_ID_VAR"

# Deploy the repo root; Vercel applies the project's Root Directory setting.
npx --yes vercel@latest deploy "${ARGS[@]}"
