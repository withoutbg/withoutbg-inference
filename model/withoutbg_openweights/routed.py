"""Routed open-weights pipeline: router → withoutBG matting or BiRefNet (sidecar schema 3).

Matches model-pro ``wbgnet_inference.py --config inference_oss_config.json``
(pipeline ``routed``, withoutBG Open Weights): the shared ConvNeXt backbone at
448² yields router logits and features. Fine strands, soft detail and
transparency go to Depth Anything V2 small depth + ConvNeXt-fused matting
(reusing those features); hard opaque objects, flat scenes and vehicles go to
BiRefNet at 1024². Only the selected branch executes; its alpha is upsampled
to native resolution.
"""

from __future__ import annotations

import hashlib
import threading
from pathlib import Path, PurePosixPath, PureWindowsPath

import numpy as np
from PIL import Image

from withoutbg_openweights.onnx_cuda import prepare_model_for_cuda
from withoutbg_openweights.preprocess import fit_max_size, graph_inputs, resize_bilinear

SCHEMA_VERSION = 3
PIPELINE_NAME = "routed"
GRAPHS = ("router", "coarse", "birefnet")
_CUDA_PROVIDER = "CUDAExecutionProvider"


def is_bundle_relative(filename: str) -> bool:
    """True for a plain relative path on every OS (no root, drive or ``..``)."""
    for path in (PurePosixPath(filename), PureWindowsPath(filename)):
        if path.anchor or ".." in path.parts or not path.name:
            return False
    return True


def validate_sidecar(sidecar: dict) -> None:
    """Reject anything but a well-formed open-weights ``routed`` bundle."""
    if sidecar.get("schema_version") != SCHEMA_VERSION:
        raise ValueError("Unsupported open-weights bundle schema")
    pipeline = sidecar.get("pipeline")
    if pipeline == "routed_edge_refine" or "refiner" in sidecar:
        raise ValueError("Edge-refine bundles are withoutBG Enterprise and not supported here")
    if pipeline != PIPELINE_NAME:
        raise ValueError(f"Unsupported open-weights pipeline: {pipeline!r}")
    for name in GRAPHS:
        if not is_bundle_relative(sidecar[name]["file"]):
            raise ValueError("Bundle model paths must be relative to the bundle")
    router = sidecar["router"]
    if not set(router["birefnet_categories"]) <= set(router["categories"]):
        raise ValueError("BiRefNet categories must be router categories")


def _session(path: Path, sha256: str, providers: list[str]):
    import onnxruntime as ort

    if not path.is_file():
        raise FileNotFoundError(f"Model not found: {path}")
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest() != sha256:
        raise ValueError(f"Model SHA256 mismatch for {path.name}: expected {sha256}, got {digest.hexdigest()}")
    if providers[0] == _CUDA_PROVIDER:
        path = prepare_model_for_cuda(path)
    session = ort.InferenceSession(str(path), providers=providers)
    if session.get_providers()[0] != providers[0]:
        raise RuntimeError(f"Expected ORT provider {providers[0]}, got {session.get_providers()[0]}")
    return session


class RoutedPipeline:
    def __init__(self, sidecar: dict, bundle_dir: Path, providers: list[str]) -> None:
        validate_sidecar(sidecar)
        self._specs = {name: sidecar[name] for name in GRAPHS}
        router = self._specs["router"]
        self._categories = list(router["categories"])
        self._birefnet_categories = set(router["birefnet_categories"])
        self._max_size = tuple(sidecar["max_inference_size"])
        self._sessions = {
            name: _session(bundle_dir / spec["file"], spec["sha256"], providers)
            for name, spec in self._specs.items()
        }
        self._lock = threading.Lock()

    def warmup(self) -> None:
        self.estimate_alpha(Image.new("RGB", (256, 192), (128, 128, 128)))

    def _route(self, rgb: np.ndarray) -> tuple[str, dict[str, np.ndarray], dict[str, np.ndarray]]:
        spec = self._specs["router"]
        feeds = graph_inputs(rgb, spec)
        logits, *feats = self._sessions["router"].run([spec["logits_name"], *spec["feature_names"]], feeds)
        if logits.shape != (1, len(self._categories)) or not np.isfinite(logits).all():
            raise ValueError("Router output must be finite [1, n_categories] logits")
        category = self._categories[int(np.argmax(logits[0]))]
        return category, feeds, dict(zip(spec["feature_names"], feats))

    def _coarse(self, rgb: np.ndarray, feeds: dict, feats: dict) -> np.ndarray:
        spec = self._specs["coarse"]
        # The backbone already resized rgb_matting identically; reuse it.
        coarse_feeds = graph_inputs(rgb, spec, cached=feeds)
        coarse_feeds.update(feats)
        return self._sessions["coarse"].run([spec["output_name"]], coarse_feeds)[0][0]

    def _birefnet(self, rgb: np.ndarray) -> np.ndarray:
        spec = self._specs["birefnet"]
        return self._sessions["birefnet"].run([spec["output_name"]], graph_inputs(rgb, spec))[0][0]

    def estimate_alpha(self, image: Image.Image) -> tuple[Image.Image, dict[str, str]]:
        """``L`` alpha matte at *image*'s size plus ``{"category", "pipeline"}``."""
        orig_size = image.size
        work = fit_max_size(image.convert("RGB"), *self._max_size)
        rgb = np.asarray(work, dtype=np.float32) / 255.0
        h, w = rgb.shape[:2]
        with self._lock:
            category, feeds, feats = self._route(rgb)
            pipeline = "birefnet" if category in self._birefnet_categories else "matting"
            if pipeline == "birefnet":
                coarse = self._birefnet(rgb)
            else:
                coarse = self._coarse(rgb, feeds, feats)
        if coarse.ndim != 3 or coarse.shape[0] != 1 or not np.isfinite(coarse).all():
            raise ValueError(f"{pipeline} output must be finite [1, H, W] alpha")
        alpha = np.clip(resize_bilinear(coarse, h, w), 0.0, 1.0)[0]
        matte = Image.fromarray(np.clip(alpha * 255.0 + 0.5, 0, 255).astype(np.uint8))
        if matte.size != orig_size:
            matte = matte.resize(orig_size, Image.Resampling.BILINEAR)
        return matte, {"category": category, "pipeline": pipeline}
