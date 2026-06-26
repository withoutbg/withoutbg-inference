"""Background removal inference endpoint."""

from __future__ import annotations

import base64
import io
import re

from fastapi import APIRouter, HTTPException, Request
from PIL import Image

from withoutbg_api.schemas import RemoveBackgroundRequest, RemoveBackgroundResponse

router = APIRouter(prefix="/v1", tags=["inference"])

_DATA_URL_RE = re.compile(r"^data:(?P<mime>[^;]+);base64,(?P<data>.*)$", re.DOTALL)


def _decode_image_payload(payload: str) -> bytes:
    match = _DATA_URL_RE.match(payload.strip())
    if match:
        return base64.b64decode(match.group("data"))
    return base64.b64decode(payload)


@router.post("/remove-background", response_model=RemoveBackgroundResponse)
async def remove_background(
    body: RemoveBackgroundRequest,
    request: Request,
) -> RemoveBackgroundResponse:
    runtime = request.app.state.runtime
    if runtime is None or not runtime.ready:
        raise HTTPException(status_code=503, detail="Model not ready")

    try:
        raw = _decode_image_payload(body.image)
        image = Image.open(io.BytesIO(raw))
        result = runtime.infer_from_pil(image)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image input: {exc}") from exc

    return RemoveBackgroundResponse(
        processed=result.processed_data_url,
        alphaMatte=result.alpha_matte_data_url,
        latencyMs=result.latency_ms,
    )
