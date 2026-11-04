"""Pydantic request/response models."""

from pydantic import BaseModel, Field


class RemoveBackgroundRequest(BaseModel):
    image: str = Field(..., description="Input image as a data URL or raw base64 string")
    keep_mask: str | None = Field(
        None,
        description=(
            "Optional Keep mask (data URL or base64), the size of the image after EXIF "
            "orientation: white (light, opaque) pixels mark what to keep. Needs an Open Weights v4 (10.12.4+) bundle."
        ),
    )
    remove_mask: str | None = Field(
        None,
        description=(
            "Optional Remove mask, same rules as keep_mask: marked pixels become transparent. "
            "Where both masks mark a pixel, Remove wins."
        ),
    )
    matte: str | None = Field(
        None,
        description=(
            "Optional, needs keep_mask or remove_mask: the matte this server returned for the "
            "image. It is edited instead of recomputed, so earlier fixes are kept."
        ),
    )
    edit_context: str | None = Field(
        None,
        description=(
            "Optional, with matte and a mask: the editContext the previous edit of this "
            "image returned. Opaque. Lets the server run only the Smart brush graph instead "
            "of the full pipeline. A stale or unknown value is ignored (recomputed)."
        ),
    )


class RemoveBackgroundResponse(BaseModel):
    processed: str = Field(..., description="Transparent PNG cutout as data URL")
    alphaMatte: str = Field(..., description="Grayscale matte as data URL")
    latencyMs: int = Field(..., description="Server-side inference latency in milliseconds")
    routeCategory: str | None = Field(
        None, description="Router category, e.g. fine_strand or vehicle (routed bundles)"
    )
    routePipeline: str | None = Field(
        None, description="Branch that produced the alpha: matting or birefnet (routed bundles)"
    )
    editContext: str | None = Field(
        None,
        description=(
            "Smart brush edits only: opaque token to send back as edit_context with the "
            "next edit of the same image, so it skips the full pipeline."
        ),
    )


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
