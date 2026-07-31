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
#   VERCEL_ORG_ID                 # Team ID (team_...) from the team that owns the project
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

# Never deploy from generic VERCEL_PROJECT_ID — use per-app vars only
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

if [[ "$PROJECT_ID" != prj_* ]]; then
  echo "⚠ ${PROJECT_ID_VAR} should look like prj_… (got prefix '${PROJECT_ID:0:8}')." >&2
  echo "  Copy Project ID from Vercel → Project → Settings → General (not the project name)." >&2
fi

if [[ "$VERCEL_ORG_ID" != team_* && "$VERCEL_ORG_ID" != user_* ]]; then
  echo "⚠ VERCEL_ORG_ID should look like team_… (or user_…)." >&2
  echo "  Prefer Team ID from Vercel → Team Settings → General." >&2
  echo "  Project URL vercel.com/<team-slug>/… → open that team's settings." >&2
fi

api() {
  local out="$1"
  local url="$2"
  curl -sS -o "$out" -w '%{http_code}' \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Accept: application/json" \
    "$url"
}

lookup_project() {
  local project_id="$1"
  local team_id="${2:-}"
  local url="https://api.vercel.com/v9/projects/${project_id}"
  if [[ -n "$team_id" ]]; then
    url="${url}?teamId=${team_id}"
  fi
  api /tmp/vercel-project.json "$url"
}

find_project_team() {
  # Prints teamId (or empty for personal) if project is found; else empty + exit 1 via return code
  local project_id="$1"
  local code

  code="$(lookup_project "$project_id" "$VERCEL_ORG_ID")"
  if [[ "$code" == "200" ]]; then
    printf '%s\n' "$VERCEL_ORG_ID"
    return 0
  fi

  code="$(lookup_project "$project_id")"
  if [[ "$code" == "200" ]]; then
    printf '\n'
    return 0
  fi

  # Search teams accessible by this token
  code="$(api /tmp/vercel-teams.json "https://api.vercel.com/v2/teams?limit=100")"
  if [[ "$code" == "200" ]]; then
    local team_ids
    team_ids="$(
      node -e '
        const fs = require("fs");
        const data = JSON.parse(fs.readFileSync("/tmp/vercel-teams.json","utf8"));
        const teams = data.teams || [];
        for (const t of teams) process.stdout.write((t.id || "") + "\n");
      ' 2>/dev/null || true
    )"
    while IFS= read -r team_id; do
      [[ -n "$team_id" ]] || continue
      [[ "$team_id" == "$VERCEL_ORG_ID" ]] && continue
      code="$(lookup_project "$project_id" "$team_id")"
      if [[ "$code" == "200" ]]; then
        echo "⚠ Project found under team ${team_id:0:10}… (not VERCEL_ORG_ID=${VERCEL_ORG_ID:0:10}…)" >&2
        echo "  Update GitLab VERCEL_ORG_ID to that Team ID." >&2
        printf '%s\n' "$team_id"
        return 0
      fi
    done <<< "$team_ids"
  fi

  return 1
}

echo "→ Deploying $APP from workspace root"
echo "  Expected Vercel Root Directory: $EXPECTED_ROOT"
echo "  Using env: $PROJECT_ID_VAR"
echo "  Org id prefix: ${VERCEL_ORG_ID:0:10}…"
echo "  Project id prefix: ${PROJECT_ID:0:10}…"

RESOLVED_ORG=""
if ! RESOLVED_ORG="$(find_project_team "$PROJECT_ID")"; then
  echo "✖ Vercel project lookup failed for ${PROJECT_ID_VAR}" >&2
  echo "  Token cannot see project ${PROJECT_ID:0:10}… under org ${VERCEL_ORG_ID:0:10}…" >&2
  echo >&2
  echo "  Fix checklist:" >&2
  echo "  1) Open the WEB project on Vercel → Settings → General" >&2
  echo "     - Copy Project ID (prj_…) into GitLab ${PROJECT_ID_VAR}" >&2
  echo "  2) From the same project URL (vercel.com/<team>/…):" >&2
  echo "     Team Settings → General → copy Team ID (team_…) into VERCEL_ORG_ID" >&2
  echo "     (Do NOT use Account user id if the project belongs to a team.)" >&2
  echo "  3) VERCEL_TOKEN must be created by an account that can access that team/project" >&2
  echo "  4) Landing and web are 2 different Vercel projects → 2 different prj_ ids" >&2

  echo >&2
  echo "  Projects visible to this token (name → id):" >&2
  # Personal / default
  if [[ "$(api /tmp/vercel-projects.json "https://api.vercel.com/v9/projects?limit=20")" == "200" ]]; then
    node -e '
      const data = JSON.parse(require("fs").readFileSync("/tmp/vercel-projects.json","utf8"));
      for (const p of (data.projects||[])) console.error("   -", p.name, "→", p.id);
    ' 2>&1 || true
  fi
  # Configured org
  if [[ "$(api /tmp/vercel-projects.json "https://api.vercel.com/v9/projects?limit=20&teamId=${VERCEL_ORG_ID}")" == "200" ]]; then
    echo "  Under VERCEL_ORG_ID:" >&2
    node -e '
      const data = JSON.parse(require("fs").readFileSync("/tmp/vercel-projects.json","utf8"));
      for (const p of (data.projects||[])) console.error("   -", p.name, "→", p.id);
    ' 2>&1 || true
  fi

  if [[ -f /tmp/vercel-project.json ]]; then
    echo "  Last API body:" >&2
    head -c 300 /tmp/vercel-project.json >&2 || true
    echo >&2
  fi
  exit 1
fi

if [[ -n "$RESOLVED_ORG" ]]; then
  VERCEL_ORG_ID="$RESOLVED_ORG"
fi

# Drop any ambient VERCEL_PROJECT_ID from CI, then map the app-specific id for the CLI
unset VERCEL_PROJECT_ID
export VERCEL_ORG_ID
export VERCEL_PROJECT_ID="$PROJECT_ID"

ARGS=(--token "$VERCEL_TOKEN" --yes --project "$PROJECT_ID")
if [[ "$MODE" == "--prod" ]]; then
  ARGS+=(--prod)
fi

npx --yes vercel@latest deploy "${ARGS[@]}"
