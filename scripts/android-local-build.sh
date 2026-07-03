#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:-staging}"
LOCAL_ENV_FILE="${ANDROID_BUILD_ENV_FILE:-$ROOT_DIR/.env.android-build.local}"

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
    echo "Usage: scripts/android-local-build.sh [staging|production]" >&2
    exit 2
    ;;
esac

if [ -f "$LOCAL_ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$LOCAL_ENV_FILE"
  set +a
fi

if [ -z "${PLAY_STORE_JSON_KEY_FILE:-}" ]; then
  echo "Missing required Android build variable: PLAY_STORE_JSON_KEY_FILE" >&2
  echo "" >&2
  echo "Create $LOCAL_ENV_FILE from scripts/android-local-build.env.example and fill the values." >&2
  exit 1
fi

if [ ! -f "$PLAY_STORE_JSON_KEY_FILE" ]; then
  echo "PLAY_STORE_JSON_KEY_FILE does not exist: $PLAY_STORE_JSON_KEY_FILE" >&2
  exit 1
fi

if [ ! -f "$ROOT_DIR/$RN_ENV_FILE" ]; then
  echo "Missing React Native env file: $ROOT_DIR/$RN_ENV_FILE" >&2
  exit 1
fi

cd "$ROOT_DIR"

export ENVFILE="$RN_ENV_FILE"
export PLAY_STORE_TRACK="${PLAY_STORE_TRACK:-internal}"
export PLAY_STORE_RELEASE_STATUS="${PLAY_STORE_RELEASE_STATUS:-completed}"

echo "Building Android $ENVIRONMENT APK/AAB and uploading AAB to Google Play track: $PLAY_STORE_TRACK"

bundle check || bundle install
yarn install --frozen-lockfile
bundle exec fastlane android "$FASTLANE_LANE"
