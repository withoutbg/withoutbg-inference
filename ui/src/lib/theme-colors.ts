/**
 * Semantic background palette — single source of truth.
 *
 * Values are injected as CSS variables via `tailwind.config.ts`.
 * Tailwind utilities: `bg-wbg-chrome`, `bg-wbg-page`, `bg-wbg-surface`.
 *
 * Dark hierarchy (chrome lightest → page darkest):
 *   chrome  navbars, sidebars
 *   surface cards, panels, selected nav items
 *   page    main content background
 */
export const themeColors = {
  light: {
    chrome: "#FAFAFA",
    page: "#FEFEFE",
    surface: "#F2F2F2",
  },
  dark: {
    chrome: "#252427",
    page: "#1F1F1E",
    surface: "#3A3A3A",
  },
} as const;

export type ThemeColorRole = keyof typeof themeColors.light;
