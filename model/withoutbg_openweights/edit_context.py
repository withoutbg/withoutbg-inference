"""Smart brush edit context: the image-only inputs of the stroke edit, round-tripped by the client.

The stroke-edit graph needs the coarse graph's ``edit_depth``. It depends only
on the image, so after the first edit the server hands it to the client as an
opaque token and the client sends it back with the next edit. A matching token
skips the router and coarse graphs (ConvNeXt backbone, Depth Anything); only
the stroke-edit graph runs. The server keeps no state.

Token: ``wbgctx1.<category>.<fingerprint>.<base64 PNG>``. The PNG is the
``S × S`` depth as 16-bit grayscale (``round(d * 65535)``). The fingerprint
ties it to the working image (after EXIF and ``max_inference_size``), so a
token from another image or host is stale, never wrong: the caller recomputes.
"""

from __future__ import annotations

import base64
import binascii
import hashlib
import io
from dataclasses import dataclass

import numpy as np
from PIL import Image

PREFIX = "wbgctx1"
MAX_TOKEN_CHARS = 4 * 1024 * 1024
"""Upper bound on a token we try to decode (a 448² PNG16 is well under this)."""


@dataclass(frozen=True)
class EditContext:
    category: str
    fingerprint: str
    depth: np.ndarray
    """Float32 ``(1, 1, S, S)`` normalised inverse depth in ``[0, 1]``."""


def fingerprint(rgb_u8: np.ndarray) -> str:
    """16 hex chars identifying the ``(H, W, 3)`` uint8 working image."""
    h, w = rgb_u8.shape[:2]
    digest = hashlib.sha256(f"{w}x{h}:".encode())
    digest.update(np.ascontiguousarray(rgb_u8, dtype=np.uint8).tobytes())
    return digest.hexdigest()[:16]


def encode(ctx: EditContext) -> str:
    """Opaque token for *ctx*."""
    d = np.asarray(ctx.depth, dtype=np.float32)
    plane = d.reshape(d.shape[-2:])
    q = np.round(np.clip(plane, 0.0, 1.0) * 65535.0).astype(np.uint16)
    buf = io.BytesIO()
    Image.fromarray(q).save(buf, format="PNG", optimize=False)
    png = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"{PREFIX}.{ctx.category}.{ctx.fingerprint}.{png}"


def decode(token: str | None, categories: list[str], size: int) -> EditContext | None:
    """Parse *token*; ``None`` when absent, malformed or not ``size × size``."""
    if not token or len(token) > MAX_TOKEN_CHARS:
        return None
    parts = token.strip().split(".", 3)
    if len(parts) != 4 or parts[0] != PREFIX or parts[1] not in categories:
        return None
    _, category, fp, png = parts
    if len(fp) != 16 or any(c not in "0123456789abcdef" for c in fp):
        return None
    try:
        img = Image.open(io.BytesIO(base64.b64decode(png, validate=True)))
        img.load()
    except (binascii.Error, ValueError, OSError):
        return None
    if img.format != "PNG" or img.size != (size, size) or img.mode not in ("I;16", "I"):
        return None
    q = np.asarray(img, dtype=np.float32)
    depth = (q / 65535.0).reshape(1, 1, size, size).astype(np.float32)
    return EditContext(category=category, fingerprint=fp, depth=depth)
