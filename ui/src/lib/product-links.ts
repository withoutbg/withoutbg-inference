import { HF_MODEL_URL } from "@/lib/reference-links";

export const SITE_URL = "https://withoutbg.com";
export const LINK_URL = `${SITE_URL}/`;
export const LICENSE_URL = `${SITE_URL}/open-model/license`;
export const OSS_URL = "https://github.com/withoutbg/withoutbg-inference";
export const LEGACY_OSS_URL = "https://github.com/withoutbg/withoutbg";
export const SUPPORT_URL = `${SITE_URL}/open-model/support`;

export type ProductLinkItem = {
  label: string;
  href: string | null;
  icon?: string;
  /** Lucide icon name when devicon is not used */
  lucideIcon?:
    | "images"
    | "play"
    | "credit-card"
    | "heart"
    | "braces"
    | "battery-charging";
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
  {
    label: "vs Pro Model",
    href: `${SITE_URL}/compare/withoutbg-open-model-vs-pro-model`,
    simple: true,
  },
  {
    label: "vs Clipping Magic",
    href: `${SITE_URL}/compare/withoutbg-open-model-vs-clipping-magic`,
    simple: true,
  },
];

export const OPEN_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: `${SITE_URL}/open-model/results`,
        lucideIcon: "images",
      },
    ],
  },
  {
    label: "Hosted",
    items: [
      {
        label: "Hugging Face",
        href: HF_MODEL_URL,
        external: true,
      },
    ],
  },
  {
    label: "Self-host",
    items: [
      {
        label: "Python Library",
        href: `${SITE_URL}/docs/open-model/python`,
        icon: "devicon-python-plain",
      },
      {
        label: "Docker",
        href: `${SITE_URL}/docs/open-model/docker`,
        icon: "devicon-docker-plain",
        current: true,
      },
    ],
  },
  {
    label: "Plugins / Apps",
    items: [
      {
        label: "Mac Application",
        href: `${SITE_URL}/mac`,
        icon: "devicon-apple-original",
      },
      {
        label: "GIMP Plugin",
        href: `${SITE_URL}/open-model/plugins/gimp`,
        icon: "devicon-gimp-plain",
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
    label: "vs Open Model",
    href: `${SITE_URL}/compare/withoutbg-open-model-vs-pro-model`,
    simple: true,
  },
  {
    label: "vs remove.bg",
    href: `${SITE_URL}/compare/withoutbg-pro-model-vs-remove-bg`,
    simple: true,
  },
];

export const API_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: `${SITE_URL}/pro-model/results`,
        lucideIcon: "images",
      },
    ],
  },
  {
    label: "Try",
    items: [
      {
        label: "API Demo",
        href: `${SITE_URL}/pro-model/remove-background`,
        lucideIcon: "play",
      },
    ],
  },
  {
    label: "Pricing",
    items: [
      {
        label: "Pricing",
        href: `${SITE_URL}/pro-model/pricing`,
        lucideIcon: "credit-card",
      },
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

export const DOCS_SECTIONS: ProductLinkSection[] = [
  {
    label: "Pro Model",
    items: [
      {
        label: "Overview",
        href: `${SITE_URL}/docs/pro-model`,
        icon: "devicon-openapi-plain",
      },
      {
        label: "Background Removal (Binary)",
        href: `${SITE_URL}/docs/pro-model/background-removal-binary`,
        lucideIcon: "images",
      },
      {
        label: "Background Removal (Base64)",
        href: `${SITE_URL}/docs/pro-model/background-removal-base64`,
        lucideIcon: "braces",
      },
      {
        label: "Alpha Matte (Binary)",
        href: `${SITE_URL}/docs/pro-model/alpha-matte-binary`,
        lucideIcon: "images",
      },
      {
        label: "Alpha Matte (Base64)",
        href: `${SITE_URL}/docs/pro-model/alpha-matte-base64`,
        lucideIcon: "braces",
      },
      {
        label: "Credits",
        href: `${SITE_URL}/docs/pro-model/credits`,
        lucideIcon: "battery-charging",
      },
    ],
  },
  {
    label: "Open Model",
    items: [
      {
        label: "Overview",
        href: `${SITE_URL}/docs/open-model`,
        icon: "devicon-python-plain",
      },
      {
        label: "Python Library",
        href: `${SITE_URL}/docs/open-model/python`,
        icon: "devicon-python-plain",
      },
      {
        label: "Docker",
        href: `${SITE_URL}/docs/open-model/docker`,
        icon: "devicon-docker-plain",
      },
      {
        label: "CLI",
        href: `${SITE_URL}/docs/open-model/cli`,
        icon: "devicon-bash-plain",
      },
    ],
  },
];

export const DOCS_SECTION_COLUMNS: ProductLinkSection[][] = DOCS_SECTIONS.map(
  (section) => [section]
);
