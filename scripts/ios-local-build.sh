#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:-staging}"
LOCAL_ENV_FILE="${IOS_BUILD_ENV_FILE:-$ROOT_DIR/.env.ios-build.local}"

case "$ENVIRONMENT" in
  staging)
    FASTLANE_LANE="staging"
    RN_ENV_FILE=".env.staging"
    ;;
  production)
    FASTLANE_LANE="production"
    RN_ENV_FILE=".env.production"
    ;;
  *)
    echo "Usage: scripts/ios-local-build.sh [staging|production]" >&2
    exit 2
    ;;
esac

if [ -f "$LOCAL_ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$LOCAL_ENV_FILE"
  set +a
fi

required_vars=(
  APP_STORE_CONNECT_KEY_ID
  APP_STORE_CONNECT_ISSUER_ID
  APP_STORE_CONNECT_API_KEY
  IOS_DEVELOPMENT_TEAM
)

missing_vars=()
for var_name in "${required_vars[@]}"; do
  if [ -z "${!var_name:-}" ]; then
    missing_vars+=("$var_name")
  fi
done

if [ "${#missing_vars[@]}" -gt 0 ]; then
  echo "Missing required iOS build variables:" >&2
  printf '  - %s\n' "${missing_vars[@]}" >&2
  echo "" >&2
  echo "Create $LOCAL_ENV_FILE from scripts/ios-local-build.env.example and fill the values." >&2
  exit 1
fi

cd "$ROOT_DIR"

export ENVFILE="$RN_ENV_FILE"
export NODE_BINARY="${NODE_BINARY:-$(command -v node)}"

printf 'export NODE_BINARY=%q\n' "$NODE_BINARY" > ios/.xcode.env.local

echo "Building iOS $ENVIRONMENT with Fastlane lane: ios $FASTLANE_LANE"

bundle check || bundle install
yarn install --frozen-lockfile
bundle exec pod install --project-directory=ios
bundle exec fastlane ios "$FASTLANE_LANE"
