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
  "7873ec427ac6928bc91a3b6e1ddd32715a02d4b85836e78f0afacacee533b82f" \
  "$CACHE_DIR"
