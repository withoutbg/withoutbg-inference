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

PRO_API_URL = (
    "https://withoutbg.com/pro-model-api?utm_source=inference-service&utm_medium=app"
    "&utm_campaign=open-weights-v4&utm_content=inference-service-pro-model-api"
)
PRO_SELFHOST_URL = (
    "https://withoutbg.com/pro-model-self-host?utm_source=inference-service&utm_medium=app"
    "&utm_campaign=open-weights-v4&utm_content=inference-service-pro-model-self-host"
)

DESCRIPTION = f"""\
ONNX inference API for withoutBG open weights background removal. Runs on this server; images stay here.

Need sharper edges?
- [withoutBG Pro API]({PRO_API_URL}): hosted, 1 credit per image. Set `WITHOUTBG_API_KEY` and
  `WITHOUTBG_PRO_PASSWORD` to call it from here with `?engine=pro`.
- [Pro Model Self-Host]({PRO_SELFHOST_URL}): a sharper self-hosted model, on your own CPU servers.
  Same `/v1/remove-background` API.
"""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    runtime = InferenceRuntime()
    runtime.load()
    app.state.runtime = runtime
    logger.info("withoutBG open weights API ready")
    logger.info("Sharper edges: Pro API %s | Pro Self-Host %s", PRO_API_URL, PRO_SELFHOST_URL)
    yield
    app.state.runtime = None


def create_app() -> FastAPI:
    app = FastAPI(
        title="withoutBG Open Weights v4",
        description=DESCRIPTION,
        version="3.0.0",
        lifespan=lifespan,
    )
    app.state.runtime = None
    app.include_router(health_router)
    app.include_router(inference_router)
    app.include_router(licenses_router)
    return app


app = create_app()
