"""License and upstream attribution data (mirrors reference-links.md)."""

from withoutbg_api.schemas import LicenseLink, LicensesResponse, UpstreamComponent

PRODUCT_LICENSE_URL = "https://withoutbg.com/open-model/license"
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
        name="Depth Anything V2",
        license="Apache-2.0",
        links=[
            LicenseLink(
                label="GitHub",
                href="https://github.com/DepthAnything/Depth-Anything-V2",
            ),
            LicenseLink(
                label="Apache-2.0",
                href="https://www.apache.org/licenses/LICENSE-2.0",
            ),
        ],
    ),
    UpstreamComponent(
        name="BiRefNet",
        license="MIT",
        links=[
            LicenseLink(
                label="GitHub",
                href="https://github.com/ZhengPeng7/BiRefNet",
            ),
            LicenseLink(
                label="MIT License",
                href="https://github.com/ZhengPeng7/BiRefNet/blob/main/LICENSE",
            ),
        ],
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
