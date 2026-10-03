#!/usr/bin/env python3
"""Bake a CUDA-compatible ONNX graph for GPU images."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from withoutbg_openweights.onnx_cuda import prepare_model_for_cuda


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: prepare-gpu-model.py <model.onnx>")

    model_path = Path(sys.argv[1])
    if not model_path.is_file():
        raise SystemExit(f"Model not found: {model_path}")

    sidecar = model_path.with_suffix(model_path.suffix + ".json")
    meta = json.loads(sidecar.read_text()) if sidecar.exists() else {}
    if "pipeline" in meta:
        # Originals stay hash-checked; the runtime loads these .cuda siblings.
        for name in ("router", "coarse", "birefnet"):
            print(prepare_model_for_cuda(model_path.parent / meta[name]["file"]))
        return
    prepared = prepare_model_for_cuda(model_path)
    print(prepared)


if __name__ == "__main__":
    main()
