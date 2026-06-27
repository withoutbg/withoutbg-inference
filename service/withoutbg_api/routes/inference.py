"""Background removal inference endpoint."""

from __future__ import annotations

import base64
import io
import re

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, Response
from PIL import Image

from withoutbg_openweights.postprocess import image_to_png_bytes
from withoutbg_api.schemas import RemoveBackgroundRequest, RemoveBackgroundResponse

router = APIRouter(prefix="/v1", tags=["inference"])

_DATA_URL_RE = re.compile(r"^data:(?P<mime>[^;]+);base64,(?P<data>.*)$", re.DOTALL)


def _decode_image_payload(payload: str) -> bytes:
    match = _DATA_URL_RE.match(payload.strip())
    if match:
        return base64.b64decode(match.group("data"))
    return base64.b64decode(payload)


def _binary_error(status_code: int, message: str) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=status_code)


async def _read_image_bytes(request: Request) -> bytes:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        upload = form.get("image")
        if upload is None or not hasattr(upload, "read"):
            raise ValueError("Multipart field 'image' not found.")
        return await upload.read()

    raw = await request.body()
    if not raw:
        raise ValueError("Empty request body.")
    return raw


def _resolve_binary_output(output: str) -> str:
    normalized = output.lower()
    if normalized == "matte":
        return "matte"
    if normalized in {"cutout", "processed"}:
        return "cutout"
    raise ValueError("Query param 'output' must be 'cutout' or 'matte'.")


@router.post("/remove-background", response_model=None)
async def remove_background(
    request: Request,
    output: str = Query(default="cutout"),
):
    runtime = request.app.state.runtime
    content_type = request.headers.get("content-type", "")
    is_json_request = "application/json" in content_type

    if is_json_request:
        if runtime is None or not runtime.ready:
            raise HTTPException(status_code=503, detail="Model not ready")

        try:
            body = RemoveBackgroundRequest.model_validate(await request.json())
            raw = _decode_image_payload(body.image)
            image = Image.open(io.BytesIO(raw))
            result = runtime.infer_from_pil(image)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=400, detail=f"Invalid image input: {exc}"
            ) from exc

        return RemoveBackgroundResponse(
            processed=result.processed_data_url,
            alphaMatte=result.alpha_matte_data_url,
            latencyMs=result.latency_ms,
        )

    if runtime is None or not runtime.ready:
        return _binary_error(503, "Model not ready")

    try:
        output_kind = _resolve_binary_output(output)
        raw = await _read_image_bytes(request)
        image = Image.open(io.BytesIO(raw))
        result = runtime.infer_from_pil(image)
    except ValueError as exc:
        return _binary_error(400, str(exc))
    except Exception as exc:
        return _binary_error(400, f"Invalid image input: {exc}")

    png_image = result.matte if output_kind == "matte" else result.cutout
    return Response(
        content=image_to_png_bytes(png_image),
        media_type="image/png",
        headers={"X-Latency-Ms": str(result.latency_ms)},
    )
