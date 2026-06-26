#!/bin/sh
set -eu

HF_REPO="${1:?HF repo required}"
MODEL_FILE="${2:?model file required}"
EXPECTED_SHA256="${3:?sha256 required}"
DEST_DIR="${4:?dest dir required}"

mkdir -p "${DEST_DIR}"
MODEL_PATH="${DEST_DIR}/${MODEL_FILE}"
SIDECAR_PATH="${MODEL_PATH}.json"
BASE_URL="https://huggingface.co/${HF_REPO}/resolve/main"

wget -q -O "${MODEL_PATH}" "${BASE_URL}/${MODEL_FILE}"
wget -q -O "${SIDECAR_PATH}" "${BASE_URL}/${MODEL_FILE}.json"

ACTUAL_SHA256="$(sha256sum "${MODEL_PATH}" | awk '{print $1}')"
if [ "${ACTUAL_SHA256}" != "${EXPECTED_SHA256}" ]; then
  echo "SHA256 mismatch for ${MODEL_FILE}: expected ${EXPECTED_SHA256}, got ${ACTUAL_SHA256}" >&2
  exit 1
fi

echo "Downloaded and verified ${MODEL_FILE} (${ACTUAL_SHA256})"
