import { HF_MODEL_URL } from "@/lib/reference-links";

export const SITE_URL = "https://withoutbg.com";
export const LINK_URL = `${SITE_URL}/`;
export const LICENSE_URL = `${SITE_URL}/open-weights-model/license`;
export const OSS_URL = "https://github.com/withoutbg/withoutbg-inference";
export const LEGACY_OSS_URL = "https://github.com/withoutbg/withoutbg";
export const SUPPORT_URL = `${SITE_URL}/open-weights-model/support`;
/** Update when the Hugging Face Space is published */
export const HF_SPACE_URL = "https://huggingface.co/spaces/withoutbg/withoutbg";

export const DOCKER_HUB_APP_CPU_URL =
  "https://hub.docker.com/r/withoutbg/withoutbg-openweights-v3-app-cpu";
export const DOCKER_HUB_APP_GPU_URL =
  "https://hub.docker.com/r/withoutbg/withoutbg-openweights-v3-app-gpu";
export const DOCKER_HUB_SERVICE_CPU_URL =
  "https://hub.docker.com/r/withoutbg/withoutbg-openweights-v3-service-cpu";
export const DOCKER_HUB_SERVICE_GPU_URL =
  "https://hub.docker.com/r/withoutbg/withoutbg-openweights-v3-service-gpu";
export const DOCKER_HUB_APP_MAC_URL = "https://hub.docker.com/r/withoutbg/app-mac";
export const PYPI_PACKAGE_URL = "https://pypi.org/project/withoutbg/";

export type ProductLinkItem = {
  label: string;
  href: string | null;
  icon?: string;
  /** Lucide icon name when devicon is not used */
  lucideIcon?: "store" | "images" | "play" | "credit-card" | "heart";
  current?: boolean;
  /** Hide the serving badge (compare links) */
  simple?: boolean;
  highlight?: boolean;
  /** Open in a new tab (default true for external URLs) */
  external?: boolean;
};

export type ProductLinkSection = {
  label: string;
  items: ProductLinkItem[];
};

export const OPEN_MODEL_COMPARE_ITEMS: ProductLinkItem[] = [
  { label: "vs remove.bg", href: `${SITE_URL}/compare/open-weights-vs-remove-bg`, simple: true },
  { label: "vs Photoroom", href: `${SITE_URL}/compare/open-weights-vs-photoroom`, simple: true },
  { label: "vs API Model", href: `${SITE_URL}/compare/open-weights-vs-api-model`, simple: true },
  { label: "vs Clipping Magic", href: `${SITE_URL}/compare/open-weights-vs-clipping-magic`, simple: true },
];

export const OPEN_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: `${SITE_URL}/open-weights-model/results`,
        lucideIcon: "images",
      },
    ],
  },
  {
    label: "Hosted",
    items: [
      {
        label: "Hugging Face Model",
        href: HF_MODEL_URL,
        icon: "devicon-pytorch-plain",
      },
      {
        label: "Hugging Face Space",
        href: HF_SPACE_URL,
        icon: "devicon-pytorch-plain",
      },
    ],
  },
  {
    label: "Self-host",
    items: [
      {
        label: "Python Library",
        href: PYPI_PACKAGE_URL,
        icon: "devicon-python-plain",
      },
      {
        label: "Docker Web App CPU",
        href: DOCKER_HUB_APP_CPU_URL,
        icon: "devicon-docker-plain",
        current: true,
      },
      {
        label: "Docker Web App Mac",
        href: DOCKER_HUB_APP_MAC_URL,
        icon: "devicon-docker-plain",
      },
      {
        label: "Docker Web App GPU",
        href: DOCKER_HUB_APP_GPU_URL,
        icon: "devicon-docker-plain",
      },
    ],
  },
  {
    label: "Plugins / Apps",
    items: [
      {
        label: "Mac Application",
        href: `${SITE_URL}/open-weights-model/mac-app`,
        icon: "devicon-apple-original",
      },
      {
        label: "GIMP Plugin",
        href: `${SITE_URL}/open-weights-model/plugins/gimp`,
        icon: "devicon-gimp-plain",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        label: "Donate",
        href: SUPPORT_URL,
        lucideIcon: "heart",
        highlight: true,
      },
    ],
  },
];

export const OPEN_MODEL_COMPARE_SECTION: ProductLinkSection = {
  label: "Compare",
  items: OPEN_MODEL_COMPARE_ITEMS,
};

export const OPEN_MODEL_SECTION_COLUMNS: ProductLinkSection[][] = [
  OPEN_MODEL_LEFT_SECTIONS,
  [OPEN_MODEL_COMPARE_SECTION],
];

export const OPEN_MODEL_SECTIONS: ProductLinkSection[] = [
  ...OPEN_MODEL_LEFT_SECTIONS,
  OPEN_MODEL_COMPARE_SECTION,
];

export const API_MODEL_COMPARE_ITEMS: ProductLinkItem[] = [
  {
    label: "vs Open-Weight Model",
    href: `${SITE_URL}/compare/open-weights-vs-api-model`,
    simple: true,
  },
];

export const API_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: `${SITE_URL}/api-model/results`,
        lucideIcon: "images",
      },
    ],
  },
  {
    label: "Try",
    items: [
      {
        label: "API Demo",
        href: `${SITE_URL}/api-model/remove-background`,
        lucideIcon: "play",
      },
    ],
  },
  {
    label: "Pricing",
    items: [
      {
        label: "Pricing",
        href: `${SITE_URL}/api-model/pricing`,
        lucideIcon: "credit-card",
      },
    ],
  },
  {
    label: "Integrations",
    items: [
      { label: "Figma Plugin", href: `${SITE_URL}/api-model/figma-plugin`, icon: "devicon-figma-plain" },
      { label: "Shopify App", href: `${SITE_URL}/api-model/shopify-app`, lucideIcon: "store" },
    ],
  },
];

export const API_MODEL_COMPARE_SECTION: ProductLinkSection = {
  label: "Compare",
  items: API_MODEL_COMPARE_ITEMS,
};

export const API_MODEL_SECTION_COLUMNS: ProductLinkSection[][] = [
  API_MODEL_LEFT_SECTIONS,
  [API_MODEL_COMPARE_SECTION],
];

export const API_MODEL_SECTIONS: ProductLinkSection[] = [
  ...API_MODEL_LEFT_SECTIONS,
  API_MODEL_COMPARE_SECTION,
];

export const API_MODEL_ITEMS: ProductLinkItem[] = API_MODEL_LEFT_SECTIONS.flatMap(
  (section) => section.items
);
