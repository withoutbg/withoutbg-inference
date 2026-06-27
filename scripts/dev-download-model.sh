#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_DIR="$ROOT/.cache/model"
MODEL_FILE="withoutbg-openweights.onnx"
MODEL_PATH="$CACHE_DIR/$MODEL_FILE"

if [ -f "$MODEL_PATH" ]; then
  echo "Model already cached at $MODEL_PATH"
  exit 0
fi

echo "Downloading model to $CACHE_DIR (~500 MB, one-time)..."
"$ROOT/docker/scripts/download-model.sh" \
  "withoutbg/withoutbg-openweights-onnx" \
  "$MODEL_FILE" \
  "927adb4f9a4bd498f1ea5620ae1befdcd45dc3e14b2a791f8fb48ddd69662774" \
  "$CACHE_DIR"
