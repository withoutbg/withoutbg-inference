#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE_DIR="$ROOT/.cache/model"
MODEL_FILE="withoutbg-open-weights.onnx"
MODEL_PATH="$CACHE_DIR/$MODEL_FILE"
HF_REVISION="d0bfe3f4d0cefe0a2ad427f350c6373a7e889ea0"
EXPECTED_SHA256="cd40bdd56770b78e9a3593aa6dbbd28cf20ed4f6861c3a1644504d585ea3e4fd"

sha256() { if command -v sha256sum >/dev/null; then sha256sum "$1"; else shasum -a 256 "$1"; fi | cut -d' ' -f1; }

if [ -f "$MODEL_PATH" ] && [ "$(sha256 "$MODEL_PATH")" = "$EXPECTED_SHA256" ]; then
  echo "Model already cached at $MODEL_PATH"
  exit 0
fi

echo "Downloading model to $CACHE_DIR (~1.5 GB, one-time)..."
python3 -m pip install --quiet "huggingface_hub==0.29.3"
python3 "$ROOT/docker/scripts/download_model.py" \
  "withoutbg/withoutbg-openweights-onnx" \
  "$MODEL_FILE" \
  "$EXPECTED_SHA256" \
  "$CACHE_DIR" \
  "$HF_REVISION"
