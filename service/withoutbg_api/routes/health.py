"""Health and readiness endpoints."""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from withoutbg_api import cloud
from withoutbg_openweights.config import load_config

router = APIRouter(tags=["health"])


def _health_payload(request: Request) -> dict[str, str | bool]:
    runtime = request.app.state.runtime
    config = runtime.config if runtime is not None else load_config()
    return {
        "status": "ok",
        "model": f"withoutbg-openweights-{config.variant}",
        "version": config.model_version,
        "pro_available": cloud.pro_available(),
    }


@router.get("/health")
async def health(request: Request) -> dict[str, str | bool]:
    return _health_payload(request)


@router.get("/ready")
async def ready(request: Request) -> JSONResponse:
    runtime = request.app.state.runtime
    if runtime is not None and runtime.ready:
        return JSONResponse({"status": "ready"})
    return JSONResponse({"status": "not_ready"}, status_code=503)
