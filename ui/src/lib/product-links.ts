import { HF_MODEL_URL } from "@/lib/reference-links";

export const SITE_URL = "https://withoutbg.com"; // utm-ok: site() tags every link

/** withoutbg.com link with this app's UTM tags (first-party measurement only). */
export function site(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const content = clean.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";
  const params = new URLSearchParams({
    utm_source: "inference-app",
    utm_medium: "app",
    utm_campaign: "open-weights-v4",
    utm_content: `inference-ui-${content}`,
  });
  return `${SITE_URL}${clean}?${params.toString()}`;
}
export const LINK_URL = site("/");
export const LICENSE_URL = site("/open-model/license");
export const OSS_URL = "https://github.com/withoutbg/withoutbg-inference";
export const LEGACY_OSS_URL = "https://github.com/withoutbg/withoutbg";
export const SUPPORT_URL = site("/open-model/support");

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
    href: site("/compare/withoutbg-open-model-vs-pro-model"),
    simple: true,
  },
  {
    label: "vs Clipping Magic",
    href: site("/compare/withoutbg-open-model-vs-clipping-magic"),
    simple: true,
  },
];

export const OPEN_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: site("/open-model/results"),
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
        href: site("/docs/open-model/python"),
        icon: "devicon-python-plain",
      },
      {
        label: "Docker",
        href: site("/docs/open-model/docker"),
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
        href: site("/mac"),
        icon: "devicon-apple-original",
      },
      {
        label: "GIMP Plugin",
        href: site("/open-model/plugins/gimp"),
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
    href: site("/compare/withoutbg-open-model-vs-pro-model"),
    simple: true,
  },
  {
    label: "vs remove.bg",
    href: site("/compare/withoutbg-pro-model-vs-remove-bg"),
    simple: true,
  },
];

export const API_MODEL_LEFT_SECTIONS: ProductLinkSection[] = [
  {
    label: "Results",
    items: [
      {
        label: "See model outputs",
        href: site("/pro-model/results"),
        lucideIcon: "images",
      },
    ],
  },
  {
    label: "Try",
    items: [
      {
        label: "API Demo",
        href: site("/pro-model/remove-background"),
        lucideIcon: "play",
      },
    ],
  },
  {
    label: "Pricing",
    items: [
      {
        label: "Pricing",
        href: site("/pro-model/pricing"),
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
        href: site("/docs/pro-model"),
        icon: "devicon-openapi-plain",
      },
      {
        label: "Background Removal (Binary)",
        href: site("/docs/pro-model/background-removal-binary"),
        lucideIcon: "images",
      },
      {
        label: "Background Removal (Base64)",
        href: site("/docs/pro-model/background-removal-base64"),
        lucideIcon: "braces",
      },
      {
        label: "Alpha Matte (Binary)",
        href: site("/docs/pro-model/alpha-matte-binary"),
        lucideIcon: "images",
      },
      {
        label: "Alpha Matte (Base64)",
        href: site("/docs/pro-model/alpha-matte-base64"),
        lucideIcon: "braces",
      },
      {
        label: "Credits",
        href: site("/docs/pro-model/credits"),
        lucideIcon: "battery-charging",
      },
    ],
  },
  {
    label: "Open Model",
    items: [
      {
        label: "Overview",
        href: site("/docs/open-model"),
        icon: "devicon-python-plain",
      },
      {
        label: "Python Library",
        href: site("/docs/open-model/python"),
        icon: "devicon-python-plain",
      },
      {
        label: "Docker",
        href: site("/docs/open-model/docker"),
        icon: "devicon-docker-plain",
      },
      {
        label: "CLI",
        href: site("/docs/open-model/cli"),
        icon: "devicon-bash-plain",
      },
    ],
  },
];

export const DOCS_SECTION_COLUMNS: ProductLinkSection[][] = DOCS_SECTIONS.map(
  (section) => [section]
);
