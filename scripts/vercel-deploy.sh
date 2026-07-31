#!/usr/bin/env bash
# Deploy an app to Vercel (preview or production).
# Usage: bash ./scripts/vercel-deploy.sh <landing|web> [--prod]
#
# Run from the fe workspace root. Do NOT pass the app subdirectory to
# `vercel deploy` — Vercel Project Settings → Root Directory must already be:
#   landing → apps/landing-page-web
#   web     → apps/web
#
# GitLab CI/CD variables required:
#   VERCEL_TOKEN
#   VERCEL_ORG_ID                 # Team ID (team_...) or personal account ID
#   VERCEL_PROJECT_ID_LANDING     # Project Settings → General → Project ID (prj_...)
#   VERCEL_PROJECT_ID_WEB
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

# Trim whitespace / accidental newlines from CI variables
VERCEL_TOKEN="$(printf '%s' "$VERCEL_TOKEN" | tr -d '[:space:]')"
VERCEL_ORG_ID="$(printf '%s' "$VERCEL_ORG_ID" | tr -d '[:space:]')"
PROJECT_ID="$(printf '%s' "${!PROJECT_ID_VAR:-}" | tr -d '[:space:]')"

# Never deploy from generic VERCEL_PROJECT_ID — use per-app vars only:
#   landing → VERCEL_PROJECT_ID_LANDING
#   web     → VERCEL_PROJECT_ID_WEB
if [[ -z "$PROJECT_ID" ]]; then
  if [[ -n "${VERCEL_PROJECT_ID:-}" ]]; then
    echo "✖ Deploy '$APP' requires ${PROJECT_ID_VAR}, not VERCEL_PROJECT_ID" >&2
    echo "  In GitLab CI/CD Variables: create ${PROJECT_ID_VAR}=prj_… (Project Settings → General)" >&2
    exit 1
  fi
  echo "Set ${PROJECT_ID_VAR} in GitLab CI/CD Variables" >&2
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "Missing app directory: $APP_DIR (cwd=$ROOT)" >&2
  exit 1
fi

# Drop any ambient VERCEL_PROJECT_ID from CI, then map the app-specific id for the CLI
unset VERCEL_PROJECT_ID
export VERCEL_ORG_ID
export VERCEL_PROJECT_ID="$PROJECT_ID"

ARGS=(--token "$VERCEL_TOKEN" --yes --project "$PROJECT_ID")
if [[ "$MODE" == "--prod" ]]; then
  ARGS+=(--prod)
fi

echo "→ Deploying $APP from workspace root"
echo "  Expected Vercel Root Directory: $EXPECTED_ROOT"
echo "  Using env: $PROJECT_ID_VAR"
echo "  Org id prefix: ${VERCEL_ORG_ID:0:8}…"
echo "  Project id prefix: ${PROJECT_ID:0:8}…"

# Preflight: confirm token can see this project under this org
HTTP_CODE="$(
  curl -sS -o /tmp/vercel-project.json -w '%{http_code}' \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${VERCEL_ORG_ID}"
)"

if [[ "$HTTP_CODE" != "200" ]]; then
  # Retry without teamId (personal account / hobby)
  HTTP_CODE="$(
    curl -sS -o /tmp/vercel-project.json -w '%{http_code}' \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      "https://api.vercel.com/v9/projects/${PROJECT_ID}"
  )"
fi

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "✖ Vercel project lookup failed (HTTP ${HTTP_CODE})" >&2
  echo "  Check GitLab CI/CD variables:" >&2
  echo "  1) VERCEL_TOKEN — token owner must have access to the project" >&2
  echo "  2) VERCEL_ORG_ID — Team ID (team_…) from Team Settings, not the project name" >&2
  echo "     Personal account: Account Settings → General → Your ID" >&2
  echo "  3) ${PROJECT_ID_VAR} — Project Settings → General → Project ID (prj_…)" >&2
  echo "  4) Do not swap landing/web project IDs" >&2
  if [[ -f /tmp/vercel-project.json ]]; then
    echo "  API body:" >&2
    head -c 400 /tmp/vercel-project.json >&2 || true
    echo >&2
  fi
  exit 1
fi

# If org is a team id, pass it to the API deploy path via env (already exported).
# For personal accounts, VERCEL_ORG_ID should be the user id from account settings.
npx --yes vercel@latest deploy "${ARGS[@]}"
