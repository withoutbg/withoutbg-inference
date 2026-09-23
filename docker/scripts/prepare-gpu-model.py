#!/usr/bin/env python3
"""Bake a CUDA-compatible ONNX graph for GPU images."""

from __future__ import annotations

import sys
import json
from pathlib import Path

from withoutbg_openweights.onnx_cuda import prepare_model_for_cuda


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: prepare-gpu-model.py <model.onnx>")

    model_path = Path(sys.argv[1])
    if not model_path.is_file():
        raise SystemExit(f"Model not found: {model_path}")

    sidecar = model_path.with_suffix(model_path.suffix + ".json")
    if sidecar.exists() and "gateway" in json.loads(sidecar.read_text()):
        # Gateway assets are portable fp32 graphs; keep hashes and filenames intact.
        print(model_path)
        return
    prepared = prepare_model_for_cuda(model_path)
    print(prepared)


if __name__ == "__main__":
    main()
