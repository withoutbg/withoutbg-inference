"""License attribution endpoint."""

from fastapi import APIRouter, Request

from withoutbg_api.licenses_data import build_licenses_response
from withoutbg_api.schemas import LicensesResponse

router = APIRouter(prefix="/v1", tags=["licenses"])


@router.get("/licenses", response_model=LicensesResponse)
async def licenses(request: Request) -> LicensesResponse:
    runtime = request.app.state.runtime
    product_version = runtime.config.product_version if runtime else "v3"
    return build_licenses_response(product_version)
