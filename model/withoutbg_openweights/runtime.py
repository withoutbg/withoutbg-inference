"""ONNX Runtime session lifecycle and inference."""

from __future__ import annotations

import hashlib
import io
import json
import logging
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageOps

from withoutbg_openweights.config import ModelConfig, load_config, _sidecar_path
from withoutbg_openweights.onnx_cuda import prepare_model_for_cuda
from withoutbg_openweights.postprocess import image_to_data_url, postprocess_outputs
from withoutbg_openweights.preprocess import preprocess_image
from withoutbg_openweights.routed import RoutedPipeline

logger = logging.getLogger(__name__)

_CUDA_PROVIDER = "CUDAExecutionProvider"


def _assert_cuda_runtime_available() -> None:
    if not any(Path(f"/dev/nvidia{i}").exists() for i in range(8)):
        raise RuntimeError(
            "CUDAExecutionProvider is configured but no NVIDIA GPU device is "
            "visible inside the container. Start the GPU image with GPU access, "
            "for example: docker run --rm --gpus all -p 8000:8000 "
            "withoutbg/withoutbg-openweights-v3-service-gpu:latest "
            "(requires the NVIDIA Container Toolkit on the host)."
        )


@dataclass(frozen=True)
class InferenceResult:
    cutout: Image.Image
    matte: Image.Image
    latency_ms: int
    route_category: str | None = None
    route_pipeline: str | None = None

    @property
    def processed_data_url(self) -> str:
        return image_to_data_url(self.cutout)

    @property
    def alpha_matte_data_url(self) -> str:
        return image_to_data_url(self.matte)


class InferenceRuntime:
    def __init__(self, config: ModelConfig | None = None) -> None:
        self._config = config or load_config()
        self._session: Any = None
        self._lock = threading.Lock()
        self._ready = False
        self._routed: RoutedPipeline | None = None

    @property
    def config(self) -> ModelConfig:
        return self._config

    @property
    def ready(self) -> bool:
        return self._ready

    def load(self) -> None:
        import onnxruntime as ort

        model_path = self._config.model_path
        if not model_path.is_file():
            raise FileNotFoundError(f"Model not found: {model_path}")

        sidecar_path = _sidecar_path(model_path)
        sidecar = json.loads(sidecar_path.read_text()) if sidecar_path.exists() else {}
        if "pipeline" in sidecar:
            if self._config.ort_provider == _CUDA_PROVIDER:
                _assert_cuda_runtime_available()
            self._routed = RoutedPipeline(
                sidecar, model_path.parent, providers=[self._config.ort_provider]
            )
            self._routed.warmup()
            self._ready = True
            logger.info(
                "Routed bundle loaded: provider=%s model_version=%s components=%s",
                self._config.ort_provider,
                self._config.model_version,
                sidecar.get("components"),
            )
            return

        if self._config.sha256:
            digest = hashlib.sha256(model_path.read_bytes()).hexdigest()
            if digest != self._config.sha256:
                raise ValueError(
                    f"Model SHA256 mismatch: expected {self._config.sha256}, got {digest}"
                )

        if self._config.ort_provider == _CUDA_PROVIDER:
            _assert_cuda_runtime_available()
            model_path = prepare_model_for_cuda(model_path)

        providers = [self._config.ort_provider]
        self._session = ort.InferenceSession(str(model_path), providers=providers)
        active = self._session.get_providers()[0]
        logger.info(
            "ORT session loaded: provider=%s product_version=%s model_version=%s path=%s",
            active,
            self._config.product_version,
            self._config.model_version,
            model_path,
        )

        if active != self._config.ort_provider:
            raise RuntimeError(
                f"Expected ORT provider {self._config.ort_provider}, got {active}"
            )

        canvas = self._config.canvas_size
        warmup = np.zeros((1, 3, canvas, canvas), dtype=np.float32)
        self._session.run(None, {self._config.input_name: warmup})
        self._ready = True
        logger.info("Model warmup complete")

    def infer_from_pil(self, image: Image.Image) -> InferenceResult:
        if not self._ready:
            raise RuntimeError("Inference runtime is not loaded")

        start = time.perf_counter()
        if self._routed is not None:
            image = ImageOps.exif_transpose(image).convert("RGB")
            alpha, route = self._routed.estimate_alpha(image)
            cutout = image.copy()
            cutout.putalpha(alpha)
            return InferenceResult(
                cutout=cutout,
                matte=alpha.convert("RGB"),
                latency_ms=int((time.perf_counter() - start) * 1000),
                route_category=route["category"],
                route_pipeline=route["pipeline"],
            )
        with self._lock:
            tensor, rgb_image, resized_dims = preprocess_image(image, self._config)
            outputs = self._session.run(None, {self._config.input_name: tensor})
            alpha_canvas = outputs[0][0, 0]
            cutout, matte = postprocess_outputs(
                alpha_canvas, rgb_image, resized_dims, self._config
            )

        latency_ms = int((time.perf_counter() - start) * 1000)
        return InferenceResult(cutout=cutout, matte=matte, latency_ms=latency_ms)

    def infer_from_bytes(self, data: bytes) -> InferenceResult:
        image = Image.open(io.BytesIO(data))
        return self.infer_from_pil(image)
