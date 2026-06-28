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
WGET_OPTS="-q --timeout=120 --tries=1 --header=User-Agent: withoutbg-docker-build"

download_file() {
  url="$1"
  dest="$2"
  attempt=1
  max_attempts=5

  while [ "${attempt}" -le "${max_attempts}" ]; do
    if wget ${WGET_OPTS} -O "${dest}" "${url}"; then
      return 0
    fi
    echo "Download failed (attempt ${attempt}/${max_attempts}): ${url}" >&2
    attempt=$((attempt + 1))
    sleep $((attempt * 5))
  done

  echo "Giving up on ${url}" >&2
  return 1
}

download_file "${BASE_URL}/${MODEL_FILE}" "${MODEL_PATH}"
download_file "${BASE_URL}/${MODEL_FILE}.json" "${SIDECAR_PATH}"

ACTUAL_SHA256="$(sha256sum "${MODEL_PATH}" | awk '{print $1}')"
if [ "${ACTUAL_SHA256}" != "${EXPECTED_SHA256}" ]; then
  echo "SHA256 mismatch for ${MODEL_FILE}: expected ${EXPECTED_SHA256}, got ${ACTUAL_SHA256}" >&2
  exit 1
fi

echo "Downloaded and verified ${MODEL_FILE} (${ACTUAL_SHA256})"
