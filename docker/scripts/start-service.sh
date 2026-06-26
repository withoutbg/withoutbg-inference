#!/bin/sh
set -eu
exec uvicorn withoutbg_api.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --timeout-keep-alive 30
