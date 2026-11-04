"""Optional withoutBG Pro engine: the hosted withoutBG API, used only when
both ``WITHOUTBG_API_KEY`` and ``WITHOUTBG_PRO_PASSWORD`` are set on the server.

The key never reaches the browser. Because the server spends the owner's
credits on behalf of whoever calls it, every Pro request must also carry the
password in ``X-Pro-Password``; without it, anyone who can reach the server
could use up the credits. Images go to api.withoutbg.com only for requests
that pick ``engine=pro``; the default engine stays the local open weights.
"""

from __future__ import annotations

import hmac
import io
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
from importlib.metadata import PackageNotFoundError, version

from PIL import Image, ImageOps

from withoutbg_openweights.runtime import InferenceResult

API_URL = os.environ.get("WITHOUTBG_API_URL", "https://api.withoutbg.com").rstrip("/")
MAX_SIDE = 1024  # Pro inference resolution; larger uploads only cost bandwidth.
TIMEOUT_S = 60


class CloudError(Exception):
    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code


def api_key() -> str | None:
    return os.environ.get("WITHOUTBG_API_KEY", "").strip() or None


def pro_password() -> str | None:
    return os.environ.get("WITHOUTBG_PRO_PASSWORD", "") or None


def pro_available() -> bool:
    """Pro needs both the key and a password guarding it."""
    return api_key() is not None and pro_password() is not None


def check_password(given: str | None) -> None:
    """Raise unless *given* matches WITHOUTBG_PRO_PASSWORD (constant time)."""
    expected = pro_password()
    if api_key() is None or expected is None:
        raise CloudError(
            400,
            "withoutBG Pro is not configured: set WITHOUTBG_API_KEY and WITHOUTBG_PRO_PASSWORD.",
        )
    if not given or not hmac.compare_digest(given.encode(), expected.encode()):
        raise CloudError(401, "Wrong or missing Pro password (X-Pro-Password header).")


def _device() -> str:
    try:
        import onnxruntime

        if "CUDAExecutionProvider" in onnxruntime.get_available_providers():
            return "gpu"
    except Exception:
        pass
    return "cpu"


def user_agent() -> str:
    try:
        ver = version("withoutbg-openweights")
    except PackageNotFoundError:
        ver = "dev"
    host = "docker" if os.path.exists("/.dockerenv") else sys.platform
    return f"withoutbg-inference/{ver} ({host}; {_device()})"


def _multipart(png: bytes) -> tuple[bytes, str]:
    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="file"; filename="image.png"\r\n'
        "Content-Type: image/png\r\n\r\n"
    ).encode() + png + f"\r\n--{boundary}--\r\n".encode()
    return body, f"multipart/form-data; boundary={boundary}"


_FRIENDLY = {
    401: "withoutBG Pro rejected the server's API key. Check WITHOUTBG_API_KEY.",
    402: "Out of withoutBG Pro credits. Top up at withoutbg.com.",
    403: "This API key cannot use withoutBG Pro.",
    429: "withoutBG Pro rate limit reached. Try again shortly.",
}


def _post_alpha(png: bytes, key: str) -> bytes:
    body, content_type = _multipart(png)
    req = urllib.request.Request(f"{API_URL}/v1.0/alpha-channel", data=body, method="POST")
    req.add_header("Content-Type", content_type)
    req.add_header("X-API-Key", key)
    req.add_header("User-Agent", user_agent())
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        message = _FRIENDLY.get(exc.code, f"withoutBG Pro returned HTTP {exc.code}.")
        # 401 from upstream = bad server key, not a bad Pro password: report 502.
        status = exc.code if exc.code in _FRIENDLY and exc.code != 401 else 502
        raise CloudError(status, message) from exc
    except urllib.error.URLError as exc:
        raise CloudError(502, f"Cannot reach withoutBG Pro: {exc.reason}") from exc


def infer(image: Image.Image) -> InferenceResult:
    """Background removal via withoutBG Pro, composed at the input's full size."""
    key = api_key()
    if key is None:
        raise CloudError(400, "withoutBG Pro is not configured: set WITHOUTBG_API_KEY.")

    start = time.perf_counter()
    rgb = ImageOps.exif_transpose(image).convert("RGB")
    proxy = rgb.copy()
    proxy.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    proxy.save(buf, format="PNG")

    alpha = Image.open(io.BytesIO(_post_alpha(buf.getvalue(), key))).convert("L")
    if alpha.size != rgb.size:
        alpha = alpha.resize(rgb.size, Image.Resampling.BILINEAR)

    cutout = rgb.copy()
    cutout.putalpha(alpha)
    return InferenceResult(
        cutout=cutout,
        matte=alpha.convert("RGB"),
        latency_ms=int((time.perf_counter() - start) * 1000),
        route_pipeline="pro",
    )
