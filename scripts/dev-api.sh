#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_PATH="$ROOT/.cache/model/withoutbg-open-weights.onnx"
VENV="$ROOT/.venv"

if [ ! -f "$MODEL_PATH" ]; then
  echo "Model not found. Run: $ROOT/scripts/dev-download-model.sh" >&2
  exit 1
fi

if [ ! -d "$VENV" ]; then
  echo "Creating virtualenv and installing package (editable)..."
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --upgrade pip
  "$VENV/bin/pip" install -e "$ROOT[cpu]"
fi

export WITHOUTBG_MODEL_PATH="$MODEL_PATH"
export WITHOUTBG_ORT_PROVIDER="${WITHOUTBG_ORT_PROVIDER:-CPUExecutionProvider}"

cd "$ROOT"
exec "$VENV/bin/uvicorn" withoutbg_api.main:app \
  --reload \
  --host 127.0.0.1 \
  --port 8000 \
  --reload-dir "$ROOT/service" \
  --reload-dir "$ROOT/model"
