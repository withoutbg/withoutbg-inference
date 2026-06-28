#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_DIR="$ROOT/.cache/model"
MODEL_FILE="withoutbg-open-weights.onnx"
MODEL_PATH="$CACHE_DIR/$MODEL_FILE"

if [ -f "$MODEL_PATH" ]; then
  echo "Model already cached at $MODEL_PATH"
  exit 0
fi

echo "Downloading model to $CACHE_DIR (~500 MB, one-time)..."
python3 -m pip install --quiet "huggingface_hub==0.29.3"
python3 "$ROOT/docker/scripts/download_model.py" \
  "withoutbg/withoutbg-openweights-onnx" \
  "$MODEL_FILE" \
  "7007809c1bdfb735e30ee2456664a4676ca64112d1dd2e1237c530804673dd12" \
  "$CACHE_DIR"
