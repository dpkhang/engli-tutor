#!/usr/bin/env bash
# Skip Vercel build when commit does not touch this app (or shared packages).
# Usage from app dir (set as Ignored Build Step): bash ../../scripts/vercel-ignore.sh landing|web
set -euo pipefail

APP="${1:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

case "$APP" in
  landing) PATHS=("apps/landing-page-web" "packages" "pnpm-lock.yaml" "pnpm-workspace.yaml" "package.json") ;;
  web) PATHS=("apps/web" "packages" "pnpm-lock.yaml" "pnpm-workspace.yaml" "package.json") ;;
  *)
    echo "Usage: vercel-ignore.sh <landing|web>" >&2
    exit 1
    ;;
esac

cd "$ROOT"

if [[ -z "${VERCEL_GIT_PREVIOUS_SHA:-}" || -z "${VERCEL_GIT_COMMIT_SHA:-}" ]]; then
  echo "→ No previous SHA; continue build"
  exit 1
fi

ARGS=()
for p in "${PATHS[@]}"; do
  ARGS+=(-- "$p")
done

if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- "${PATHS[@]}"; then
  echo "→ No relevant changes for $APP; skip build"
  exit 0
fi

echo "→ Relevant changes for $APP; continue build"
exit 1
