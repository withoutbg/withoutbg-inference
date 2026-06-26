"""License and upstream attribution data (mirrors reference-links.md)."""

from withoutbg_api.schemas import LicenseLink, LicensesResponse, UpstreamComponent

PRODUCT_LICENSE_URL = "https://withoutbg.com/open-weights-model/license"
THIRD_PARTY_NOTICES_PATH = "/opt/withoutbg/v3/THIRD_PARTY_NOTICES.md"

UPSTREAM_COMPONENTS: list[UpstreamComponent] = [
    UpstreamComponent(
        name="DINOv3",
        license="DINOv3 License",
        links=[
            LicenseLink(
                label="Meta license",
                href="https://ai.meta.com/resources/models-and-libraries/dinov3-license/",
            ),
            LicenseLink(
                label="GitHub LICENSE",
                href="https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md",
            ),
        ],
    ),
    UpstreamComponent(
        name="Depth Anything V2 Small",
        license="Apache-2.0",
        links=[
            LicenseLink(
                label="GitHub",
                href="https://github.com/DepthAnything/Depth-Anything-V2",
            ),
            LicenseLink(
                label="Hugging Face",
                href="https://huggingface.co/depth-anything/Depth-Anything-V2-Small",
            ),
        ],
    ),
    UpstreamComponent(
        name="IS-Net",
        license="Apache-2.0 (code and evaluation metrics)",
        links=[
            LicenseLink(label="GitHub", href="https://github.com/xuebinqin/DIS"),
        ],
        note="DIS5K dataset has separate non-commercial research/education terms.",
    ),
]


def build_licenses_response(product_version: str) -> LicensesResponse:
    return LicensesResponse(
        product_version=product_version,
        product_license="Apache-2.0",
        product_license_url=PRODUCT_LICENSE_URL,
        upstream_components=UPSTREAM_COMPONENTS,
        third_party_notices_path=f"/opt/withoutbg/{product_version}/THIRD_PARTY_NOTICES.md",
    )
