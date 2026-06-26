"""Pydantic request/response models."""

from pydantic import BaseModel, Field


class RemoveBackgroundRequest(BaseModel):
    image: str = Field(..., description="Input image as a data URL or raw base64 string")


class RemoveBackgroundResponse(BaseModel):
    processed: str = Field(..., description="Transparent PNG cutout as data URL")
    alphaMatte: str = Field(..., description="Grayscale matte as data URL")
    latencyMs: int = Field(..., description="Server-side inference latency in milliseconds")


class LicenseLink(BaseModel):
    label: str
    href: str


class UpstreamComponent(BaseModel):
    name: str
    license: str
    links: list[LicenseLink]
    note: str | None = None


class LicensesResponse(BaseModel):
    product_version: str
    product_license: str
    product_license_url: str
    upstream_components: list[UpstreamComponent]
    third_party_notices_path: str
