/**
 * Upstream license links — mirrors reference-links.md and THIRD_PARTY_NOTICES.md.
 */

export type ReferenceLink = {
  label: string;
  href: string;
};

export type UpstreamComponent = {
  name: string;
  license: string;
  links: ReferenceLink[];
  note?: string;
};

export const UPSTREAM_COMPONENTS: UpstreamComponent[] = [
  {
    name: "DINOv3",
    license: "DINOv3 License",
    links: [
      {
        label: "Meta license",
        href: "https://ai.meta.com/resources/models-and-libraries/dinov3-license/",
      },
      {
        label: "GitHub LICENSE",
        href: "https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md",
      },
    ],
  },
  {
    name: "Depth Anything V2",
    license: "Apache-2.0",
    links: [
      { label: "GitHub", href: "https://github.com/DepthAnything/Depth-Anything-V2" },
      {
        label: "Apache-2.0",
        href: "https://www.apache.org/licenses/LICENSE-2.0",
      },
    ],
  },
  {
    name: "BiRefNet",
    license: "MIT",
    links: [
      { label: "GitHub", href: "https://github.com/ZhengPeng7/BiRefNet" },
      {
        label: "MIT License",
        href: "https://github.com/ZhengPeng7/BiRefNet/blob/main/LICENSE",
      },
    ],
  },
];

export const HF_MODEL_URL = "https://huggingface.co/withoutbg/withoutbg-openweights-onnx";
export const INFERENCE_REPO_URL = "https://github.com/withoutbg/withoutbg-inference";
export const THIRD_PARTY_NOTICES_URL =
  "https://github.com/withoutbg/withoutbg-inference/blob/main/THIRD_PARTY_NOTICES.md";
