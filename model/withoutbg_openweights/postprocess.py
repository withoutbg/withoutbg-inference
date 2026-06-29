"""Alpha crop, resize, and cutout / matte composition."""

from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image

from withoutbg_openweights.config import ModelConfig


def alpha_from_output(
    alpha_canvas: np.ndarray,
    resized_dims: tuple[int, int],
    orig_dims: tuple[int, int],
    canvas_size: int,
    output_canvas_size: int,
) -> Image.Image:
    new_w, new_h = resized_dims
    orig_w, orig_h = orig_dims
    scale = output_canvas_size / canvas_size
    out_w = max(1, round(new_w * scale))
    out_h = max(1, round(new_h * scale))
    alpha_crop = alpha_canvas[:out_h, :out_w]
    alpha_u8 = np.clip(alpha_crop * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(alpha_u8, "L").resize((orig_w, orig_h), Image.Resampling.BILINEAR)


def compose_cutout(rgb_image: Image.Image, alpha: Image.Image) -> Image.Image:
    out = rgb_image.copy()
    out.putalpha(alpha)
    return out


def matte_from_alpha(alpha: Image.Image) -> Image.Image:
    """Grayscale RGB matte: white = subject, black = background."""
    return Image.merge("RGB", (alpha, alpha, alpha))


def image_to_data_url(image: Image.Image, fmt: str = "PNG") -> str:
    encoded = base64.b64encode(image_to_png_bytes(image, fmt)).decode("ascii")
    mime = "image/png" if fmt.upper() == "PNG" else f"image/{fmt.lower()}"
    return f"data:{mime};base64,{encoded}"


def image_to_png_bytes(image: Image.Image, fmt: str = "PNG") -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format=fmt)
    return buffer.getvalue()


def postprocess_outputs(
    alpha_canvas: np.ndarray,
    rgb_image: Image.Image,
    resized_dims: tuple[int, int],
    config: ModelConfig,
) -> tuple[Image.Image, Image.Image]:
    orig_dims = rgb_image.size
    alpha = alpha_from_output(
        alpha_canvas,
        resized_dims,
        orig_dims,
        config.canvas_size,
        config.output_canvas_size,
    )
    cutout = compose_cutout(rgb_image, alpha)
    matte = matte_from_alpha(alpha)
    return cutout, matte
