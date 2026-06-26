import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";
import { themeColors } from "./src/lib/theme-colors";

const themeVariablesPlugin = plugin(({ addBase }) => {
  addBase({
    ":root": {
      "--background": themeColors.light.page,
      "--wbg-chrome": themeColors.light.chrome,
      "--wbg-page": themeColors.light.page,
      "--wbg-surface": themeColors.light.surface,
    },
    ".dark": {
      "--background": themeColors.dark.page,
      "--wbg-chrome": themeColors.dark.chrome,
      "--wbg-page": themeColors.dark.page,
      "--wbg-surface": themeColors.dark.surface,
    },
  });
});

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: [
        "Inter",
        "SF Pro Display",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "sans-serif",
      ],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.025em" }],
      sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.015em" }],
      base: ["1rem", { lineHeight: "1.6", letterSpacing: "0.01em" }],
      lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "0.005em" }],
      xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "0em" }],
      "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
      "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
      "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
      "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
      "6xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.035em" }],
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    extend: {
      colors: {
        wbg: {
          chrome: "var(--wbg-chrome)",
          page: "var(--wbg-page)",
          surface: "var(--wbg-surface)",
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [themeVariablesPlugin],
} satisfies Config;
