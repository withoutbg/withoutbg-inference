"""Runtime configuration from environment and sidecar metadata."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path


DEFAULT_PRODUCT_VERSION = "v3"


def _default_model_path(product_version: str) -> Path:
    return Path(f"/opt/withoutbg/{product_version}/model/withoutbg-open-weights.onnx")


@dataclass(frozen=True)
class ModelConfig:
    product_version: str
    model_path: Path
    ort_provider: str
    canvas_size: int
    input_name: str
    output_name: str
    model_version: str
    variant: str
    sha256: str


def load_config() -> ModelConfig:
    product_version = os.getenv("WITHOUTBG_PRODUCT_VERSION", DEFAULT_PRODUCT_VERSION)
    model_path = Path(
        os.getenv("WITHOUTBG_MODEL_PATH", str(_default_model_path(product_version)))
    )
    ort_provider = os.getenv("WITHOUTBG_ORT_PROVIDER", "CPUExecutionProvider")

    sidecar_path = model_path.with_suffix(model_path.suffix + ".json")
    sidecar: dict = {}
    if sidecar_path.is_file():
        sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))

    return ModelConfig(
        product_version=product_version,
        model_path=model_path,
        ort_provider=ort_provider,
        canvas_size=int(sidecar.get("canvas_size", 1024)),
        input_name=str(sidecar.get("input_name", "rgb")),
        output_name=str(sidecar.get("output_name", "alpha")),
        model_version=str(sidecar.get("model_version", "unknown")),
        variant=str(sidecar.get("variant", "oss")),
        sha256=str(sidecar.get("sha256", "")),
    )
