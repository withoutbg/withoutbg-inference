"""FastAPI application factory."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from withoutbg_openweights.runtime import InferenceRuntime
from withoutbg_api.routes.health import router as health_router
from withoutbg_api.routes.inference import router as inference_router
from withoutbg_api.routes.licenses import router as licenses_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    runtime = InferenceRuntime()
    runtime.load()
    app.state.runtime = runtime
    logger.info("withoutBG open weights API ready")
    yield
    app.state.runtime = None


def create_app() -> FastAPI:
    app = FastAPI(
        title="withoutBG Open Weights v3",
        description="ONNX inference API for withoutBG open weights background removal",
        version="3.0.0",
        lifespan=lifespan,
    )
    app.state.runtime = None
    app.include_router(health_router)
    app.include_router(inference_router)
    app.include_router(licenses_router)
    return app


app = create_app()
