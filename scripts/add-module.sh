#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

usage() {
  cat <<'EOF'
Add one or more dependencies to both LandingCraft applications.

Usage:
  pnpm module:add <package...> [--dev] [--exact]

Examples:
  pnpm module:add date-fns
  pnpm module:add react-dropzone sonner
  pnpm module:add vitest @testing-library/react --dev

Targets:
  landing-page-generator-fe  (apps/web)
  landing-page-web           (apps/landing-page-web)
EOF
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

PACKAGES=()
PNPM_FLAGS=()

for arg in "$@"; do
  case "$arg" in
    --dev|-D|--save-dev)
      PNPM_FLAGS+=(--save-dev)
      ;;
    --exact|-E)
      PNPM_FLAGS+=(--save-exact)
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --*)
      echo "Unsupported option: $arg" >&2
      usage
      exit 1
      ;;
    *)
      PACKAGES+=("$arg")
      ;;
  esac
done

if [[ ${#PACKAGES[@]} -eq 0 ]]; then
  echo "Provide at least one package name." >&2
  usage
  exit 1
fi

echo "→ Adding modules to Marketing + Workspace"
printf '  - %s\n' "${PACKAGES[@]}"

pnpm add \
  --filter landing-page-generator-fe \
  --filter landing-page-web \
  "${PNPM_FLAGS[@]}" \
  "${PACKAGES[@]}"

echo "→ Verifying workspace dependencies"
pnpm --filter landing-page-generator-fe list --depth 0
pnpm --filter landing-page-web list --depth 0

echo "→ Done"
