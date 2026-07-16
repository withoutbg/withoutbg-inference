#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_DIR="$ROOT/.cache/model"
MODEL_FILE="withoutbg-open-weights.onnx"
MODEL_PATH="$CACHE_DIR/$MODEL_FILE"
EXPECTED_SHA256="29930e48e9d5ecc56d6486c53c35a4c1470566c2a3359fa180b08c8d3c34ef0f"

if [ -f "$MODEL_PATH" ]; then
  echo "Model already cached at $MODEL_PATH"
  exit 0
fi

echo "Downloading model to $CACHE_DIR (~455 MB, one-time)..."
python3 -m pip install --quiet "huggingface_hub==0.29.3"
python3 "$ROOT/docker/scripts/download_model.py" \
  "withoutbg/withoutbg-openweights-onnx" \
  "$MODEL_FILE" \
  "$EXPECTED_SHA256" \
  "$CACHE_DIR"
