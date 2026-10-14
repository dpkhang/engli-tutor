#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-}"

usage() {
  cat <<'EOF'
Usage: bash ./scripts/install-workspace.sh <workspace>

Workspaces:
  all        Install root + apps/* + packages/*, then build packages
  workspace  Install apps/workspace (+ deps), then build packages   (alias: web)
  marketing  Install apps/marketing (+ deps), then build packages   (alias: landing)
  packages   Install all packages/*, then build them                (alias: ui)

Package scripts:
  pnpm install:all                Install all EngliTutor workspaces
  pnpm module:add <package...>    Add dependencies to both applications
EOF
}

if [[ -z "$TARGET" ]]; then
  usage
  exit 1
fi

case "$TARGET" in
  all)
    echo "→ Installing all fe workspaces..."
    pnpm install --filter "." --filter "./apps/*" --filter "./packages/*"
    echo "→ Building packages..."
    pnpm --filter "./packages/*" run build
    ;;
  workspace|web)
    echo "→ Installing workspace: engli-tutor-fe..."
    pnpm install --filter "engli-tutor-fe..."
    echo "→ Building packages..."
    pnpm --filter "./packages/*" run build
    ;;
  marketing|landing)
    echo "→ Installing workspace: engli-tutor-web..."
    pnpm install --filter "engli-tutor-web..."
    echo "→ Building packages..."
    pnpm --filter "./packages/*" run build
    ;;
  packages|ui)
    echo "→ Installing all packages/* workspaces..."
    pnpm install --filter "./packages/*"
    echo "→ Building packages..."
    pnpm --filter "./packages/*" run build
    ;;
  *)
    echo "Unknown workspace: $TARGET" >&2
    usage
    exit 1
    ;;
esac

echo "→ Done ($TARGET)"
pnpm list -r --depth -1
