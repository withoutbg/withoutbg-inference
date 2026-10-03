"""Letterbox preprocessing for fixed-size NCHW RGB input (default 448×448)."""

from __future__ import annotations

import numpy as np
from PIL import Image

from withoutbg_openweights.config import ModelConfig


def letterbox_rgb(image: Image.Image, canvas_size: int) -> tuple[np.ndarray, Image.Image, tuple[int, int]]:
    """Resize longest side to canvas, paste top-left on black canvas, return NCHW tensor."""
    rgb_image = image.convert("RGB")
    orig_w, orig_h = rgb_image.size
    scale = canvas_size / max(orig_w, orig_h)
    new_w = max(1, round(orig_w * scale))
    new_h = max(1, round(orig_h * scale))

    resized = rgb_image.resize((new_w, new_h), Image.Resampling.BILINEAR)
    padded = Image.new("RGB", (canvas_size, canvas_size), (0, 0, 0))
    padded.paste(resized, (0, 0))

    rgb = np.asarray(padded, dtype=np.float32) / 255.0
    rgb = np.transpose(rgb, (2, 0, 1))[None, ...]

    return rgb, rgb_image, (new_w, new_h)


def preprocess_image(image: Image.Image, config: ModelConfig) -> tuple[np.ndarray, Image.Image, tuple[int, int]]:
    return letterbox_rgb(image, config.canvas_size)


# ---------------------------------------------------------------------------
# Routed pipeline (sidecar schema 3). Mirrors model-pro serve: whole-image
# square stretches, no letterbox.
# ---------------------------------------------------------------------------


def fit_max_size(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    """Downscale to fit ``max_width × max_height`` (model-pro ``resize_if_img_big``)."""
    w, h = image.size
    ar = w / h
    resize = False
    if w > max_width:
        w, h, resize = max_width, int(max_width / ar), True
    if h > max_height:
        h, w, resize = max_height, int(max_height * ar), True
    return image.resize((w, h)) if resize else image


def _bilinear_axis(src: int, dst: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Source indices and weights of torch bilinear, ``align_corners=False``, no antialias."""
    pos = np.maximum((np.arange(dst) + 0.5) * (src / dst) - 0.5, 0.0)
    i0 = pos.astype(np.int64)
    i1 = np.minimum(i0 + 1, src - 1)
    return i0, i1, (pos - i0).astype(np.float32)


def resize_bilinear(x: np.ndarray, height: int, width: int) -> np.ndarray:
    """``(C, H, W)`` float32 → ``(C, height, width)``, matching ``F.interpolate(bilinear)``."""
    _, h, w = x.shape
    if (h, w) == (height, width):
        return x
    r0, r1, rl = _bilinear_axis(h, height)
    c0, c1, cl = _bilinear_axis(w, width)
    rows = x[:, r0] * (1.0 - rl)[:, None] + x[:, r1] * rl[:, None]
    return rows[:, :, c0] * (1.0 - cl) + rows[:, :, c1] * cl


def resize_bicubic_antialias(rgb: np.ndarray, size: int) -> np.ndarray:
    """``(H, W, 3)`` float → ``(3, size, size)``; PIL "F" bicubic equals torch ``antialias=True``."""
    return np.stack([
        np.asarray(Image.fromarray(np.ascontiguousarray(rgb[..., c]), "F")
                   .resize((size, size), Image.Resampling.BICUBIC))
        for c in range(3)
    ])


def graph_inputs(
    rgb: np.ndarray, graph_spec: dict, cached: dict[str, np.ndarray] | None = None
) -> dict[str, np.ndarray]:
    """Graph feeds from native ``(H, W, 3)`` float32 RGB in ``[0, 1]``.

    Feeds already in *cached* (same name, same resize spec) are reused.
    """
    feeds = {}
    for name, spec in graph_spec["inputs"].items():
        if cached is not None and name in cached:
            feeds[name] = cached[name]
            continue
        size = int(spec["size"])
        if spec["interpolation"] == "bicubic" and spec["antialias"]:
            x = resize_bicubic_antialias(rgb, size)
        elif spec["interpolation"] == "bilinear" and not spec["antialias"]:
            x = resize_bilinear(np.ascontiguousarray(rgb.transpose(2, 0, 1)), size, size)
        else:
            raise ValueError(f"Unsupported resize for {name}: {spec}")
        feeds[name] = np.ascontiguousarray(x[None], dtype=np.float32)
    return feeds
