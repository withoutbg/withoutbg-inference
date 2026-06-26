"""Letterbox preprocessing for fixed 1024×1024 NCHW RGB input."""

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
