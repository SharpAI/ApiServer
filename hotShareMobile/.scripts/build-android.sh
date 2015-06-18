#!/bin/bash
ROOT=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
METEOR_ROOT=$(dirname "${ROOT}")

cd "${ROOT}"
source "${ROOT}/includes/build.sh"

# Directory where compiled .apk files are moved to after build
RELEASE_DIR="${METEOR_ROOT}/.release";

# Make .apk directory if it doesn't exist
if [ ! -d "$RELEASE_DIR" ]; then
  mkdir "${METEOR_ROOT}/.release";
  mkdir "${METEOR_ROOT}/.release/android";
  mkdir "${METEOR_ROOT}/.release/ios";
fi

source "${ROOT}/includes/android/build.sh"

if [ "${DEBUG_MODE}" = true ]; then
  source "${ROOT}/includes/android/install.sh"
  if [ "${USE_LOCAL}" = true ]; then
    source "${ROOT}/includes/run-server.sh"
  fi
else
  source "${ROOT}/includes/android/sign.sh"
fi
